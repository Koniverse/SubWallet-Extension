// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

import { decodeI96F32, isRootClaimWorthNotifying, parseRootClaimThreshold, planRootClaim, RootClaimPreview, UNKNOWN_ROOT_CLAIM_THRESHOLD } from './bittensor-root-claim-plan';

const TAO = 1e9;
// RootClaimableThreshold on mainnet: 500,000 rao
const THRESHOLD = new BigN(500000);

const preview = (hotkey: string, redeemable: number, rows: number, extra: Partial<RootClaimPreview> = {}): RootClaimPreview =>
  ({ hotkey, redeemableTao: redeemable, rows, swept: 0, flushedCredits: 0, ...extra });

const plan = (previews: RootClaimPreview[], rootHotkeys = previews.map((item) => item.hotkey)) =>
  planRootClaim({ previews, rootHotkeys, threshold: THRESHOLD });

describe('Bittensor root claim: which claim to send (EXT-9)', () => {
  it('claims nothing when no validator pays at least the threshold', () => {
    expect(plan([]).error).toBe('belowThreshold');

    const result = plan([preview('a', 400000, 120), preview('b', 0, 120)]);

    expect(result.call).toBeUndefined();
    expect(result.pays.toFixed()).toBe('0');
    expect(result.error).toBe('belowThreshold');
  });

  it('claims a single paying validator on its own, leaving out the ones under the threshold', () => {
    const result = plan([preview('a', 374213341, 123), preview('b', 400000, 128)]);

    expect(result.call).toBe('claimRootWithHotkey');
    expect(result.hotkey).toBe('a');
    expect(result.pays.toFixed()).toBe('374213341');
    expect(result.remainingValidators).toBe(0);
  });

  it('claims every validator in one claim_root while hotkeys plus rows fit', () => {
    const result = plan([preview('a', 139330000, 124), preview('b', 600000, 124), preview('dust', 14000, 0)]);

    // 3 hotkeys + 248 rows = 251 units; the dust validator still counts but pays nothing
    expect(result.call).toBe('claimRoot');
    expect(result.pays.toFixed()).toBe('139930000');
    expect(result.remainingValidators).toBe(0);
  });

  it('claims one validator at a time once claim_root would be refused — two funds at 257 units (mainnet, 10-16)', () => {
    const result = plan([preview('small', 21300000, 127), preview('big', 585000000, 128)]);

    expect(result.call).toBe('claimRootWithHotkey');
    expect(result.hotkey).toBe('big');
    expect(result.pays.toFixed()).toBe('585000000');
    expect(result.remainingValidators).toBe(1);
    expect(result.remainingReward.toFixed()).toBe('21300000');
  });

  it('keeps a margin under the budget: 255 units go one validator at a time, 254 in one claim', () => {
    expect(plan([preview('a', TAO, 126), preview('b', TAO, 127)]).call).toBe('claimRootWithHotkey');
    expect(plan([preview('a', TAO, 126), preview('b', TAO, 126)]).call).toBe('claimRoot');
  });

  it('pays the largest first and counts what is left over three validators (387 units)', () => {
    const result = plan([preview('c', 16630000, 128), preview('a', 584625000, 128), preview('b', 173083000, 128)]);

    expect(result.hotkey).toBe('a');
    expect(result.remainingValidators).toBe(2);
    expect(result.remainingReward.toFixed()).toBe('189713000');
  });

  it('counts the rows a claim sweeps first, as the chain does at admission', () => {
    expect(plan([preview('a', TAO, 120), preview('b', TAO, 120)]).call).toBe('claimRoot');
    expect(plan([preview('a', TAO, 120, { swept: 8 }), preview('b', TAO, 120, { swept: 8 })]).call).toBe('claimRootWithHotkey');
  });

  it('does not risk claim_root when a root hotkey has no preview, since its rows are unknown', () => {
    const result = plan([preview('a', TAO, 40), preview('b', TAO, 40)], ['a', 'b', 'new']);

    expect(result.call).toBe('claimRootWithHotkey');
  });

  it('does not risk claim_root over the flush allowance', () => {
    const result = plan([preview('a', TAO, 40, { flushedCredits: 300 }), preview('b', TAO, 40, { flushedCredits: 300 })]);

    expect(result.call).toBe('claimRootWithHotkey');
  });

  it('skips a fund too large for one claim and reports when none can be claimed (testnet)', () => {
    const one = plan([preview('huge', 2 * TAO, 300), preview('fits', TAO, 100)]);

    expect(one.hotkey).toBe('fits');
    expect(one.remainingValidators).toBe(0);

    const none = plan([preview('huge', 2 * TAO, 300)]);

    expect(none.call).toBeUndefined();
    expect(none.error).toBe('tooHeavy');
  });
});

describe('Bittensor root claim: notification', () => {
  const fee = new BigN(8251372);

  it('notifies only when a claim pays at least twice its fee (owner, 10-14)', () => {
    expect(isRootClaimWorthNotifying(fee.multipliedBy(2), fee)).toBe(true);
    expect(isRootClaimWorthNotifying(fee.multipliedBy(2).minus(1), fee)).toBe(false);
  });

  it('does not notify when the fee cannot be estimated', () => {
    expect(isRootClaimWorthNotifying(new BigN(TAO), undefined)).toBe(false);
  });
});

describe('Root claim threshold, a substrate-fixed I96F32 (EXT-17)', () => {
  it('reads the threshold mainnet and testnet store: 500,000 rao (10-20)', () => {
    // `rootClaimableThreshold(0).toJSON()` on both networks
    expect(parseRootClaimThreshold({ bits: 2147483648000000 }).toFixed()).toBe('500000');
  });

  it('reads the big-endian hex string toJSON gives once the bits pass 53 bits', () => {
    // polkadot.js `{"bits":"i128"}` for 0.01 TAO and 1 TAO
    expect(parseRootClaimThreshold({ bits: '0x00000000000000000098968000000000' }).toFixed()).toBe('10000000');
    expect(parseRootClaimThreshold({ bits: '0x00000000000000003b9aca0000000000' }).toFixed()).toBe('1000000000');
  });

  it('keeps the fraction in the decoded value and drops it from the rao threshold', () => {
    // 500,000.5 rao
    expect(decodeI96F32({ bits: 2147485795483648 })?.toFixed()).toBe('500000.5');
    expect(parseRootClaimThreshold({ bits: 2147485795483648 }).toFixed()).toBe('500000');
  });

  it('honours 0: a chain with the dust check off filters nothing', () => {
    expect(parseRootClaimThreshold({ bits: 0 }).toFixed()).toBe('0');
  });

  it('falls back to filtering nothing when the value cannot be read, or reads below 0', () => {
    [null, undefined, {}, { bits: null }, 'not a number'].forEach((raw) => {
      expect(parseRootClaimThreshold(raw).eq(UNKNOWN_ROOT_CLAIM_THRESHOLD)).toBe(true);
    });
    // −1 rao, as a number and as the i128's two's-complement hex
    expect(decodeI96F32({ bits: -4294967296 })?.toFixed()).toBe('-1');
    expect(decodeI96F32({ bits: '0xffffffffffffffffffffffff00000000' })?.toFixed()).toBe('-1');
    expect(parseRootClaimThreshold({ bits: '0xffffffffffffffffffffffff00000000' }).eq(UNKNOWN_ROOT_CLAIM_THRESHOLD)).toBe(true);
  });
});
