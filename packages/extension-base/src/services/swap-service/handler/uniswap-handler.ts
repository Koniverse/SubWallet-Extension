// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateTypedSignMessageDataV3V4 } from '@subwallet/extension-base/core/logic-validation';
import { estimateTxFee, getERC20Allowance, getERC20SpendingApprovalTx } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { createAcrossBridgeExtrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm';
import { SpokePoolMapping } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import TransactionService from '@subwallet/extension-base/services/transaction-service';
import { ApproveStepMetadata, BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, EvmFeeInfo, FeeOptionKey, GenSwapStepFuncV2, HandleYieldStepData, OptimalSwapPathParamsV2, PermitSwapData, SwapBaseTxData, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TokenSpendingApprovalParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getAssetOriginChain, _getChainNativeTokenSlug, _getContractAddressOfToken, _getEvmChainId, _isNativeToken } from '../../chain-service/utils';
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

export interface UniswapMetadata {
  permitData: PermitData;
  quote: UniswapQuote;
  routing: string;
}

type UniswapQuote = UniswapClassicQuote | UniswapDutchQuote;

interface UniswapClassicQuote {
  swapper: string
  chainId: number
  input: {
    amount: string
    token: string
  }
  output: {
    amount: string
    token: string
  }
}

interface UniswapDutchQuote {
  orderInfo: {
    swapper: string
    chainId: number
    input: {
      startAmount: string
      endAmount: string
      token: string
    },
    outputs: {
      startAmount: string
      endAmount: string
      token: string
    }[]
  },
  orderId: string
}

export interface UniswapOrders {
  orders: UniswapOrderInfo[]
}

export interface UniswapOrderInfo {
  orderStatus: 'open' | 'expired' | 'error' | 'cancelled' | 'filled' | 'unverified' | 'insufficient-funds',
  orderId: string,
  swapper: string,
  txHash: string
}

interface SwapResponse {
  swap: TransactionConfig
}

interface CheckApprovalRequest {
  address: string,
  amount: string,
  // only one in two quote is provided.
  dutchQuote?: UniswapDutchQuote,
  classicQuote?: UniswapClassicQuote
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

async function fetchCheckApproval (request: CheckApprovalRequest): Promise<CheckApprovalResponse | undefined> {
  const { address, amount, classicQuote, dutchQuote } = request;

  let chainId;
  let tokenIn;
  let tokenOut;

  if (classicQuote) {
    chainId = classicQuote.chainId;
    tokenIn = classicQuote.input.token;
    tokenOut = classicQuote.output.token;
  } else if (dutchQuote) {
    chainId = dutchQuote.orderInfo.chainId;
    tokenIn = dutchQuote.orderInfo.input.token;
    tokenOut = dutchQuote.orderInfo.outputs[0].token;
  } else {
    return undefined;
  }

  const response = await fetch(`${API_URL}/check_approval`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      walletAddress: address,
      amount: BigNumber(amount).multipliedBy(2).toString(),
      token: tokenIn,
      chainId: chainId,
      tokenOut: tokenOut,
      tokenOutChainId: chainId // swap in-chain
    })
  });

  return await response.json() as CheckApprovalResponse;
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
    const stepFuncList: GenSwapStepFuncV2[] = [];
    /**
     * approve - permit - swap or
     * approve - permit - swap - approve - bridge
     */

    params.path.forEach((step) => {
      if (step.action === DynamicSwapType.SWAP) {
        stepFuncList.push(...[
          this.getApprovalStep.bind(this),
          this.getPermitStep.bind(this),
          this.getSubmitStep.bind(this)
        ]);

        return;
      }

      if (step.action === DynamicSwapType.BRIDGE) {
        stepFuncList.push(...[
          this.getApprovalStep.bind(this),
          this.getBridgeStep.bind(this)
        ]);

        return;
      }

      throw new Error(`Error generating optimal process: Action ${step.action as string} is not supported`);
    });

    return this.swapBaseHandler.generateOptimalProcessV2(params, stepFuncList);
  }

  async getApprovalStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (stepIndex === 0) {
      return this.getApproveSwap(params);
    }

    if (stepIndex === 3) {
      return this.getApproveBridge(params);
    }

    return Promise.resolve(undefined);
  }

  async getApproveSwap (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const selectedQuote = params.selectedQuote;

    if (!selectedQuote) {
      return Promise.resolve(undefined);
    }

    const quoteMetadata = selectedQuote.metadata as UniswapMetadata;

    let sender;
    let sendingValue;
    let checkApprovalResponse;

    if (quoteMetadata.routing === 'CLASSIC') {
      const quote = quoteMetadata.quote as UniswapClassicQuote;

      sender = quote.swapper;
      sendingValue = quote.input.amount;
      checkApprovalResponse = await fetchCheckApproval({
        address: sender,
        amount: sendingValue,
        classicQuote: quote
      });
    } else if (quoteMetadata.routing === 'DUTCH_LIMIT' || quoteMetadata.routing === 'DUTCH_V2') {
      const quote = quoteMetadata.quote as UniswapDutchQuote;

      sender = quote.orderInfo.swapper;
      sendingValue = quote.orderInfo.input.startAmount;
      checkApprovalResponse = await fetchCheckApproval({
        address: sender,
        amount: sendingValue,
        dutchQuote: quote
      });
    } else {
      return undefined;
    }

    if (!checkApprovalResponse) {
      return undefined;
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(selectedQuote.pair.from);

    const approval = checkApprovalResponse.approval;

    if (!approval) {
      return Promise.resolve(undefined);
    }

    let spender = '';

    try {
      const valueLength = 40;

      spender = approval.data.slice(-(valueLength * 2), -valueLength);
    } catch (e) {
      // Empty
    }

    const submitStep: BaseStepDetail = {
      name: 'Approve token for swap',
      type: CommonStepType.TOKEN_APPROVAL,
      // @ts-ignore
      metadata: {
        tokenApprove: fromTokenInfo.slug,
        contractAddress: _getContractAddressOfToken(fromTokenInfo) || approval.to,
        spenderAddress: spender,
        owner: sender, // todo: use approval.from?
        amount: sendingValue,
        isUniswapApprove: true
      } as ApproveStepMetadata
    };

    return Promise.resolve([submitStep, selectedQuote.feeInfo]); // todo: wrong feeInfo, please check
  }

  async getApproveBridge (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const quote = params.selectedQuote;

    if (!quote) {
      return Promise.resolve(undefined);
    }

    const sendingAmount = quote.toAmount;
    const senderAddress = params.request.address;
    const fromTokenInfo = this.chainService.getAssetBySlug(quote.pair.to);
    const fromChainInfo = this.chainService.getChainInfoByKey(_getAssetOriginChain(fromTokenInfo));
    const fromChainId = _getEvmChainId(fromChainInfo);
    const evmApi = this.chainService.getEvmApi(fromChainInfo.slug);
    const tokenContract = _getContractAddressOfToken(fromTokenInfo);

    if (_isNativeToken(fromTokenInfo)) {
      return Promise.resolve(undefined);
    }

    if (!fromChainId) {
      throw Error('Error getting Evm chain Id');
    }

    const spokePoolAddress = SpokePoolMapping[fromChainId].SpokePool.address;

    const allowance = await getERC20Allowance(spokePoolAddress, senderAddress, tokenContract, evmApi);

    if (allowance && BigNumber(allowance).gt(sendingAmount)) {
      return Promise.resolve(undefined);
    }

    const tx = await getERC20SpendingApprovalTx(spokePoolAddress, senderAddress, tokenContract, evmApi);
    const evmFeeInfo = await this.feeService.subscribeChainFee(getId(), fromTokenInfo.originChain, 'evm') as EvmFeeInfo;
    const estimatedFee = await estimateTxFee(tx, evmApi, evmFeeInfo);

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

    const submitStep: BaseStepDetail = {
      name: 'Approve token for bridge',
      type: CommonStepType.TOKEN_APPROVAL,
      // @ts-ignore
      metadata: {
        tokenApprove: fromTokenInfo.slug,
        contractAddress: tokenContract,
        spenderAddress: spokePoolAddress,
        amount: sendingAmount,
        owner: senderAddress
      } as ApproveStepMetadata
    };

    return Promise.resolve([submitStep, feeInfo]);
  }

  async getPermitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
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

  async getBridgeStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request, selectedQuote } = params;

    // stepIndex is not corresponding index in path, because uniswap include approval and permit step
    const bridgePairInfo = path.find((action) => action.action === DynamicSwapType.BRIDGE);

    if (!bridgePairInfo || !bridgePairInfo.pair) {
      return Promise.resolve(undefined);
    }

    if (!selectedQuote) {
      return Promise.resolve(undefined);
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(bridgePairInfo.pair.from);
    const toTokenInfo = this.chainService.getAssetBySlug(bridgePairInfo.pair.to);
    const fromChainInfo = this.chainService.getChainInfoByKey(fromTokenInfo.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toTokenInfo.originChain);

    if (!fromChainInfo || !toChainInfo || !fromChainInfo || !toChainInfo) {
      throw Error('Token or chain not found');
    }

    const senderAddress = _reformatAddressWithChain(request.address, fromChainInfo);
    const receiverAddress = _reformatAddressWithChain(request.recipient || request.address, toChainInfo);
    const sendingValue = BigNumber(selectedQuote.toAmount).div(1.02).toFixed(0, 1);

    try {
      const evmApi = await this.chainService.getEvmApi(fromChainInfo.slug).isReady;
      const feeInfo = await this.feeService.subscribeChainFee(getId(), fromTokenInfo.originChain, 'evm') as EvmFeeInfo;

      const tx = await createAcrossBridgeExtrinsic({
        originTokenInfo: fromTokenInfo,
        destinationTokenInfo: toTokenInfo,
        originChain: fromChainInfo,
        destinationChain: toChainInfo,
        evmApi,
        feeInfo,
        // Mock sending value to get payment info
        sendingValue,
        sender: senderAddress,
        recipient: receiverAddress
      });

      // // todo: wait until this ready to get destination fee. the real receiveAmount is deduce by this fee
      // const acrossQuote = await getAcrossQuote({
      //   destinationChain: toChainInfo,
      //   destinationTokenInfo: toTokenInfo,
      //   originChain: fromChainInfo,
      //   originTokenInfo: fromTokenInfo,
      //   recipient: receiverAddress,
      //   sender: senderAddress,
      //   sendingValue,
      //   feeInfo
      // });

      const estimatedBridgeFee = await estimateTxFee(tx, evmApi, feeInfo);
      const expectedReceive = BigNumber(sendingValue).minus(estimatedBridgeFee).toFixed(0, 1);

      const fee: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: estimatedBridgeFee,
          tokenSlug: _getChainNativeTokenSlug(fromChainInfo)
        }],
        defaultFeeToken: _getChainNativeTokenSlug(fromChainInfo),
        feeOptions: [_getChainNativeTokenSlug(fromChainInfo)]
      };

      const step: BaseStepDetail = {
        // @ts-ignore
        metadata: {
          sendingValue: sendingValue,
          expectedReceive,
          originTokenInfo: fromTokenInfo,
          destinationTokenInfo: toTokenInfo,
          receiver: receiverAddress,
          sender: senderAddress
        } as BaseSwapStepMetadata,
        name: `Transfer ${fromTokenInfo.symbol} from ${fromChainInfo.name}`,
        type: CommonStepType.XCM
      };

      return [step, fee];
    } catch (e) {
      console.error('Error creating bridge step', e);

      throw new Error((e as Error).message);
    }
  }

  public async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.DEFAULT:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
      case CommonStepType.TOKEN_APPROVAL:
        return this.tokenApproveSpending(params);
      case CommonStepType.XCM:
        return this.swapBaseHandler.handleBridgeStep(params, 'across');
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      case SwapStepType.PERMIT:
        return this.handlePermitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  private async tokenApproveSpending (params: SwapSubmitParams): Promise<HandleYieldStepData> {
    const approveStep = params.process.steps[params.currentStep].metadata as unknown as ApproveStepMetadata;

    if (!approveStep || !approveStep.tokenApprove || !approveStep.contractAddress || !approveStep.spenderAddress) {
      throw new Error('Approval spending metadata error');
    }

    if (approveStep.isUniswapApprove) {
      return this.approveSpendingSwap(params, approveStep);
    }

    return this.approveSpendingBridge(approveStep);
  }

  private async approveSpendingSwap (params: SwapSubmitParams, approveStep: ApproveStepMetadata): Promise<HandleYieldStepData> {
    const fromAsset = this.chainService.getAssetBySlug(approveStep.tokenApprove);
    const sender = approveStep.owner;
    const sendingValue = approveStep.amount;

    if (!sender || !sendingValue) {
      throw new Error('Sender or value is not found');
    }

    const quoteMetadata = params.quote.metadata as UniswapMetadata;

    let spenderAddress;
    let contractAddress;
    let chainId;
    let checkApprovalResponse;

    if (quoteMetadata.routing === 'CLASSIC') {
      const quote = quoteMetadata.quote as UniswapClassicQuote;

      spenderAddress = quote.output.token;
      contractAddress = quote.input.token;
      chainId = quote.chainId.toString();
      checkApprovalResponse = await fetchCheckApproval({
        address: sender,
        amount: sendingValue,
        classicQuote: quote
      });
    } else if (quoteMetadata.routing === 'DUTCH_LIMIT' || quoteMetadata.routing === 'DUTCH_V2') {
      const quote = quoteMetadata.quote as UniswapDutchQuote;

      spenderAddress = quote.orderInfo.outputs[0].token;
      contractAddress = quote.orderInfo.input.token;
      chainId = quote.orderInfo.chainId.toString();
      checkApprovalResponse = await fetchCheckApproval({
        address: sender,
        amount: sendingValue,
        dutchQuote: quote
      });
    } else {
      throw Error('Unsupported quote route');
    }

    let transactionConfig: TransactionConfig = {} as TransactionConfig;

    if (!checkApprovalResponse) {
      throw new Error('Check approval fail');
    }

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
      spenderAddress,
      contractAddress,
      amount: params.quote.fromAmount,
      owner: params.address,
      chain: chainId
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

  private async approveSpendingBridge (approveStep: ApproveStepMetadata): Promise<HandleYieldStepData> {
    const fromAsset = this.chainService.getAssetBySlug(approveStep.tokenApprove);
    const fromChain = _getAssetOriginChain(fromAsset);
    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
    const sender = approveStep.owner;
    const sendingValue = approveStep.amount;

    if (!sender) {
      throw new Error('Sender or value is not found');
    }

    const spenderAddress = approveStep.spenderAddress;
    const contractAddress = approveStep.contractAddress;

    const transactionConfig = await getERC20SpendingApprovalTx(spenderAddress, sender, contractAddress, evmApi);

    const _data: TokenSpendingApprovalParams = {
      spenderAddress: approveStep.spenderAddress,
      contractAddress: approveStep.contractAddress,
      amount: sendingValue,
      owner: sender,
      chain: fromChain
    };

    return Promise.resolve({
      txChain: fromChain,
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

    let signature: string | undefined = '';

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
      const dutchQuote = quote as UniswapDutchQuote;

      const submitSwapOrder = async () => {
        try {
          const res = await fetch(`${API_URL}/order`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              signature: signature,
              quote: dutchQuote
            })
          });

          return res.ok;
        } catch (e) {
          console.log(e);

          return false;
        }
      };

      const retryGetUniswapTx = async (fn: () => Promise<UniswapOrderInfo | undefined>, options: { retries: number, delay: number }): Promise<UniswapOrderInfo | undefined> => {
        let lastError: Error | undefined;

        for (let i = 0; i < options.retries; i++) {
          try {
            const orderInfo = await fn();

            if (orderInfo && orderInfo.orderStatus === 'filled') {
              return orderInfo;
            }

            await new Promise((resolve) => setTimeout(resolve, options.delay));
          } catch (e) {
            if (e instanceof Error) {
              lastError = e;
            }

            await new Promise((resolve) => setTimeout(resolve, options.delay));
          }
        }

        console.error('UniswapX order timeout', lastError); // throw only last error, in case no successful result from fn()

        return undefined;
      };

      const cronCheckTxSuccess = async (): Promise<UniswapOrderInfo | undefined> => {
        const delay = 10000;
        const retries = 50;

        const orderId = dutchQuote.orderId;
        const swapper = dutchQuote.orderInfo.swapper;

        return retryGetUniswapTx(async () => {
          try {
            const response = await fetch(`${API_URL}/orders?orderId=${orderId}&swapper=${swapper}`, {
              method: 'GET',
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const res = await response.json() as UniswapOrders;

              return res.orders.find((e) => e.orderId === orderId && e.swapper === swapper);
            }

            return undefined;
          } catch (e) {
            return undefined;
          }
        }, { retries, delay });
      };

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
        extrinsic: {
          submitSwapOrder,
          cronCheckTxSuccess
        },
        transferNativeAmount: _isNativeToken(fromAsset) ? params.quote.fromAmount : '0',
        extrinsicType: ExtrinsicType.SWAP,
        chainType: ChainType.EVM,
        isDutch: true
      } as SwapSubmitStepData;
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
    const { permitData, routing } = params.quote.metadata as UniswapMetadata;
    const processId = params.cacheProcessId;
    const primaryType = routing === 'CLASSIC'
      ? 'PermitSingle'
      : routing === 'DUTCH_LIMIT' || routing === 'DUTCH_V2'
        ? 'PermitWitnessTransferFrom'
        : ''; // todo

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
        primaryType,
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

    const swapIndex = params.process.steps.findIndex((step) => step.type === SwapStepType.SWAP);
    const bridgeIndex = params.process.steps.findIndex((step) => step.type === CommonStepType.XCM);

    if (swapIndex <= -1) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (swapXcm && bridgeIndex <= -1) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (swap) {
      return this.swapBaseHandler.validateSwapOnlyProcess(params, swapIndex); // todo: create interface for input request
    }

    if (swapXcm) {
      return this.swapBaseHandler.validateSwapXcmProcess(params, swapIndex, bridgeIndex);
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
