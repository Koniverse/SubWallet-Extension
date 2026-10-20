// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import type { SubnetAprResult } from '@subwallet/extension-base/types';

import BigN from 'bignumber.js';

/** Blocks in a year at 12 s: 365.25 × 7,200 */
export const BITTENSOR_BLOCKS_PER_YEAR = 2629800;
/** A validator sets a subnet's "Up to" only with at least this share of the stake paid in the last epoch */
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
