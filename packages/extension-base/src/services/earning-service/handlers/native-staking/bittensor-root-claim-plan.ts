// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

/** The low 32 bits of a substrate-fixed `I96F32` are its fraction */
const FIXED_POINT_32_DIVISOR = new BigN(2).pow(32);
const I128_SIGN = new BigN(2).pow(127);
const I128_RANGE = new BigN(2).pow(128);

/**
 * Threshold used when the chain's own value can't be read. Zero means nothing is filtered: a
 * wrong guess in the other direction would hide a claimable reward and lock the owner out of the
 * claim screen, which is worse than briefly showing dust that a claim then skips.
 */
export const UNKNOWN_ROOT_CLAIM_THRESHOLD = new BigN(0);

/**
 * A substrate-fixed `I96F32` as `toJSON` gives it: `{ bits }`, the bits a number while they fit in 53
 * bits and a big-endian two's-complement hex string beyond (0.01 TAO already is). Undefined if unreadable.
 */
export function decodeI96F32 (raw: unknown): BigN | undefined {
  const bits = raw !== null && typeof raw === 'object' ? (raw as { bits?: unknown }).bits : raw;

  if (typeof bits !== 'number' && typeof bits !== 'string') {
    return undefined;
  }

  let value = new BigN(bits);

  // The hex form is the raw i128: its top bit is the sign
  if (typeof bits === 'string' && bits.startsWith('0x') && value.gte(I128_SIGN)) {
    value = value.minus(I128_RANGE);
  }

  return value.isNaN() ? undefined : value.dividedBy(FIXED_POINT_32_DIVISOR);
}

/**
 * `RootClaimableThreshold`, in rao: the payout a validator must owe before a claim settles it — 500,000
 * rao on mainnet and testnet (10-20). A chain that turns the dust check off reports 0, which is a value
 * to honour; one that cannot be read, or reads below 0, falls back to `UNKNOWN_ROOT_CLAIM_THRESHOLD`.
 */
export function parseRootClaimThreshold (raw: unknown): BigN {
  const value = decodeI96F32(raw);

  return !value || value.lt(0) ? UNKNOWN_ROOT_CLAIM_THRESHOLD : value.integerValue(BigN.ROUND_FLOOR);
}

/** `MAX_ROOT_CLAIM_WORK`: root hotkeys plus their fund rows that one `claim_root` may walk (v478 `lib.rs:83`). */
export const ROOT_CLAIM_WORK = 256;
/** `MAX_ROOT_CLAIM_HOTKEY_WORK`: one validator plus its fund rows, for `claim_root_with_hotkey` (`lib.rs:89`). */
export const ROOT_CLAIM_HOTKEY_WORK = 129;
/** `MAX_BASKET_FLUSH_ROWS`: queued credits a claim may flush before it runs (`basket_flush.rs:35`). */
export const ROOT_CLAIM_FLUSH_ROWS = 512;
/**
 * Units kept free under `ROOT_CLAIM_WORK`: a fund that gains a row between the read and the block
 * would push a claim at the edge over, and one refused at admission still pays its fee.
 */
export const ROOT_CLAIM_WORK_MARGIN = 2;

/** One row of `get_root_basket_claim_previews`: what a claim would do on one validator's fund. */
export interface RootClaimPreview {
  hotkey: string;
  /** What the claim pays, in rao: the entitlement less the dust slices it skips */
  redeemableTao: string | number;
  /** Fund rows the claim scans, after the dust sweep */
  rows: number;
  /** Rows the sweep consolidates first — still counted when the chain admits the claim */
  swept: number;
  /** Queued credits the claim flushes first */
  flushedCredits: number;
}

export interface RootClaimPlan {
  /** `claimRoot` settles every validator in one transaction; `claimRootWithHotkey` settles `hotkey` only */
  call?: 'claimRoot' | 'claimRootWithHotkey';
  hotkey?: string;
  /** What this claim pays, in rao */
  pays: BigN;
  /** Validators still holding a claimable reward after this claim */
  remainingValidators: number;
  /** What they hold, in rao */
  remainingReward: BigN;
  /** Why nothing can be claimed: rewards under the chain threshold, or funds too large for one claim */
  error?: 'belowThreshold' | 'tooHeavy';
}

export interface RootClaimParams {
  previews: RootClaimPreview[];
  /** Hotkeys the coldkey has root stake on: `claim_root` counts them even with nothing owed */
  rootHotkeys: string[];
  /** `RootClaimableThreshold`, in rao: the chain skips a validator paying less */
  threshold: BigN;
}

/** Work the chain counts for one fund at admission: the hotkey and every row it will scan. */
function getUnits (preview: RootClaimPreview): number {
  return 1 + preview.rows + preview.swept;
}

/**
 * Which claim to send. `claim_root` settles every validator for one fee, but the chain refuses it —
 * and keeps the fee — once root hotkeys plus their fund rows exceed `ROOT_CLAIM_WORK`, which two
 * large funds already do. Then claim one validator at a time, the one paying most first:
 * `claim_root_with_hotkey` declares so much weight that two cannot share a transaction.
 */
export function planRootClaim ({ previews, rootHotkeys, threshold }: RootClaimParams): RootClaimPlan {
  const zero = new BigN(0);
  const claimable = previews
    .filter((preview) => {
      const redeemable = new BigN(preview.redeemableTao);

      return redeemable.gt(0) && redeemable.gte(threshold);
    })
    .sort((a, b) => new BigN(b.redeemableTao).comparedTo(a.redeemableTao));

  if (!claimable.length) {
    return { pays: zero, remainingValidators: 0, remainingReward: zero, error: 'belowThreshold' };
  }

  if (claimable.length > 1) {
    const known = new Set(previews.map((preview) => preview.hotkey));
    // A root hotkey with nothing owed has no preview, so its rows are unknown: assume it does not fit
    const hasUnknown = rootHotkeys.some((hotkey) => !known.has(hotkey));
    const units = previews.reduce((sum, preview) => sum + getUnits(preview), 0);
    const flushes = previews.reduce((sum, preview) => sum + preview.flushedCredits, 0);

    if (!hasUnknown && units <= ROOT_CLAIM_WORK - ROOT_CLAIM_WORK_MARGIN && flushes <= ROOT_CLAIM_FLUSH_ROWS) {
      // The chain skips validators under the threshold, so the claim pays the claimable ones
      const pays = claimable.reduce((sum, preview) => sum.plus(preview.redeemableTao), zero);

      return { call: 'claimRoot', pays, remainingValidators: 0, remainingReward: zero };
    }
  }

  // A fund over the single-hotkey budget cannot be claimed at all (testnet, with more subnets than slots)
  const fitting = claimable.filter((preview) => getUnits(preview) <= ROOT_CLAIM_HOTKEY_WORK && preview.flushedCredits <= ROOT_CLAIM_FLUSH_ROWS);

  if (!fitting.length) {
    return { pays: zero, remainingValidators: 0, remainingReward: zero, error: 'tooHeavy' };
  }

  const [next, ...rest] = fitting;

  return {
    call: 'claimRootWithHotkey',
    hotkey: next.hotkey,
    pays: new BigN(next.redeemableTao),
    remainingValidators: rest.length,
    remainingReward: rest.reduce((sum, preview) => sum.plus(preview.redeemableTao), zero)
  };
}

/** Notify only when a claim nets at least one fee: what it pays is at least twice what it costs (owner, 10-14). */
export function isRootClaimWorthNotifying (pays: BigN, fee?: BigN): boolean {
  return !!fee && fee.gt(0) && pays.gte(fee.multipliedBy(2));
}
