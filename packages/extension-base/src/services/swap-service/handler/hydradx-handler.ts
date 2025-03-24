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
import { getAmountAfterSlippage, getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { BasicTxErrorType, DynamicSwapType, GenSwapStepFuncV2, HydrationSwapStepMetadata, OptimalSwapPathParamsV2, RuntimeDispatchInfo, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { BaseStepDetail, CommonOptimalPath, CommonStepFeeInfo, CommonStepType } from '@subwallet/extension-base/types/service-base';
import { HydradxSwapTxData, OptimalSwapPathParams, SwapErrorType, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData } from '@subwallet/extension-base/types/swap';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigN from 'bignumber.js';

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

  async getSwapStepV2 (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request: { fromAmount, slippage }, selectedQuote } = params;
    const swapPairInfo = path.find((step) => step.action === DynamicSwapType.SWAP)?.pair;

    if (!swapPairInfo || !selectedQuote) {
      return Promise.resolve(undefined);
    }

    const txHex: `0x${string}` = params.selectedQuote?.metadata as `0x${string}`;

    if (!txHex || !isHex(txHex)) {
      return Promise.resolve(undefined);
    }

    const submitStep: BaseStepDetail = {
      name: 'Swap',
      type: SwapStepType.SWAP,
      metadata: {
        sendingValue: fromAmount,
        originTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.from),
        destinationValue: getAmountAfterSlippage(selectedQuote?.toAmount || '0', slippage),
        destinationTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.to),
        txHex
      }
    };

    return Promise.resolve([submitStep, selectedQuote.feeInfo]);
  }

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getXcmStep.bind(this),
      // this.getFeeOptionStep.bind(this),
      this.getSubmitStep.bind(this)
    ]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalPath> {
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
        return this.swapBaseHandler.handleXcmStep(params);
      case CommonStepType.SET_FEE_TOKEN:
        return this.handleSetFeeStep(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  public async validateSwapProcess (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const { currentStep, process, selectedQuote } = params;
    const bnAmount = BigN(selectedQuote.fromAmount);

    if (bnAmount.lte(0)) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')];
    }

    const swapStep = params.process.steps.find((item) => item.type === SwapStepType.SWAP);

    if (!swapStep) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'Swap step not found')];
    }

    let isXcmOk = false;

    for (const [index, step] of process.steps.entries()) {
      if (currentStep > index) {
        continue;
      }

      const getErrors = async (): Promise<TransactionError[]> => {
        switch (step.type) {
          case CommonStepType.DEFAULT:
            return Promise.resolve([]);
          case CommonStepType.XCM:
            return this.swapBaseHandler.validateBridgeStep(params, index);
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
      return this.swapBaseHandler.validateSwapV2(params, 1); // todo: create interface for input request
    }

    if (swapXcm) {
      return this.swapBaseHandler.validateSwapXcmV2(params, 1, 2);
    }

    if (xcmSwap) {
      return this.swapBaseHandler.validateXcmSwapV2(params, 2, 1);
    }

    if (xcmSwapXcm) {
      return this.swapBaseHandler.validateXcmSwapXcmV2(params, 2, 1, 3);
    }

    return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
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
