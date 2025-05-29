// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BACKEND_PROXY_API_URL, ProxyServiceRoute } from '@subwallet/extension-base/constants';
import { estimateTxFee, getERC20Allowance, getERC20SpendingApprovalTx } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, EvmFeeInfo, HandleYieldStepData, OptimalSwapPathParamsV2, SwapErrorType, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TokenSpendingApprovalParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, combineEthFee } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getChainNativeTokenSlug, _getContractAddressOfToken, _isNativeToken } from '../../chain-service/utils';
import FeeService from '../../fee-service/service';
import { calculateGasFeeParams } from '../../fee-service/utils';
import TransactionService from '../../transaction-service';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

interface KyberRouteData {
  routeSummary: KyberSwapQuoteData;
  routerAddress: string;
}

interface KyberSwapQuoteData {
  amountIn: string;
  tokenIn: string;
  tokenOut: string;
  amountOut: string;
  amountInUsd: string;
  amountOutUsd: string;
  gas: string;
  gasPrice: string;
  extraFee: {
    feeAmount: string;
    isInBps: boolean
  }
}

interface KyberMetadata {
  network: string;
  priceImpact: string;
  routeSummary: KyberSwapQuoteData;
  routerAddress: string;
}

interface BuildTxForSwapParams {
  routeSummary: KyberSwapQuoteData;
  sender: string;
  recipient: string;
  deadline?: number;
  slippageTolerance?: number; // in bps: 100 = 1%
  permit?: string;
  ignoreCappedSlippage?: boolean;
  enableGasEstimation?: boolean;
  referral?: string;
}

interface KyberSwapBuildTxResponse {
  routerAddress: string;
  data: string;
  gas: string;
  transactionValue: string;
}

interface KyberApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  details?: string[];
}

export interface KyberSwapQuoteMetadata {
  priceImpact?: string;
}

const proxyApi = `${BACKEND_PROXY_API_URL}${ProxyServiceRoute.KYBER}`;

type BuildTxForSwapResult = { data?: TransactionConfig; error?: SwapError | TransactionError };

async function buildTxForSwap (params: BuildTxForSwapParams, chain: string): Promise<BuildTxForSwapResult> {
  const { recipient, sender, slippageTolerance } = params;
  let routeSummary = params.routeSummary;

  if (!routeSummary || !routeSummary.tokenIn || !routeSummary.tokenOut || !routeSummary.amountIn) {
    const queryParams = new URLSearchParams({
      tokenIn: routeSummary.tokenIn,
      tokenOut: routeSummary.tokenOut,
      amountIn: routeSummary.amountIn,
      gasInclude: 'true'
    });

    const url = `${proxyApi}/${chain}/api/v1/routes?${queryParams.toString()}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        }
      });

      const routeData = (await res.json()) as KyberApiResponse<KyberRouteData>;

      if (!routeData.success || !routeData.data?.routeSummary) {
        return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR, routeData.message) };
      }

      routeSummary = routeData.data.routeSummary;
    } catch (error) {
      console.error('Error:', error);

      return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR) };
    }
  }

  const body = {
    routeSummary,
    sender,
    recipient,
    slippageTolerance,
    ignoreCappedSlippage: true,
    enableGasEstimation: true
  };

  try {
    console.log('proxyapi', proxyApi);
    const res = await fetch(`${proxyApi}/${chain}/api/v1/route/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = (await res.json()) as KyberApiResponse<KyberSwapBuildTxResponse>;
    const requestData = data.data;

    if (!requestData || !requestData.routerAddress || !requestData.data || !requestData.gas) {
      const lowerDetails = data.details?.map((d) => d.toLowerCase()) ?? [];
      const msg = data.message?.toLowerCase() ?? '';

      if (lowerDetails.some((d) => d.includes('insufficient liquidity'))) {
        return { error: new SwapError(SwapErrorType.NOT_ENOUGH_LIQUIDITY) };
      }

      if (lowerDetails.some((d) => d.includes('execution reverted')) || msg.includes('smaller than estimated')) {
        return { error: new SwapError(SwapErrorType.NOT_MEET_MIN_EXPECTED) };
      }

      return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR, data.message) };
    }

    return {
      data: {
        from: sender,
        to: requestData.routerAddress,
        value: requestData.transactionValue,
        data: requestData.data,
        gas: requestData.gas
      }
    };
  } catch (error) {
    console.error('Kyber error:', error);

    return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR) };
  }
}

export class KyberHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  public transactionService: TransactionService;

  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, transactionService: TransactionService, feeService: FeeService) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: 'Kyber',
      providerSlug: SwapProviderId.KYBER
    });

    this.transactionService = transactionService;
    this.providerSlug = SwapProviderId.KYBER;
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get balanceService () {
    return this.swapBaseHandler.balanceService;
  }

  get feeService () {
    return this.swapBaseHandler.feeService;
  }

  get providerInfo () {
    return this.swapBaseHandler.providerInfo;
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcessV2(params, [
      this.getApprovalStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  async getApprovalStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const selectedQuote = params.selectedQuote;

    if (selectedQuote) {
      const fromAsset = this.chainService.getAssetBySlug(selectedQuote.pair.from);

      if (_isNativeToken(fromAsset)) {
        return Promise.resolve(undefined);
      }

      const metadata = selectedQuote.metadata as KyberMetadata;
      const routerContract = metadata.routerAddress;

      const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
      const fromContractAddress = _getContractAddressOfToken(fromAsset);
      const allowance = await getERC20Allowance(routerContract, params.request.address, fromContractAddress, evmApi);

      if (allowance && new BigNumber(allowance).gt(params.request.fromAmount)) {
        return Promise.resolve(undefined);
      }

      const sendingAmount = selectedQuote.toAmount;
      const senderAddress = params.request.address;
      const fromTokenInfo = this.chainService.getAssetBySlug(selectedQuote.pair.from);

      const tokenContract = _getContractAddressOfToken(fromTokenInfo);
      const spenderAddress = metadata.routerAddress;

      const submitStep: BaseStepDetail = {
        name: 'Approve token',
        type: CommonStepType.TOKEN_APPROVAL,
        metadata: {
          tokenApprove: fromTokenInfo.slug,
          contractAddress: tokenContract,
          spenderAddress: spenderAddress,
          amount: sendingAmount,
          owner: senderAddress
        }
      };

      const tx = await getERC20SpendingApprovalTx(spenderAddress, senderAddress, tokenContract, evmApi);
      const evmFeeInfo = await this.feeService.subscribeChainFee(getId(), fromTokenInfo.originChain, 'evm') as EvmFeeInfo;
      const estimatedFee = await estimateTxFee(tx, evmApi, evmFeeInfo);

      const fromChainInfo = this.chainService.getChainInfoByKey(fromTokenInfo.originChain);
      const nativeTokenSlug = _getChainNativeTokenSlug(fromChainInfo);
      const feeInfo: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: estimatedFee,
          tokenSlug: nativeTokenSlug
        }],
        defaultFeeToken: nativeTokenSlug,
        feeOptions: [nativeTokenSlug]
      };

      return Promise.resolve([submitStep, feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request, selectedQuote } = params;

    // stepIndex is not corresponding index in path, because uniswap include approval and permit step
    const stepData = path.find((action) => action.action === DynamicSwapType.SWAP);

    if (!stepData || !stepData.pair) {
      return Promise.resolve(undefined);
    }

    if (!selectedQuote) {
      return Promise.resolve(undefined);
    }

    const originTokenInfo = this.chainService.getAssetBySlug(selectedQuote.pair.from);
    const destinationTokenInfo = this.chainService.getAssetBySlug(selectedQuote.pair.to);
    const originChain = this.chainService.getChainInfoByKey(originTokenInfo.originChain);
    const destinationChain = this.chainService.getChainInfoByKey(destinationTokenInfo.originChain);

    const submitStep: BaseStepDetail = {
      name: 'Swap',
      type: SwapStepType.SWAP,
      // @ts-ignore
      metadata: {
        sendingValue: request.fromAmount.toString(),
        expectedReceive: selectedQuote.toAmount,
        originTokenInfo,
        destinationTokenInfo,
        sender: _reformatAddressWithChain(request.address, originChain),
        receiver: _reformatAddressWithChain(request.recipient || request.address, destinationChain),
        version: 2
      } as unknown as BaseSwapStepMetadata
    };

    return Promise.resolve([submitStep, selectedQuote.feeInfo]);
  }

  public async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.DEFAULT:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
      case CommonStepType.TOKEN_APPROVAL:
        return this.tokenApproveSpending(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  private async tokenApproveSpending (params: SwapSubmitParams): Promise<HandleYieldStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const fromContract = _getContractAddressOfToken(fromAsset);
    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);

    const chain = fromAsset.originChain;
    const metadata = params.quote.metadata as KyberMetadata;

    if (!metadata || !metadata.routerAddress) {
      throw new TransactionError(BasicTxErrorType.INVALID_PARAMS);
    }

    const routerContract = metadata.routerAddress;

    const transactionConfig = await getERC20SpendingApprovalTx(routerContract, params.address, fromContract, evmApi);

    const _data: TokenSpendingApprovalParams = {
      spenderAddress: routerContract,
      contractAddress: fromContract,
      amount: params.quote.fromAmount,
      owner: params.address,
      chain: chain
    };

    return Promise.resolve({
      txChain: chain,
      extrinsicType: ExtrinsicType.TOKEN_SPENDING_APPROVAL,
      extrinsic: transactionConfig,
      txData: _data,
      transferNativeAmount: '0',
      chainType: ChainType.EVM
    });
  }

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const toAsset = this.chainService.getAssetBySlug(params.quote.pair.to);
    const chainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toAsset.originChain);

    const sender = _reformatAddressWithChain(params.address, chainInfo);
    const recipient = _reformatAddressWithChain(params.recipient ?? sender, toChainInfo);

    const metadata = params.quote.metadata as KyberMetadata;
    const slippageTolerance = params.slippage * 10000;

    const rawTx = await buildTxForSwap({ routeSummary: metadata.routeSummary, sender: params.address, recipient, slippageTolerance }, metadata.network);

    if (rawTx.error) {
      console.error('Kyber error:', rawTx.error);
      throw rawTx.error;
    }

    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
    const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);
    const fee = combineEthFee(priority);

    const transactionConfig: TransactionConfig = {
      ...rawTx.data,
      ...fee
    };

    const txData = {
      address: params.address,
      provider: this.providerInfo,
      quote: params.quote,
      slippage: params.slippage,
      recipient: params.recipient,
      process: params.process
    };

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic: transactionConfig,
      transferNativeAmount: _isNativeToken(fromAsset) ? params.quote.fromAmount : '0',
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.EVM
    };
  }

  public async validateSwapProcessV2 (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    // todo: recheck address and recipient format in params
    const { process, selectedQuote } = params; // todo: review flow, currentStep param.

    // todo: validate path with optimalProcess
    // todo: review error message in case many step swap
    if (BigNumber(selectedQuote.fromAmount).lte(0)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')];
    }

    const actionList = JSON.stringify(process.path.map((step) => step.action));
    const swap = actionList === JSON.stringify([DynamicSwapType.SWAP]);
    const swapXcm = actionList === JSON.stringify([DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);
    const xcmSwap = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP]);
    const xcmSwapXcm = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);

    const swapIndex = params.process.steps.findIndex((step) => step.type === SwapStepType.SWAP); // todo

    if (swapIndex <= -1) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (swap) {
      return this.swapBaseHandler.validateSwapOnlyProcess(params, swapIndex); // todo: create interface for input request
    }

    if (swapXcm) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (xcmSwap) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (xcmSwapXcm) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
  }
}
