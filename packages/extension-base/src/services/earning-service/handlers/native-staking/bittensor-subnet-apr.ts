// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import type { SubnetAprResult } from '@subwallet/extension-base/types';

import BigN from 'bignumber.js';

/** Blocks in a year at 12 s: 365.25 × 7,200 */
export const BITTENSOR_BLOCKS_PER_YEAR = 2629800;
/** A validator sets a pool's "Up to" only with at least this share of the stake: on a subnet the stake paid in its last epoch, on root the root stake listed */
export const UP_TO_MIN_STAKE_SHARE = 0.01;

/** One hotkey paid in a subnet's last epoch, read at one block */
export interface SubnetDividendRow {
  hotkey: string;
  /** `AlphaDividendsPerSubnet(netuid, hotkey)`: the nominators' alpha for the last epoch, every take already out */
  dividend: BigN;
  /** `TotalHotkeyAlpha(hotkey, netuid)`: the alpha staked on the hotkey now, the dividend included */
  totalAlpha: BigN;
}

/** BE-2's figure for one subnet: returns in alpha, as a fraction a year (0.34 = 34% APR) */
export type SubnetApr = SubnetAprResult;

/**
 * A validator's nominator APR, in alpha (BE-2): its return over the last epoch, r = D / (A − D) — A read
 * after the epoch already holds D — times the epochs in a year. Undefined when A − D ≤ 0.
 */
export function getValidatorApr (dividend: BigN, totalAlpha: BigN, tempo: number): number | undefined {
  const before = totalAlpha.minus(dividend);

  if (!tempo || before.lte(0)) {
    return undefined;
  }

  return dividend.dividedBy(before).multipliedBy(BITTENSOR_BLOCKS_PER_YEAR).dividedBy(tempo).toNumber();
}

/** A subnet's APR from the hotkeys paid in its last epoch. Undefined without a tempo: the chain never runs its epoch. */
export function getSubnetApr (rows: SubnetDividendRow[], tempo: number): SubnetApr | undefined {
  if (!tempo) {
    return undefined;
  }

  const byHotkey: Record<string, number> = {};
  let earningStake = new BigN(0);

  rows.forEach(({ dividend, hotkey, totalAlpha }) => {
    const apr = getValidatorApr(dividend, totalAlpha, tempo);

    if (apr !== undefined) {
      byHotkey[hotkey] = apr;
      earningStake = earningStake.plus(totalAlpha);
    }
  });

  // A tiny hotkey with an outsized ratio must not set the headline
  const minStake = earningStake.multipliedBy(UP_TO_MIN_STAKE_SHARE);
  const upTo = rows.reduce((best, { hotkey, totalAlpha }) => {
    const apr = byHotkey[hotkey];

    return apr !== undefined && totalAlpha.gte(minStake) ? Math.max(best, apr) : best;
  }, 0);

  return { byHotkey, upTo };
}

/** A row of the chain's whole `AlphaDividendsPerSubnet` map, with the hotkey's stake on that subnet */
export interface NetuidDividendRow extends SubnetDividendRow {
  netuid: number;
}

/**
 * Every subnet's APR from one read of the whole dividend map: for each subnet with a tempo, what `getSubnetApr` gives
 * it, from the rows paid there. No figure for a subnet in `notRun`, one that has not run an epoch since it registered.
 */
export function getSubnetAprs (rows: NetuidDividendRow[], tempos: Record<number, number>, notRun: Set<number>): Record<number, SubnetApr | undefined> {
  const byNetuid: Record<number, SubnetDividendRow[]> = {};
  const result: Record<number, SubnetApr | undefined> = {};

  rows.forEach(({ netuid, ...row }) => {
    if (!byNetuid[netuid]) {
      byNetuid[netuid] = [];
    }

    byNetuid[netuid].push(row);
  });

  Object.entries(tempos).forEach(([key, tempo]) => {
    const netuid = Number(key);

    if (netuid !== 0) {
      result[netuid] = notRun.has(netuid) ? undefined : getSubnetApr(byNetuid[netuid] || [], tempo);
    }
  });

  return result;
}

/** One root validator's 30-day APR from the proxy (Taostats), with its root stake */
export interface RootAprRow {
  hotkey: string;
  /** Root stake, in rao: within 0.05% of the chain's `TotalHotkeyAlpha(hotkey, 0)` on 10-23 */
  stake: BigN;
  /**
   * `thirty_day_apy`, a fraction a year. A simple return in TAO, not a compounded one: on 10-23 it was 0.92 – 1.01 of
   * the chain's own 30-day `BasketTwr` return, median 0.96, over the 18 validators holding ≥ 1% of root (BE-12)
   */
  apr: number;
}

/**
 * Root's APR from the proxy's 30-day figures (BE-11 dropped, 10-22). "Up to" is the best validator holding at least 1% of
 * the root stake listed — the subnets' rule, so a small validator with an outsized figure does not set it (BE-3): 5.85%
 * on 10-23, where the highest figure overall was 9.89%. Undefined when the proxy lists none.
 */
export function getRootApr (rows: RootAprRow[]): SubnetApr | undefined {
  if (!rows.length) {
    return undefined;
  }

  const total = rows.reduce((sum, { stake }) => sum.plus(stake), new BigN(0));
  const minStake = total.multipliedBy(UP_TO_MIN_STAKE_SHARE);
  const byHotkey: Record<string, number> = {};

  rows.forEach(({ apr, hotkey }) => {
    byHotkey[hotkey] = apr;
  });

  const upTo = rows.reduce((best, { apr, stake }) => (stake.gte(minStake) ? Math.max(best, apr) : best), 0);

  return { byHotkey, upTo };
}

/**
 * A position's APR: its hotkeys' APRs weighted by the stake on each — a hotkey not paid in the last
 * epoch counts as 0, the truth for that stake. Undefined without stake.
 */
export function getPositionApr (stakes: Array<{ hotkey: string, stake: BigN }>, apr: SubnetApr): number | undefined {
  const total = stakes.reduce((sum, { stake }) => sum.plus(stake), new BigN(0));

  if (total.lte(0)) {
    return undefined;
  }

  return stakes.reduce((sum, { hotkey, stake }) => sum.plus(stake.multipliedBy(apr.byHotkey[hotkey] ?? 0)), new BigN(0)).dividedBy(total).toNumber();
}
