// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { BITTENSOR_BLOCKS_PER_YEAR, getPositionApr, getSubnetApr, getValidatorApr } from './bittensor-subnet-apr';

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
});
