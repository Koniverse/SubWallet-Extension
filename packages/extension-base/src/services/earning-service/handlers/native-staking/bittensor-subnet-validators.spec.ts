// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { decodeTaoWeight, DEFAULT_TAO_WEIGHT, formatTake, getPermittedUids, getSubnetValidatorHotkeys, getSubnetValidatorStake } from './bittensor-subnet-validators';

const RAO = 1e9;

describe('A subnet\'s validators from the chain (EXT-14)', () => {
  it('reads TaoWeight as a share of u64::MAX, mainnet\'s 0.18 when the chain has none', () => {
    // Mainnet's raw value on 10-21
    expect(decodeTaoWeight('3320413933267719290').toNumber()).toBeCloseTo(0.18, 12);
    expect(decodeTaoWeight(undefined)).toBe(DEFAULT_TAO_WEIGHT);
  });

  it('lists permit holders, then hotkeys paid without a permit, each once', () => {
    expect(getPermittedUids([true, false, false, true, true])).toEqual([0, 3, 4]);
    expect(getSubnetValidatorHotkeys(['a', 'b'], ['b', 'parent'])).toEqual(['a', 'b', 'parent']);
    expect(getSubnetValidatorHotkeys([], [])).toEqual([]);
  });

  it('adds root stake × TaoWeight to the subnet\'s alpha at spot, as validator.json weighs stake', () => {
    // TAO.com on SN64 (10-21): 264,423.6 α at 0.067134277 TAO, 246,293 TAO on root
    const stake = getSubnetValidatorStake(
      { alpha: new BigN(264423.6 * RAO), hotkey: '5HK5tp6t', rootStake: new BigN(246293 * RAO) },
      new BigN(0.067134277),
      decodeTaoWeight('3320413933267719290')
    );

    expect(stake.rootWeight.dividedBy(RAO).toNumber()).toBeCloseTo(44332.74, 1);
    expect(stake.subnetStake.dividedBy(RAO).toNumber()).toBeCloseTo(17751.84, 1);
    expect(stake.totalStake.toFixed()).toBe(stake.rootWeight.plus(stake.subnetStake).toFixed());
    expect(stake.totalStake.isInteger()).toBe(true);
  });

  it('prints a take in percent the way the picker always has, without u16 rounding noise', () => {
    expect(formatTake(11796)).toBe('18');
    expect(formatTake(5898)).toBe('9');
    expect(formatTake(0)).toBe('0');
    expect(formatTake(3604)).toBe('5.5');
  });
});
