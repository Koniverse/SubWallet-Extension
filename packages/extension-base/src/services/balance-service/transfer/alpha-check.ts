// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { getMinimumAtSpot, getWorthAtSpot } from '@subwallet/extension-base/utils/alpha';
import BigN from 'bignumber.js';

export type AlphaTransferRefusal = 'transferDisabled' | 'amountBelowMinimum' | 'recipientRejectsLocked' | 'recipientLockOnOtherValidator' | 'recipientTooManyValidators';

/**
 * What `transfer_stake` depends on, read from the chain. A field left out was not read — the runtime no
 * longer has it, or the read failed — and its check is skipped: the chain still decides.
 */
export interface AlphaTransferState {
  /** In alpha rao */
  amount: BigN;
  /** The recipient is another coldkey: only then do locks and the recipient's hotkeys matter */
  toOtherColdkey: boolean;
  /** `TransferToggle(netuid)` */
  transferEnabled?: boolean;
  /** Spot TAO per alpha */
  taoPerAlpha?: BigN;
  /** `InitialMinTransfer`, in rao */
  minTransfer?: BigN;
  /** The sender's unlocked and conviction-locked alpha on the subnet, in alpha rao */
  available?: BigN;
  locked?: BigN;
  /** Read only when locked alpha would move */
  recipientAcceptsLocked?: boolean;
  recipientLockOnOtherHotkey?: boolean;
  /** Others already staked the recipient into 128 hotkeys, not including this one */
  recipientHotkeyLimitReached?: boolean;
}

export interface AlphaTransferCheck {
  refusal?: AlphaTransferRefusal;
  /** With `amountBelowMinimum`: the smallest amount the chain takes, in alpha rao */
  minimum?: BigN;
  /** The conviction-locked alpha that goes with the transfer and reaches the recipient still locked */
  lockedToMove: BigN;
}

/** The locked alpha a transfer of `amount` carries: the unlocked alpha leaves first (v478 `transfer_lock`) */
export const getLockedToMove = (amount: BigN, available?: BigN, locked?: BigN): BigN => {
  if (!available || amount.lte(available)) {
    return new BigN(0);
  }

  const beyond = amount.minus(available);

  return locked ? BigN.minimum(beyond, locked) : beyond;
};

/**
 * What the chain checks inside `transfer_stake` and would refuse only in the block, with the fee paid
 * (EXT-12), and the locked alpha the transfer carries to the recipient.
 */
export function checkAlphaTransfer (state: AlphaTransferState): AlphaTransferCheck {
  const { amount, available, locked, minTransfer, recipientAcceptsLocked, recipientHotkeyLimitReached, recipientLockOnOtherHotkey, taoPerAlpha, toOtherColdkey, transferEnabled } = state;
  const none = new BigN(0);

  if (transferEnabled === false) {
    return { refusal: 'transferDisabled', lockedToMove: none };
  }

  // The chain values the stake at spot, with no slippage
  if (taoPerAlpha && minTransfer && getWorthAtSpot(amount, taoPerAlpha).lt(minTransfer)) {
    return { refusal: 'amountBelowMinimum', minimum: getMinimumAtSpot(minTransfer, taoPerAlpha), lockedToMove: none };
  }

  // Within one coldkey the lock stays where it is
  if (!toOtherColdkey) {
    return { lockedToMove: none };
  }

  const lockedToMove = getLockedToMove(amount, available, locked);

  if (lockedToMove.gt(0)) {
    // An account takes locked alpha only once it opts in (`AccountRejectsLockedAlpha`)
    if (recipientAcceptsLocked === false) {
      return { refusal: 'recipientRejectsLocked', lockedToMove };
    }

    // One lock per coldkey and subnet, bound to one hotkey (`LockHotkeyMismatch`)
    if (recipientLockOnOtherHotkey) {
      return { refusal: 'recipientLockOnOtherValidator', lockedToMove };
    }
  }

  if (recipientHotkeyLimitReached) {
    return { refusal: 'recipientTooManyValidators', lockedToMove };
  }

  return { lockedToMove };
}
