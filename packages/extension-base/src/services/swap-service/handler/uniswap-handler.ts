// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateTypedSignMessageDataV3V4 } from '@subwallet/extension-base/core/logic-validation';
import TransactionService from '@subwallet/extension-base/services/transaction-service';
import { ApproveStepMetadata, BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, FeeOptionKey, HandleYieldStepData, OptimalSwapPathParams, OptimalSwapPathParamsV2, PermitSwapData, SwapBaseTxData, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TokenSpendingApprovalParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getContractAddressOfToken, _isNativeToken } from '../../chain-service/utils';
import FeeService from '../../fee-service/service';
import { calculateGasFeeParams } from '../../fee-service/utils';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

const API_URL = 'https://trade-api.gateway.uniswap.org/v1';
const headers = {
  'x-api-key': process.env.UNISWAP_API_KEY || ''
};

export type PermitData = {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  values: unknown;
};

interface UniswapMetadata {
  permitData: PermitData;
  quote: UniswapQuote;
  routing: string;
}

interface UniswapQuote {
  chainId: number;
  input: {
    amount: string;
    token: string;
  };
  output: {
    amount: string;
    token: string;
  };
}
interface SwapResponse {
  swap: TransactionConfig
}

interface CheckApprovalResponse {
  requestId: string;
  approval?: {
    to: string;
    value: string;
    from: string;
    data: string;
  };
  cancel: any;
}

async function fetchCheckApproval (walletAddress: string, fromAmount: string, quote: UniswapQuote): Promise<CheckApprovalResponse> {
  const chainId = quote.chainId;
  const response = await fetch(`${API_URL}/check_approval`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      walletAddress,
      amount: BigNumber(fromAmount).multipliedBy(2).toString(),
      token: quote.input.token,
      chainId: chainId,
      tokenOut: quote.output.token,
      tokenOutChainId: chainId
    })
  });

  const data = await response.json() as CheckApprovalResponse;

  return data;
}

export class UniswapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  public transactionService: TransactionService;

  providerSlug: SwapProviderId;
  constructor (chainService: ChainService, balanceService: BalanceService, transactionService: TransactionService, feeService: FeeService) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: 'Uniswap',
      providerSlug: SwapProviderId.UNISWAP
    });

    this.transactionService = transactionService;
    this.providerSlug = SwapProviderId.UNISWAP;
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
      this.getPermitStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  async getApprovalStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const walletAddress = params.request.address;
      const fromAmount = params.selectedQuote.fromAmount;
      const inputTokenInfo = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);
      const { quote } = params.selectedQuote.metadata as UniswapMetadata;

      const checkApprovalResponse = await fetchCheckApproval(walletAddress, fromAmount, quote);
      const approval = checkApprovalResponse.approval;

      if (approval) {
        let spender = '';

        try {
          const valueLength = 40;

          spender = approval.data.slice(-(valueLength * 2), -valueLength);
        } catch (e) {
          // Empty
        }

        const metadata: ApproveStepMetadata = {
          tokenApprove: inputTokenInfo.slug,
          contractAddress: _getContractAddressOfToken(inputTokenInfo),
          spenderAddress: spender
        };

        const submitStep = {
          name: 'Approve token',
          type: CommonStepType.TOKEN_APPROVAL,
          metadata: metadata as unknown as Record<string, unknown>
        };

        return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
      }
    }

    return Promise.resolve(undefined);
  }

  async getPermitStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote && (params.selectedQuote.metadata as UniswapMetadata).permitData) {
      const submitStep = {
        name: 'Permit Step',
        type: SwapStepType.PERMIT
      };
      // TODO: GET NATIVE TOKEN
      const defaultFeeToken = params.selectedQuote.feeInfo.defaultFeeToken;
      const feeInfo: CommonStepFeeInfo = {
        feeComponent: [
          {
            amount: '0',
            feeType: SwapFeeType.NETWORK_FEE,
            tokenSlug: defaultFeeToken
          }
        ],
        defaultFeeToken: defaultFeeToken,
        feeOptions: [defaultFeeToken]
      };

      return Promise.resolve([submitStep, feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const stepData = params.path[stepIndex];

    if (stepData.action !== DynamicSwapType.SWAP) {
      return Promise.resolve(undefined);
    }

    if (params.selectedQuote) {
      const submitStep: BaseStepDetail = {
        name: 'Swap',
        type: SwapStepType.SWAP,
        // @ts-ignore
        metadata: {
          sendingValue: params.request.fromAmount.toString(),
          originTokenInfo: this.chainService.getAssetBySlug(params.selectedQuote.pair.from),
          destinationTokenInfo: this.chainService.getAssetBySlug(params.selectedQuote.pair.to)
        } as unknown as BaseSwapStepMetadata
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
      case SwapStepType.PERMIT:
        return this.handlePermitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  private async tokenApproveSpending (params: SwapSubmitParams): Promise<HandleYieldStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const walletAddress = params.address;
    const fromAmount = params.quote.fromAmount;
    const { quote } = params.quote.metadata as UniswapMetadata;

    const checkApprovalResponse = await fetchCheckApproval(walletAddress, fromAmount, quote);
    let transactionConfig: TransactionConfig = {} as TransactionConfig;

    const approval = checkApprovalResponse.approval as TransactionConfig;

    if (approval) {
      const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
      const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

      transactionConfig = {
        from: approval.from,
        to: approval.to,
        value: approval.value,
        data: approval.data,
        gasPrice: priority.gasPrice,
        maxFeePerGas: priority.options?.[FeeOptionKey.AVERAGE].maxFeePerGas?.toString(),
        maxPriorityFeePerGas: priority.options?.[FeeOptionKey.AVERAGE].maxPriorityFeePerGas.toString()
      };
      const gasLimit = await evmApi.api.eth.estimateGas(transactionConfig).catch(() => 200000);

      transactionConfig.gas = gasLimit.toString();
    }

    const chain = fromAsset.originChain;

    const _data: TokenSpendingApprovalParams = {
      spenderAddress: quote.output.token,
      contractAddress: quote.input.token,
      amount: params.quote.fromAmount,
      owner: params.address,
      chain: quote.chainId.toString()
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

    const { permitData, quote, routing } = params.quote.metadata as UniswapMetadata;
    const processId = params.cacheProcessId;

    let signature: string | undefined;

    if (permitData) {
      signature = this.transactionService.getCacheInfo(processId, SwapStepType.PERMIT);
    }

    let postTransactionResponse;
    let extrinsic;

    if (routing === 'CLASSIC' || routing === 'WRAP' || routing === 'UNWRAP') {
      const body: Record<string, any> = {
        signature: signature,
        quote: quote
      };

      if (permitData) {
        body.permitData = permitData;
      }

      postTransactionResponse = await fetch(`${API_URL}/swap`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const transactionResponse = await postTransactionResponse.json() as SwapResponse;

      extrinsic = transactionResponse.swap;
    } else if (routing === 'DUTCH_LIMIT' || routing === 'DUTCH_V2') {
      postTransactionResponse = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature: signature,
          quote: quote
        })
      });
    }

    const txData: SwapBaseTxData = {
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
      extrinsic: extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? params.quote.fromAmount : '0',
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.EVM
    } as SwapSubmitStepData;
  }

  public handlePermitStep (params: SwapSubmitParams) {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const { permitData } = params.quote.metadata as UniswapMetadata;
    const processId = params.cacheProcessId;

    let validatePayload;

    if (permitData) {
      const payload = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          ...permitData.types
        },
        domain: permitData.domain,
        primaryType: 'PermitSingle',
        message: permitData.values
      };

      validatePayload = validateTypedSignMessageDataV3V4({ data: payload, from: params.address });
    }

    const txData: PermitSwapData = {
      processId,
      step: SwapStepType.PERMIT
    };

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic: validatePayload as unknown as TransactionConfig,
      extrinsicType: ExtrinsicType.TOKEN_SPENDING_APPROVAL,
      transferNativeAmount: '0',
      chainType: ChainType.EVM,
      isPermit: true
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
