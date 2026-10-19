// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { getPriceAfterStake, getPriceAfterUnstake, getPriceImpact, getShownAlphaStakes, getStakeLimitPrice, getSwapLimitPrice, getTaoPerAlphaMap, readOptional } from './alpha';

describe('Alpha balance as Earning shows it (EXT-39)', () => {
  // rao per alpha, as `current_alpha_price_all` returns it
  const taoPerAlpha = getTaoPerAlphaMap([{ netuid: 0, price: 1e9 }, { netuid: 17, price: 42000000 }, { netuid: 64, price: 67907638 }, { netuid: 9, price: 3e9 }]);

  it('reads prices as TAO per alpha, root at 1', () => {
    expect(taoPerAlpha[0].toFixed()).toBe('1');
    expect(taoPerAlpha[17].toFixed()).toBe('0.042');
  });

  it('drops the 1-rao leftovers an unstake leaves behind, which Earning does not show', () => {
    // 5GH2aUTM on 10-16: 1 rao on 30 subnets, nothing else
    const [shown] = getShownAlphaStakes([['a', [{ netuid: 17, stake: 1 }, { netuid: 64, stake: 1 }]]], taoPerAlpha);

    expect(shown).toEqual({});
  });

  it('keeps a stake worth at least 1 rao of TAO, summed over hotkeys', () => {
    const [shown] = getShownAlphaStakes([['a', [{ netuid: 64, stake: 34550485174 }, { netuid: 64, stake: 1 }, { netuid: 64, stake: 20 }]]], taoPerAlpha);

    // 20 alpha-rao × 0.0679 ≈ 1.36 rao of TAO counts; the 1-rao leftover does not
    expect(shown[64].toFixed()).toBe(new BigN(34550485174).plus(20).toFixed());
  });

  it('counts a 1-rao stake on a subnet priced above 0.5 TAO, as Earning rounds it to 1 rao', () => {
    const [shown] = getShownAlphaStakes([['a', [{ netuid: 9, stake: 1 }]]], taoPerAlpha);

    expect(shown[9].toFixed()).toBe('1');
  });

  it('keeps one map per account, in order', () => {
    const shown = getShownAlphaStakes([['a', [{ netuid: 64, stake: 1e9 }]], ['b', []]], taoPerAlpha);

    expect(shown.length).toBe(2);
    expect(Object.keys(shown[1])).toEqual([]);
  });
});

describe('Reads a runtime upgrade may drop', () => {
  it('counts every stake when the runtime gives no prices, as before the dust rule', () => {
    const [shown] = getShownAlphaStakes([['a', [{ netuid: 17, stake: 1 }, { netuid: 64, stake: 0 }]]]);

    expect(shown).toEqual({ 17: new BigN(1) });
  });

  it('gives undefined for a storage the runtime no longer has, or a call that fails', async () => {
    const query: { transferToggle?: () => Promise<boolean> } = {};

    await expect(readOptional(() => query.transferToggle?.())).resolves.toBeUndefined();
    // A missing entry called without `?.` throws before any promise exists
    await expect(readOptional(() => (query.transferToggle as () => Promise<boolean>)())).resolves.toBeUndefined();
    await expect(readOptional(() => Promise.reject(new Error('Unknown runtime API')))).resolves.toBeUndefined();
    await expect(readOptional(() => Promise.resolve(true))).resolves.toBe(true);
  });
});

describe('Limit prices against the price after the trade (EXT-6)', () => {
  // 1,000 TAO and 10,000 α: spot 0.1
  const pool = { taoIn: new BigN(1000e9), alphaIn: new BigN(10000e9) };
  const spot = new BigN(0.1);

  it('prices a stake as x·y=k does: 1% of the pool moves the price by (1.01)²', () => {
    const tao = new BigN(10e9);
    const alphaOut = pool.alphaIn.minus(pool.taoIn.times(pool.alphaIn).div(pool.taoIn.plus(tao)));

    expect(getPriceAfterStake(spot, pool, tao, new BigN(0), alphaOut).toNumber()).toBeCloseTo(0.1 * 1.01 * 1.01, 12);
  });

  it('prices an unstake down by the same rule', () => {
    const alpha = new BigN(100e9);
    const taoOut = pool.taoIn.minus(pool.taoIn.times(pool.alphaIn).div(pool.alphaIn.plus(alpha)));

    expect(getPriceAfterUnstake(spot, pool, alpha, new BigN(0), taoOut).toNumber()).toBeCloseTo(0.1 / (1.01 * 1.01), 12);
  });

  it('takes the fee off the input before it reaches the pool', () => {
    const tao = new BigN(10e9);
    const fee = new BigN(5e6);
    const alphaOut = pool.alphaIn.minus(pool.taoIn.times(pool.alphaIn).div(pool.taoIn.plus(tao.minus(fee))));

    expect(getPriceAfterStake(spot, pool, tao, fee, alphaOut).toNumber()).toBeLessThan(0.1 * 1.01 * 1.01);
  });

  it('leaves the slippage setting for other trades: up for a stake, down for an unstake', () => {
    const after = new BigN(0.10201);

    expect(getStakeLimitPrice(after, 0.005, true).toFixed()).toBe(new BigN(0.10201).times(1.005).times(1e9).integerValue(BigN.ROUND_CEIL).toFixed());
    expect(getStakeLimitPrice(after, 0.005, false).toFixed()).toBe(new BigN(0.10201).times(0.995).times(1e9).integerValue(BigN.ROUND_CEIL).toFixed());
  });

  it('limits a swap by the price ratio after it, root counting as 1', () => {
    // TAO → alpha: the destination price rises to 0.10201
    expect(getSwapLimitPrice(new BigN(1), new BigN(0.10201), 0.005).toFixed()).toBe(new BigN(1).div(0.10201).times(0.995).times(1e9).integerValue(BigN.ROUND_DOWN).toFixed());
  });

  it('measures impact without the fee, and never below 0', () => {
    expect(getPriceImpact(new BigN(100), new BigN(98))).toBeCloseTo(0.02, 12);
    expect(getPriceImpact(new BigN(100), new BigN(101))).toBe(0);
  });
});
