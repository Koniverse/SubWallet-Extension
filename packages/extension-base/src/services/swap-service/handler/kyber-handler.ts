// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { getERC20Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { _ERC20_ABI } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { BaseStepDetail, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, FeeOptionKey, HandleYieldStepData, OptimalSwapPathParams, OptimalSwapPathParamsV2, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TokenSpendingApprovalParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getContractAddressOfToken, _isNativeToken } from '../../chain-service/utils';
import FeeService from '../../fee-service/service';
import { calculateGasFeeParams } from '../../fee-service/utils';
import TransactionService from '../../transaction-service';
import { DynamicSwapType } from '../interface';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

interface KyberSwapQuoteData {
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
  encodedSwapData: string;
  gas: string;
}

interface KyberApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export const KYBER_CLIENT_ID = process.env.KYBER_CLIENT_ID || '';

const kyberUrl = 'https://aggregator-api.kyberswap.com';

export async function buildTxForSwap (params: BuildTxForSwapParams, chain: string): Promise<TransactionConfig> {
  const { recipient, routeSummary, sender, slippageTolerance } = params;

  if (!recipient || !sender || !routeSummary || !slippageTolerance) {
    throw new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Invalid swap input parameters');
  }

  const body = { routeSummary, sender, recipient, slippageTolerance };

  try {
    const res = await fetch(`${kyberUrl}/${chain}/api/v1/route/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': KYBER_CLIENT_ID,
        accept: 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json() as KyberApiResponse<KyberSwapBuildTxResponse>;
    const requestData = data.data;

    if (!requestData) {
      throw new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'Failed to build Kyber transaction');
    }

    return {
      from: sender,
      to: requestData.routerAddress,
      data: requestData.encodedSwapData,
      gas: requestData.gas
    } as TransactionConfig;
  } catch (error) {
    throw new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'Failed to build Kyber transaction');
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

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getApprovalStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcessV2(params, [
      this.getApprovalStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  async getApprovalStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const fromAsset = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);

      if (_isNativeToken(fromAsset)) {
        return Promise.resolve(undefined);
      }

      const metadata = params.selectedQuote.metadata as KyberMetadata;
      const routerContract = metadata.routerAddress;

      const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
      const fromContractAddress = _getContractAddressOfToken(fromAsset);
      const fromTokenContract = getERC20Contract(fromContractAddress, evmApi);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const allowance = await fromTokenContract.methods.allowance(params.request.address, routerContract).call() as string;

      if (allowance && new BigNumber(allowance).gt(params.request.fromAmount)) {
        return Promise.resolve(undefined);
      }

      const submitStep: BaseStepDetail = {
        name: 'Approve token',
        type: CommonStepType.TOKEN_APPROVAL
      };

      return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  async getSubmitStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const submitStep: BaseStepDetail = {
        name: 'Swap',
        type: SwapStepType.SWAP,
        metadata: {
          sendingValue: params.request.fromAmount.toString(),
          originTokenInfo: this.chainService.getAssetBySlug(params.selectedQuote.pair.from),
          destinationTokenInfo: this.chainService.getAssetBySlug(params.selectedQuote.pair.to)
        }
      };

      return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
    }

    return Promise.resolve(undefined);
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
    const routerContract = metadata.routerAddress;
    let transactionConfig: TransactionConfig = {} as TransactionConfig;

    const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

    const amount = params.quote.fromAmount;
    const tokenContract = new evmApi.api.eth.Contract(_ERC20_ABI, fromContract);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const approveData = tokenContract.methods.approve(routerContract, amount).encodeABI();

    console.log('approveData', approveData);
    transactionConfig = {
      from: params.address,
      to: fromContract,
      value: 0,
      data: approveData as string,
      gasPrice: priority.gasPrice,
      maxFeePerGas: priority.options?.[FeeOptionKey.AVERAGE].maxFeePerGas?.toString(),
      maxPriorityFeePerGas: priority.options?.[FeeOptionKey.AVERAGE].maxPriorityFeePerGas.toString()
    };
    const gasLimit = await evmApi.api.eth.estimateGas(transactionConfig).catch(() => 200000);

    transactionConfig.gas = gasLimit.toString();
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

    const transactionConfig: TransactionConfig = await buildTxForSwap({ routeSummary: metadata.routeSummary, sender: params.address, recipient, slippageTolerance }, metadata.network);

    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
    const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

    transactionConfig.gasPrice = priority.gasPrice;
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

  public async validateSwapProcess (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const amount = params.selectedQuote.fromAmount;

    const bnAmount = new BigNumber(amount);

    if (bnAmount.lte(0)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')];
    }

    const swapStep = params.process.steps.find((item) => item.type === SwapStepType.SWAP);

    if (!swapStep) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'Swap step not found')];
    }

    let isXcmOk = false;
    const currentStep = params.currentStep;

    for (const [index, step] of params.process.steps.entries()) {
      if (currentStep > index) {
        continue;
      }

      const getErrors = async (): Promise<TransactionError[]> => {
        switch (step.type) {
          case CommonStepType.DEFAULT:
            return Promise.resolve([]);
          case CommonStepType.XCM:
            return this.swapBaseHandler.validateXcmStepV2(params, index);
          case CommonStepType.SET_FEE_TOKEN:
            return this.swapBaseHandler.validateSetFeeTokenStep(params, index);
          default:
            return this.swapBaseHandler.validateSwapStep(params, isXcmOk, index);
        }
      };

      const errors = await getErrors();

      if (errors.length) {
        return errors;
      } else if (step.type === CommonStepType.XCM) {
        isXcmOk = true;
      }
    }

    return [];
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
