// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';

/** How many times `findMinLeg` re-prices its guess; on mainnet one is enough (10-16). */
const MIN_LEG_TRIES = 5;

export interface SwapStakeRow {
  hotkey: string;
  netuid: number;
  stake: string | number;
}

export interface SwapLeg {
  hotkey: string;
  amount: BigNumber;
}

export type SwapSourceError = 'swapUnavailable' | 'noStakeToSwap' | 'stakeBelowMinimum' | 'stakeOnHold' | 'stakeLocked';
export type SwapPlanError = SwapSourceError | 'amountBelowMinimum' | 'notEnoughStakeToSwap' | 'cannotSplitAmount';

/**
 * What a Bittensor swap from one netuid can spend. A swap spends stake on the origin netuid — root
 * stake for TAO, alpha stake for an alpha token — never transferable balance.
 */
export interface SwapSource {
  /** Hotkeys that can carry a leg, largest first. */
  eligible: SwapLeg[];
  /** All stake on the origin netuid. */
  total: BigNumber;
  /** What a swap can spend now: eligible stake, capped at the coldkey's unlocked stake. */
  usable: BigNumber;
  /** Left out: hotkeys holding less than one leg. */
  belowMinimum: BigNumber;
  /** Left out: root stake under the root hold (`RootStakeUnlockInterval`). */
  held: BigNumber;
  /** Left out: stake under a conviction lock, which a move off the subnet may not take. */
  locked: BigNumber;
  /** The smallest leg, in origin units. */
  minLeg: BigNumber;
  error?: SwapSourceError;
}

export interface SwapSourcePlan extends Omit<SwapSource, 'error'> {
  /** One `swapStakeLimit` per entry, in submit order; empty when the amount cannot be funded. */
  legs: SwapLeg[];
  error?: SwapPlanError;
}

export interface SwapSourceParams {
  /** The coldkey's stake rows, as `getStakeInfoForColdkey` returns them. */
  stakes: SwapStakeRow[];
  fromNetuid: number;
  /** The smallest leg the chain accepts, in origin units (`findMinLeg`); unknown when the subnet cannot price one. */
  minLeg?: BigNumber;
  /** Root hotkeys still under the root hold. */
  held?: Set<string>;
  /** The coldkey's unlocked stake on the origin netuid (`get_stake_availability_for_coldkeys`); no cap when unknown. */
  available?: BigNumber;
}

/**
 * Root hotkeys whose stake is still under the root hold: a move off root fails `RootStakeLocked`
 * until `interval` blocks have passed since the hotkey's last root change. None while `interval` is 0.
 */
export function getRootHeldHotkeys (interval: number, now: number, lastStakeBlocks: Record<string, number | null | undefined>): Set<string> {
  const held = new Set<string>();

  if (!interval) {
    return held;
  }

  Object.entries(lastStakeBlocks).forEach(([hotkey, last]) => {
    if (now - (last ?? 0) < interval) {
      held.add(hotkey);
    }
  });

  return held;
}

/**
 * The smallest leg the chain accepts off a subnet. A move off the subnet must sell for more than
 * `DefaultMinStake` — `validate_stake_transition` checks the `sim_swap` output, after the pool fee and
 * slippage — so the guess at spot is re-priced with the chain's own simulation until it clears.
 * `simulate` returns the TAO a sale of the given alpha pays out (`simSwapAlphaForTao`).
 */
export async function findMinLeg (minStake: BigNumber, taoPerUnit: BigNumber, simulate: (alpha: BigNumber) => Promise<BigNumber>): Promise<BigNumber | undefined> {
  if (taoPerUnit.lte(0)) {
    return undefined;
  }

  const target = minStake.plus(1);
  let leg = target.dividedBy(taoPerUnit).integerValue(BigNumber.ROUND_CEIL);

  for (let i = 0; i < MIN_LEG_TRIES; i++) {
    const out = await simulate(leg);

    if (out.gt(minStake)) {
      return leg;
    }

    if (out.lte(0)) {
      return undefined;
    }

    // This small, the payout is close to linear in the leg: scale the guess up to the target
    leg = BigNumber.maximum(leg.plus(1), leg.multipliedBy(target).dividedBy(out).integerValue(BigNumber.ROUND_CEIL));
  }

  return undefined;
}

/**
 * Which stake a swap from `fromNetuid` can spend. Each leg must be at least `minLeg`, so hotkeys below
 * one leg are left out, as are root hotkeys under the root hold; and a move off the subnet may not take
 * conviction-locked stake, so the total is capped at the coldkey's unlocked stake.
 */
export function getSwapSource ({ available, fromNetuid, held = new Set(), minLeg, stakes }: SwapSourceParams): SwapSource {
  const zero = new BigNumber(0);
  const source: SwapSource = { eligible: [], total: zero, usable: zero, belowMinimum: zero, held: zero, locked: zero, minLeg: zero };

  const hotkeys = stakes
    .filter((row) => row.netuid === fromNetuid && new BigNumber(row.stake).gt(0))
    .sort((a, b) => new BigNumber(b.stake).comparedTo(a.stake));

  source.total = hotkeys.reduce((sum, row) => sum.plus(row.stake), zero);

  // A subnet whose price reads 0, or whose pool pays nothing out, cannot price a leg
  if (!minLeg || minLeg.lte(0)) {
    return { ...source, error: 'swapUnavailable' };
  }

  source.minLeg = minLeg;

  let eligibleSum = zero;

  for (const row of hotkeys) {
    const stake = new BigNumber(row.stake);

    if (held.has(row.hotkey)) {
      source.held = source.held.plus(stake);
    } else if (stake.lt(source.minLeg)) {
      source.belowMinimum = source.belowMinimum.plus(stake);
    } else {
      source.eligible.push({ hotkey: row.hotkey, amount: stake });
      eligibleSum = eligibleSum.plus(stake);
    }
  }

  source.usable = available ? BigNumber.minimum(eligibleSum, available) : eligibleSum;
  source.locked = eligibleSum.minus(source.usable);

  if (source.usable.lte(0)) {
    return { ...source, usable: zero, error: getEmptySourceError(source, eligibleSum) };
  }

  return source;
}

/** Why nothing can be spent: locked beats on hold beats too small, so the message names what the user can act on. */
function getEmptySourceError (source: SwapSource, eligibleSum: BigNumber): SwapSourceError {
  if (eligibleSum.gt(0)) {
    return 'stakeLocked';
  }

  if (source.held.gt(0)) {
    return 'stakeOnHold';
  }

  if (source.belowMinimum.gt(0)) {
    return 'stakeBelowMinimum';
  }

  return 'noStakeToSwap';
}

/**
 * Splits `amount` into `swapStakeLimit` legs over the coldkey's stake on `fromNetuid`, largest hotkey
 * first, so that no leg — the last one included — is smaller than one leg's worth.
 */
export function planSwapLegs (params: SwapSourceParams & { amount: BigNumber }): SwapSourcePlan {
  const { amount } = params;
  const { eligible, error: sourceError, ...source } = getSwapSource(params);
  const empty: SwapSourcePlan = { ...source, eligible, legs: [] };

  if (sourceError) {
    return { ...empty, error: sourceError };
  }

  if (amount.lt(source.minLeg)) {
    return { ...empty, error: 'amountBelowMinimum' };
  }

  if (amount.gt(source.usable)) {
    return { ...empty, error: 'notEnoughStakeToSwap' };
  }

  const legs: SwapLeg[] = [];
  let remaining = amount;

  for (const item of eligible) {
    if (remaining.lte(0)) {
      break;
    }

    let leg = BigNumber.minimum(item.amount, remaining);
    const rest = remaining.minus(leg);

    // Leave at least one leg's worth for the next hotkey instead of a remainder the chain would refuse
    if (rest.gt(0) && rest.lt(source.minLeg)) {
      leg = leg.minus(source.minLeg.minus(rest));

      if (leg.lt(source.minLeg)) {
        continue;
      }
    }

    legs.push({ hotkey: item.hotkey, amount: leg });
    remaining = remaining.minus(leg);
  }

  if (remaining.gt(0)) {
    return { ...empty, error: 'cannotSplitAmount' };
  }

  // Smallest first: each leg is checked after the earlier ones have moved the origin price, so the leg
  // nearest the minimum goes while the price is still the one `minLeg` was found at
  return { ...empty, legs: legs.sort((a, b) => a.amount.comparedTo(b.amount)) };
}
