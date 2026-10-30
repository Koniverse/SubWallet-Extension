// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createPositionGate } from './bittensor-positions';

describe('Subnet positions sent per read (EXT-34)', () => {
  const SN1 = 'TAO___subnet_staking___bittensor__subnet_01';
  const SN64 = 'TAO___subnet_staking___bittensor__subnet_64';

  it('sends an empty position once, not on every read', () => {
    const send = createPositionGate();

    expect([send('a', SN1, false), send('a', SN1, false), send('a', SN1, false)]).toEqual([true, false, false]);
  });

  it('sends a position with stake on every read, and its empty position once the stake is gone', () => {
    const send = createPositionGate();

    // Empty, staked twice, fully unstaked, still empty
    expect([send('a', SN1, false), send('a', SN1, true), send('a', SN1, true), send('a', SN1, false), send('a', SN1, false)]).toEqual([true, true, true, true, false]);
  });

  it('keeps accounts and subnets apart', () => {
    const send = createPositionGate();

    expect([send('a', SN1, false), send('b', SN1, false), send('a', SN64, false), send('a', SN1, false)]).toEqual([true, true, true, false]);
  });

  it('starts over with each subscription, so a new one clears the store again', () => {
    expect(createPositionGate()('a', SN1, false)).toBe(true);
    expect(createPositionGate()('a', SN1, false)).toBe(true);
  });
});
