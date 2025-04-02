// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { PoolService, TradeRouter } from '@galacticcouncil/sdk';
import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType, RequestChangeFeeToken } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getTokenOnChainAssetId, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from '@subwallet/extension-base/services/swap-service/handler/base-handler';
import { BasicTxErrorType, DynamicSwapType, GenSwapStepFuncV2, HydrationSwapStepMetadata, OptimalSwapPathParamsV2, RuntimeDispatchInfo, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { BaseStepDetail, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType } from '@subwallet/extension-base/types/service-base';
import { HydradxSwapTxData, SwapErrorType, SwapFeeType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData } from '@subwallet/extension-base/types/swap';
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

  async getFeeOptionStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
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

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    const { path, request: { fromAmount }, selectedQuote } = params;
    const stepData = path[stepIndex];

    if (stepData.action !== DynamicSwapType.SWAP) {
      return Promise.resolve(undefined);
    }

    if (!selectedQuote) {
      return Promise.resolve(undefined);
    }

    const swapPairInfo = stepData.pair;

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
      // @ts-ignore
      metadata: {
        sendingValue: fromAmount,
        expectedReceive: selectedQuote.toAmount,
        originTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.from),
        destinationTokenInfo: this.chainService.getAssetBySlug(swapPairInfo.to),
        sender: params.request.address,
        receiver: params.request.recipient || params.request.address,
        txHex
      } as unknown as HydrationSwapStepMetadata
    };

    return Promise.resolve([submitStep, selectedQuote.feeInfo]);
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    const stepFuncList: GenSwapStepFuncV2[] = params.path.map((step) => {
      if (step.action === DynamicSwapType.SWAP) {
        return this.getSubmitStep.bind(this);
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
        return this.swapBaseHandler.handleBridgeStep(params);
      case CommonStepType.SET_FEE_TOKEN:
        return this.handleSetFeeStep(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
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
      return this.swapBaseHandler.validateSwapXcmProcess(params, 1, 2);
    }

    if (xcmSwap) {
      return this.swapBaseHandler.validateXcmSwapProcess(params, 2, 1);
    }

    if (xcmSwapXcm) {
      return this.swapBaseHandler.validateXcmSwapXcmProcess(params, 2, 1, 3);
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
