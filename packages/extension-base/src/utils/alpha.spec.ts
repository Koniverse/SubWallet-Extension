// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { getShownAlphaStakes, getTaoPerAlphaMap } from './alpha';

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
