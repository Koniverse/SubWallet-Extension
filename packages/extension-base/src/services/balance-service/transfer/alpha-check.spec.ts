// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { AlphaTransferState, checkAlphaTransfer, getLockedToMove } from './alpha-check';

// Testnet SN3, 10-19: 0.088091246 TAO per alpha, `InitialMinTransfer` 100,000 rao
const base: AlphaTransferState = {
  amount: new BigN(5e9),
  toOtherColdkey: true,
  transferEnabled: true,
  taoPerAlpha: new BigN('0.088091246'),
  minTransfer: new BigN(100000)
};

describe('Alpha transfer, as the chain judges it (EXT-12)', () => {
  it('refuses a subnet whose transfers are off (SN12, SN29 on mainnet)', () => {
    expect(checkAlphaTransfer({ ...base, transferEnabled: false }).refusal).toBe('transferDisabled');
  });

  it('refuses an amount worth less than the minimum at spot, and names the smallest one taken', () => {
    const below = checkAlphaTransfer({ ...base, amount: new BigN(1135186) });

    expect(below.refusal).toBe('amountBelowMinimum');
    expect(below.minimum?.toFixed()).toBe('1135187');
    expect(checkAlphaTransfer({ ...base, amount: new BigN(1135187) }).refusal).toBeUndefined();
  });

  it('leaves locks alone within one coldkey', () => {
    const result = checkAlphaTransfer({ ...base, toOtherColdkey: false, available: new BigN(1e9), locked: new BigN(4e9), recipientAcceptsLocked: false });

    expect(result.refusal).toBeUndefined();
    expect(result.lockedToMove.toFixed()).toBe('0');
  });

  it('carries no lock while the amount fits in the unlocked alpha', () => {
    expect(checkAlphaTransfer({ ...base, available: new BigN(5e9), locked: new BigN(2e9) }).lockedToMove.toFixed()).toBe('0');
  });

  it('carries the part beyond the unlocked alpha, still locked, to a recipient that takes it', () => {
    const result = checkAlphaTransfer({ ...base, available: new BigN(3e9), locked: new BigN(4e9), recipientAcceptsLocked: true, recipientLockOnOtherHotkey: false });

    expect(result.refusal).toBeUndefined();
    expect(result.lockedToMove.toFixed()).toBe('2000000000');
  });

  it('refuses locked alpha to a recipient that has not opted in, or holds a lock on another validator', () => {
    const state = { ...base, available: new BigN(3e9), locked: new BigN(4e9) };

    expect(checkAlphaTransfer({ ...state, recipientAcceptsLocked: false }).refusal).toBe('recipientRejectsLocked');
    expect(checkAlphaTransfer({ ...state, recipientAcceptsLocked: true, recipientLockOnOtherHotkey: true }).refusal).toBe('recipientLockOnOtherValidator');
  });

  it('skips a check whose read is missing: the chain still decides', () => {
    const result = checkAlphaTransfer({ amount: new BigN(10), toOtherColdkey: true, available: new BigN(3), locked: new BigN(9) });

    expect(result.refusal).toBeUndefined();
    expect(result.lockedToMove.toFixed()).toBe('7');
  });

  it('refuses a recipient others already staked into on 128 validators', () => {
    expect(checkAlphaTransfer({ ...base, recipientHotkeyLimitReached: true }).refusal).toBe('recipientTooManyValidators');
  });

  it('never carries more than is locked, and nothing without the availability read', () => {
    expect(getLockedToMove(new BigN(10), new BigN(3), new BigN(4)).toFixed()).toBe('4');
    expect(getLockedToMove(new BigN(10)).toFixed()).toBe('0');
  });
});
