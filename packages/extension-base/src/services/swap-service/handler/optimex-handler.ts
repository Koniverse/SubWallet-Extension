// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { estimateTxFee } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { createBitcoinTransaction } from '@subwallet/extension-base/services/balance-service/transfer/bitcoin-transfer';
import { getERC20TransactionObject, getEVMTransactionObject } from '@subwallet/extension-base/services/balance-service/transfer/smart-contract';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _chainInfoToChainType, _getChainNativeTokenSlug, _getContractAddressOfToken, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { getAmountAfterSlippage } from '@subwallet/extension-base/services/swap-service/utils';
import { SWTransaction } from '@subwallet/extension-base/services/transaction-service/types';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, BitcoinFeeInfo, CommonFeeComponent, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, EvmFeeInfo, OptimalSwapPathParamsV2, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, combineBitcoinFee, getSizeInfo } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import keyring from '@subwallet/ui-keyring';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';

import { hexStripPrefix, u8aToHex } from '@polkadot/util';

interface OptimexQuoteMetadata {
  session_id: string;
  best_quote: string,
}

interface OptimexTradeRequest {
  session_id: string;
  amount_in: string;
  from_user_address: string;
  to_user_address: string;
  user_refund_address: string;
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
    this.baseUrl = isTestnet ? 'https://provider-stg.bitdex.xyz' : 'https://api.optimex.xyz'; // todo: move to cloud worker
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
    const pair = request.request.pair;
    const fromAsset = this.chainService.getAssetBySlug(pair.from);
    const fromChain = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const fromChainType = _chainInfoToChainType(fromChain);
    const sender = request.request.address;
    const receiver = request.request.recipient;
    const sendingValue = request.request.fromAmount;
    const slippage = request.request.slippage;
    const metadata = request.selectedQuote?.metadata as OptimexQuoteMetadata;
    const walletFeeInfo = request.selectedQuote?.feeInfo.feeComponent.find((fee) => fee.feeType === SwapFeeType.WALLET_FEE);

    if (!metadata || !walletFeeInfo) {
      return undefined;
    }

    let initTradeRequest: OptimexTradeRequest;
    const swAffiliate = walletFeeInfo.metadata as AffiliateInfo;

    if (fromChainType === ChainType.EVM) {
      initTradeRequest = {
        session_id: metadata.session_id,
        amount_in: sendingValue,
        from_user_address: sender, // compressPublicKey for BTC and SOLANA, address for EVM
        to_user_address: receiver || '', // Receiving address
        user_refund_address: sender, // Refund address if trade fails
        user_refund_pubkey: sender, // Refund pubkey if trade fails, in btc is pubkey and in evm is address
        creator_public_key: sender, // Compressed public key, in btc is pubkey and in evm is address
        from_wallet_address: sender, // Creator address
        min_amount_out: getAmountAfterSlippage(metadata.best_quote, slippage),
        affiliate_info: [swAffiliate]
      };
    } else if (fromChainType === ChainType.BITCOIN) {
      const fromPublicKey = hexStripPrefix(u8aToHex(keyring.getPair(sender).publicKey));

      initTradeRequest = {
        session_id: metadata.session_id,
        amount_in: sendingValue,
        from_user_address: fromPublicKey,
        to_user_address: receiver || '',
        user_refund_address: sender,
        user_refund_pubkey: fromPublicKey,
        creator_public_key: fromPublicKey,
        from_wallet_address: sender,
        min_amount_out: getAmountAfterSlippage(metadata.best_quote, slippage),
        affiliate_info: [swAffiliate]
      };
    } else {
      return undefined;
    }

    let tradeInfo: OptimexTradeMetadata;

    try {
      const rawResponse = await fetch(`${this.baseUrl}/v1/trades/initiate`, {
        method: 'POST',
        body: JSON.stringify(initTradeRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!rawResponse.ok) {
        console.log('Error bad request while init quote');

        return undefined;
      }

      const response = await rawResponse.json() as unknown as { data: OptimexTradeMetadata };

      tradeInfo = response.data;
    } catch (e) {
      console.log('Error while init quote');

      return undefined;
    }

    return tradeInfo;
  }

  async getApprovalStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    // todo: handle this when support route has approve step
    // const selectedQuote = params.selectedQuote;
    //
    // if (selectedQuote) {
    //   const metadata = selectedQuote.metadata as OptimexMetadata;
    // }

    return Promise.resolve(undefined);
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (!params.selectedQuote) {
      return Promise.resolve(undefined);
    }

    const originTokenInfo = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);
    const originChain = this.chainService.getChainInfoByKey(originTokenInfo.originChain);
    const destinationTokenInfo = this.chainService.getAssetBySlug(params.selectedQuote.pair.to);
    const destinationChain = this.chainService.getChainInfoByKey(destinationTokenInfo.originChain);

    const originChainType = _chainInfoToChainType(originChain);
    const originChainNativeTokenSlug = _getChainNativeTokenSlug(originChain);

    // Optimex do not return fee in quote. Need calculate network fee manually from client side
    let networkFeeAmount: string;
    const depositAddress = this.currentTradeMetadata?.deposit_address;

    if (!depositAddress) {
      console.log('Optimex Trade metadata is undefined, request for new quote');

      return Promise.resolve(undefined);
    }

    try {
      if (originChainType === ChainType.EVM) {
        const evmApi = this.chainService.getEvmApi(originChain.slug);
        const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(getId(), originChain.slug, 'evm') as EvmFeeInfo;

        let transactionConfig;

        if (_isNativeToken(originTokenInfo)) {
          [transactionConfig] = await getEVMTransactionObject({
            chain: originChain.slug,
            evmApi,
            from: params.request.address,
            to: depositAddress,
            value: params.request.fromAmount,
            feeInfo,
            transferAll: false,
            fallbackFee: true,
            data: this.currentTradeMetadata?.payload
          });
        } else {
          [transactionConfig] = await getERC20TransactionObject({
            assetAddress: _getContractAddressOfToken(originTokenInfo),
            chain: originChain.slug,
            evmApi: this.chainService.getEvmApi(originChain.slug),
            from: params.request.address,
            to: depositAddress,
            value: params.request.fromAmount,
            feeInfo,
            transferAll: false
          });
        }

        networkFeeAmount = await estimateTxFee(transactionConfig, evmApi, feeInfo);
      } else if (originChainType === ChainType.BITCOIN) {
        const bitcoinApi = this.chainService.getBitcoinApi(originChain.slug);
        const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(getId(), originChain.slug, 'bitcoin');
        const network = originChain.isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

        const [transaction] = await createBitcoinTransaction({
          bitcoinApi,
          chain: originChain.slug,
          from: params.request.address,
          feeInfo,
          to: depositAddress,
          transferAll: false,
          value: params.request.fromAmount,
          network
        });

        const feeCombine = combineBitcoinFee(feeInfo as BitcoinFeeInfo, undefined, undefined); // todo: recheck when implement custom fee

        const recipients: string[] = [];

        for (const txOutput of transaction.txOutputs) {
          txOutput.address && recipients.push(txOutput.address);
        }

        const sizeInfo = getSizeInfo({
          inputLength: transaction.inputCount,
          recipients: recipients,
          sender: params.request.address
        });

        networkFeeAmount = Math.ceil(feeCombine.feeRate * sizeInfo.txVBytes).toString();
      } else {
        console.log('Unsupported swap from this chain type', originChainType);

        return Promise.resolve(undefined);
      }
    } catch (e) {
      throw new Error((e as Error).message);
    }

    const networkFee: CommonFeeComponent = {
      amount: networkFeeAmount || '0',
      feeType: SwapFeeType.NETWORK_FEE,
      tokenSlug: originChainNativeTokenSlug
    };

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

    const feeInfo: CommonStepFeeInfo = {
      defaultFeeToken: params.selectedQuote.feeInfo.defaultFeeToken,
      feeComponent: [...params.selectedQuote.feeInfo.feeComponent, networkFee],
      feeOptions: params.selectedQuote.feeInfo.feeOptions
    };

    return Promise.resolve([submitStep, feeInfo]);
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

    const swapIndex = params.process.steps.findIndex((step) => step.type === SwapStepType.SWAP);

    if (swapIndex <= -1) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (swap) {
      return this.swapBaseHandler.validateSwapOnlyProcess(params, swapIndex);
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

  public handleApproveStep (params: SwapSubmitParams) {
    // todo: handle this when support route has approve step
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

    const depositAddress = this.currentTradeMetadata?.deposit_address;
    const tradeId = this.currentTradeMetadata?.trade_id;
    const payload = this.currentTradeMetadata?.payload; // undefined in case swap from btc

    if (!depositAddress || !tradeId) {
      throw new Error('Optimex Trade metadata is undefined, request for new quote');
    }

    const txData = {
      address,
      provider: this.providerInfo,
      quote,
      slippage,
      recipient,
      process
    };

    let extrinsic: SWTransaction['transaction'];

    // dont remove this log
    console.log('Optimex Trade metadata:', depositAddress);
    console.log('Optimex Trade channel:', `https://provider-api-docs.vercel.app/swap/${tradeId}`); // todo: log for mainnet

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
          transferAll: false,
          data: payload
        });

        extrinsic = {
          ...transactionConfig,
          data: payload
        };
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

    // reset tradeMetadata after use // todo: review to check if need this clear
    // this.currentTradeMetadata = undefined;

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? quote.fromAmount : '0',
      extrinsicType: ExtrinsicType.SWAP,
      chainType
    } as SwapSubmitStepData;
  }
}
