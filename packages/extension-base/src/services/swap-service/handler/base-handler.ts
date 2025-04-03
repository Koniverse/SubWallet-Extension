// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateSpendingAndFeePayment } from '@subwallet/extension-base/core/logic-validation';
import { _isAccountActive } from '@subwallet/extension-base/core/substrate/system-pallet';
import { FrameSystemAccountInfo } from '@subwallet/extension-base/core/substrate/types';
import { _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { _isSufficientToken } from '@subwallet/extension-base/core/utils';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getAssetDecimals, _getAssetSymbol, _getChainNativeTokenSlug, _getTokenMinAmount, _isChainEvmCompatible, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { FEE_RATE_MULTIPLIER } from '@subwallet/extension-base/services/swap-service/utils';
import { BaseSwapStepMetadata, BasicTxErrorType, GenSwapStepFuncV2, OptimalSwapPathParamsV2, RequestCrossChainTransfer, RuntimeDispatchInfo, SwapStepType, TransferTxErrorType } from '@subwallet/extension-base/types';
import { BaseStepDetail, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DEFAULT_FIRST_STEP, MOCK_STEP_FEE } from '@subwallet/extension-base/types/service-base';
import { DynamicSwapType, SwapErrorType, SwapFeeType, SwapProvider, SwapProviderId, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types/swap';
import { _reformatAddressWithChain, balanceFormatter, formatNumber } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigN from 'bignumber.js';
import { t } from 'i18next';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { createXcmExtrinsic } from '../../balance-service/transfer/xcm';

export interface SwapBaseInterface {
  providerSlug: SwapProviderId;

  generateOptimalProcessV2: (params: OptimalSwapPathParamsV2) => Promise<CommonOptimalSwapPath>;

  getSubmitStep: (params: OptimalSwapPathParamsV2, stepIndex: number) => Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined>;

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

  public async generateOptimalProcessV2 (params: OptimalSwapPathParamsV2, genStepFuncList: GenSwapStepFuncV2[]): Promise<CommonOptimalSwapPath> {
    const result: CommonOptimalSwapPath = {
      totalFee: [MOCK_STEP_FEE],
      steps: [DEFAULT_FIRST_STEP],
      path: params.path
    };

    try {
      for (const [i, genStepFunc] of genStepFuncList.entries()) {
        const step = await genStepFunc(params, i);

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

  async getBridgeStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    // only xcm on substrate for now
    const { path, request: { address, fromAmount, recipient }, selectedQuote } = params;

    if (stepIndex < 0 || stepIndex > params.path.length - 1) {
      return undefined;
    }

    const bridgePairInfo = path[stepIndex];

    if (bridgePairInfo.action !== DynamicSwapType.BRIDGE) {
      return undefined;
    }

    if (!bridgePairInfo || !selectedQuote) {
      return undefined;
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(bridgePairInfo.pair.from);
    const toTokenInfo = this.chainService.getAssetBySlug(bridgePairInfo.pair.to);
    const fromChainInfo = this.chainService.getChainInfoByKey(fromTokenInfo.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toTokenInfo.originChain);

    if (!fromChainInfo || !toChainInfo || !fromChainInfo || !toChainInfo) {
      throw Error('Token or chain not found');
    }

    let recipientAddress;
    const senderAddress = _reformatAddressWithChain(address, fromChainInfo);

    if (stepIndex === 0) {
      recipientAddress = _reformatAddressWithChain(address, toChainInfo);
    } else { // bridge after swap
      recipientAddress = _reformatAddressWithChain(recipient || address, toChainInfo);
    }

    try {
      const substrateApi = await this.chainService.getSubstrateApi(fromTokenInfo.originChain).isReady;

      const id = getId();
      const [feeInfo, toTokenBalance] = await Promise.all([
        this.feeService.subscribeChainFee(id, fromTokenInfo.originChain, 'substrate'),
        this.balanceService.getTotalBalance(senderAddress, toTokenInfo.originChain, toTokenInfo.slug, ExtrinsicType.TRANSFER_BALANCE)
      ]);

      const xcmTransfer = await createXcmExtrinsic({
        originTokenInfo: fromTokenInfo,
        destinationTokenInfo: toTokenInfo,
        originChain: fromChainInfo,
        destinationChain: toChainInfo,
        substrateApi: substrateApi,
        feeInfo,
        // Mock sending value to get payment info
        sendingValue: fromAmount,
        sender: senderAddress,
        recipient: recipientAddress
      });

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(senderAddress);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;
      const estimatedBridgeFee = Math.ceil(xcmFeeInfo.partialFee * FEE_RATE_MULTIPLIER.high).toString();

      const fee: CommonStepFeeInfo = {
        feeComponent: [{
          feeType: SwapFeeType.NETWORK_FEE,
          amount: estimatedBridgeFee,
          tokenSlug: _getChainNativeTokenSlug(fromChainInfo)
        }],
        defaultFeeToken: _getChainNativeTokenSlug(fromChainInfo),
        feeOptions: [_getChainNativeTokenSlug(fromChainInfo)]
      };

      const isBridgeNativeToken = _isNativeToken(fromTokenInfo);

      let bnSendingValue;
      let expectedReceive;

      // todo: increase transfer amount when XCM local token
      if (stepIndex === 0) {
        expectedReceive = fromAmount;
        bnSendingValue = BigN(fromAmount);

        const actionList = JSON.stringify(path.map((step) => step.action));
        const xcmSwapXcm = actionList === JSON.stringify([DynamicSwapType.BRIDGE, DynamicSwapType.SWAP, DynamicSwapType.BRIDGE]);

        if (xcmSwapXcm) {
          bnSendingValue = bnSendingValue.multipliedBy(1.02);
        }

        if (isBridgeNativeToken) {
          bnSendingValue = bnSendingValue.plus(BigN(estimatedBridgeFee));
        } else {
          bnSendingValue = bnSendingValue.plus(BigN(_getTokenMinAmount(toTokenInfo)).multipliedBy(FEE_RATE_MULTIPLIER.medium));
        }

        if (BigN(toTokenBalance.value).lte(0)) {
          bnSendingValue = bnSendingValue.plus(_getTokenMinAmount(toTokenInfo));
        }
      } else { // bridge after swap
        expectedReceive = selectedQuote.toAmount;
        bnSendingValue = BigN(selectedQuote.toAmount);
      }

      const step: BaseStepDetail = {
        // @ts-ignore
        metadata: {
          sendingValue: bnSendingValue.toString(),
          expectedReceive,
          originTokenInfo: fromTokenInfo,
          destinationTokenInfo: toTokenInfo,
          receiver: recipientAddress,
          sender: senderAddress
        } as BaseSwapStepMetadata,
        name: `Transfer ${fromTokenInfo.symbol} from ${fromChainInfo.name}`,
        type: CommonStepType.XCM
      };

      return [step, fee];
    } catch (e) {
      console.error('Error creating xcm step', e);

      return undefined;
    }
  }

  public async handleBridgeStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const briefXcmStep = params.process.steps[params.currentStep].metadata as unknown as BaseSwapStepMetadata;

    if (!briefXcmStep || !briefXcmStep.originTokenInfo || !briefXcmStep.destinationTokenInfo || !briefXcmStep.sendingValue) {
      throw new Error('XCM metadata error');
    }

    const originAsset = briefXcmStep.originTokenInfo;
    const destinationAsset = briefXcmStep.destinationTokenInfo;
    const originChain = this.chainService.getChainInfoByKey(originAsset.originChain);
    const destinationChain = this.chainService.getChainInfoByKey(destinationAsset.originChain);
    const substrateApi = this.chainService.getSubstrateApi(originAsset.originChain);
    const chainApi = await substrateApi.isReady;
    const feeInfo = await this.feeService.subscribeChainFee(getId(), originAsset.originChain, 'substrate');

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

    if (bnExpectedReceivingAmount.lte(_getTokenMinAmount(receivingToken))) {
      const atLeastStr = formatNumber(_getTokenMinAmount(receivingToken), _getAssetDecimals(receivingToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(receivingToken) || 6 });

      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP, t('You can\'t receive less than {{number}} {{symbol}}', { replace: { number: atLeastStr, symbol: _getAssetSymbol(receivingToken) } }))];
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

    if (!swapMetadata || !swapMetadata.destinationTokenInfo || !swapMetadata.originTokenInfo || !swapMetadata.sendingValue || !swapMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    // Validate quote
    if (!params.selectedQuote) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (params.selectedQuote.aliveUntil <= +Date.now()) {
      return [new TransactionError(SwapErrorType.QUOTE_TIMEOUT)];
    }

    if (params.selectedQuote.toAmount !== swapMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapNetworkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!swapNetworkFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapToken = swapMetadata.originTokenInfo;
    const swapReceivingToken = swapMetadata.destinationTokenInfo;
    const bnSwapReceivingAmount = BigN(swapMetadata.expectedReceive);

    const bnSwapValue = BigN(swapMetadata.sendingValue);
    const bnSwapFeeAmount = BigN(swapNetworkFee.amount);

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapFeeToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    return this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance, swapMetadata.receiver);
  }

  public async validateXcmSwapProcess (params: ValidateSwapProcessParams, swapIndex: number, xcmIndex: number): Promise<TransactionError[]> {
    // Bridge
    const currentStep = params.process.steps[xcmIndex];
    const xcmMetadata = currentStep.metadata as unknown as BaseSwapStepMetadata;
    const currentFee = params.process.totalFee[xcmIndex];
    const bridgeFeeAmount = currentFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!xcmMetadata || !xcmMetadata.destinationTokenInfo || !xcmMetadata.originTokenInfo || !xcmMetadata.sendingValue || !xcmMetadata.expectedReceive) {
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

    const bridgeSender = _reformatAddressWithChain(xcmMetadata.sender, this.chainService.getChainInfoByKey(bridgeFromToken.originChain));
    const bridgeReceiver = _reformatAddressWithChain(xcmMetadata.receiver ?? bridgeSender, this.chainService.getChainInfoByKey(bridgeToToken.originChain));

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

    if (swapStepInfo.type !== SwapStepType.SWAP) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (!swapMetadata || !swapMetadata.destinationTokenInfo || !swapMetadata.originTokenInfo || !swapMetadata.sendingValue || !swapMetadata.expectedReceive) {
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

    if (bnSwapValue.lte(_getTokenMinAmount(swapToken))) {
      const atLeastString = formatNumber(_getTokenMinAmount(swapToken), _getAssetDecimals(swapToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(swapToken) || 6 });

      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP, t(`Swap amount too small. Increase to more than ${atLeastString} ${_getAssetSymbol(swapToken)} and try again`))];
    }

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapFeeToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value).plus(bnBridgeAmount);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    const swapStepValidation = this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance, swapMetadata.receiver);

    if (swapStepValidation.length > 0) {
      return swapStepValidation;
    }

    return [];
  }

  public async validateSwapXcmProcess (params: ValidateSwapProcessParams, swapIndex: number, xcmIndex: number): Promise<TransactionError[]> {
    // Swap
    const swapStepInfo = params.process.steps[swapIndex];
    const swapMetadata = swapStepInfo.metadata as unknown as BaseSwapStepMetadata; // todo
    const swapFee = params.process.totalFee[swapIndex];

    if (!swapMetadata || !swapMetadata.destinationTokenInfo || !swapMetadata.originTokenInfo || !swapMetadata.sendingValue || !swapMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    // Validate quote
    if (!params.selectedQuote) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (params.selectedQuote.toAmount !== swapMetadata.expectedReceive) {
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
    const bnSwapReceivingAmount = BigN(swapMetadata.expectedReceive);

    const bnSwapValue = BigN(swapMetadata.sendingValue);
    const bnSwapFeeAmount = BigN(swapNetworkFee.amount);

    if (bnSwapValue.lte(_getTokenMinAmount(swapToken))) {
      const atLeastString = formatNumber(_getTokenMinAmount(swapToken), _getAssetDecimals(swapToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(swapToken) || 6 });

      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP, t(`Swap amount too small. Increase to more than ${atLeastString} ${_getAssetSymbol(swapToken)} and try again`))];
    }

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapFeeToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    const swapStepValidation = this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance, swapMetadata.receiver);

    if (swapStepValidation.length > 0) {
      return swapStepValidation;
    }

    // Bridge
    const currentStep = params.process.steps[xcmIndex];
    const xcmMetadata = currentStep.metadata as unknown as BaseSwapStepMetadata;
    const currentFee = params.process.totalFee[xcmIndex];
    const bridgeFeeAmount = currentFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!xcmMetadata || !xcmMetadata.destinationTokenInfo || !xcmMetadata.originTokenInfo || !xcmMetadata.sendingValue || !xcmMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (!bridgeFeeAmount) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bridgeFromToken = xcmMetadata.originTokenInfo;
    const bridgeToToken = xcmMetadata.destinationTokenInfo;

    const fromChain = this.chainService.getChainInfoByKey(bridgeFromToken.originChain);
    const toChain = this.chainService.getChainInfoByKey(bridgeToToken.originChain);

    if (swapReceivingToken.slug !== bridgeFromToken.slug) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (_isSnowBridgeXcm(fromChain, toChain)) {
      return [new TransactionError(BasicTxErrorType.UNSUPPORTED)];
    }

    const bnBridgeFeeAmount = BigN(bridgeFeeAmount);
    const bnBridgeAmount = new BigN(xcmMetadata.sendingValue);
    const bridgeToChainNativeToken = this.chainService.getNativeTokenInfo(bridgeToToken.originChain);
    const bridgeSelectedFeeToken = this.chainService.getAssetBySlug(currentFee.selectedFeeToken || currentFee.defaultFeeToken);

    if (bnBridgeAmount.gt(bnSwapReceivingAmount)) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bnBridgeDeliveryFee = BigN(0); // todo

    const bridgeSender = _reformatAddressWithChain(xcmMetadata.sender, this.chainService.getChainInfoByKey(bridgeFromToken.originChain));
    const bridgeReceiver = _reformatAddressWithChain(xcmMetadata.receiver ?? bridgeSender, this.chainService.getChainInfoByKey(bridgeToToken.originChain));

    const [bridgeFromTokenBalance, bridgeFeeTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(bridgeSender, bridgeFromToken.originChain, bridgeFromToken.slug, ExtrinsicType.TRANSFER_XCM),
      this.balanceService.getTransferableBalance(bridgeSender, bridgeFromToken.originChain, bridgeSelectedFeeToken.slug, ExtrinsicType.TRANSFER_XCM)
    ]);

    // Native token balance has already accounted for ED aka strict mode
    const bnBridgeFromTokenBalance = new BigN(bridgeFromTokenBalance.value).plus(bnSwapReceivingAmount);
    const bnBridgeFeeTokenBalance = new BigN(bridgeFeeTokenBalance.value);

    const bridgeStepValidation = await this.validateBridgeStep(bridgeReceiver, bridgeFromToken, bridgeToToken, bridgeSelectedFeeToken, bridgeToChainNativeToken, bnBridgeAmount, bnBridgeFromTokenBalance, bnBridgeFeeAmount, bnBridgeFeeTokenBalance, bnBridgeDeliveryFee);

    if (bridgeStepValidation.length > 0) {
      return bridgeStepValidation;
    }

    return [];
  }

  public async validateXcmSwapXcmProcess (params: ValidateSwapProcessParams, swapIndex: number, xcmIndex: number, transitIndex: number): Promise<TransactionError[]> {
    // Bridge
    const bridgeStep = params.process.steps[xcmIndex];
    const bridgeMetadata = bridgeStep.metadata as unknown as BaseSwapStepMetadata;
    const bridgeFee = params.process.totalFee[xcmIndex];
    const bridgeFeeAmount = bridgeFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!bridgeMetadata || !bridgeMetadata.destinationTokenInfo || !bridgeMetadata.originTokenInfo || !bridgeMetadata.sendingValue || !bridgeMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (!bridgeFeeAmount) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bridgeFromToken = bridgeMetadata.originTokenInfo;
    const bridgeToToken = bridgeMetadata.destinationTokenInfo;

    const fromChain = this.chainService.getChainInfoByKey(bridgeFromToken.originChain);
    const toChain = this.chainService.getChainInfoByKey(bridgeToToken.originChain);

    if (_isSnowBridgeXcm(fromChain, toChain)) {
      return [new TransactionError(BasicTxErrorType.UNSUPPORTED)];
    }

    const bnBridgeFeeAmount = BigN(bridgeFeeAmount);
    const bnBridgeAmount = new BigN(bridgeMetadata.sendingValue);
    const bridgeToChainNativeToken = this.chainService.getNativeTokenInfo(bridgeToToken.originChain);
    const bridgeSelectedFeeToken = this.chainService.getAssetBySlug(bridgeFee.selectedFeeToken || bridgeFee.defaultFeeToken);

    const bnBridgeDeliveryFee = BigN(0); // todo

    const bridgeSender = _reformatAddressWithChain(bridgeMetadata.sender, this.chainService.getChainInfoByKey(bridgeFromToken.originChain));
    const bridgeReceiver = _reformatAddressWithChain(bridgeMetadata.receiver ?? bridgeSender, this.chainService.getChainInfoByKey(bridgeToToken.originChain));

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

    if (swapStepInfo.type !== SwapStepType.SWAP) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (!swapMetadata || !swapMetadata.destinationTokenInfo || !swapMetadata.originTokenInfo || !swapMetadata.sendingValue || !swapMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    // Validate quote
    if (!params.selectedQuote) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (params.selectedQuote.aliveUntil <= +Date.now()) {
      return [new TransactionError(SwapErrorType.QUOTE_TIMEOUT)];
    }

    if (params.selectedQuote.toAmount !== swapMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapNetworkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!swapNetworkFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const swapToken = swapMetadata.originTokenInfo;
    const swapReceivingToken = swapMetadata.destinationTokenInfo;
    const bnSwapReceivingAmount = BigN(swapMetadata.expectedReceive);

    if (swapToken.slug !== bridgeToToken.slug) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bnSwapValue = BigN(swapMetadata.sendingValue);
    const bnSwapFeeAmount = BigN(swapNetworkFee.amount);

    if (bnSwapValue.gt(bnBridgeAmount)) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (bnSwapValue.lte(_getTokenMinAmount(swapToken))) {
      const atLeastString = formatNumber(_getTokenMinAmount(swapToken), _getAssetDecimals(swapToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(swapToken) || 6 });

      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP, t(`Swap amount too small. Increase to more than ${atLeastString} ${_getAssetSymbol(swapToken)} and try again`))];
    }

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapFeeToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(swapMetadata.sender, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value).plus(bnBridgeAmount);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    const swapStepValidation = this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance, swapMetadata.receiver);

    if (swapStepValidation.length > 0) {
      return swapStepValidation;
    }

    // Bridge again
    const transitStep = params.process.steps[transitIndex];
    const transitMetadata = transitStep.metadata as unknown as BaseSwapStepMetadata;
    const transitTotalFee = params.process.totalFee[transitIndex];
    const transitFee = transitTotalFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!transitMetadata || !transitMetadata.destinationTokenInfo || !transitMetadata.originTokenInfo || !transitMetadata.sendingValue || !transitMetadata.expectedReceive) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (!transitFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const transitFromToken = transitMetadata.originTokenInfo;
    const transitToToken = transitMetadata.destinationTokenInfo;

    const fromTransitChain = this.chainService.getChainInfoByKey(transitFromToken.originChain);
    const toTransitChain = this.chainService.getChainInfoByKey(transitToToken.originChain);

    if (swapReceivingToken.slug !== transitFromToken.slug) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    if (_isSnowBridgeXcm(fromTransitChain, toTransitChain)) {
      return [new TransactionError(BasicTxErrorType.UNSUPPORTED)];
    }

    const bnTransitFeeAmount = BigN(transitFee);
    const bnTransitAmount = new BigN(transitMetadata.sendingValue);
    const transitToChainNativeToken = this.chainService.getNativeTokenInfo(transitToToken.originChain);
    const transitSelectedFeeToken = this.chainService.getAssetBySlug(transitTotalFee.selectedFeeToken || transitTotalFee.defaultFeeToken);

    if (bnTransitAmount.gt(bnSwapReceivingAmount)) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const bnTransitDeliveryFee = BigN(0); // todo

    const transitSender = _reformatAddressWithChain(transitMetadata.sender, this.chainService.getChainInfoByKey(transitFromToken.originChain));
    const transitReceiver = _reformatAddressWithChain(transitMetadata.receiver ?? transitSender, this.chainService.getChainInfoByKey(transitToToken.originChain));

    const [transitFromTokenBalance, transitFeeTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(transitSender, transitFromToken.originChain, transitFromToken.slug, ExtrinsicType.TRANSFER_XCM),
      this.balanceService.getTransferableBalance(transitSender, transitFromToken.originChain, transitSelectedFeeToken.slug, ExtrinsicType.TRANSFER_XCM)
    ]);

    // Native token balance has already accounted for ED aka strict mode
    const bnTransitFromTokenBalance = new BigN(transitFromTokenBalance.value).plus(bnSwapReceivingAmount);
    const bnTransitFeeTokenBalance = new BigN(transitFeeTokenBalance.value);

    const transitStepValidation = await this.validateBridgeStep(transitReceiver, transitFromToken, transitToToken, transitSelectedFeeToken, transitToChainNativeToken, bnTransitAmount, bnTransitFromTokenBalance, bnTransitFeeAmount, bnTransitFeeTokenBalance, bnTransitDeliveryFee);

    if (transitStepValidation.length > 0) {
      return transitStepValidation;
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
