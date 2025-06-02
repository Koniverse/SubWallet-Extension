// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_ASSETS } from '@subwallet/chain-list';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { formatExternalServiceApi, ProxyServiceRoute, SW_EXTERNAL_SERVICES_API } from '@subwallet/extension-base/constants';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { getERC20TransactionObject, getEVMTransactionObject } from '@subwallet/extension-base/services/balance-service/transfer/smart-contract';
import { createSubstrateExtrinsic } from '@subwallet/extension-base/services/balance-service/transfer/token';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getAssetSymbol, _getContractAddressOfToken, _isChainSubstrateCompatible, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { BaseStepDetail, BasicTxErrorType, ChainFlipSwapStepMetadata, ChainflipSwapTxData, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, OptimalSwapPathParamsV2, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TransactionData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigNumber from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api/types';

const INTERMEDIARY_MAINNET_ASSET_SLUG = COMMON_ASSETS.USDC_ETHEREUM;
const INTERMEDIARY_TESTNET_ASSET_SLUG = COMMON_ASSETS.USDC_SEPOLIA;

const externalServiceApi = `${SW_EXTERNAL_SERVICES_API}${ProxyServiceRoute.CHAINFLIP}`;

interface DepositAddressResponse {
  id: number;
  address: string;
  issuedBlock: number;
  network: string;
  channelId: number;
  sourceExpiryBlock: number;
  explorerUrl: string;
  channelOpeningFee: number;
  channelOpeningFeeNative: string;
}

interface ChainFlipMetadata {
  srcChain: string;
  destChain: string;
}

export class ChainflipSwapHandler implements SwapBaseInterface {
  private readonly isTestnet: boolean;
  private swapBaseHandler: SwapBaseHandler;
  providerSlug: SwapProviderId;
  // private baseUrl: string;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, isTestnet = true) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: isTestnet ? 'Chainflip Testnet' : 'Chainflip',
      providerSlug: isTestnet ? SwapProviderId.CHAIN_FLIP_TESTNET : SwapProviderId.CHAIN_FLIP_MAINNET
    });
    this.isTestnet = isTestnet;
    this.providerSlug = isTestnet ? SwapProviderId.CHAIN_FLIP_TESTNET : SwapProviderId.CHAIN_FLIP_MAINNET;
    // this.baseUrl = getChainflipSwap(isTestnet);
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get balanceService () {
    return this.swapBaseHandler.balanceService;
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

  get intermediaryAssetSlug () {
    if (this.isTestnet) {
      return INTERMEDIARY_TESTNET_ASSET_SLUG;
    } else {
      return INTERMEDIARY_MAINNET_ASSET_SLUG;
    }
  }

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { address, quote, recipient, slippage } = params;

    const pair = quote.pair;
    const fromAsset = this.chainService.getAssetBySlug(pair.from);
    const toAsset = this.chainService.getAssetBySlug(pair.to);
    const chainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const chainType = _isChainSubstrateCompatible(chainInfo) ? ChainType.SUBSTRATE : ChainType.EVM;
    const receiver = _reformatAddressWithChain(recipient ?? address, toChainInfo);
    const fromAssetId = _getAssetSymbol(fromAsset);
    const toAssetId = _getAssetSymbol(toAsset);

    const minReceive = new BigNumber(quote.rate).times(1 - slippage).toString();

    const processMetadata = params.process.steps[params.currentStep].metadata as unknown as ChainFlipSwapStepMetadata;
    const quoteMetadata = processMetadata as ChainFlipMetadata;

    if (!processMetadata || !quoteMetadata) {
      throw new Error('Metadata for Chainflip not found');
    }

    if (processMetadata.destChain !== quoteMetadata.destChain || processMetadata.srcChain !== quoteMetadata.srcChain) {
      throw new Error('Metadata for Chainflip not found');
    }

    const depositParams = {
      sourceChain: processMetadata.srcChain,
      destinationAddress: receiver,
      destinationAsset: toAssetId,
      destinationChain: processMetadata.destChain,
      minimumPrice: minReceive, // minimum accepted price for swaps through the channel
      refundAddress: address, // address to which assets are refunded
      retryDurationInBlocks: '100', // 100 blocks * 6 seconds = 10 minutes before deposits are refunded
      sourceAsset: fromAssetId
    };

    const formattedExternalServiceApi = formatExternalServiceApi(externalServiceApi, this.isTestnet);

    const url = `${formattedExternalServiceApi}/swap?${new URLSearchParams(depositParams).toString()}`;
    const response = await fetch(url, {
      method: 'GET'
    });

    const data = await response.json() as DepositAddressResponse;

    if (!data.id || !data.address || data.address === '' || !data.issuedBlock || !data.network || !data.channelId) {
      throw new Error('Error get Chainflip data');
    }

    const depositChannelId = `${data.issuedBlock}-${data.network}-${data.channelId}`;
    const depositAddress = data.address;

    const txData: ChainflipSwapTxData = {
      address,
      provider: this.providerInfo,
      quote: params.quote,
      slippage: params.slippage,
      recipient,
      depositChannelId: depositChannelId,
      depositAddress: depositAddress,
      process: params.process
    };

    let extrinsic: TransactionData;

    if (chainType === ChainType.SUBSTRATE) {
      const chainApi = this.chainService.getSubstrateApi(chainInfo.slug);

      const substrateApi = await chainApi.isReady;

      const [submittableExtrinsic] = await createSubstrateExtrinsic({
        from: address,
        networkKey: chainInfo.slug,
        substrateApi,
        to: depositAddress,
        tokenInfo: fromAsset,
        transferAll: false, // always false, because we do not allow swapping all the balance
        value: quote.fromAmount
      });

      extrinsic = submittableExtrinsic as SubmittableExtrinsic<'promise'>;
    } else {
      const id = getId();
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(id, chainInfo.slug, 'evm');

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
    }

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? quote.fromAmount : '0', // todo
      extrinsicType: ExtrinsicType.SWAP,
      chainType
    } as SwapSubmitStepData;
  }

  public async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.DEFAULT:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const metadata = params.selectedQuote?.metadata as ChainFlipMetadata;

    if (!params.selectedQuote) {
      return Promise.resolve(undefined);
    }

    if (!metadata || !metadata.srcChain || !metadata.destChain) {
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

        srcChain: metadata.srcChain,
        destChain: metadata.destChain,

        version: 2
      } as unknown as ChainFlipSwapStepMetadata
    };

    return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcessV2(params, [
      this.getSubmitStep.bind(this)
    ]);
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
