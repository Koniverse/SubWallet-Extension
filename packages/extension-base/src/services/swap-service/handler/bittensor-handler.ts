// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BaseStepDetail, BaseSwapStepMetadata, BasicTxErrorType, BittensorSwapMax, CommonOptimalSwapPath, CommonStepFeeInfo, CommonStepType, DynamicSwapType, OptimalSwapPathParamsV2, SwapBaseTxData, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { _reformatAddressWithChain, balanceFormatter, formatNumber, toBNString } from '@subwallet/extension-base/utils';
import { ApiPromise } from 'avail-js-sdk';
import BigNumber from 'bignumber.js';
import { t } from 'i18next';

import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _getAssetDecimals, _getAssetSymbol, _isNativeTokenBySlug } from '../../chain-service/utils';
import { TaoStakeInfo } from '../../earning-service/handlers/native-staking/tao';
import FeeService from '../../fee-service/service';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';
import { findMinLeg, getRootHeldHotkeys, getSwapSource, planSwapLegs, SwapSourceParams, SwapSourcePlan } from './bittensor-swap-plan';

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
      const fromAsset = this.chainService.getAssetBySlug(selectedQuote.pair.from);
      const toAsset = this.chainService.getAssetBySlug(selectedQuote.pair.to);
      const fromNetuid = this.getNetuid(fromAsset);
      const toNetuid = this.getNetuid(toAsset);

      if (fromNetuid == null || toNetuid == null || fromNetuid === toNetuid) {
        return [new TransactionError(BasicTxErrorType.UNSUPPORTED)];
      }

      const substrateApi = await this.chainService.getSubstrateApi(fromAsset.originChain).isReady;
      const plan = await this.getSwapSourcePlan(substrateApi.api, params.address, fromNetuid, new BigNumber(selectedQuote.fromAmount), fromAsset);

      if (plan.txError) {
        return [plan.txError];
      }

      // The amount is checked against the stake the legs spend; the fee is checked against transferable balance on its own
      return this.swapBaseHandler.validateSwapOnlyProcess(params, swapIndex, plan.usable);
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
    const { address, quote } = params;

    const pair = quote.pair;

    const fromAsset = this.chainService.getAssetBySlug(pair.from);
    const toAsset = this.chainService.getAssetBySlug(pair.to);
    const chainInfo = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const fromNetuid = this.getNetuid(fromAsset);
    const toNetuid = this.getNetuid(toAsset);

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

    // Same plan as validation, so the check, the quote and the submit spend the same stake
    const plan = await this.getSwapSourcePlan(substrateApi.api, address, fromNetuid, new BigNumber(quote.fromAmount), fromAsset);

    if (plan.txError) {
      return Promise.reject(plan.txError);
    }

    // TAO/ALPHA ratio
    const priceRatio = new BigNumber(toBNString(quote.rate, _getAssetDecimals(fromAsset)));

    const limitPrice = priceRatio
      .multipliedBy(new BigNumber(1).minus(params.slippage))
      .integerValue(BigNumber.ROUND_DOWN)
      .toFixed();

    const calls = plan.legs.map((leg) => substrateApi.api.tx.subtensorModule.swapStakeLimit(
      leg.hotkey,
      fromNetuid,
      toNetuid,
      leg.amount.toFixed(),
      limitPrice,
      false
    ));

    if (!calls.length) {
      // Never send an empty batch: the chain accepts it and nothing is swapped
      return Promise.reject(new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE));
    }

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

  /** Root hotkeys still under the root hold; none while `RootStakeUnlockInterval` is 0. */
  private async readRootHeldHotkeys (api: ApiPromise, coldkey: string, hotkeys: string[]): Promise<Set<string>> {
    const intervalCodec = await api.query.subtensorModule.rootStakeUnlockInterval?.();
    const interval = Number(intervalCodec?.toPrimitive() ?? 0);

    if (!interval || !hotkeys.length || !api.query.subtensorModule.lastColdkeyHotkeyStakeBlock) {
      return new Set();
    }

    const [header, lastBlocks] = await Promise.all([
      api.rpc.chain.getHeader(),
      api.query.subtensorModule.lastColdkeyHotkeyStakeBlock.multi(hotkeys.map((hotkey) => [coldkey, hotkey]))
    ]);
    const lastStakeBlocks: Record<string, number | null> = {};

    hotkeys.forEach((hotkey, index) => {
      const last = lastBlocks[index].toPrimitive();

      lastStakeBlocks[hotkey] = last == null ? null : Number(last);
    });

    return getRootHeldHotkeys(interval, header.number.toNumber(), lastStakeBlocks);
  }

  /** Reads what `getSwapSource` / `planSwapLegs` need for a swap from `fromNetuid`. */
  private async readSwapSourceParams (api: ApiPromise, address: string, fromNetuid: number): Promise<SwapSourceParams> {
    const [_stakeInfo, priceCodec, availabilityCodec] = await Promise.all([
      api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address),
      fromNetuid === 0 ? Promise.resolve(undefined) : api.call.swapRuntimeApi.currentAlphaPrice(fromNetuid),
      // Older runtimes have no availability API: no lock cap then
      api.call.stakeInfoRuntimeApi.getStakeAvailabilityForColdkeys?.([address], [fromNetuid]).catch(() => undefined)
    ]);

    const stakes = _stakeInfo.toPrimitive() as unknown as TaoStakeInfo[];
    // DefaultMinStake = InitialMinStake (v478 `lib.rs`)
    const minStake = new BigNumber(api.consts.subtensorModule.initialMinStake.toString());
    const rootHotkeys = fromNetuid === 0 ? stakes.filter((row) => row.netuid === 0 && new BigNumber(row.stake).gt(0)).map((row) => row.hotkey) : [];
    const held = fromNetuid === 0 ? await this.readRootHeldHotkeys(api, address, rootHotkeys) : new Set<string>();
    // A leg must sell for more than the minimum: root sells 1:1 with no fee, a subnet through its pool
    const minLeg = fromNetuid === 0
      ? minStake.plus(1)
      : await findMinLeg(minStake, new BigNumber(priceCodec?.toString() || '0').dividedBy(1e9), (alpha) => this.simulateAlphaSale(api, fromNetuid, alpha));

    // { coldkey: { netuid: { total, locked, available } } } for the one coldkey asked
    const availability = Object.values((availabilityCodec?.toPrimitive() ?? {}) as Record<string, Record<string, { available: number | string }>>)[0]?.[fromNetuid];
    const available = availability ? new BigNumber(availability.available) : undefined;

    return { stakes, fromNetuid, minLeg, held, available };
  }

  /** The TAO a sale of `alpha` on `netuid` pays out now, as the chain checks a leg against the minimum. */
  private async simulateAlphaSale (api: ApiPromise, netuid: number, alpha: BigNumber): Promise<BigNumber> {
    const result = (await api.call.swapRuntimeApi.simSwapAlphaForTao(netuid, alpha.toFixed(0))).toPrimitive() as { taoAmount?: number | string };

    return new BigNumber(result.taoAmount ?? 0);
  }

  private getNetuid (asset: _ChainAsset): number | undefined {
    return _isNativeTokenBySlug(asset.slug) ? 0 : asset.metadata?.netuid;
  }

  /**
   * Splits `amount` into legs over the stake a swap can spend (`planSwapLegs`). Validation and submit
   * both call this, so the check and the submit spend the same stake.
   */
  private async getSwapSourcePlan (api: ApiPromise, address: string, fromNetuid: number, amount: BigNumber, fromAsset: _ChainAsset): Promise<SwapSourcePlan & { txError?: TransactionError }> {
    const plan = planSwapLegs({ ...(await this.readSwapSourceParams(api, address, fromNetuid)), amount });

    if (!plan.error) {
      return plan;
    }

    const decimals = _getAssetDecimals(fromAsset);
    const symbol = _getAssetSymbol(fromAsset);
    const format = (value: BigNumber) => formatNumber(value.toFixed(), decimals, balanceFormatter, { maxNumberFormat: decimals || 6 });
    const number = ['amountBelowMinimum', 'stakeBelowMinimum'].includes(plan.error) ? plan.minLeg : plan.usable;
    const message = t(`bg.SWAP.services.service.swap.bittensorHandler.${plan.error}`, { replace: { symbol, number: format(number) } });
    const errorType = plan.error === 'swapUnavailable'
      ? BasicTxErrorType.UNSUPPORTED
      : ['amountBelowMinimum', 'cannotSplitAmount'].includes(plan.error) ? BasicTxErrorType.INVALID_PARAMS : BasicTxErrorType.NOT_ENOUGH_BALANCE;

    return { ...plan, txError: new TransactionError(errorType, message) };
  }

  /** What a swap from `fromAsset` can spend now — what the Swap screen's Max fills in. */
  public async getSwapMax (address: string, fromAsset: _ChainAsset): Promise<BittensorSwapMax> {
    const fromNetuid = this.getNetuid(fromAsset);

    if (fromNetuid == null) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    const substrateApi = await this.chainService.getSubstrateApi(fromAsset.originChain).isReady;
    const source = getSwapSource(await this.readSwapSourceParams(substrateApi.api, address, fromNetuid));

    return { usable: source.usable.toFixed(0) };
  }
}
