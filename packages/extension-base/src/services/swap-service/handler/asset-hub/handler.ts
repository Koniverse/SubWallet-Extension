// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { XCM_MIN_AMOUNT_RATIO } from '@subwallet/extension-base/constants';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { createXcmExtrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getChainNativeTokenSlug, _getTokenMinAmount, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { FEE_RATE_MULTIPLIER, getAmountAfterSlippage, getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, BriefXCMStep, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, GenSwapStepFuncV2, OptimalSwapPathParams, OptimalSwapPathParamsV2, RequestCrossChainTransfer, RuntimeDispatchInfo, SwapBaseTxData, SwapErrorType, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams, XcmStepPosition } from '@subwallet/extension-base/types';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigN from 'bignumber.js';

import { SwapBaseHandler, SwapBaseInterface } from '../base-handler';
import { AssetHubRouter } from './router';

export class AssetHubSwapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  private readonly chain: string;
  private router: AssetHubRouter | undefined;
  isReady = false;
  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, chain: string) {
    const chainInfo = chainService.getChainInfoByKey(chain);
    const providerSlug: SwapProviderId = (function () {
      switch (chain) {
        case 'statemint':
          return SwapProviderId.POLKADOT_ASSET_HUB;
        case 'statemine':
          return SwapProviderId.KUSAMA_ASSET_HUB;
        case 'westend_assethub':
          return SwapProviderId.WESTEND_ASSET_HUB;
        default:
          return SwapProviderId.ROCOCO_ASSET_HUB;
      }
    }());

    this.swapBaseHandler = new SwapBaseHandler({
      balanceService,
      chainService,
      providerName: chainInfo.name,
      providerSlug,
      feeService
    });

    this.providerSlug = providerSlug;
    this.chain = chain;
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

  public async init (): Promise<void> {
    const chainState = this.chainService.getChainStateByKey(this.chain);

    if (!chainState.active) {
      await this.chainService.enableChain(this.chain);
    }

    const substrateApi = this.chainService.getSubstrateApi(this.chain);

    await substrateApi.api.isReady;

    this.router = new AssetHubRouter(this.chain, this.chainService);

    this.isReady = true;
  }

  async getXcmStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const bnAmount = BigN(params.request.fromAmount);
    const fromAsset = this.chainService.getAssetBySlug(params.request.pair.from);

    const fromAssetBalance = await this.balanceService.getTransferableBalance(params.request.address, fromAsset.originChain, fromAsset.slug);

    const bnFromAssetBalance = BigN(fromAssetBalance.value);

    if (bnFromAssetBalance.gte(bnAmount)) {
      return undefined; // enough balance, no need to xcm
    }

    const alternativeAssetSlug = getSwapAlternativeAsset(params.request.pair);

    if (!alternativeAssetSlug) {
      return undefined;
    }

    const alternativeAsset = this.chainService.getAssetBySlug(alternativeAssetSlug);
    const alternativeAssetBalance = await this.balanceService.getTransferableBalance(params.request.address, alternativeAsset.originChain, alternativeAsset.slug);
    const bnAlternativeAssetBalance = BigN(alternativeAssetBalance.value);

    if (bnAlternativeAssetBalance.lte(0)) {
      return undefined;
    }

    try {
      const alternativeChainInfo = this.chainService.getChainInfoByKey(alternativeAsset.originChain);
      const originalChainInfo = this.chainService.getChainInfoByKey(this.chain);

      const xcmOriginSubstrateApi = await this.chainService.getSubstrateApi(alternativeAsset.originChain).isReady;
      const id = getId();
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(id, alternativeChainInfo.slug, 'substrate');

      const xcmTransfer = await createXcmExtrinsic({
        originTokenInfo: alternativeAsset,
        destinationTokenInfo: fromAsset,
        // Mock sending value to get payment info
        sendingValue: bnAmount.toString(),
        recipient: params.request.address,
        sender: params.request.address,
        feeInfo: feeInfo,
        substrateApi: xcmOriginSubstrateApi,
        destinationChain: originalChainInfo,
        originChain: alternativeChainInfo
      });

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(params.request.address);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;

      const fee: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: Math.round(xcmFeeInfo.partialFee * XCM_MIN_AMOUNT_RATIO).toString(),
          tokenSlug: _getChainNativeTokenSlug(alternativeChainInfo)
        }],
        defaultFeeToken: _getChainNativeTokenSlug(alternativeChainInfo),
        feeOptions: [_getChainNativeTokenSlug(alternativeChainInfo)]
      };

      let bnTransferAmount = bnAmount.minus(bnFromAssetBalance);

      if (_isNativeToken(alternativeAsset)) {
        const bnXcmFee = BigN(fee.feeComponent[0].amount); // xcm fee is paid in native token but swap token is not always native token

        bnTransferAmount = bnTransferAmount.plus(bnXcmFee);
      }

      const step: BaseStepDetail = {
        metadata: {
          sendingValue: bnTransferAmount.toString(),
          originTokenInfo: alternativeAsset,
          destinationTokenInfo: fromAsset
        },
        name: `Transfer ${alternativeAsset.symbol} from ${alternativeChainInfo.name}`,
        type: CommonStepType.XCM
      };

      return [step, fee];
    } catch (e) {
      console.error('Error creating xcm step', e);

      return undefined;
    }
  }

  async getSubmitStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const submitStep = {
        name: 'Swap',
        type: SwapStepType.SWAP
      };

      return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  async getXcmStepV2 (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request: { address, fromAmount, slippage }, selectedQuote } = params;
    const xcmStepIndex = path.findIndex((step) => step.action === DynamicSwapType.BRIDGE); // index = 0 => XCM first; index = 1 => SWAP first
    const xcmPairInfo = xcmStepIndex !== -1 ? path[xcmStepIndex] : undefined;

    if (!xcmPairInfo) {
      return undefined;
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.pair.from);
    const toTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.pair.to);
    const fromChainInfo = this.chainService.getChainInfoByKey(fromTokenInfo.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toTokenInfo.originChain);
    const substrateApi = await this.chainService.getSubstrateApi(fromTokenInfo.originChain).isReady;

    if (!fromChainInfo || !toChainInfo || !fromChainInfo || !toChainInfo) {
      throw Error('Token and chain not found');
    }

    try {
      const id = getId();
      const [feeInfo, toTokenBalance] = await Promise.all([
        this.swapBaseHandler.feeService.subscribeChainFee(id, fromTokenInfo.originChain, 'substrate'),
        this.balanceService.getTotalBalance(params.request.address, toTokenInfo.originChain, toTokenInfo.slug, ExtrinsicType.TRANSFER_BALANCE)
      ]);

      const xcmTransfer = await createXcmExtrinsic({
        originTokenInfo: fromTokenInfo,
        destinationTokenInfo: toTokenInfo,
        // Mock sending value to get payment info
        sendingValue: fromAmount, // todo: recheck amount xcm step with amount init
        recipient: address,
        substrateApi: substrateApi,
        sender: address,
        originChain: fromChainInfo,
        destinationChain: toChainInfo,
        feeInfo
      });

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(address);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;
      const estimatedXcmFee = Math.ceil(xcmFeeInfo.partialFee * FEE_RATE_MULTIPLIER.high).toString();

      const fee: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: estimatedXcmFee,
          tokenSlug: _getChainNativeTokenSlug(fromChainInfo)
        }],
        defaultFeeToken: _getChainNativeTokenSlug(fromChainInfo),
        feeOptions: [_getChainNativeTokenSlug(fromChainInfo)]
      };

      let bnTransferAmount = BigN(fromAmount);
      const isXcmNativeToken = _isNativeToken(fromTokenInfo);

      if (xcmStepIndex === XcmStepPosition.AFTER_SWAP || xcmStepIndex === XcmStepPosition.AFTER_XCM_SWAP) {
        bnTransferAmount = BigN(getAmountAfterSlippage(selectedQuote?.toAmount || '0', slippage));
      }

      if (xcmStepIndex === XcmStepPosition.FIRST && isXcmNativeToken) {
        // xcm fee is paid in native token but swap token is not always native token
        // add amount of fee into sending value to ensure has enough token to swap
        bnTransferAmount = bnTransferAmount.plus(BigN(estimatedXcmFee));
      } else {
        bnTransferAmount = bnTransferAmount.plus(BigN(_getTokenMinAmount(toTokenInfo)).multipliedBy(FEE_RATE_MULTIPLIER.medium));
      }

      if (BigN(toTokenBalance.value).lte(0)) {
        bnTransferAmount = bnTransferAmount.plus(_getTokenMinAmount(toTokenInfo));
      }

      const step: BaseStepDetail = {
        metadata: {
          sendingValue: bnTransferAmount.toString(),
          originTokenInfo: fromTokenInfo,
          destinationValue: isXcmNativeToken ? bnTransferAmount.minus(BigN(estimatedXcmFee)).toString() : bnTransferAmount.toString(),
          destinationTokenInfo: toTokenInfo
        },
        name: `Transfer ${fromTokenInfo.symbol} from ${fromChainInfo.name}`,
        type: CommonStepType.XCM
      };

      return [step, fee];
    } catch (e) {
      console.error('Error creating xcm step', e);

      return undefined;
    }
  }

  async getSwapStepV2 (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request: { fromAmount, slippage }, selectedQuote } = params;
    const swapPairInfo = path.find((step) => step.action === DynamicSwapType.SWAP)?.pair;

    if (!swapPairInfo || !selectedQuote) {
      return Promise.resolve(undefined);
    }

    const submitStep: BaseStepDetail = {
      name: 'Swap',
      type: SwapStepType.SWAP,
      metadata: {
        sendingValue: fromAmount,
        originTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.from),
        destinationValue: getAmountAfterSlippage(selectedQuote?.toAmount || '0', slippage),
        destinationTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.to)
      }
    };

    return Promise.resolve([submitStep, selectedQuote.feeInfo]);
  }

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getXcmStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    const stepFuncList: GenSwapStepFuncV2[] = params.path.map((step, stepIndex) => {
      if (step.action === DynamicSwapType.SWAP) {
        return this.getSwapStepV2.bind(this);
      }

      if (step.action === DynamicSwapType.BRIDGE && stepIndex === 2) {
        return this.swapBaseHandler.getExtraBridgeStep.bind(this.swapBaseHandler);
      }

      if (step.action === DynamicSwapType.BRIDGE) {
        return this.swapBaseHandler.getBridgeStep.bind(this.swapBaseHandler);
      }

      throw new Error(`Error generating optimal process: Action ${step.action as string} is not supported`);
    });

    return this.swapBaseHandler.generateOptimalProcessV2(params, stepFuncList);
  }

  public async handleXcmStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const briefXcmStep = params.process.steps[params.currentStep].metadata as unknown as BriefXCMStep;

    if (!briefXcmStep || !briefXcmStep.originTokenInfo || !briefXcmStep.destinationTokenInfo || !briefXcmStep.sendingValue) {
      throw new Error('XCM metadata error');
    }

    const originAsset = briefXcmStep.originTokenInfo;
    const destinationAsset = briefXcmStep.destinationTokenInfo;
    const originChain = this.chainService.getChainInfoByKey(originAsset.originChain);
    const destinationChain = this.chainService.getChainInfoByKey(destinationAsset.originChain);
    const substrateApi = this.chainService.getSubstrateApi(originAsset.originChain);
    const chainApi = await substrateApi.isReady;

    const destinationAssetBalance = await this.balanceService.getTransferableBalance(params.address, destinationAsset.originChain, destinationAsset.slug);
    const xcmFee = params.process.totalFee[params.currentStep];

    const bnAmount = BigN(params.quote.fromAmount);
    const bnDestinationAssetBalance = BigN(destinationAssetBalance.value);
    const id = getId();
    const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(id, originChain.slug, 'substrate');

    let bnTotalAmount = bnAmount.minus(bnDestinationAssetBalance);

    if (_isNativeToken(originAsset)) {
      const bnXcmFee = BigN(xcmFee.feeComponent[0].amount); // xcm fee is paid in native token but swap token is not always native token

      bnTotalAmount = bnTotalAmount.plus(bnXcmFee);
    }

    const xcmTransfer = await createXcmExtrinsic({
      originTokenInfo: originAsset,
      destinationTokenInfo: destinationAsset,
      sendingValue: briefXcmStep.sendingValue,
      recipient: params.address,
      substrateApi: chainApi,
      sender: params.address,
      destinationChain,
      originChain,
      feeInfo
    });

    const xcmData: RequestCrossChainTransfer = {
      originNetworkKey: originAsset.originChain,
      destinationNetworkKey: destinationAsset.originChain,
      from: params.address,
      to: params.address,
      value: briefXcmStep.sendingValue,
      tokenSlug: originAsset.slug,
      showExtraWarning: true
    };

    return {
      txChain: originAsset.originChain,
      extrinsic: xcmTransfer,
      transferNativeAmount: _isNativeToken(originAsset) ? briefXcmStep.sendingValue : '0',
      extrinsicType: ExtrinsicType.TRANSFER_XCM,
      chainType: ChainType.SUBSTRATE,
      txData: xcmData
    } as SwapSubmitStepData;
  }

  async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const metadata = params.process.steps[params.currentStep].metadata as unknown as BaseSwapStepMetadata;

    if (!metadata || !metadata.sendingValue || !metadata.destinationTokenInfo || !metadata.originTokenInfo) {
      return new SwapError(SwapErrorType.UNKNOWN) as unknown as SwapSubmitStepData;
    }

    const fromAsset = metadata.originTokenInfo;

    const txData: SwapBaseTxData = {
      provider: this.providerInfo,
      quote: params.quote,
      address: params.address,
      slippage: params.slippage,
      process: params.process
    };

    const paths = params.quote.route.path.map((slug) => this.chainService.getAssetBySlug(slug));
    const { fromAmount, toAmount } = params.quote;
    // todo: move to gen process
    const minReceive = BigN(getAmountAfterSlippage(toAmount, params.slippage));

    if (!params.address || !paths || !fromAmount || !minReceive) {
      throw new SwapError(SwapErrorType.UNKNOWN);
    }

    const extrinsic = await this.router?.buildSwapExtrinsic(paths, params.address, fromAmount, minReceive.toString());

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? params.quote.fromAmount : '0', // todo
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.SUBSTRATE
    } as SwapSubmitStepData;
  }

  handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.XCM:
        return this.handleXcmStep(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }
  }

  public async validateSwapProcessV2 (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    // todo: recheck address and recipient format in params
    const { process, selectedQuote } = params; // todo: review flow, currentStep param.

    // todo: validate path with optimalProcess
    // todo: review error message in case many step swap
    if (BigN(selectedQuote.fromAmount).lte(0)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')];
    }

    const actionList = JSON.stringify(process.path.map((step) => step.action));
    const swap = actionList === JSON.stringify([DynamicSwapType.SWAP]);
    const swapXcm = actionList === JSON.stringify([DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);
    const xcmSwap = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP]);
    const xcmSwapXcm = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);

    if (swap) {
      return this.swapBaseHandler.validateSwapOnlyProcess(params, 1); // todo: create interface for input request
    }

    if (swapXcm) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (xcmSwap) {
      return this.swapBaseHandler.validateXcmSwapProcess(params, 2, 1);
    }

    if (xcmSwapXcm) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
  }
}
