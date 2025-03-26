// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateSpendingAndFeePayment } from '@subwallet/extension-base/core/logic-validation';
import { _validateBalanceToSwap, _validateSwapRecipient } from '@subwallet/extension-base/core/logic-validation/swap';
import { _isAccountActive } from '@subwallet/extension-base/core/substrate/system-pallet';
import { FrameSystemAccountInfo } from '@subwallet/extension-base/core/substrate/types';
import { _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { _isSufficientToken } from '@subwallet/extension-base/core/utils';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getAssetDecimals, _getAssetSymbol, _getTokenMinAmount, _isChainEvmCompatible, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { FEE_RATE_MULTIPLIER, getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { BaseSwapStepMetadata, BasicTxErrorType, BriefXCMStep, GenSwapStepFuncV2, OptimalSwapPathParamsV2, TransferTxErrorType } from '@subwallet/extension-base/types';
import { BaseStepDetail, CommonOptimalSwapPath, CommonStepFeeInfo, DEFAULT_FIRST_STEP, MOCK_STEP_FEE } from '@subwallet/extension-base/types/service-base';
import { GenSwapStepFunc, OptimalSwapPathParams, SwapErrorType, SwapFeeType, SwapProvider, SwapProviderId, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types/swap';
import { _reformatAddressWithChain, balanceFormatter, formatNumber } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { t } from 'i18next';

import { isEthereumAddress } from '@polkadot/util-crypto';

export interface SwapBaseInterface {
  providerSlug: SwapProviderId;

  generateOptimalProcess: (params: OptimalSwapPathParams) => Promise<CommonOptimalSwapPath>;
  generateOptimalProcessV2: (params: OptimalSwapPathParamsV2) => Promise<CommonOptimalSwapPath>;

  getSubmitStep: (params: OptimalSwapPathParams) => Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined>;

  validateSwapProcess: (params: ValidateSwapProcessParams) => Promise<TransactionError[]>;
  validateSwapProcessV2: (params: ValidateSwapProcessParams) => Promise<TransactionError[]>;
  handleSwapProcess: (params: SwapSubmitParams) => Promise<SwapSubmitStepData>;
  handleSubmitStep: (params: SwapSubmitParams) => Promise<SwapSubmitStepData>;

  isReady?: boolean;
  init?: () => Promise<void>;
}

export interface SwapBaseHandlerInitParams {
  providerSlug: SwapProviderId,
  providerName: string,
  chainService: ChainService,
  balanceService: BalanceService,
  feeService: FeeService;
}

export class SwapBaseHandler {
  private readonly providerSlug: SwapProviderId;
  private readonly providerName: string;
  public chainService: ChainService;
  public balanceService: BalanceService;
  public feeService: FeeService;

  public constructor ({ balanceService, chainService, feeService, providerName, providerSlug }: SwapBaseHandlerInitParams) {
    this.providerName = providerName;
    this.providerSlug = providerSlug;
    this.chainService = chainService;
    this.balanceService = balanceService;
    this.feeService = feeService;
  }

  // public abstract getSwapQuote(request: SwapRequest): Promise<SwapQuote | SwapError>;
  public async generateOptimalProcess (params: OptimalSwapPathParams, genStepFuncList: GenSwapStepFunc[]): Promise<CommonOptimalSwapPath> {
    const result: CommonOptimalSwapPath = {
      totalFee: [MOCK_STEP_FEE],
      steps: [DEFAULT_FIRST_STEP],
      path: []
    };

    try {
      for (const genStepFunc of genStepFuncList) {
        const step = await genStepFunc(params);

        if (step) {
          result.steps.push({
            id: result.steps.length,
            ...step[0]
          });
          result.totalFee.push(step[1]);
        }
      }

      return result;
    } catch (e) {
      return result;
    }
  }

  public async generateOptimalProcessV2 (params: OptimalSwapPathParamsV2, genStepFuncList: GenSwapStepFuncV2[]): Promise<CommonOptimalSwapPath> {
    const result: CommonOptimalSwapPath = {
      totalFee: [MOCK_STEP_FEE],
      steps: [DEFAULT_FIRST_STEP],
      path: params.path
    };

    try {
      for (const genStepFunc of genStepFuncList) {
        const step = await genStepFunc(params);

        if (step) {
          result.steps.push({
            id: result.steps.length,
            ...step[0]
          });
          result.totalFee.push(step[1]);
        }
      }

      return result;
    } catch (e) {
      return result;
    }
  }

  public async validateXcmStep (params: ValidateSwapProcessParams, stepIndex: number): Promise<TransactionError[]> {
    const bnAmount = new BigN(params.selectedQuote.fromAmount);
    const swapPair = params.selectedQuote.pair;

    const alternativeAssetSlug = getSwapAlternativeAsset(swapPair);

    if (!alternativeAssetSlug) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const alternativeAsset = this.chainService.getAssetBySlug(alternativeAssetSlug);
    const fromAsset = this.chainService.getAssetBySlug(swapPair.from);

    const [alternativeAssetBalance, fromAssetBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(params.address, alternativeAsset.originChain, alternativeAssetSlug),
      this.balanceService.getTransferableBalance(params.address, fromAsset.originChain, fromAsset.slug)
    ]);

    const bnAlternativeAssetBalance = new BigN(alternativeAssetBalance.value);
    const bnFromAssetBalance = new BigN(fromAssetBalance.value);

    const xcmFeeComponent = params.process.totalFee[stepIndex].feeComponent[0]; // todo: can do better than indexing
    const xcmFee = new BigN(xcmFeeComponent.amount || '0');
    let xcmAmount = bnAmount.minus(bnFromAssetBalance);
    let editedXcmFee = new BigN(0);

    if (_isNativeToken(alternativeAsset)) {
      xcmAmount = xcmAmount.plus(xcmFee);
      editedXcmFee = xcmFee.times(2);
    }

    if (!bnAlternativeAssetBalance.minus(_isNativeToken(alternativeAsset) ? xcmAmount.plus(xcmFee) : xcmFee).gt(0)) {
      const maxBn = bnFromAssetBalance.plus(new BigN(alternativeAssetBalance.value)).minus(_isNativeToken(alternativeAsset) ? editedXcmFee : xcmFee);
      const maxValue = formatNumber(maxBn.toString(), fromAsset.decimals || 0);

      const altInputTokenInfo = this.chainService.getAssetBySlug(alternativeAssetSlug);
      const symbol = altInputTokenInfo.symbol;

      const alternativeChain = this.chainService.getChainInfoByKey(altInputTokenInfo.originChain);
      const chain = this.chainService.getChainInfoByKey(fromAsset.originChain);

      const inputNetworkName = chain.name;
      const altNetworkName = alternativeChain.name;

      const currentValue = formatNumber(bnFromAssetBalance.toString(), fromAsset.decimals || 0);
      const bnMaxXCM = new BigN(alternativeAssetBalance.value).minus(_isNativeToken(alternativeAsset) ? editedXcmFee : xcmFee);
      const maxXCMValue = formatNumber(bnMaxXCM.toString(), fromAsset.decimals || 0);

      if (maxBn.lte(0) || bnFromAssetBalance.lte(0) || bnMaxXCM.lte(0)) {
        return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t(`Insufficient balance. Deposit ${fromAsset.symbol} and try again.`))];
      }

      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t(
        'You can only enter a maximum of {{maxValue}} {{symbol}}, which is {{currentValue}} {{symbol}} ({{inputNetworkName}}) and {{maxXCMValue}} {{symbol}} ({{altNetworkName}}). Lower your amount and try again.',
        {
          replace: {
            symbol,
            maxValue,
            inputNetworkName,
            altNetworkName,
            currentValue,
            maxXCMValue
          }
        }
      ))];
    }

    return [];
  }

  public async validateXcmStepV2 (params: ValidateSwapProcessParams, stepIndex: number): Promise<TransactionError[]> {
    const currentStep = params.process.steps[stepIndex];
    const currentFee = params.process.totalFee[stepIndex];
    const feeToken = currentFee.selectedFeeToken || currentFee.defaultFeeToken;
    const feeAmount = currentFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!feeAmount) {
      throw new Error('Fee not found for XCM step');
    }

    const metadata = currentStep.metadata as unknown as BriefXCMStep;
    const sendingAmount = metadata.sendingValue;
    const bnAmount = new BigN(sendingAmount);

    const fromAsset = metadata?.originTokenInfo;
    const toAsset = metadata?.destinationTokenInfo;

    if (!fromAsset || !toAsset) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const fromChain = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const toChain = this.chainService.getChainInfoByKey(toAsset.originChain);
    const toChainNativeAsset = this.chainService.getNativeTokenInfo(toAsset.originChain);
    const sender = _reformatAddressWithChain(params.address, fromChain);
    const receiver = _reformatAddressWithChain(params.recipient ?? sender, toChain);

    /* Get transferable balance */
    const [fromAssetBalance, feeTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(sender, fromAsset.originChain, fromAsset.slug, ExtrinsicType.TRANSFER_XCM),
      this.balanceService.getTransferableBalance(sender, fromAsset.originChain, feeToken, ExtrinsicType.TRANSFER_XCM)
    ]);

    const bnFromAssetBalance = new BigN(fromAssetBalance.value);
    const bnFeeTokenBalance = new BigN(feeTokenBalance.value);

    /* Compare transferable balance with amount xcm */
    if (bnFromAssetBalance.lt(bnAmount)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t(`Insufficient balance. Deposit ${fromAsset.symbol} and try again.`))];
    }

    /**
     * Calculate fee token keep alive after xcm
     * If fee token is the same as from token, need to subtract sending amount
     * @TODO: Need to update logic if change fee token (multi with rate)
     * */
    const feeBalanceAfterTransfer = bnFeeTokenBalance.minus(feeAmount).minus(fromAsset.slug === feeToken ? bnAmount : 0);

    /**
     * Check fee token balance after transfer.
     * Because the balance had subtracted with existence deposit, so only need to check if it's less than 0
     * */
    if (feeBalanceAfterTransfer.lt(0)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t(`Insufficient balance. Deposit ${fromAsset.symbol} and try again.`))];
    }

    const destMinAmount = _getTokenMinAmount(toAsset);
    // TODO: Need to update with new logic, calculate fee to claim on dest chain
    const minSendingRequired = new BigN(destMinAmount).multipliedBy(FEE_RATE_MULTIPLIER.high);

    // Check sending token ED for receiver
    if (bnAmount.lt(minSendingRequired)) {
      const atLeastStr = formatNumber(minSendingRequired, _getAssetDecimals(toAsset), balanceFormatter, { maxNumberFormat: _getAssetDecimals(toAsset) || 6 });

      return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('You must transfer at least {{amount}} {{symbol}} to keep the destination account alive', { replace: { amount: atLeastStr, symbol: fromAsset.symbol } }))];
    }

    // Check keepAlive on dest chain for receiver
    if (!_isNativeToken(toAsset)) {
      const toChainApi = this.chainService.getSubstrateApi(toAsset.originChain);

      // TODO: Need to update, currently only support substrate xcm
      if (!toChainApi) {
        return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR, t('Destination chain is not active'))];
      }

      const isSendingTokenSufficient = await _isSufficientToken(toAsset, toChainApi);

      if (!isSendingTokenSufficient) {
        const toChainNativeAssetBalance = await this.balanceService.getTotalBalance(receiver, toAsset.originChain, toChainNativeAsset.slug, ExtrinsicType.TRANSFER_BALANCE);

        const isReceiverAliveByNativeToken = _isAccountActive(toChainNativeAssetBalance.metadata as FrameSystemAccountInfo);

        if (!isReceiverAliveByNativeToken) {
          // TODO: Update message
          return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('The recipient account has less than {{amount}} {{nativeSymbol}}, which can lead to your {{localSymbol}} being lost. Change recipient account and try again', { replace: { amount: toChainNativeAssetBalance.value, nativeSymbol: toChainNativeAsset.symbol, localSymbol: toAsset.symbol } }))];
        }
      }
    }

    // SKIP: BECAUSE CURRENTLY NOT SUPPORT SNOWBRIDGE FOR SWAP FEATURE
    // check native token ED on dest chain for receiver
    // const bnKeepAliveBalance = _isNativeToken(destinationTokenInfo) ? new BigN(receiverNativeBalance).plus(sendingAmount) : new BigN(receiverNativeBalance);
    //
    // if (isSnowBridge && bnKeepAliveBalance.lt(_getChainExistentialDeposit(destChainInfo))) {
    //   const { decimals, symbol } = _getChainNativeTokenBasicInfo(destChainInfo);
    //   const atLeastStr = formatNumber(_getChainExistentialDeposit(destChainInfo), decimals || 0, balanceFormatter, { maxNumberFormat: 6 });
    //
    //   error = new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t(' Insufficient {{symbol}} on {{chain}} to cover min balance ({{amount}} {{symbol}})', { replace: { amount: atLeastStr, symbol, chain: destChainInfo.name } }));
    // }

    return [];
  }

  public async validateTokenApproveStep (params: ValidateSwapProcessParams, stepIndex: number): Promise<TransactionError[]> {
    return Promise.resolve([]);
  }

  public async validateSetFeeTokenStep (params: ValidateSwapProcessParams, stepIndex: number): Promise<TransactionError[]> {
    if (!params.selectedQuote) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    const feeInfo = params.process.totalFee[stepIndex];
    const feeAmount = feeInfo.feeComponent[0];
    const feeTokenInfo = this.chainService.getAssetBySlug(feeInfo.defaultFeeToken);

    const feeTokenBalance = await this.balanceService.getTransferableBalance(params.address, feeTokenInfo.originChain, feeTokenInfo.slug);
    const bnFeeTokenBalance = new BigN(feeTokenBalance.value);
    const bnFeeAmount = new BigN(feeAmount.amount);

    if (bnFeeAmount.gte(bnFeeTokenBalance)) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE)]);
    }

    return [];
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

    const balanceError = _validateBalanceToSwap(fromAsset, feeTokenInfo, feeTokenChain, networkFee.amount, fromAssetBalance.value, feeTokenBalance.value, fromAmount, isXcmOk, minSwap);

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

  private async validateBridgeStep (receiver: string, fromToken: _ChainAsset, toToken: _ChainAsset, selectedFeeToken: _ChainAsset, toChainNativeToken: _ChainAsset, bnBridgeAmount: BigN, bnFromTokenBalance: BigN, bnBridgeFeeAmount: BigN, bnFeeTokenBalance: BigN, bnBridgeDeliveryFee: BigN): Promise<TransactionError[]> {
    const minBridgeAmountRequired = new BigN(_getTokenMinAmount(toToken)).multipliedBy(FEE_RATE_MULTIPLIER.high);
    const spendingAndFeePaymentValidation = validateSpendingAndFeePayment(fromToken, selectedFeeToken, bnBridgeAmount, bnFromTokenBalance, bnBridgeFeeAmount, bnFeeTokenBalance);

    if (spendingAndFeePaymentValidation.length > 0) {
      return spendingAndFeePaymentValidation;
    }

    if (bnBridgeAmount.lte(minBridgeAmountRequired.plus(bnBridgeDeliveryFee))) {
      const atLeastStr = formatNumber(minBridgeAmountRequired.plus(bnBridgeDeliveryFee), _getAssetDecimals(toToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(toToken) || 6 });

      return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('You must transfer at least {{amount}} {{symbol}} to keep the destination account alive', { replace: { amount: atLeastStr, symbol: fromToken.symbol } }))];
    }

    // By here, we know that the user is receiving a valid amount of toToken
    const toChainApi = this.chainService.getSubstrateApi(toToken.originChain);

    if (!toChainApi) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    // Only need to check if account is alive with the receiving toToken
    const isToTokenSufficient = await _isSufficientToken(toToken, toChainApi);

    if (!isToTokenSufficient && !_isNativeToken(toToken)) { // sending token cannot keep account alive, must check with native token
      const toChainNativeTokenBalance = await this.balanceService.getTotalBalance(receiver, toToken.originChain, toChainNativeToken.slug, ExtrinsicType.TRANSFER_BALANCE);

      if (!_isAccountActive(toChainNativeTokenBalance.metadata as FrameSystemAccountInfo)) {
        return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('The recipient account has less than {{amount}} {{nativeSymbol}}, which can lead to your {{localSymbol}} being lost. Change recipient account and try again', { replace: { amount: toChainNativeTokenBalance.value, nativeSymbol: toChainNativeToken.symbol, localSymbol: toToken.symbol } }))];
      }
    }

    return [];
  }

  private validateSwapStepV2 (swapToChain: _ChainInfo, swapToken: _ChainAsset, receivingToken: _ChainAsset, swapFeeToken: _ChainAsset, bnSwapValue: BigN, bnExpectedReceivingAmount: BigN, bnSwapFromTokenBalance: BigN, bnSwapFeeAmount: BigN, bnSwapFeeTokenBalance: BigN, recipient?: string): TransactionError[] {
    const spendingAndFeePaymentValidation = validateSpendingAndFeePayment(swapToken, swapFeeToken, bnSwapValue, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance);

    if (spendingAndFeePaymentValidation.length > 0) {
      return spendingAndFeePaymentValidation;
    }

    if (bnSwapValue.lte(_getTokenMinAmount(swapToken))) {
      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP)];
    }

    if (bnExpectedReceivingAmount.lte(_getTokenMinAmount(receivingToken))) {
      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP, t(`Amount ${_getAssetSymbol(receivingToken)} received is too small`))];
    }

    if (recipient) {
      const isEvmAddress = isEthereumAddress(recipient);
      const isEvmDestChain = _isChainEvmCompatible(swapToChain);

      if ((isEvmAddress && !isEvmDestChain) || (!isEvmAddress && isEvmDestChain)) { // todo: update this condition
        return [new TransactionError(SwapErrorType.INVALID_RECIPIENT)];
      }
    }

    return [];
  }

  public async validateSwapOnlyProcess (params: ValidateSwapProcessParams, swapIndex: number): Promise<TransactionError[]> {
    const swapStepInfo = params.process.steps[swapIndex];
    const swapMetadata = swapStepInfo.metadata as unknown as BaseSwapStepMetadata; // todo
    const swapFee = params.process.totalFee[swapIndex];

    if (!swapMetadata || !swapMetadata.destinationTokenInfo || !swapMetadata.originTokenInfo || !swapMetadata.sendingValue) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    // Validate quote
    if (!params.selectedQuote) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (params.selectedQuote.aliveUntil <= +Date.now()) {
      return [new TransactionError(SwapErrorType.QUOTE_TIMEOUT)];
    }

    const swapNetworkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!swapNetworkFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapToken = swapMetadata.originTokenInfo;
    const swapReceivingToken = swapMetadata.destinationTokenInfo;
    const bnSwapReceivingAmount = BigN(params.selectedQuote.toAmount);

    const bnSwapValue = BigN(swapMetadata.sendingValue);
    const bnSwapFeeAmount = BigN(swapNetworkFee.amount);

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(params.address, swapToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(params.address, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    return this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance, params.recipient);
  }

  public async validateXcmSwapProcess (params: ValidateSwapProcessParams, swapIndex: number, xcmIndex: number): Promise<TransactionError[]> {
    // Bridge
    const currentStep = params.process.steps[xcmIndex];
    const xcmMetadata = currentStep.metadata as unknown as BriefXCMStep;
    const currentFee = params.process.totalFee[xcmIndex];
    const bridgeFeeAmount = currentFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!xcmMetadata || !xcmMetadata.destinationTokenInfo || !xcmMetadata.originTokenInfo || !xcmMetadata.sendingValue) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (!bridgeFeeAmount) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bridgeFromToken = xcmMetadata.originTokenInfo;
    const bridgeToToken = xcmMetadata.destinationTokenInfo;

    const fromChain = this.chainService.getChainInfoByKey(bridgeFromToken.originChain);
    const toChain = this.chainService.getChainInfoByKey(bridgeToToken.originChain);

    if (_isSnowBridgeXcm(fromChain, toChain)) {
      return [new TransactionError(BasicTxErrorType.UNSUPPORTED)];
    }

    const bnBridgeFeeAmount = BigN(bridgeFeeAmount);
    const bnBridgeAmount = new BigN(xcmMetadata.sendingValue);
    const bridgeToChainNativeToken = this.chainService.getNativeTokenInfo(bridgeToToken.originChain);
    const bridgeSelectedFeeToken = this.chainService.getAssetBySlug(currentFee.selectedFeeToken || currentFee.defaultFeeToken);

    const bnBridgeDeliveryFee = BigN(0); // todo

    const bridgeSender = _reformatAddressWithChain(params.address, this.chainService.getChainInfoByKey(bridgeFromToken.originChain));
    const bridgeReceiver = _reformatAddressWithChain(params.recipient ?? bridgeSender, this.chainService.getChainInfoByKey(bridgeToToken.originChain));

    const [bridgeFromTokenBalance, bridgeFeeTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(bridgeSender, bridgeFromToken.originChain, bridgeFromToken.slug, ExtrinsicType.TRANSFER_XCM),
      this.balanceService.getTransferableBalance(bridgeSender, bridgeFromToken.originChain, bridgeSelectedFeeToken.slug, ExtrinsicType.TRANSFER_XCM)
    ]);

    // Native token balance has already accounted for ED aka strict mode
    const bnBridgeFromTokenBalance = new BigN(bridgeFromTokenBalance.value);
    const bnBridgeFeeTokenBalance = new BigN(bridgeFeeTokenBalance.value);

    const bridgeStepValidation = await this.validateBridgeStep(bridgeReceiver, bridgeFromToken, bridgeToToken, bridgeSelectedFeeToken, bridgeToChainNativeToken, bnBridgeAmount, bnBridgeFromTokenBalance, bnBridgeFeeAmount, bnBridgeFeeTokenBalance, bnBridgeDeliveryFee);

    if (bridgeStepValidation.length > 0) {
      return bridgeStepValidation;
    }

    // Swap
    const swapStepInfo = params.process.steps[swapIndex];
    const swapMetadata = swapStepInfo.metadata as unknown as BaseSwapStepMetadata; // todo
    const swapFee = params.process.totalFee[swapIndex];

    if (!swapMetadata || !swapMetadata.destinationTokenInfo || !swapMetadata.originTokenInfo || !swapMetadata.sendingValue) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    // Validate quote
    if (!params.selectedQuote) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (params.selectedQuote.aliveUntil <= +Date.now()) {
      return [new TransactionError(SwapErrorType.QUOTE_TIMEOUT)];
    }

    const swapNetworkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!swapNetworkFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapToken = swapMetadata.originTokenInfo;
    const swapReceivingToken = swapMetadata.destinationTokenInfo;
    const bnSwapReceivingAmount = BigN(params.selectedQuote.toAmount);

    if (swapToken.slug !== bridgeToToken.slug) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bnSwapValue = BigN(swapMetadata.sendingValue);
    const bnSwapFeeAmount = BigN(swapNetworkFee.amount);

    if (bnSwapValue.gt(bnBridgeAmount)) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(params.address, swapToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(params.address, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    console.log(bnSwapFromTokenBalance); // todo

    const swapStepValidation = this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnBridgeAmount, bnSwapFeeAmount, bnSwapFeeTokenBalance, params.recipient);

    if (swapStepValidation.length > 0) {
      return swapStepValidation;
    }

    return [];
  }

  get name (): string {
    return this.providerName;
  }

  get slug (): string {
    return this.providerSlug;
  }

  get providerInfo (): SwapProvider {
    return {
      id: this.providerSlug,
      name: this.providerName
    };
  }
}
