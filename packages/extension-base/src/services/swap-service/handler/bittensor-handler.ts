// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, OptimalSwapPathParamsV2, SwapBaseTxData, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, toBNString } from '@subwallet/extension-base/utils';
import { ApiPromise } from 'avail-js-sdk';
import BigNumber from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getAssetDecimals, _isNativeToken, _isNativeTokenBySlug } from '../../chain-service/utils';
import { TaoStakeInfo } from '../../earning-service/handlers/native-staking/tao';
import FeeService from '../../fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

export class BittensorSwapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  providerSlug: SwapProviderId;
  isReady = false;

  constructor (chainService: ChainService, balanceService: BalanceService, feeService: FeeService, isTestnet: boolean) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: isTestnet ? 'Bittensor Testnet' : 'Bittensor',
      providerSlug: isTestnet ? SwapProviderId.BITTENSOR_TESTNET : SwapProviderId.BITTENSOR
    });
    this.providerSlug = isTestnet ? SwapProviderId.BITTENSOR_TESTNET : SwapProviderId.BITTENSOR;
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get providerInfo () {
    return this.swapBaseHandler.providerInfo;
  }

  generateOptimalProcessV2 (params: OptimalSwapPathParamsV2): Promise<CommonOptimalSwapPath> {
    return this.swapBaseHandler.generateOptimalProcessV2(params, [
      this.getSubmitStep.bind(this)
    ]);
  }

  async getSubmitStep (params: OptimalSwapPathParamsV2): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
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
    const { address, mevShieldMode, quote } = params;

    const pair = quote.pair;

    const fromAsset = this.chainService.getAssetBySlug(pair.from);
    const toAsset = this.chainService.getAssetBySlug(pair.to);
    const chainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const fromNetuid = _isNativeTokenBySlug(fromAsset.slug) ? 0 : fromAsset.metadata?.netuid;
    const toNetuid = _isNativeTokenBySlug(toAsset.slug) ? 0 : toAsset.metadata?.netuid;

    if (fromNetuid == null || toNetuid == null || fromNetuid === toNetuid) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    const txData: SwapBaseTxData = {
      address,
      provider: this.providerInfo,
      quote: params.quote,
      slippage: params.slippage,
      process: params.process
    };

    const chainApi = this.chainService.getSubstrateApi(chainInfo.slug);
    const substrateApi = await chainApi.isReady;
    const _stakeInfo = await substrateApi.api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
    const stakeInfo = _stakeInfo.toPrimitive() as unknown as TaoStakeInfo[];

    // TAO/ALPHA ratio
    const priceRatio = new BigNumber(toBNString(quote.rate, _getAssetDecimals(fromAsset)));

    const limitPrice = priceRatio
      .multipliedBy(new BigNumber(1).minus(params.slippage))
      .integerValue(BigNumber.ROUND_DOWN)
      .toFixed();

    const calls = this.buildSwapCalls({
      stakeInfo,
      fromNetuid,
      toNetuid,
      amount: new BigNumber(quote.fromAmount),
      limitPrice,
      mevShieldMode
    }, substrateApi.api);

    let extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>;

    if (calls.length === 1) {
      extrinsic = calls[0];
    } else {
      extrinsic = substrateApi.api.tx.utility.batchAll(calls);
    }

    return {
      txChain: fromAsset.originChain,
      extrinsic,
      txData,
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.SUBSTRATE
      // using staked balance so we do not need transferNativeAmount
    } as SwapSubmitStepData;
  }

  // Sort hotkeys by stake descending
  private getHotkeysByNetuidDesc (stakeInfo: TaoStakeInfo[], fromNetuid: number): TaoStakeInfo[] {
    return stakeInfo.filter((i) => i.netuid === fromNetuid && new BigNumber(i.stake).gt(0))
      .sort((a, b) => new BigNumber(b.stake).minus(a.stake).toNumber());
  }

  private buildSwapCalls (params: { stakeInfo: TaoStakeInfo[]; fromNetuid: number; toNetuid: number; amount: BigNumber; limitPrice: string; mevShieldMode?: boolean }, api: ApiPromise) {
    const { amount, fromNetuid, limitPrice, stakeInfo, toNetuid } = params;

    const hotkeys = this.getHotkeysByNetuidDesc(stakeInfo, fromNetuid);

    let remaining = amount;
    const calls = [];

    for (const item of hotkeys) {
      if (remaining.lte(0)) {
        break;
      }

      const stake = new BigNumber(item.stake);

      if (stake.lte(0)) {
        continue;
      }

      const swapAmount = BigNumber.minimum(stake, remaining);

      calls.push(
        api.tx.subtensorModule.swapStakeLimit(
          item.hotkey,
          fromNetuid,
          toNetuid,
          swapAmount.toFixed(),
          limitPrice,
          false
        )
      );

      remaining = remaining.minus(swapAmount);
    }

    return calls;
  }
}
