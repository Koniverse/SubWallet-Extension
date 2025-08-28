// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { createBitcoinTransaction } from '@subwallet/extension-base/services/balance-service/transfer/bitcoin-transfer';
import { getERC20TransactionObject, getEVMTransactionObject } from '@subwallet/extension-base/services/balance-service/transfer/smart-contract';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _chainInfoToChainType, _getContractAddressOfToken, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { SWTransaction } from '@subwallet/extension-base/services/transaction-service/types';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, OptimalSwapPathParamsV2, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';

interface OptimexQuoteMetadata {
  session_id: string;
  best_quote: string,
}

interface OptimexTradeRequest {
  session_id: string;
  amount_in: string;
  from_user_address: string;
  to_user_address: string;
  userRefundAddress: string;
  user_refund_pubkey: string;
  creator_public_key: string;
  from_wallet_address: string;
  min_amount_out: string;
  affiliate_info: AffiliateInfo[]
}

interface AffiliateInfo {
  provider: string;
  rate: string;
  receiver: string;
  network: string;
}

interface OptimexTradeMetadata {
  trade_id: string;
  deposit_address: string;
  payload: string;
  need_approve: boolean;
  approve_address: string;
  approve_payload: string;
}

export class OptimexHandler implements SwapBaseInterface {
  private readonly baseUrl: string;
  private currentTradeMetadata: OptimexTradeMetadata | undefined;
  private swapBaseHandler: SwapBaseHandler;
  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, isTestnet = true) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: isTestnet ? 'Optimex Testnet' : 'Optimex',
      providerSlug: isTestnet ? SwapProviderId.OPTIMEX_TESTNET : SwapProviderId.OPTIMEX
    });
    this.providerSlug = isTestnet ? SwapProviderId.OPTIMEX_TESTNET : SwapProviderId.OPTIMEX;
    this.baseUrl = isTestnet ? 'https://provider-stg.bitdex.xyz' : 'https://api.optimex.xyz';
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get providerInfo () {
    return this.swapBaseHandler.providerInfo;
  }

  get name () {
    return this.swapBaseHandler.name;
  }

  get slug () {
    return this.swapBaseHandler.slug;
  }

  async generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    const tradeMetadata = await this.initTrade(params);

    if (!tradeMetadata) {
      throw new Error('Error generating optimal process: Cannot init Optimex trade');
    }

    const isNeedApprove = tradeMetadata.need_approve;

    this.currentTradeMetadata = tradeMetadata;

    if (!isNeedApprove) {
      return this.swapBaseHandler.generateOptimalProcessV2(params, [
        this.getSubmitStep.bind(this)
      ]);
    }

    if (!tradeMetadata.approve_address || !tradeMetadata.approve_payload) {
      throw new Error('Error generating optimal process: Lack of approve info');
    }

    return this.swapBaseHandler.generateOptimalProcessV2(params, [
      this.getApprovalStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  async initTrade (request: OptimalSwapPathParamsV2) {
    const metadata = request.selectedQuote?.metadata as OptimexMetadata;

    if (!metadata) {
      return undefined;
    }

    const swAffiliate = {
      provider: 'SubWallet',
      rate: '25',
      receiver: '0xdd718f9Ecaf8f144a3140b79361b5D713D3A6b19',
      network: 'ethereum'
    };

    const sender = request.request.address;
    const receiver = request.request.recipient;
    const sendingValue = request.request.fromAmount;

    // todo: btc -> eth
    const body: OptimexTradeRequest = {
      session_id: metadata.session_id,
      amount_in: sendingValue,
      from_user_address: sender,
      to_user_address: receiver || '', // todo
      userRefundAddress: sender,
      user_refund_pubkey: sender,
      creator_public_key: sender,
      from_wallet_address: sender,
      min_amount_out: metadata.best_quote,
      affiliate_info: [swAffiliate]
    };

    let tradeInfo: OptimexTradeMetadata;

    try {
      const rawResponse = await fetch(`${this.baseUrl}/v1/trades/initiate`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!rawResponse.ok) {
        console.log('Error while init quote');
      }

      const response = await rawResponse.json() as unknown as { data: OptimexTradeMetadata };

      tradeInfo = response.data;
    } catch {
      return undefined;
    }

    return tradeInfo;
  }

  async getApprovalStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    // todo: implement this
    // const selectedQuote = params.selectedQuote;
    //
    // if (selectedQuote) {
    //   const metadata = selectedQuote.metadata as OptimexMetadata;
    // }

    console.log('params', params);
    console.log('approve', this.currentTradeMetadata);

    return Promise.resolve(undefined);
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (!params.selectedQuote) {
      return Promise.resolve(undefined);
    }

    const originTokenInfo = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);
    const destinationTokenInfo = this.chainService.getAssetBySlug(params.selectedQuote.pair.to);
    const originChain = this.chainService.getChainInfoByKey(originTokenInfo.originChain);
    const destinationChain = this.chainService.getChainInfoByKey(destinationTokenInfo.originChain);

    const submitStep: BaseStepDetail = {
      name: 'Swap',
      type: SwapStepType.SWAP,
      // @ts-ignore
      metadata: {
        sendingValue: params.request.fromAmount.toString(),
        expectedReceive: params.selectedQuote.toAmount,
        originTokenInfo,
        destinationTokenInfo,
        sender: _reformatAddressWithChain(params.request.address, originChain),
        receiver: _reformatAddressWithChain(params.request.recipient || params.request.address, destinationChain),
        version: 2
      } as unknown as BaseSwapStepMetadata
    };

    return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
  }

  public async validateSwapProcessV2 (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const { process, selectedQuote } = params;

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

  public async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.DEFAULT:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
      case CommonStepType.TOKEN_APPROVAL:
        return this.handleApproveStep(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  public async handleApproveStep (params: SwapSubmitParams) {
    // todo:
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);

    return {
      txChain: fromAsset.originChain,
      txData: '',
      extrinsic: {},
      extrinsicType: ExtrinsicType.TOKEN_SPENDING_APPROVAL,
      transferNativeAmount: '0',
      chainType: ChainType.EVM
    };
  }

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { address, process, quote, recipient, slippage } = params;

    const pair = quote.pair;
    const fromAsset = this.chainService.getAssetBySlug(pair.from);
    const chainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const chainType = _chainInfoToChainType(chainInfo);

    const txData = {
      address,
      provider: this.providerInfo,
      quote,
      slippage,
      recipient,
      process
    };

    let extrinsic: SWTransaction['transaction'];

    if (!this.currentTradeMetadata) {
      throw new Error('Unknown trade metadata');
    }

    const depositAddress = this.currentTradeMetadata.deposit_address;

    if (chainType === ChainType.BITCOIN) {
      const bitcoinApi = this.chainService.getBitcoinApi(chainInfo.slug);
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(getId(), chainInfo.slug, 'bitcoin');
      const network = chainInfo.isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

      const [transaction] = await createBitcoinTransaction({
        bitcoinApi,
        chain: chainInfo.slug,
        from: address,
        feeInfo,
        to: depositAddress,
        transferAll: false,
        value: quote.fromAmount,
        network
      });

      extrinsic = transaction;
    } else if (chainType === ChainType.EVM) {
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(getId(), chainInfo.slug, 'evm');

      if (_isNativeToken(fromAsset)) {
        const [transactionConfig] = await getEVMTransactionObject({
          chain: chainInfo.slug,
          evmApi: this.chainService.getEvmApi(chainInfo.slug),
          from: address,
          to: depositAddress,
          value: quote.fromAmount,
          feeInfo,
          transferAll: false
        });

        extrinsic = transactionConfig;
      } else {
        const [transactionConfig] = await getERC20TransactionObject({
          assetAddress: _getContractAddressOfToken(fromAsset),
          chain: chainInfo.slug,
          evmApi: this.chainService.getEvmApi(chainInfo.slug),
          from: address,
          to: depositAddress,
          value: quote.fromAmount,
          feeInfo,
          transferAll: false
        });

        extrinsic = transactionConfig;
      }
    } else {
      throw new Error('Unknown swap chain type');
    }

    // reset tradeMetadata after use
    this.currentTradeMetadata = undefined;

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? quote.fromAmount : '0', // todo
      extrinsicType: ExtrinsicType.SWAP,
      chainType
    } as SwapSubmitStepData;
  }
}
