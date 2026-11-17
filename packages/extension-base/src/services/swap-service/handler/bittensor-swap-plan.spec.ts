// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';

import { findMinLeg, getRootHeldHotkeys, getSwapSource, planSwapLegs, SwapSourcePlan, SwapStakeRow } from './bittensor-swap-plan';

// DefaultMinStake = InitialMinStake on mainnet: 0.002 TAO
const MIN_STAKE = new BigNumber(2000000);
const TAO = 1e9;
// Root sells 1:1 with no fee, and a leg must sell for more than the minimum
const ROOT_MIN_LEG = MIN_STAKE.plus(1);

function plan (stakes: SwapStakeRow[], fromNetuid: number, amount: number, minLeg = ROOT_MIN_LEG, held?: Set<string>, available?: number): SwapSourcePlan {
  return planSwapLegs({ stakes, fromNetuid, amount: new BigNumber(amount), minLeg, held, available: available === undefined ? undefined : new BigNumber(available) });
}

const legs = (result: SwapSourcePlan) => result.legs.map((leg) => [leg.hotkey, leg.amount.toFixed()]);
const total = (result: SwapSourcePlan) => result.legs.reduce((sum, leg) => sum.plus(leg.amount), new BigNumber(0)).toFixed();

describe('Bittensor swap: legs over stake', () => {
  it('refuses a TAO swap when the coldkey has no root stake, instead of building an empty batch (EXT-28)', () => {
    const result = plan([{ hotkey: 'A', netuid: 1, stake: 5 * TAO }], 0, TAO);

    expect(result.legs).toEqual([]);
    expect(result.error).toBe('noStakeToSwap');
  });

  it('funds the swap from root stake, largest hotkey first', () => {
    const result = plan([{ hotkey: 'small', netuid: 0, stake: 0.5 * TAO }, { hotkey: 'big', netuid: 0, stake: TAO }], 0, 0.8 * TAO);

    expect(result.error).toBeUndefined();
    expect(legs(result)).toEqual([['big', String(0.8 * TAO)]]);
  });

  it('never leaves a leg below the chain minimum — the 1.0 + 0.5 TAO swap that reverted on testnet (EXT-36)', () => {
    // Before: legs of 1.0 and 0.0005 TAO; the second failed AmountTooLow and reverted the whole batch
    const result = plan([{ hotkey: 'big', netuid: 0, stake: TAO }, { hotkey: 'small', netuid: 0, stake: 0.5 * TAO }], 0, 1.0005 * TAO);

    expect(result.error).toBeUndefined();
    // Submitted smallest first, so the leg at the minimum goes before the other moves the price
    expect(legs(result)).toEqual([['small', '2000001'], ['big', '998499999']]);
    expect(result.legs.every((leg) => leg.amount.gt(MIN_STAKE))).toBe(true);
    expect(total(result)).toBe(String(1.0005 * TAO));
  });

  it('skips hotkeys holding less than one leg and caps the amount at the usable stake', () => {
    const result = plan([{ hotkey: 'big', netuid: 0, stake: TAO }, { hotkey: 'dust', netuid: 0, stake: 1000000 }], 0, 1.0005 * TAO);

    expect(result.legs).toEqual([]);
    expect(result.usable.toFixed()).toBe(String(TAO));
    expect(result.error).toBe('notEnoughStakeToSwap');
  });

  it('refuses an amount the chain would not take: it must sell for more than the minimum, not just reach it', () => {
    const stakes = [{ hotkey: 'big', netuid: 0, stake: TAO }];

    expect(plan(stakes, 0, 1000000).error).toBe('amountBelowMinimum');
    expect(plan(stakes, 0, MIN_STAKE.toNumber()).error).toBe('amountBelowMinimum');
    expect(legs(plan(stakes, 0, MIN_STAKE.toNumber() + 1))).toEqual([['big', '2000001']]);
  });

  it('spreads over every hotkey when one is not enough', () => {
    const result = plan([{ hotkey: 'a', netuid: 0, stake: 0.4 * TAO }, { hotkey: 'b', netuid: 0, stake: 0.3 * TAO }, { hotkey: 'c', netuid: 0, stake: 0.3 * TAO }], 0, TAO);

    expect(result.error).toBeUndefined();
    expect(legs(result)).toEqual([['b', String(0.3 * TAO)], ['c', String(0.3 * TAO)], ['a', String(0.4 * TAO)]]);
  });

  it('refuses an amount no split can fund without a leg under the minimum', () => {
    // Each hotkey alone is short of 0.004 TAO, and two legs over the minimum add up to more
    const result = plan([{ hotkey: 'a', netuid: 0, stake: 2500000 }, { hotkey: 'b', netuid: 0, stake: 2500000 }], 0, 4000000);

    expect(result.legs).toEqual([]);
    expect(result.error).toBe('cannotSplitAmount');
  });

  it('measures a subnet leg in alpha, against the subnet\'s own minimum', () => {
    const result = plan([{ hotkey: 'A', netuid: 1, stake: TAO }, { hotkey: 'B', netuid: 1, stake: 4000000 }, { hotkey: 'R', netuid: 0, stake: TAO }], 1, 0.5 * TAO, new BigNumber(4002004));

    expect(result.minLeg.toFixed()).toBe('4002004');
    expect(result.usable.toFixed()).toBe(String(TAO)); // B is below one leg; root stake is not alpha
    expect(legs(result)).toEqual([['A', String(0.5 * TAO)]]);
  });

  it('reports a subnet that cannot price a leg as unavailable (EXT-27)', () => {
    const result = planSwapLegs({ stakes: [{ hotkey: 'A', netuid: 1, stake: TAO }], fromNetuid: 1, amount: new BigNumber(0.5 * TAO), minLeg: undefined });

    expect(result.legs).toEqual([]);
    expect(result.error).toBe('swapUnavailable');
  });

  it('says the stake is too small, not missing, when every hotkey holds less than one leg', () => {
    const result = plan([{ hotkey: 'a', netuid: 0, stake: 1500000 }, { hotkey: 'b', netuid: 0, stake: 1500000 }], 0, 2500000);

    expect(result.legs).toEqual([]);
    expect(result.belowMinimum.toFixed()).toBe('3000000');
    expect(result.error).toBe('stakeBelowMinimum');
  });

  it('leaves out root stake still under the root hold', () => {
    const result = plan([{ hotkey: 'recent', netuid: 0, stake: 2 * TAO }, { hotkey: 'old', netuid: 0, stake: TAO }], 0, 0.5 * TAO, ROOT_MIN_LEG, new Set(['recent']));

    expect(result.held.toFixed()).toBe(String(2 * TAO));
    expect(result.usable.toFixed()).toBe(String(TAO));
    expect(legs(result)).toEqual([['old', String(0.5 * TAO)]]);
  });

  it('says the stake is on hold when every root hotkey is', () => {
    const result = plan([{ hotkey: 'recent', netuid: 0, stake: TAO }, { hotkey: 'dust', netuid: 0, stake: 1000000 }], 0, 0.5 * TAO, ROOT_MIN_LEG, new Set(['recent']));

    expect(result.legs).toEqual([]);
    expect(result.error).toBe('stakeOnHold');
  });
});

describe('Bittensor swap: the smallest leg', () => {
  // A pool at 0.5 TAO per alpha that keeps a 0.05% fee, as SN64/16/94/51 did on 10-16
  const pool = (alpha: BigNumber) => Promise.resolve(alpha.multipliedBy(0.5).multipliedBy(1 - 0.0005).integerValue(BigNumber.ROUND_FLOOR));

  it('re-prices the spot guess with the chain\'s simulation until the leg sells for more than the minimum', async () => {
    const minLeg = await findMinLeg(MIN_STAKE, new BigNumber(0.5), pool);
    // The smallest alpha that sells for more than 2,000,000: ceil(2,000,001 / 0.49975)
    const smallest = new BigNumber(4002004);

    expect(minLeg).toBeDefined();
    expect((await pool(minLeg as BigNumber)).gt(MIN_STAKE)).toBe(true);
    expect((minLeg as BigNumber).minus(smallest).toNumber()).toBeGreaterThanOrEqual(0);
    expect((minLeg as BigNumber).minus(smallest).toNumber()).toBeLessThanOrEqual(2);
  });

  it('takes the guess as it is when it already clears', async () => {
    const minLeg = await findMinLeg(MIN_STAKE, new BigNumber(1), (amount) => Promise.resolve(amount));

    expect(minLeg?.toFixed()).toBe('2000001');
  });

  it('finds none when the subnet is priced at 0 or its pool pays nothing out', async () => {
    expect(await findMinLeg(MIN_STAKE, new BigNumber(0), pool)).toBeUndefined();
    expect(await findMinLeg(MIN_STAKE, new BigNumber(0.5), () => Promise.resolve(new BigNumber(0)))).toBeUndefined();
  });
});

describe('Bittensor swap: what Max can spend', () => {
  it('reports the swappable stake and what is left out, so the Swap screen\'s Max matches validation', () => {
    const source = getSwapSource({
      stakes: [{ hotkey: 'big', netuid: 0, stake: TAO }, { hotkey: 'dust', netuid: 0, stake: 1000000 }, { hotkey: 'recent', netuid: 0, stake: 0.3 * TAO }, { hotkey: 'other', netuid: 5, stake: TAO }],
      fromNetuid: 0,
      minLeg: ROOT_MIN_LEG,
      held: new Set(['recent'])
    });

    expect(source.total.toFixed()).toBe(String(1.301 * TAO));
    expect(source.usable.toFixed()).toBe(String(TAO));
    expect(source.belowMinimum.toFixed()).toBe('1000000');
    expect(source.held.toFixed()).toBe(String(0.3 * TAO));
    expect(source.locked.toFixed()).toBe('0');
    expect(source.error).toBeUndefined();
  });

  it('caps the swappable stake at the unlocked stake — a move off the subnet may not take locked alpha (EXT-19)', () => {
    const minLeg = new BigNumber(20010005);
    const stakes = [{ hotkey: 'a', netuid: 3, stake: TAO }, { hotkey: 'b', netuid: 3, stake: 0.5 * TAO }];
    const source = getSwapSource({ stakes, fromNetuid: 3, minLeg, available: new BigNumber(TAO) });

    expect(source.usable.toFixed()).toBe(String(TAO));
    expect(source.locked.toFixed()).toBe(String(0.5 * TAO));
    expect(plan(stakes, 3, 1.2 * TAO, minLeg, undefined, TAO).error).toBe('notEnoughStakeToSwap');
    expect(legs(plan(stakes, 3, TAO, minLeg, undefined, TAO))).toEqual([['a', String(TAO)]]);
  });

  it('says the stake is locked when none of it is unlocked', () => {
    const result = plan([{ hotkey: 'a', netuid: 3, stake: TAO }], 3, 0.5 * TAO, new BigNumber(20010005), undefined, 0);

    expect(result.legs).toEqual([]);
    expect(result.error).toBe('stakeLocked');
  });
});

describe('Bittensor swap: root hold', () => {
  it('holds nothing while RootStakeUnlockInterval is 0 (mainnet and testnet on 10-14)', () => {
    expect(getRootHeldHotkeys(0, 100000, { a: 99999 }).size).toBe(0);
  });

  it('holds a hotkey changed within the interval, and frees one changed before it', () => {
    const held = getRootHeldHotkeys(7200, 100000, { recent: 99000, old: 1000, never: null });

    expect([...held]).toEqual(['recent']);
  });
});
