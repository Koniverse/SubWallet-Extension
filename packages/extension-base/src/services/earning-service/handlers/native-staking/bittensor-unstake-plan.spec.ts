// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { planUnstake } from './bittensor-unstake-plan';

// DefaultMinStake × NominatorMinRequiredStake / 10^6 on mainnet and testnet: 2,000,000 × 10,000,000 / 10^6 = 0.02 TAO
const NOMINATOR_MIN = new BigN(2e7);
// SN3 on testnet, 10-19: 0.0881 TAO per alpha
const PRICE = new BigN(0.0881);

const plan = (amount: number, stake: number, { ownsHotkey = false, taoPerUnit = PRICE, unstakeAll = false } = {}) =>
  planUnstake({ amount: new BigN(amount), stake: new BigN(stake), taoPerUnit, nominatorMinStake: NOMINATOR_MIN, ownsHotkey, unstakeAll });

describe('Bittensor unstake (EXT-26)', () => {
  it('sends the whole position as a full exit, with no minimum', () => {
    // 0.001 TAO of alpha: under the chain's 0.002 and the extension's old 0.021, and the chain takes it in full
    const result = plan(11351922, 11351922);

    expect(result.fullExit).toBe(true);
    expect(result.unstaked.toFixed()).toBe('11351922');
    expect(result.remainderTooSmall).toBe(false);
  });

  it('keeps Max a full exit when rewards accrued after the amount was read', () => {
    // The screen read 68,077,189; a block later the stake is 68,078,365
    const result = plan(68077189, 68078365, { unstakeAll: true });

    expect(result.fullExit).toBe(true);
    expect(result.unstaked.toFixed()).toBe('68078365');
  });

  it('refuses a partial unstake that leaves less than the nominator minimum, which the chain would take too', () => {
    // 0.068 α staked, 0.051 α asked: 0.017 α ≈ 0.0015 TAO would be left
    const result = plan(51057937, 68077253);

    expect(result.minRemaining.toFixed()).toBe(new BigN(2e7).dividedBy(PRICE).integerValue(BigN.ROUND_FLOOR).toFixed());
    expect(result.fullExit).toBe(false);
    expect(result.remaining.toFixed()).toBe('17019316');
    expect(result.remainderTooSmall).toBe(true);
  });

  it('refuses leaving 0.015 TAO of a 0.02 TAO position, which the chain swept on testnet (10-19)', () => {
    expect(plan(56759616, 226924166).remainderTooSmall).toBe(true);
  });

  it('allows a partial unstake that leaves the nominator minimum', () => {
    const result = plan(50000000, 300000000);

    expect(result.fullExit).toBe(false);
    expect(result.remainderTooSmall).toBe(false);
    expect(result.unstaked.toFixed()).toBe('50000000');
  });

  it('leaves a hotkey owner\'s small remainder alone, as the chain does', () => {
    expect(plan(51057937, 68077253, { ownsHotkey: true }).remainderTooSmall).toBe(false);
  });

  it('treats an amount at or above the stake as a full exit of the stake there is', () => {
    const result = plan(2e9, 1e9);

    expect(result.fullExit).toBe(true);
    expect(result.unstaked.toFixed()).toBe('1000000000');
  });

  it('measures root in TAO: 0.015 TAO left on root is under 0.02 TAO', () => {
    expect(plan(5e6, 2e7, { taoPerUnit: new BigN(1) }).remainderTooSmall).toBe(true);
    expect(plan(5e6, 3e7, { taoPerUnit: new BigN(1) }).remainderTooSmall).toBe(false);
  });
});
