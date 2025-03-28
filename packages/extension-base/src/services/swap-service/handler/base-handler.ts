// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateSpendingAndFeePayment } from '@subwallet/extension-base/core/logic-validation';
import { _validateBalanceToSwap, _validateBalanceToSwapV2, _validateQuoteV2, _validateSwapRecipient, _validateSwapRecipientV2 } from '@subwallet/extension-base/core/logic-validation/swap';
import { _isAccountActive } from '@subwallet/extension-base/core/substrate/system-pallet';
import { FrameSystemAccountInfo } from '@subwallet/extension-base/core/substrate/types';
import { _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { _isSufficientToken } from '@subwallet/extension-base/core/utils';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { createXcmExtrinsic } from '@subwallet/extension-base/services/balance-service/transfer/xcm';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getAssetDecimals, _getAssetSymbol, _getTokenMinAmount, _isChainEvmCompatible, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { FEE_RATE_MULTIPLIER, getAmountAfterSlippage, getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { BaseSwapStepMetadata, BasicTxErrorType, BriefSwapStepV2, BriefXCMStep, BriefXcmStepV2, CommonStepType, DynamicSwapType, GenSwapStepFuncV2, OptimalSwapPathParamsV2, RequestCrossChainTransfer, RuntimeDispatchInfo, TransferTxErrorType, XcmStepPosition } from '@subwallet/extension-base/types';
import { BaseStepDetail, CommonOptimalSwapPath, CommonStepFeeInfo, DEFAULT_FIRST_STEP, MOCK_STEP_FEE } from '@subwallet/extension-base/types/service-base';
import { GenSwapStepFunc, OptimalSwapPathParams, SwapErrorType, SwapFeeType, SwapProvider, SwapProviderId, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types/swap';
import { _reformatAddressWithChain, balanceFormatter, formatNumber } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
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

  async getBridgeStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    // only xcm on substrate for now
    const { path, request: { address, fromAmount, recipient, slippage }, selectedQuote } = params;
    const xcmStepIndex = path.findIndex((step) => step.action === DynamicSwapType.BRIDGE); // index = 0 => XCM first; index = 1 => SWAP first
    const xcmPairInfo = xcmStepIndex === -1 ? undefined : path[xcmStepIndex];

    if (!xcmPairInfo) {
      return undefined;
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.pair.from);
    const toTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.pair.to);
    const fromChainInfo = this.chainService.getChainInfoByKey(fromTokenInfo.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toTokenInfo.originChain);

    if (!fromChainInfo || !toChainInfo || !fromChainInfo || !toChainInfo) {
      throw Error('Token or chain not found');
    }

    try {
      const substrateApi = await this.chainService.getSubstrateApi(fromTokenInfo.originChain).isReady;

      const id = getId();
      const feeInfo = await this.feeService.subscribeChainFee(id, fromTokenInfo.originChain, 'substrate');

      const mockSendingValue = xcmStepIndex === XcmStepPosition.FIRST ? fromAmount : selectedQuote?.toAmount || '0';
      const recipientAddress = xcmStepIndex === XcmStepPosition.FIRST ? _reformatAddressWithChain(address, toChainInfo) : recipient || _reformatAddressWithChain(address, toChainInfo); // has recipient in case swap to another address

      const xcmTransfer = await createXcmExtrinsic({
        originTokenInfo: fromTokenInfo,
        destinationTokenInfo: toTokenInfo,
        originChain: fromChainInfo,
        destinationChain: toChainInfo,
        substrateApi: substrateApi,
        feeInfo,
        // Mock sending value to get payment info
        sendingValue: mockSendingValue,
        sender: address,
        recipient: recipientAddress
      });

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(address);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;
      const estimatedXcmFee = Math.ceil(xcmFeeInfo.partialFee * FEE_RATE_MULTIPLIER.medium).toString();

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

      if (xcmStepIndex === XcmStepPosition.AFTER_SWAP) {
        bnTransferAmount = BigN(getAmountAfterSlippage(selectedQuote?.toAmount || '0', slippage)); // todo: check exception toAmount
      }

      // todo: increase transfer amount when XCM local token
      if (xcmStepIndex === XcmStepPosition.FIRST && isXcmNativeToken) {
        // xcm fee is paid in native token but swap token is not always native token
        // add amount of fee into sending value to ensure has enough token to swap
        bnTransferAmount = bnTransferAmount.plus(BigN(estimatedXcmFee));
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

  async getExtraBridgeStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    // todo: can merge with getBridgeStep by adding param flag to check extra bridge step
    const { path, request: { address, fromAmount, recipient, slippage }, selectedQuote } = params;
    const xcmStepIndex = XcmStepPosition.AFTER_XCM_SWAP;
    const xcmPairInfo = path[xcmStepIndex] || undefined;

    if (!xcmPairInfo) {
      return undefined;
    }

    const fromTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.pair.from);
    const toTokenInfo = this.chainService.getAssetBySlug(xcmPairInfo.pair.to);
    const fromChainInfo = this.chainService.getChainInfoByKey(fromTokenInfo.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toTokenInfo.originChain);

    if (!fromChainInfo || !toChainInfo || !fromChainInfo || !toChainInfo) {
      throw Error('Token or chain not found');
    }

    try {
      const substrateApi = await this.chainService.getSubstrateApi(fromTokenInfo.originChain).isReady;

      const id = getId();
      const feeInfo = await this.feeService.subscribeChainFee(id, fromTokenInfo.originChain, 'substrate');

      const xcmTransfer = await createXcmExtrinsic({
        originTokenInfo: fromTokenInfo,
        destinationTokenInfo: toTokenInfo,
        originChain: fromChainInfo,
        destinationChain: toChainInfo,
        substrateApi: substrateApi,
        feeInfo,
        // Mock sending value to get payment info
        sendingValue: selectedQuote?.toAmount || '0', // todo: any better way to handle than || '0'?
        sender: _reformatAddressWithChain(address, fromChainInfo),
        recipient: recipient || _reformatAddressWithChain(address, toChainInfo) // recipient in case swap to another address
      });

      const _xcmFeeInfo = await xcmTransfer.paymentInfo(address);
      const xcmFeeInfo = _xcmFeeInfo.toPrimitive() as unknown as RuntimeDispatchInfo;
      const estimatedXcmFee = Math.ceil(xcmFeeInfo.partialFee * FEE_RATE_MULTIPLIER.medium).toString();

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

      bnTransferAmount = BigN(getAmountAfterSlippage(selectedQuote?.toAmount || '0', slippage));

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

  public async validateBridgeStep (params: ValidateSwapProcessParams, stepIndex: number): Promise<TransactionError[]> {
    const currentStep = params.process.steps[stepIndex];
    const currentFee = params.process.totalFee[stepIndex];
    const feeToken = currentFee.selectedFeeToken || currentFee.defaultFeeToken;
    const feeAmount = currentFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE)?.amount;

    if (!feeAmount) {
      throw new Error('Fee not found for XCM step');
    }

    const metadata = currentStep.metadata as unknown as BriefXcmStepV2;
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

  public async validateSwapV2 (params: ValidateSwapProcessParams, swapIndex: number): Promise<TransactionError[]> {
    const { address, process, recipient, selectedQuote } = params;

    // Validate quote
    const quoteError = _validateQuoteV2(selectedQuote);

    if (quoteError) {
      return Promise.resolve([quoteError]);
    }

    const swapFee = process.totalFee[swapIndex];
    const swapInfo = process.steps[swapIndex].metadata as unknown as BriefSwapStepV2;
    const networkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!networkFee) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    const fromToken = swapInfo.originTokenInfo;
    const fromChain = this.chainService.getChainInfoByKey(fromToken.originChain);
    const feeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const [feeTokenBalance, fromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(address, fromChain.slug, feeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(address, fromChain.slug, fromToken.slug, ExtrinsicType.SWAP)
    ]);

    // Validate balance
    const balanceError = _validateBalanceToSwapV2({
      chainInfo: fromChain,
      fromToken: fromToken,
      fromTokenBalance: fromTokenBalance.value,
      feeToken: feeToken,
      feeTokenBalance: feeTokenBalance.value,
      feeAmount: networkFee.amount,
      swapAmount: swapInfo.sendingValue,
      minSwapAmount: selectedQuote.minSwap
    });

    if (balanceError) {
      return Promise.resolve([balanceError]);
    }

    // Validate recipient
    const toChain = this.chainService.getChainInfoByKey(swapInfo.destinationTokenInfo.originChain);
    const recipientError = _validateSwapRecipientV2(toChain, recipient);

    if (recipientError) {
      return Promise.resolve([recipientError]);
    }

    return Promise.resolve([]);
  }

  public async validateSwapXcmV2 (params: ValidateSwapProcessParams, swapIndex: number, xcmIndex: number): Promise<TransactionError[]> {
    // -- SWAP -- //

    const swapInfo = params.process.steps[swapIndex].metadata as unknown as BriefSwapStepV2;
    const swapFee = params.process.totalFee[xcmIndex];

    // Validate quote
    const quoteError = _validateQuoteV2(params.selectedQuote);

    if (quoteError) {
      return Promise.resolve([quoteError]);
    }

    const swapNetworkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!swapNetworkFee) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    const swapFromToken = swapInfo.originTokenInfo;
    const swapFromChain = this.chainService.getChainInfoByKey(swapFromToken.originChain);
    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(params.address, swapFromChain.slug, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(params.address, swapFromChain.slug, swapFromToken.slug, ExtrinsicType.SWAP)
    ]);

    // Validate balance
    const balanceError = _validateBalanceToSwapV2({
      chainInfo: swapFromChain,
      fromToken: swapFromToken,
      fromTokenBalance: swapFromTokenBalance.value,
      feeToken: swapFeeToken,
      feeTokenBalance: swapFeeTokenBalance.value,
      feeAmount: swapNetworkFee.amount,
      swapAmount: swapInfo.sendingValue,
      minSwapAmount: params.selectedQuote.minSwap
    });

    if (balanceError) {
      return Promise.resolve([balanceError]);
    }

    // Validate recipient
    const swapToChain = this.chainService.getChainInfoByKey(swapInfo.destinationTokenInfo.originChain);
    const recipientError = _validateSwapRecipientV2(swapToChain, params.recipient);

    if (recipientError) {
      return Promise.resolve([recipientError]);
    }

    // -- XCM -- //

    const xcmInfo = params.process.steps[xcmIndex].metadata as unknown as BriefXcmStepV2;
    const xcmFee = params.process.totalFee[xcmIndex];
    const xcmFeeToken = xcmFee.selectedFeeToken || xcmFee.defaultFeeToken;
    const xcmNetworkFee = xcmFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!xcmNetworkFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const xcmFeeAmount = xcmNetworkFee.amount;
    const bnXcmSendingAmount = BigN(xcmInfo.sendingValue);
    const xcmFromToken = xcmInfo?.originTokenInfo;
    const xcmToToken = xcmInfo?.destinationTokenInfo;

    if (!xcmFromToken || !xcmToToken) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const xcmFromChain = this.chainService.getChainInfoByKey(xcmFromToken.originChain);
    const xcmToChain = this.chainService.getChainInfoByKey(xcmToToken.originChain);
    const xcmToChainNativeToken = this.chainService.getNativeTokenInfo(xcmToToken.originChain);
    const xcmSender = _reformatAddressWithChain(params.address, xcmFromChain);
    const xcmReceiver = _reformatAddressWithChain(params.recipient ?? xcmSender, xcmToChain);
    const [xcmFromTokenBalance, xcmFeeTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(xcmSender, xcmFromChain.slug, xcmFromToken.slug, ExtrinsicType.TRANSFER_XCM),
      this.balanceService.getTransferableBalance(xcmSender, xcmFromChain.slug, xcmFeeToken, ExtrinsicType.TRANSFER_XCM)
    ]);

    // Balance adjust after previous step
    const xcmFromTokenBalanceAfterSwap = BigN(xcmFromTokenBalance.value).plus(swapInfo.destinationValue);
    const xcmFeeTokenBalanceAfterSwap = xcmFromToken.slug === xcmFeeToken ? BigN(xcmFeeTokenBalance.value).plus(swapInfo.destinationValue) : BigN(xcmFeeTokenBalance.value);

    /* Compare transferable balance with amount xcm */
    if (xcmFromTokenBalanceAfterSwap.lt(bnXcmSendingAmount)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t(`Insufficient balance. Deposit ${xcmFromToken.symbol} and try again.`))];
    }

    /**
     * Calculate fee token keep alive after xcm
     * If fee token is the same as from token, need to subtract sending amount
     * @TODO: Need to update logic if change fee token (multi with rate)
     * */
    const xcmFeeBalanceAfterTransfer = xcmFeeTokenBalanceAfterSwap.minus(xcmFeeAmount).minus(xcmFromToken.slug === xcmFeeToken ? bnXcmSendingAmount : 0);

    /**
     * Check fee token balance after transfer.
     * Because the balance had subtracted with existence deposit, so only need to check if it's less than 0
     * */
    if (xcmFeeBalanceAfterTransfer.lt(0)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t(`Insufficient balance. Deposit ${xcmFromToken.symbol} and try again.`))];
    }

    const destMinAmount = _getTokenMinAmount(xcmToToken);
    // TODO: Need to update with new logic, calculate fee to claim on dest chain
    const minSendingRequired = BigN(destMinAmount).multipliedBy(FEE_RATE_MULTIPLIER.medium);

    // Check sending token ED for receiver
    if (bnXcmSendingAmount.lt(minSendingRequired)) {
      const atLeastStr = formatNumber(minSendingRequired, _getAssetDecimals(xcmToToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(xcmToToken) || 6 });

      return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('You must transfer at least {{amount}} {{symbol}} to keep the destination account alive', { replace: { amount: atLeastStr, symbol: xcmFromToken.symbol } }))];
    }

    // Check keepAlive on dest chain for receiver
    if (!_isNativeToken(xcmToToken)) {
      const toChainApi = this.chainService.getSubstrateApi(xcmToToken.originChain);

      // TODO: Need to update, currently only support substrate xcm
      if (!toChainApi) {
        return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR, t('Destination chain is not active'))];
      }

      const isSendingTokenSufficient = await _isSufficientToken(xcmToToken, toChainApi);

      if (!isSendingTokenSufficient) {
        const toChainNativeAssetBalance = await this.balanceService.getTotalBalance(xcmReceiver, xcmToToken.originChain, xcmToChainNativeToken.slug, ExtrinsicType.TRANSFER_BALANCE);

        const isReceiverAliveByNativeToken = _isAccountActive(toChainNativeAssetBalance.metadata as FrameSystemAccountInfo);

        if (!isReceiverAliveByNativeToken) {
          // TODO: Update message
          return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('The recipient account has less than {{amount}} {{nativeSymbol}}, which can lead to your {{localSymbol}} being lost. Change recipient account and try again', { replace: { amount: toChainNativeAssetBalance.value, nativeSymbol: xcmToChainNativeToken.symbol, localSymbol: xcmToToken.symbol } }))];
        }
      }
    }

    return Promise.resolve([]);
  }

  public async validateXcmSwapV2 (params: ValidateSwapProcessParams, swapIndex: number, xcmIndex: number): Promise<TransactionError[]> {
    // -- XCM -- //

    const xcmInfo = params.process.steps[xcmIndex].metadata as unknown as BriefXcmStepV2;
    const xcmFee = params.process.totalFee[xcmIndex];
    const xcmFeeToken = xcmFee.selectedFeeToken || xcmFee.defaultFeeToken;
    const xcmNetworkFee = xcmFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!xcmNetworkFee) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const xcmFeeAmount = xcmNetworkFee.amount;
    const bnXcmSendingAmount = BigN(xcmInfo.sendingValue);
    const xcmFromToken = xcmInfo?.originTokenInfo;
    const xcmToToken = xcmInfo?.destinationTokenInfo;

    if (!xcmFromToken || !xcmToToken) {
      return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR)];
    }

    const xcmFromChain = this.chainService.getChainInfoByKey(xcmFromToken.originChain);
    const xcmToChain = this.chainService.getChainInfoByKey(xcmToToken.originChain);
    const xcmToChainNativeToken = this.chainService.getNativeTokenInfo(xcmToToken.originChain);
    const xcmSender = _reformatAddressWithChain(params.address, xcmFromChain);
    const xcmReceiver = _reformatAddressWithChain(params.recipient ?? xcmSender, xcmToChain);

    /* Get transferable balance */
    const [xcmFromTokenBalance, xcmFeeTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(xcmSender, xcmFromChain.slug, xcmFromToken.slug, ExtrinsicType.TRANSFER_XCM),
      this.balanceService.getTransferableBalance(xcmSender, xcmFromChain.slug, xcmFeeToken, ExtrinsicType.TRANSFER_XCM)
    ]);

    const bnXcmFromTokenBalance = BigN(xcmFromTokenBalance.value);
    const bnXcmFeeTokenBalance = BigN(xcmFeeTokenBalance.value);

    /* Compare transferable balance with amount xcm */
    if (bnXcmFromTokenBalance.lt(bnXcmSendingAmount)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t(`Insufficient balance. Deposit ${xcmFromToken.symbol} and try again.`))];
    }

    /**
     * Calculate fee token keep alive after xcm
     * If fee token is the same as from token, need to subtract sending amount
     * @TODO: Need to update logic if change fee token (multi with rate)
     * */
    const xcmFeeBalanceAfterTransfer = bnXcmFeeTokenBalance.minus(xcmFeeAmount).minus(xcmFromToken.slug === xcmFeeToken ? bnXcmSendingAmount : 0);

    /**
     * Check fee token balance after transfer.
     * Because the balance had subtracted with existence deposit, so only need to check if it's less than 0
     * */
    if (xcmFeeBalanceAfterTransfer.lt(0)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t(`Insufficient balance. Deposit ${xcmFromToken.symbol} and try again.`))];
    }

    const destMinAmount = _getTokenMinAmount(xcmToToken);
    // TODO: Need to update with new logic, calculate fee to claim on dest chain
    const minSendingRequired = BigN(destMinAmount).multipliedBy(FEE_RATE_MULTIPLIER.medium);

    // Check sending token ED for receiver
    if (bnXcmSendingAmount.lt(minSendingRequired)) {
      const atLeastStr = formatNumber(minSendingRequired, _getAssetDecimals(xcmToToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(xcmToToken) || 6 });

      return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('You must transfer at least {{amount}} {{symbol}} to keep the destination account alive', { replace: { amount: atLeastStr, symbol: xcmFromToken.symbol } }))];
    }

    // Check keepAlive on dest chain for receiver
    if (!_isNativeToken(xcmToToken)) {
      const toChainApi = this.chainService.getSubstrateApi(xcmToToken.originChain);

      // TODO: Need to update, currently only support substrate xcm
      if (!toChainApi) {
        return [new TransactionError(BasicTxErrorType.INTERNAL_ERROR, t('Destination chain is not active'))];
      }

      const isSendingTokenSufficient = await _isSufficientToken(xcmToToken, toChainApi);

      if (!isSendingTokenSufficient) {
        const toChainNativeAssetBalance = await this.balanceService.getTotalBalance(xcmReceiver, xcmToToken.originChain, xcmToChainNativeToken.slug, ExtrinsicType.TRANSFER_BALANCE);

        const isReceiverAliveByNativeToken = _isAccountActive(toChainNativeAssetBalance.metadata as FrameSystemAccountInfo);

        if (!isReceiverAliveByNativeToken) {
          // TODO: Update message
          return [new TransactionError(TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT, t('The recipient account has less than {{amount}} {{nativeSymbol}}, which can lead to your {{localSymbol}} being lost. Change recipient account and try again', { replace: { amount: toChainNativeAssetBalance.value, nativeSymbol: xcmToChainNativeToken.symbol, localSymbol: xcmToToken.symbol } }))];
        }
      }
    }

    // -- SWAP -- //

    const swapInfo = params.process.steps[swapIndex].metadata as unknown as BriefSwapStepV2;
    const swapFee = params.process.totalFee[swapIndex];

    // Validate quote
    const quoteError = _validateQuoteV2(params.selectedQuote);

    if (quoteError) {
      return Promise.resolve([quoteError]);
    }

    const swapNetworkFee = swapFee.feeComponent.find((fee) => fee.feeType === SwapFeeType.NETWORK_FEE);

    if (!swapNetworkFee) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INTERNAL_ERROR)]);
    }

    const swapFromToken = swapInfo.originTokenInfo;
    const swapFromChain = this.chainService.getChainInfoByKey(swapFromToken.originChain);
    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapSender = _reformatAddressWithChain(params.address, swapFromChain);
    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(swapSender, swapFromChain.slug, swapFeeToken.slug),
      this.balanceService.getTransferableBalance(swapSender, swapFromChain.slug, swapFromToken.slug)
    ]);

    // Balance adjust after previous step
    const swapFromTokenBalanceAfterXcm = BigN(swapFromTokenBalance.value).plus(xcmInfo.destinationValue).toString();
    const swapFeeTokenBalanceAfterXcm = swapFeeToken.slug === swapFromToken.slug ? BigN(swapFeeTokenBalance.value).plus(xcmInfo.destinationValue).toString() : swapFeeTokenBalance.value;

    // Validate balance
    const balanceError = _validateBalanceToSwapV2({
      chainInfo: swapFromChain,
      fromToken: swapFromToken,
      fromTokenBalance: swapFromTokenBalanceAfterXcm,
      feeToken: swapFeeToken,
      feeTokenBalance: swapFeeTokenBalanceAfterXcm,
      feeAmount: swapNetworkFee.amount,
      swapAmount: swapInfo.sendingValue,
      minSwapAmount: params.selectedQuote.minSwap
    });

    if (balanceError) {
      return Promise.resolve([balanceError]);
    }

    // Validate recipient
    const swapToChain = this.chainService.getChainInfoByKey(swapInfo.destinationTokenInfo.originChain);
    const recipientError = _validateSwapRecipientV2(swapToChain, params.recipient);

    if (recipientError) {
      return Promise.resolve([recipientError]);
    }

    return Promise.resolve([]);
  }

  public async validateXcmSwapXcmV2 (params: ValidateSwapProcessParams, swapIndex: number, firstXcmIndex: number, lastXcmIndex: number): Promise<TransactionError[]> {
    return Promise.resolve([]);
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
      this.balanceService.getTransferableBalance(params.address, swapFeeToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
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

    if (bnSwapValue.lte(_getTokenMinAmount(swapToken))) {
      const atLeastString = formatNumber(_getTokenMinAmount(swapToken), _getAssetDecimals(swapToken), balanceFormatter, { maxNumberFormat: _getAssetDecimals(swapToken) || 6 });

      return [new TransactionError(SwapErrorType.NOT_MEET_MIN_SWAP, t(`Swap amount too small. Increase to more than ${atLeastString} ${_getAssetSymbol(swapToken)} and try again`))];
    }

    const swapFeeToken = this.chainService.getAssetBySlug(swapFee.selectedFeeToken || swapFee.defaultFeeToken);
    const swapToChain = this.chainService.getChainInfoByKey(swapMetadata.destinationTokenInfo.originChain);

    const [swapFeeTokenBalance, swapFromTokenBalance] = await Promise.all([
      this.balanceService.getTransferableBalance(params.address, swapFeeToken.originChain, swapFeeToken.slug, ExtrinsicType.SWAP),
      this.balanceService.getTransferableBalance(params.address, swapToken.originChain, swapToken.slug, ExtrinsicType.SWAP)
    ]);

    const bnSwapFromTokenBalance = BigN(swapFromTokenBalance.value).plus(bnBridgeAmount);
    const bnSwapFeeTokenBalance = BigN(swapFeeTokenBalance.value);

    const swapStepValidation = this.validateSwapStepV2(swapToChain, swapToken, swapReceivingToken, swapFeeToken, bnSwapValue, bnSwapReceivingAmount, bnSwapFromTokenBalance, bnSwapFeeAmount, bnSwapFeeTokenBalance, params.recipient);

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
