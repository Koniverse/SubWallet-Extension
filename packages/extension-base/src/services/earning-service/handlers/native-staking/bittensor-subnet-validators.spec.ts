// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { decodeTaoWeight, DEFAULT_TAO_WEIGHT, formatTake, getPermittedUids, getValidatorHotkeys, getValidatorStake } from './bittensor-subnet-validators';

const RAO = 1e9;
const TAO_WEIGHT = decodeTaoWeight('3320413933267719290');

describe('A subnet\'s validators from the chain (EXT-14)', () => {
  it('reads TaoWeight as a share of u64::MAX, mainnet\'s 0.18 when the chain has none', () => {
    // Mainnet's raw value on 10-21
    expect(TAO_WEIGHT.toNumber()).toBeCloseTo(0.18, 12);
    expect(decodeTaoWeight(undefined)).toBe(DEFAULT_TAO_WEIGHT);
  });

  it('lists permit holders, then hotkeys paid without a permit, each once', () => {
    expect(getPermittedUids([true, false, false, true, true])).toEqual([0, 3, 4]);
    expect(getValidatorHotkeys(['a', 'b'], ['b', 'parent'])).toEqual(['a', 'b', 'parent']);
    expect(getValidatorHotkeys([], [])).toEqual([]);
  });

  it('adds root stake × TaoWeight to the subnet\'s alpha at spot, as validator.json weighs stake', () => {
    // TAO.com on SN64 (10-21): 264,423.6 α at 0.067134277 TAO, 246,293 TAO on root
    const stake = getValidatorStake(
      { alphas: [{ alpha: new BigN(264423.6 * RAO), taoPerAlpha: new BigN(0.067134277) }], rootStake: new BigN(246293 * RAO) },
      TAO_WEIGHT
    );

    expect(stake.rootWeight.dividedBy(RAO).toNumber()).toBeCloseTo(44332.74, 1);
    expect(stake.subnetStake.dividedBy(RAO).toNumber()).toBeCloseTo(17751.84, 1);
    expect(stake.totalStake.toFixed()).toBe(stake.rootWeight.plus(stake.subnetStake).toFixed());
    expect(stake.totalStake.isInteger()).toBe(true);
  });

  it('sums a root validator\'s alpha over every subnet, each at its own price', () => {
    const stake = getValidatorStake(
      {
        alphas: [
          { alpha: new BigN(1000 * RAO), taoPerAlpha: new BigN(0.05) },
          { alpha: new BigN(200 * RAO), taoPerAlpha: new BigN(0.5) },
          // A subnet whose price reads 0 adds nothing
          { alpha: new BigN(7 * RAO), taoPerAlpha: new BigN(0) }
        ],
        rootStake: new BigN(10000 * RAO)
      },
      DEFAULT_TAO_WEIGHT
    );

    expect(stake.subnetStake.toNumber()).toBe(150 * RAO);
    expect(stake.rootWeight.toNumber()).toBe(1800 * RAO);
    expect(stake.totalStake.toNumber()).toBe(1950 * RAO);
  });

  it('prints a take in percent the way the picker always has, without u16 rounding noise', () => {
    expect(formatTake(11796)).toBe('18');
    expect(formatTake(5898)).toBe('9');
    expect(formatTake(0)).toBe('0');
    expect(formatTake(3604)).toBe('5.5');
  });
});
