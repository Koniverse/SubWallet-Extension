// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import BigN from 'bignumber.js';

import { SharedRead } from './shared-read';

/**
 * Each account's alpha by netuid, counting only the stake Earning shows: a hotkey whose stake is worth
 * at least 1 rao of TAO (`parseNominatorMetadataBase`). Unstaking leaves 1 rao behind on a subnet;
 * counted, it shows as a "0" balance that "Show zero balance" cannot hide (EXT-39). Without
 * `taoPerAlpha`, when the runtime gives no prices, every stake counts, as before.
 */
export const getShownAlphaStakes = (rows: Array<[string, Array<{ netuid: number, stake: string | number }>]>, taoPerAlpha?: Record<number, BigN>): Array<Record<number, BigN>> => {
  return rows.map(([, stakes]) => {
    const byNetuid: Record<number, BigN> = {};

    stakes.forEach(({ netuid, stake }) => {
      const value = new BigN(stake);
      const shown = taoPerAlpha ? new BigN(value.multipliedBy(taoPerAlpha[netuid] || 0).toFixed(0)).gt(0) : value.gt(0);

      if (shown) {
        byNetuid[netuid] = (byNetuid[netuid] || new BigN(0)).plus(value);
      }
    });

    return byNetuid;
  });
};

/** Every subnet's price as `current_alpha_price_all` returns it: rao of TAO per alpha */
export type AlphaPriceList = Array<{ netuid: number, price: string | number }>;

// `CRON_REFRESH_PRICE_INTERVAL`: the price list refreshes this often anyway
const alphaPriceReads = new SharedRead<AlphaPriceList>(30000);

/**
 * `current_alpha_price_all`, read once for every reader within 30 s: the price list, alpha balances
 * (Substrate and Subtensor-EVM, one per token), Earning positions and token auto-enable all want it on
 * their own timers. None needs it fresher: it prices display and the 1-rao dust rule, never a limit.
 */
export const readAlphaPrices = (api: ApiPromise): Promise<AlphaPriceList> => {
  return alphaPriceReads.get(api.genesisHash.toHex(), async () => (await api.call.swapRuntimeApi.currentAlphaPriceAll()).toPrimitive() as AlphaPriceList);
};

/** TAO per alpha by netuid from `current_alpha_price_all`, whose prices are rao per alpha. */
export const getTaoPerAlphaMap = (prices: AlphaPriceList): Record<number, BigN> => {
  const result: Record<number, BigN> = {};

  prices.forEach(({ netuid, price }) => {
    result[netuid] = netuid === 0 ? new BigN(1) : new BigN(price).dividedBy(1e9);
  });

  return result;
};

/** A subnet pool's reserves, in rao: `SubnetTAO` and `SubnetAlphaIn` */
export interface AlphaPoolReserves {
  taoIn: BigN;
  alphaIn: BigN;
}

/**
 * The pool price after a trade fills in full, in TAO per alpha: what the chain checks a limit price
 * against (`price_target`, v478 `swap_step.rs`). spot × (T′/T) × (A/A′) holds whatever the pool's
 * weights; `taoDelta` and `alphaDelta` are what the reserves gain, negative where the pool pays out.
 */
export const getPriceAfterTrade = (spot: BigN, { alphaIn, taoIn }: AlphaPoolReserves, taoDelta: BigN, alphaDelta: BigN): BigN => {
  return spot.multipliedBy(taoIn.plus(taoDelta)).dividedBy(taoIn).multipliedBy(alphaIn).dividedBy(alphaIn.plus(alphaDelta));
};

/** The price after staking `tao`: the fee comes off the input before it reaches the pool. */
export const getPriceAfterStake = (spot: BigN, pool: AlphaPoolReserves, tao: BigN, taoFee: BigN, alphaOut: BigN): BigN => {
  return getPriceAfterTrade(spot, pool, tao.minus(taoFee), alphaOut.negated());
};

/** The price after unstaking `alpha`: the fee comes off the input before it reaches the pool. */
export const getPriceAfterUnstake = (spot: BigN, pool: AlphaPoolReserves, alpha: BigN, alphaFee: BigN, taoOut: BigN): BigN => {
  return getPriceAfterTrade(spot, pool, taoOut.negated(), alpha.minus(alphaFee));
};

/**
 * A stake or unstake limit price, in rao per alpha (EXT-6): the price after the trade, with `slippage`
 * left for other trades — up for a stake, down for an unstake. Taking spot instead leaves the trade's
 * own impact against the setting, and the chain refuses one of about 0.25 – 0.49% of the pool that the
 * screen let through.
 */
export const getStakeLimitPrice = (priceAfter: BigN, slippage: number, isStake: boolean): BigN => {
  return priceAfter.multipliedBy(isStake ? 1 + slippage : 1 - slippage).multipliedBy(1e9).integerValue(BigN.ROUND_CEIL);
};

/**
 * A `swap_stake_limit` limit, in rao (EXT-29): the origin-to-destination price ratio after the whole
 * swap, less `slippage`. Root counts as 1 on either side.
 */
export const getSwapLimitPrice = (originPriceAfter: BigN, destinationPriceAfter: BigN, slippage: number): BigN => {
  return originPriceAfter.dividedBy(destinationPriceAfter).multipliedBy(1 - slippage).multipliedBy(1e9).integerValue(BigN.ROUND_DOWN);
};

/**
 * Price impact of a trade, excluding the pool fee: how far the fill falls short of spot. `ideal` is the
 * output at spot for the input less its fee; `out` what the chain's simulation pays.
 */
export const getPriceImpact = (ideal: BigN, out: BigN): number => {
  return ideal.lte(0) ? 0 : BigN.maximum(ideal.minus(out).dividedBy(ideal), 0).toNumber();
};

/** `InitialMinStake` (= `DefaultMinStake`) on v478, in rao, for a runtime that no longer exposes the constant */
export const DEFAULT_MIN_STAKE = '2000000';

/**
 * A chain read that only refines a check: `undefined` when the runtime no longer has the storage or
 * runtime API, or the call fails, so the check is skipped and the action goes on as before it existed.
 */
export const readOptional = async <T>(read: () => Promise<T> | undefined): Promise<T | undefined> => {
  try {
    return await read();
  } catch (e) {
    return undefined;
  }
};
