// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { BITTENSOR_BLOCKS_PER_YEAR, getPositionApr, getRootApr, getSubnetApr, getSubnetAprs, getValidatorApr } from './bittensor-subnet-apr';

const ALPHA = 1e9;
const row = (hotkey: string, dividend: number, totalAlpha: number) => ({ hotkey, dividend: new BigN(dividend), totalAlpha: new BigN(totalAlpha) });

describe('Subnet APR from the chain (EXT-1, BE-2)', () => {
  it('annualises the last epoch\'s return, D / (A − D), by the epochs in a year', () => {
    // 46 α paid on 1,000,046 α after the epoch: 0.0046% for the epoch, on a 360-block tempo
    const apr = getValidatorApr(new BigN(46 * ALPHA), new BigN(1000046 * ALPHA), 360);

    expect(apr).toBeCloseTo(46 / 1000000 * BITTENSOR_BLOCKS_PER_YEAR / 360, 10);
    expect(apr).toBeCloseTo(0.336, 3);
  });

  it('has no figure without stake before the dividend, or without a tempo', () => {
    expect(getValidatorApr(new BigN(5), new BigN(5), 360)).toBeUndefined();
    expect(getValidatorApr(new BigN(5), new BigN(100), 0)).toBeUndefined();
    expect(getSubnetApr([row('a', 5, 100)], 0)).toBeUndefined();
  });

  it('sets "Up to" from validators holding at least 1% of the stake paid, so a tiny one cannot set it', () => {
    const apr = getSubnetApr([
      row('big', 40 * ALPHA, 1000040 * ALPHA),
      row('mid', 60 * ALPHA, 1000060 * ALPHA),
      // 0.05% of the paid stake, at a ratio 100 times the others'
      row('tiny', 6 * ALPHA, 1006 * ALPHA)
    ], 360);

    expect(apr?.byHotkey.tiny).toBeGreaterThan(apr?.byHotkey.mid ?? Infinity);
    expect(apr?.upTo).toBe(apr?.byHotkey.mid);
  });

  it('is a measured 0 when the subnet paid no staker in its last epoch (SN59, SN103 on 10-20)', () => {
    expect(getSubnetApr([], 360)).toEqual({ byHotkey: {}, upTo: 0 });
  });

  it('weights a position\'s validators by its stake on each, a validator not paid counting 0', () => {
    const apr = getSubnetApr([row('a', 40 * ALPHA, 1000040 * ALPHA)], 360);

    if (!apr) {
      throw new Error('no figure');
    }

    const onA = getPositionApr([{ hotkey: 'a', stake: new BigN(3 * ALPHA) }], apr);
    const split = getPositionApr([{ hotkey: 'a', stake: new BigN(3 * ALPHA) }, { hotkey: 'unpaid', stake: new BigN(1 * ALPHA) }], apr);

    expect(onA).toBeCloseTo(apr.byHotkey.a, 12);
    expect(split).toBeCloseTo(apr.byHotkey.a * 0.75, 12);
    expect(getPositionApr([{ hotkey: 'unpaid', stake: new BigN(ALPHA) }], apr)).toBe(0);
    expect(getPositionApr([], apr)).toBeUndefined();
  });

  it('gives every subnet, from one read of the whole dividend map, what it gives one subnet', () => {
    const one = [row('a', 40 * ALPHA, 1000040 * ALPHA), row('b', 60 * ALPHA, 1000060 * ALPHA)];
    const all = getSubnetAprs([
      ...one.map((r) => ({ ...r, netuid: 1 })),
      { ...row('c', 5 * ALPHA, 1005 * ALPHA), netuid: 2 }
    ], { 0: 360, 1: 360, 2: 0, 3: 360, 4: 360 }, new Set([4]));

    expect(all[1]).toEqual(getSubnetApr(one, 360));
    // A tempo of 0 never runs its epoch; SN3 paid no one; SN4 has not run an epoch since it registered; root has no row
    expect(all[2]).toBeUndefined();
    expect(all[3]).toEqual({ byHotkey: {}, upTo: 0 });
    expect(4 in all && all[4] === undefined).toBe(true);
    expect(0 in all).toBe(false);
  });
});

describe('Root APR from the proxy\'s 30-day figures (EXT-1, BE-3)', () => {
  const TAO = 1e9;
  const rootRow = (hotkey: string, stake: number, apr: number) => ({ hotkey, stake: new BigN(stake * TAO), apr });

  it('sets "Up to" from validators holding at least 1% of the root stake listed, not the highest figure', () => {
    // As on 10-23: the highest figure, 9.89%, is a small validator's; the best of those holding ≥ 1% is 5.85%
    const apr = getRootApr([rootRow('large', 1000000, 0.0547), rootRow('best', 200000, 0.0585), rootRow('small', 5000, 0.0989), rootRow('idle', 300000, 0)]);

    expect(apr?.upTo).toBe(0.0585);
    expect(apr?.byHotkey).toEqual({ large: 0.0547, best: 0.0585, small: 0.0989, idle: 0 });
  });

  it('is a measured 0 when no validator listed earned, and has no figure when the proxy lists none', () => {
    expect(getRootApr([rootRow('a', 100, 0), rootRow('b', 100, 0)])).toEqual({ byHotkey: { a: 0, b: 0 }, upTo: 0 });
    expect(getRootApr([])).toBeUndefined();
  });
});
