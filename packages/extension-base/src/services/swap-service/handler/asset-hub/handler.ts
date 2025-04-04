// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { XCM_MIN_AMOUNT_RATIO } from '@subwallet/extension-base/constants';
import { _validateBalanceToSwapOnAssetHub, _validateSwapRecipient } from '@subwallet/extension-base/core/logic-validation/swap';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { createXcmExtrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getChainNativeTokenSlug, _getTokenMinAmount, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { DynamicSwapType } from '@subwallet/extension-base/services/swap-service/interface';
import { FEE_RATE_MULTIPLIER, getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, BriefXCMStep, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, GenSwapStepFuncV2, OptimalSwapPathParams, OptimalSwapPathParamsV2, RequestCrossChainTransfer, RuntimeDispatchInfo, SwapBaseTxData, SwapErrorType, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
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
    const bnAmount = new BigN(params.request.fromAmount);
    const fromAsset = this.chainService.getAssetBySlug(params.request.pair.from);

    const fromAssetBalance = await this.balanceService.getTransferableBalance(params.request.address, fromAsset.originChain, fromAsset.slug);

    const bnFromAssetBalance = new BigN(fromAssetBalance.value);

    if (bnFromAssetBalance.gte(bnAmount)) {
      return undefined; // enough balance, no need to xcm
    }

    const alternativeAssetSlug = getSwapAlternativeAsset(params.request.pair);

    if (!alternativeAssetSlug) {
      return undefined;
    }

    const alternativeAsset = this.chainService.getAssetBySlug(alternativeAssetSlug);
    const alternativeAssetBalance = await this.balanceService.getTransferableBalance(params.request.address, alternativeAsset.originChain, alternativeAsset.slug);
    const bnAlternativeAssetBalance = new BigN(alternativeAssetBalance.value);

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
        const bnXcmFee = new BigN(fee.feeComponent[0].amount); // xcm fee is paid in native token but swap token is not always native token

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
    // todo: improve this function for Round 2

    const xcmPairInfo = params.path.find((step, i) => i === 0 && step.action === DynamicSwapType.BRIDGE)?.pair;

    if (!xcmPairInfo) {
      return undefined;
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.from);
    const toTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.to);
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
        sendingValue: params.request.fromAmount,
        recipient: params.request.address,
        substrateApi: substrateApi,
        sender: params.request.address,
        originChain: fromChainInfo,
        destinationChain: toChainInfo,
        feeInfo
      });

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(params.request.address);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;

      const fee: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: Math.ceil(xcmFeeInfo.partialFee * FEE_RATE_MULTIPLIER.high).toString(),
          tokenSlug: _getChainNativeTokenSlug(fromChainInfo)
        }],
        defaultFeeToken: _getChainNativeTokenSlug(fromChainInfo),
        feeOptions: [_getChainNativeTokenSlug(fromChainInfo)]
      };

      let bnTransferAmount = new BigN(params.request.fromAmount);

      if (_isNativeToken(fromTokenInfo)) {
        // xcm fee is paid in native token but swap token is not always native token
        // add amount of fee into sending value to ensure has enough token to swap
        const bnXcmFee = new BigN(fee.feeComponent[0].amount);

        bnTransferAmount = bnTransferAmount.plus(bnXcmFee);
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
    const swapPairInfo = params.path.find((step) => step.action === DynamicSwapType.SWAP)?.pair;

    if (!swapPairInfo) {
      return Promise.resolve(undefined);
    }

    if (params.selectedQuote) {
      const submitStep: BaseStepDetail = {
        name: 'Swap',
        type: SwapStepType.SWAP,
        metadata: {
          sendingValue: params.request.fromAmount.toString(),
          originTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.from),
          destinationTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.to)
        }
      };

      return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getXcmStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    const stepFuncList: GenSwapStepFuncV2[] = params.path.map((step) => {
      if (step.action === DynamicSwapType.BRIDGE) {
        return this.getXcmStepV2.bind(this);
      }

      if (step.action === DynamicSwapType.SWAP) {
        return this.getSwapStepV2.bind(this);
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

    const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(getId(), originAsset.originChain, 'substrate');

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
    const minReceive = new BigN(1 - params.slippage).times(toAmount).integerValue(BigN.ROUND_DOWN);

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

  public async validateSwapStep (params: ValidateSwapProcessParams, isXcmOk: boolean, stepIndex: number): Promise<TransactionError[]> {
    // check swap quote timestamp
    // check balance to pay transaction fee
    // check balance against spending amount
    if (!params.selectedQuote) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    const selectedQuote = params.selectedQuote;
    const currentTimestamp = +Date.now();

    if (selectedQuote.aliveUntil <= currentTimestamp) {
      return Promise.resolve([new TransactionError(SwapErrorType.QUOTE_TIMEOUT)]);
    }

    const stepFee = params.process.totalFee[stepIndex].feeComponent;
    const networkFee = stepFee.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!networkFee) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    const fromAsset = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);
    const feeTokenInfo = this.chainService.getAssetBySlug(networkFee.tokenSlug);
    const feeTokenChain = this.chainService.getChainInfoByKey(feeTokenInfo.originChain);

    const { fromAmount, minSwap } = params.selectedQuote;

    const [feeTokenBalance, fromAssetBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(params.address, feeTokenInfo.originChain, feeTokenInfo.slug),
      this.balanceService.getTransferableBalance(params.address, fromAsset.originChain, fromAsset.slug)
    ]);

    const balanceError = _validateBalanceToSwapOnAssetHub(fromAsset, feeTokenInfo, feeTokenChain, networkFee.amount, fromAssetBalance.value, feeTokenBalance.value, fromAmount, isXcmOk, minSwap);

    if (balanceError) {
      return Promise.resolve([balanceError]);
    }

    if (!params.recipient) {
      return Promise.resolve([]);
    }

    const toAsset = this.chainService.getAssetBySlug(params.selectedQuote.pair.to);
    const toAssetChain = this.chainService.getChainInfoByKey(toAsset.originChain);

    const recipientError = _validateSwapRecipient(toAssetChain, params.recipient);

    if (recipientError) {
      return Promise.resolve([recipientError]);
    }

    return Promise.resolve([]);
  }

  async validateSwapProcess (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const amount = params.selectedQuote.fromAmount;
    const bnAmount = new BigN(amount);

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
          case SwapStepType.SWAP:
            return this.validateSwapStep(params, isXcmOk, index);
          default:
            return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
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
    if (BigN(selectedQuote.fromAmount).lte(0)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')];
    }

    const actionList = process.steps.map((step) => step.type);
    const [firstStep, secondStep, thirdStep, fourthStep, fifthStep] = actionList;
    const swap = firstStep === CommonStepType.DEFAULT && secondStep === SwapStepType.SWAP && !thirdStep;
    const swapXcm = firstStep === CommonStepType.DEFAULT && secondStep === SwapStepType.SWAP && thirdStep === CommonStepType.XCM && !fourthStep;
    const xcmSwap = firstStep === CommonStepType.DEFAULT && secondStep === CommonStepType.XCM && thirdStep === SwapStepType.SWAP && !fourthStep;
    const xcmSwapXcm = firstStep === CommonStepType.DEFAULT && secondStep === CommonStepType.XCM && thirdStep === SwapStepType.SWAP && fourthStep === CommonStepType.XCM && !fifthStep;

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
