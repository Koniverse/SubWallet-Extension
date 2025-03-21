// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { PoolService, TradeRouter } from '@galacticcouncil/sdk';
import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType, RequestChangeFeeToken } from '@subwallet/extension-base/background/KoniTypes';
import { XCM_MIN_AMOUNT_RATIO } from '@subwallet/extension-base/constants';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { createXcmExtrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getChainNativeTokenSlug, _getTokenOnChainAssetId, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { DynamicSwapType } from '@subwallet/extension-base/services/swap-service/interface';
import { FEE_RATE_MULTIPLIER, getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { BasicTxErrorType, BriefXCMStep, GenSwapStepFuncV2, HydrationSwapStepMetadata, OptimalSwapPathParamsV2, RequestCrossChainTransfer, RuntimeDispatchInfo, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { BaseStepDetail, CommonOptimalPath, CommonStepFeeInfo, CommonStepType } from '@subwallet/extension-base/types/service-base';
import { HydradxSwapTxData, OptimalSwapPathParams, SwapErrorType, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData } from '@subwallet/extension-base/types/swap';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigNumber from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { isHex } from '@polkadot/util';

const HYDRADX_SUBWALLET_REFERRAL_CODE = 'WALLET';
const HYDRADX_SUBWALLET_REFERRAL_ACCOUNT = '7PCsCpkgsHdNaZhv79wCCQ5z97uxVbSeSCtDMUa1eZHKXy4a';

const HYDRADX_TESTNET_SUBWALLET_REFERRAL_CODE = 'ASSETHUB';
const HYDRADX_TESTNET_SUBWALLET_REFERRAL_ACCOUNT = '7LCt6dFqtxzdKVB2648jWW9d85doiFfLSbZJDNAMVJNxh5rJ';

export class HydradxHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  private tradeRouter: TradeRouter | undefined;
  private readonly isTestnet: boolean = true;
  public isReady = false;
  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, isTestnet = true) {
    this.swapBaseHandler = new SwapBaseHandler({
      balanceService,
      chainService,
      feeService,
      providerName: isTestnet ? 'Hydration Testnet' : 'Hydration',
      providerSlug: isTestnet ? SwapProviderId.HYDRADX_TESTNET : SwapProviderId.HYDRADX_MAINNET
    });
    this.providerSlug = isTestnet ? SwapProviderId.HYDRADX_TESTNET : SwapProviderId.HYDRADX_MAINNET;

    this.isTestnet = isTestnet;
  }

  public async init (): Promise<void> {
    const chainState = this.chainService.getChainStateByKey(this.chain());

    if (!chainState.active) {
      await this.chainService.enableChain(this.chain());
    }

    const substrateApi = this.chainService.getSubstrateApi(this.chain());

    await substrateApi.api.isReady;
    const poolService = new PoolService(substrateApi.api);

    this.tradeRouter = new TradeRouter(poolService);

    this.isReady = true;
  }

  chain = (): string => { // TODO: check origin chain of tokens in swap pair to determine support
    if (!this.isTestnet) {
      return COMMON_CHAIN_SLUGS.HYDRADX;
    } else {
      return COMMON_CHAIN_SLUGS.HYDRADX_TESTNET;
    }
  };

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

  async getXcmStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const bnAmount = new BigNumber(params.request.fromAmount);
    const fromAsset = this.chainService.getAssetBySlug(params.request.pair.from);

    const fromAssetBalance = await this.balanceService.getTransferableBalance(params.request.address, fromAsset.originChain, fromAsset.slug);

    const bnFromAssetBalance = new BigNumber(fromAssetBalance.value);

    if (bnFromAssetBalance.gte(bnAmount)) {
      return undefined; // enough balance, no need to xcm
    }

    const alternativeAssetSlug = getSwapAlternativeAsset(params.request.pair);

    if (!alternativeAssetSlug) {
      return undefined;
    }

    const alternativeAsset = this.chainService.getAssetBySlug(alternativeAssetSlug);
    const alternativeAssetBalance = await this.balanceService.getTransferableBalance(params.request.address, alternativeAsset.originChain, alternativeAsset.slug);
    const bnAlternativeAssetBalance = new BigNumber(alternativeAssetBalance.value);

    if (bnAlternativeAssetBalance.lte(0)) {
      return undefined;
    }

    try {
      const alternativeChainInfo = this.chainService.getChainInfoByKey(alternativeAsset.originChain);
      const destChainInfo = this.chainService.getChainInfoByKey(this.chain());

      const xcmOriginSubstrateApi = await this.chainService.getSubstrateApi(alternativeAsset.originChain).isReady;
      const id = getId();
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(id, alternativeAsset.originChain, 'substrate');

      const xcmTransfer = await createXcmExtrinsic({
        originTokenInfo: alternativeAsset,
        destinationTokenInfo: fromAsset,
        // Mock sending value to get payment info
        sendingValue: bnAmount.toString(),
        recipient: params.request.address,
        substrateApi: xcmOriginSubstrateApi,
        sender: params.request.address,
        destinationChain: destChainInfo,
        originChain: alternativeChainInfo,
        feeInfo
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
        const bnXcmFee = new BigNumber(fee.feeComponent[0].amount); // xcm fee is paid in native token but swap token is not always native token

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

  async getFeeOptionStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (!params.selectedQuote) {
      return Promise.resolve(undefined);
    }

    const selectedFeeToken = params.selectedQuote.feeInfo.selectedFeeToken;

    if (!selectedFeeToken) {
      return undefined;
    }

    const feeStep: BaseStepDetail = {
      name: 'Set fee token',
      type: CommonStepType.SET_FEE_TOKEN
    };

    try {
      const substrateApi = this.chainService.getSubstrateApi(this.chain());
      const chainApi = await substrateApi.isReady;

      const _currentFeeAssetId = await chainApi.api.query.multiTransactionPayment.accountCurrencyMap(params.request.address);
      const currentFeeAssetId = _currentFeeAssetId.toString();

      const selectedFeeAsset = this.chainService.getAssetBySlug(selectedFeeToken);
      const assetId = _getTokenOnChainAssetId(selectedFeeAsset);

      if (currentFeeAssetId === assetId) {
        return;
      }

      const setFeeTx = chainApi.api.tx.multiTransactionPayment.setCurrency(assetId);
      const _txFee = await setFeeTx.paymentInfo(params.request.address);
      const txFee = _txFee.toPrimitive() as unknown as RuntimeDispatchInfo;

      const fee: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: Math.round(txFee.partialFee).toString(),
          tokenSlug: selectedFeeAsset.slug
        }],
        selectedFeeToken: selectedFeeAsset.slug,
        defaultFeeToken: selectedFeeAsset.slug,
        feeOptions: [selectedFeeAsset.slug]
      };

      return [
        feeStep,
        fee
      ];
    } catch (e) {
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

    if (!fromChainInfo || !toChainInfo || !fromChainInfo || !toChainInfo) {
      throw Error('Token and chain not found');
    }

    try {
      const substrateApi = await this.chainService.getSubstrateApi(fromTokenInfo.originChain).isReady;

      const id = getId();
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(id, fromTokenInfo.originChain, 'substrate');

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
          amount: Math.ceil(xcmFeeInfo.partialFee * FEE_RATE_MULTIPLIER.medium).toString(),
          tokenSlug: _getChainNativeTokenSlug(fromChainInfo)
        }],
        defaultFeeToken: _getChainNativeTokenSlug(fromChainInfo),
        feeOptions: [_getChainNativeTokenSlug(fromChainInfo)]
      };

      let bnTransferAmount = new BigNumber(params.request.fromAmount);

      // todo: increase transfer amount when XCM local token
      if (_isNativeToken(fromTokenInfo)) {
        // xcm fee is paid in native token but swap token is not always native token
        // add amount of fee into sending value to ensure has enough token to swap
        const bnXcmFee = new BigNumber(fee.feeComponent[0].amount);

        bnTransferAmount = bnTransferAmount.plus(bnXcmFee);
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

    if (!params.selectedQuote) {
      return Promise.resolve(undefined);
    }

    const txHex: `0x${string}` = params.selectedQuote.metadata as `0x${string}`;

    if (!txHex || !isHex(txHex)) {
      return Promise.resolve(undefined);
    }

    const metadata: HydrationSwapStepMetadata = {
      sendingValue: params.request.fromAmount.toString(),
      originTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.from),
      destinationTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.to),
      txHex
    };

    const submitStep: BaseStepDetail = {
      name: 'Swap',
      type: SwapStepType.SWAP,
      // @ts-ignore
      metadata
    };

    return Promise.resolve([submitStep, params.selectedQuote.feeInfo]); // review fee
  }

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getXcmStep.bind(this),
      // this.getFeeOptionStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalPath> {
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

  public async handleSetFeeStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const substrateApi = this.chainService.getSubstrateApi(this.chain());
    const chainApi = await substrateApi.isReady;

    const swapStepIndex = params.process.steps.findIndex((step) => step.type === SwapStepType.SWAP);

    if (swapStepIndex <= -1) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INTERNAL_ERROR));
    }

    const swapFeeInfo = params.process.totalFee[swapStepIndex];
    const selectedFeeTokenSlug = swapFeeInfo.selectedFeeToken ?? swapFeeInfo.defaultFeeToken;

    const selectedFeeAsset = this.chainService.getAssetBySlug(selectedFeeTokenSlug);
    const extrinsic = chainApi.api.tx.multiTransactionPayment.setCurrency(_getTokenOnChainAssetId(selectedFeeAsset));

    const txData: RequestChangeFeeToken = {
      selectedFeeToken: selectedFeeTokenSlug
    };

    return {
      txChain: this.chain(),
      extrinsic,
      // extrinsicType: ExtrinsicType.SET_FEE_TOKEN,
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.SUBSTRATE,
      txData
    } as SwapSubmitStepData;
  }

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const metadata = params.process.steps[params.currentStep].metadata as unknown as HydrationSwapStepMetadata;
    const txHex = params.quote.metadata as string;

    if (!txHex || !isHex(txHex)) {
      return new SwapError(SwapErrorType.UNKNOWN) as unknown as SwapSubmitStepData;
    }

    if (!metadata || !metadata.sendingValue || !metadata.txHex || !metadata.destinationTokenInfo || !metadata.originTokenInfo) {
      throw new Error('Swap metadata error');
    }

    const fromAsset = metadata.originTokenInfo;

    if (!this.isReady || !this.tradeRouter) {
      return new SwapError(SwapErrorType.UNKNOWN) as unknown as SwapSubmitStepData;
    }

    const substrateApi = this.chainService.getSubstrateApi(this.chain());
    const chainApi = await substrateApi.isReady;

    const txData: HydradxSwapTxData = {
      provider: this.providerInfo,
      quote: params.quote,
      address: params.address,
      slippage: params.slippage,
      txHex: txHex,
      process: params.process
    };

    let extrinsic: SubmittableExtrinsic<'promise'>;

    const txList: SubmittableExtrinsic<'promise'>[] = [];

    const swapTx = chainApi.api.tx(txHex);

    const _referral = await chainApi.api.query.referrals.linkedAccounts(params.address);
    const referral = _referral?.toString();
    const needSetReferral = !referral || referral === '';

    const steps = params.process.steps.map((step) => step.type);
    const needSetFeeToken = steps.includes(CommonStepType.SET_FEE_TOKEN);

    if (!needSetReferral && !needSetFeeToken) {
      extrinsic = swapTx;
    } else {
      if (needSetReferral) {
        txList.push(chainApi.api.tx.referrals.linkCode(this.referralCode));
      }

      if (needSetFeeToken) {
        const nativeTokenInfo = this.chainService.getNativeTokenInfo(this.chain());

        txList.push(chainApi.api.tx.multiTransactionPayment.setCurrency(_getTokenOnChainAssetId(nativeTokenInfo)));
      }

      txList.push(swapTx);
      extrinsic = chainApi.api.tx.utility.batchAll(txList);
    }

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? metadata.sendingValue : '0',
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.SUBSTRATE
    } as SwapSubmitStepData;
  }

  handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.DEFAULT:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
      case CommonStepType.XCM:
        return this.handleXcmStep(params);
      case CommonStepType.SET_FEE_TOKEN:
        return this.handleSetFeeStep(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
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
        return this.swapBaseHandler.validateProcess(params);
        // switch (step.type) {
        //   case CommonStepType.DEFAULT:
        //     return Promise.resolve([]);
        //   case CommonStepType.XCM:
        //     return this.swapBaseHandler.validateXcmStepV2(params, index);
        //   case CommonStepType.SET_FEE_TOKEN:
        //     return this.swapBaseHandler.validateSetFeeTokenStep(params, index);
        //   default:
        //     return this.swapBaseHandler.validateSwapStep(params, isXcmOk, index);
        // }
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

  get referralCode () {
    if (this.isTestnet) {
      return HYDRADX_TESTNET_SUBWALLET_REFERRAL_CODE;
    }

    return HYDRADX_SUBWALLET_REFERRAL_CODE;
  }

  get referralAccount () {
    if (this.isTestnet) {
      return HYDRADX_TESTNET_SUBWALLET_REFERRAL_ACCOUNT;
    }

    return HYDRADX_SUBWALLET_REFERRAL_ACCOUNT;
  }
}
