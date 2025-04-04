// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BaseStepDetail, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, OptimalSwapPathParams, OptimalSwapPathParamsV2, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getContractAddressOfToken, _isNativeToken } from '../../chain-service/utils';
import FeeService from '../../fee-service/service';
import TransactionService from '../../transaction-service';
import { DynamicSwapType } from '../interface';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

interface OneInchMetadata {
  dstAddress: string;
  srcAddress: string;
  chainId: number;
}

interface OneInchSwapParams {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
  disableEstimate: boolean;
  allowPartialFill: boolean;
}

interface Allowance {
  allowance: string;
}

interface ApproveData {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
}

interface SwapResponse {
  tx: TransactionConfig;
}
export const oneInchApiKey = process.env.ONE_INCH_API_KEY || '';

const apiBaseUrl = 'https://api.1inch.dev/swap/v6.0/';
const HEADERS = {
  headers: {
    Authorization: oneInchApiKey,
    accept: 'application/json'
  }
};

function apiRequestUrl (methodName: string, queryParams: Record<string, string>, chainId: number): string {
  return `${apiBaseUrl}${chainId}${methodName}?${new URLSearchParams(queryParams).toString()}`;
}

async function checkAllowance (tokenAddress: string, walletAddress: string, chainId: number): Promise<string> {
  const url = apiRequestUrl('/approve/allowance', { tokenAddress, walletAddress }, chainId);

  const response = await fetch(url, HEADERS).then((res) => res.json()) as Allowance;

  return response.allowance;
}

async function buildTxForApproveTradeWithRouter (tokenAddress: string, chainId: number, amount?: string): Promise<ApproveData> {
  const url = apiRequestUrl('/approve/transaction', amount ? { tokenAddress, amount } : { tokenAddress }, chainId);
  const transaction = await fetch(url, HEADERS).then((res) => res.json()) as ApproveData;

  return transaction;
}

async function buildTxForSwap (swapParams: OneInchSwapParams, chainId: number): Promise<TransactionConfig> {
  const url = apiRequestUrl('/swap', Object.fromEntries(Object.entries(swapParams).map(([key, value]) => [key, String(value)])), chainId);
  const response = await fetch(url, HEADERS).then((res) => res.json()) as SwapResponse;

  return response.tx;
}

export class OneInchHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  public transactionService: TransactionService;

  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, transactionService: TransactionService, feeService: FeeService) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: '1inch',
      providerSlug: SwapProviderId.CHAIN_FLIP_MAINNET
    });

    this.transactionService = transactionService;
    this.providerSlug = SwapProviderId.CHAIN_FLIP_MAINNET;
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
      const walletAddress = params.request.address;
      const inputTokenInfo = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);

      const metadata = params.selectedQuote.metadata as OneInchMetadata;
      const chainId = metadata.chainId;
      const allowance = await checkAllowance(metadata.srcAddress, walletAddress, chainId);

      if (new BigNumber(allowance).lt(new BigNumber(params.selectedQuote.fromAmount))) {
        const approveMetadata = {
          tokenApprove: inputTokenInfo.slug,
          contractAddress: _getContractAddressOfToken(inputTokenInfo),
          spenderAddress: metadata.srcAddress
        };
        const submitStep: BaseStepDetail = {
          name: 'Approve token',
          type: CommonStepType.TOKEN_APPROVAL,
          metadata: approveMetadata as unknown as Record<string, unknown>
        };

        return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
      }
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

  async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.TOKEN_APPROVAL:
        return this.tokenApproveSpending(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }
  }

  private async tokenApproveSpending (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const walletAddress = params.address;
    const fromAmount = params.quote.fromAmount;

    const metadata = params.quote.metadata as OneInchMetadata;
    const chainId = metadata.chainId;
    const transactionForSign = await buildTxForApproveTradeWithRouter(params.address, chainId, fromAmount);

    console.log('transactionForSign', transactionForSign);

    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
    const gasLimit = await evmApi.api.eth.estimateGas(transactionForSign).catch(() => 200000);

    const transactionConfig: TransactionConfig = {
      ...transactionForSign,
      from: walletAddress,
      gas: gasLimit.toString()
    };

    const txData = {
      spenderAddress: transactionForSign.to,
      contractAddress: metadata.srcAddress,
      amount: fromAmount,
      owner: walletAddress,
      chain: fromAsset.originChain
    };

    return {
      txChain: fromAsset.originChain,
      extrinsicType: ExtrinsicType.TOKEN_SPENDING_APPROVAL,
      extrinsic: transactionConfig,
      txData,
      transferNativeAmount: '0',
      chainType: ChainType.EVM
    };
  }

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);

    const metadata = params.quote.metadata as OneInchMetadata;
    const swapParams: OneInchSwapParams = {
      src: metadata.srcAddress,
      dst: metadata.dstAddress,
      amount: params.quote.fromAmount,
      from: params.address,
      slippage: params.slippage,
      disableEstimate: false,
      allowPartialFill: false
    };

    const transactionConfig: TransactionConfig = await buildTxForSwap(swapParams, metadata.chainId);

    console.log('transactionConfig', transactionConfig);
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
    const bnAmount = BigInt(amount);

    if (bnAmount <= BigInt(0)) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')]);
    }

    return this.swapBaseHandler.validateSwapStep(params, false, 0);
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
