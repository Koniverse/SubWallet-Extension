// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';

import { formatMinimum, formatNumber, roundUpMinimum } from './number';

describe('A minimum as a message shows it', () => {
  it('shows enough: the default formatter cut 0.001135187 down to 0.0011, under the minimum', () => {
    // Testnet SN3, 10-19: the smallest move within the subnet, worth 100,000 rao at spot
    const minimum = 1135187;

    expect(formatNumber(minimum, 9)).toBe('0.0011');
    expect(formatMinimum(minimum, 9)).toBe('0.00114');
    expect(roundUpMinimum(minimum, 9).gte(minimum)).toBe(true);
  });

  it('keeps an exact minimum as it is', () => {
    expect(formatMinimum(100000, 9)).toBe('0.0001');
    expect(formatMinimum(20000000, 9)).toBe('0.02');
  });

  it('rounds a staking minimum to the 2 digits the screens print, so 0.002001 shows as 0.0021, not 0.002', () => {
    // 0.002 TAO + the pool fee on a buy that size (1,007 rao on testnet SN3, 10-19)
    const minimum = roundUpMinimum(2001007, 9, 2);

    expect(minimum.toFixed()).toBe('2100000');
    expect(formatNumber(minimum, 9)).toBe('0.0021');
    expect(formatNumber(2001007, 9)).toBe('0.002');
    // Root has no pool fee: 0.002 exactly
    expect(roundUpMinimum(2000000, 9, 2).toFixed()).toBe('2000000');
  });

  it('rounds up above 1 too', () => {
    expect(formatMinimum(new BigNumber('2552955089'), 9)).toBe('2.56');
    expect(formatMinimum(new BigNumber('1234500000000'), 9)).toBe('1240');
  });
});
