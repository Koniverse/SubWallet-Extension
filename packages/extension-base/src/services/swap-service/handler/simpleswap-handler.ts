// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { HEADERS, ProxyServiceRoute, SW_EXTERNAL_SERVICES_API } from '@subwallet/extension-base/constants';
import { _getAssetDecimals, _getAssetSymbol, _getContractAddressOfToken, _isChainSubstrateCompatible, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, OptimalSwapPathParamsV2, SimpleSwapTxData, SwapErrorType, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TransactionData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, formatNumber, TARGET_ENV } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import BigN, { BigNumber } from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api/types';

import { BalanceService } from '../../balance-service';
import { getERC20TransactionObject, getEVMTransactionObject } from '../../balance-service/transfer/smart-contract';
import { createSubstrateExtrinsic } from '../../balance-service/transfer/token';
import { ChainService } from '../../chain-service';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

interface ExchangeSimpleSwapResult {
  id: string;
  addressFrom: string;
  addressTo: string;
  amountFrom: string;
  amountTo: string;
}

interface ExchangeSimpleSwapData {
  result: ExchangeSimpleSwapResult;
  traceId: string;
}

interface SimpleSwapMetadata{
  fromChainSymbol: string;
  toChainSymbol: string
}

interface BuildSimpleSwapTxParams {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  fromAsset: _ChainAsset;
  receiver: string;
  sender: string;
  toAsset: _ChainAsset;
  metadata: SimpleSwapMetadata;
}

const externalServiceApi = `${SW_EXTERNAL_SERVICES_API}${ProxyServiceRoute.SIMPLESWAP}`;

const toBNString = (input: string | number | BigNumber, decimal: number): string => {
  const raw = new BigNumber(input);

  return raw.shiftedBy(decimal).integerValue(BigNumber.ROUND_CEIL).toFixed();
};

type BuildTxForSimpleSwapResult =
  | { data: { id: string; addressFrom: string; amountTo: string }; error?: undefined }
  | { data?: undefined; error: SwapError | TransactionError };

const buildTxForSimpleSwap = async (params: BuildSimpleSwapTxParams): Promise<BuildTxForSimpleSwapResult> => {
  try {
    const { fromAmount, fromAsset, fromSymbol,
      metadata, receiver, sender, toAsset, toSymbol } = params;

    const fromDecimals = _getAssetDecimals(fromAsset);
    const toDecimals = _getAssetDecimals(toAsset);
    const formattedAmount = formatNumber(fromAmount, fromDecimals, (s) => s);

    const requestBody = {
      fixed: false,
      tickerFrom: fromSymbol,
      tickerTo: toSymbol,
      amount: formattedAmount,
      networkFrom: metadata.fromChainSymbol,
      networkTo: metadata.toChainSymbol,
      addressTo: receiver,
      extraIdTo: '',
      userRefundAddress: sender,
      userRefundExtraId: ''
    };

    const response = await fetch(
      `${externalServiceApi}/exchanges`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          [HEADERS.PLATFORM]: TARGET_ENV
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR, `Unable to create simpleswap transaction: ${errorText}`) };
    }

    const depositAddressResponse = await response.json() as ExchangeSimpleSwapData;

    const result = depositAddressResponse.result;

    console.log('simpleswapID', result.id);

    if (!result?.id || !result.addressFrom || !result.amountTo) {
      return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR) };
    }

    return {
      data: {
        id: result.id,
        addressFrom: result.addressFrom,
        amountTo: toBNString(result.amountTo, toDecimals)
      }
    };
  } catch (err) {
    console.error('Error:', err);

    return { error: new TransactionError(BasicTxErrorType.INTERNAL_ERROR) };
  }
};

export class SimpleSwapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  providerSlug: SwapProviderId;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: 'SimpleSwap',
      providerSlug: SwapProviderId.SIMPLE_SWAP
    });
    this.providerSlug = SwapProviderId.SIMPLE_SWAP;
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

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcessV2(params, [
      this.getSubmitStep.bind(this)
    ]);
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2, stepIndex: number): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (!params.selectedQuote) {
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
        version: 2
      } as unknown as BaseSwapStepMetadata
    };

    return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
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

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { address, quote, recipient } = params;

    const pair = quote.pair;

    const fromAsset = this.chainService.getAssetBySlug(pair.from);
    const toAsset = this.chainService.getAssetBySlug(pair.to);
    const chainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const toChainInfo = this.chainService.getChainInfoByKey(toAsset.originChain);
    const chainType = _isChainSubstrateCompatible(chainInfo) ? ChainType.SUBSTRATE : ChainType.EVM;
    const sender = _reformatAddressWithChain(address, chainInfo);
    const receiver = _reformatAddressWithChain(recipient ?? sender, toChainInfo);

    const fromSymbol = _getAssetSymbol(fromAsset).toLowerCase();
    const toSymbol = _getAssetSymbol(toAsset).toLowerCase();
    const metadata = quote.metadata as SimpleSwapMetadata;

    const { fromAmount } = quote;
    const result = await buildTxForSimpleSwap({
      fromSymbol,
      toSymbol,
      fromAmount,
      fromAsset,
      receiver,
      sender,
      toAsset,
      metadata
    });

    if (result.error) {
      console.error('Simple swap error:', result.error);

      throw result.error;
    }

    const { addressFrom, amountTo, id } = result.data;

    if (!id || id.length === 0 || !addressFrom || addressFrom.length === 0) {
      throw new SwapError(SwapErrorType.UNKNOWN);
    }

    // Validate the amount to be swapped
    const rate = BigN(amountTo).div(BigN(quote.toAmount)).multipliedBy(100);

    if (rate.lt(95)) {
      throw new SwapError(SwapErrorType.NOT_MEET_MIN_EXPECTED);
    }

    // Can modify quote.toAmount to amountTo after confirm real amount received

    const txData: SimpleSwapTxData = {
      id: id,
      address,
      provider: this.providerInfo,
      quote: params.quote,
      slippage: params.slippage,
      recipient: receiver,
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
        to: addressFrom,
        tokenInfo: fromAsset,
        transferAll: false,
        value: quote.fromAmount
      });

      extrinsic = submittableExtrinsic as SubmittableExtrinsic<'promise'>;
    } else {
      const feeInfo = await this.swapBaseHandler.feeService.subscribeChainFee(getId(), chainInfo.slug, 'evm');

      if (_isNativeToken(fromAsset)) {
        const [transactionConfig] = await getEVMTransactionObject({
          evmApi: this.chainService.getEvmApi(chainInfo.slug),
          transferAll: false,
          value: quote.fromAmount,
          from: address,
          to: addressFrom,
          chain: chainInfo.slug,
          feeInfo
        });

        extrinsic = transactionConfig;
      } else {
        const [transactionConfig] = await getERC20TransactionObject({
          assetAddress: _getContractAddressOfToken(fromAsset),
          chain: chainInfo.slug,
          evmApi: this.chainService.getEvmApi(chainInfo.slug),
          feeInfo,
          from: address,
          to: addressFrom,
          value: quote.fromAmount,
          transferAll: false
        });

        extrinsic = transactionConfig;
      }
    }

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? quote.fromAmount : '0',
      extrinsicType: ExtrinsicType.SWAP,
      chainType
    } as SwapSubmitStepData;
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
