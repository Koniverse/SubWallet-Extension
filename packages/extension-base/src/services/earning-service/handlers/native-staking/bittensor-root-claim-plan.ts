// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

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
