// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

export interface UnstakePlanParams {
  /** What the user asks to unstake, in the position's unit (alpha, or TAO on root) */
  amount: BigN;
  /** The coldkey's stake on this hotkey and netuid now */
  stake: BigN;
  /** TAO per unit at spot: 1 on root */
  taoPerUnit: BigN;
  /** The smallest stake a nominator may keep, in rao of TAO: DefaultMinStake × `NominatorMinRequiredStake` / 10^6 */
  nominatorMinStake: BigN;
  /** The coldkey owns the hotkey: the chain does not clear an owner's small stake */
  ownsHotkey: boolean;
  /** The user asked for all of it (Max): what accrues before the block goes too */
  unstakeAll?: boolean;
}

export interface UnstakePlan {
  /** The whole position leaves, so it goes out with `remove_stake_full_limit` and has no minimum */
  fullExit: boolean;
  /** What leaves the position */
  unstaked: BigN;
  /** What stays on the hotkey; 0 on a full exit */
  remaining: BigN;
  /**
   * What stays is under the nominator minimum. The chain would unstake it as well
   * (`clear_small_nomination_if_required`, v478 `helpers.rs`), so the extension refuses the amount:
   * unstake less, or all of it (owner, 10-19).
   */
  remainderTooSmall: boolean;
  /** The smallest stake a nominator may keep on a hotkey, in the position's unit */
  minRemaining: BigN;
}

/**
 * How an unstake leaves the position (EXT-26). A full exit has no minimum (`validate_remove_stake`
 * checks the minimum only while stake remains); a partial one must leave a nominator at least the
 * nominator minimum at spot.
 */
export function planUnstake ({ amount, nominatorMinStake, ownsHotkey, stake, taoPerUnit, unstakeAll = false }: UnstakePlanParams): UnstakePlan {
  const minRemaining = taoPerUnit.gt(0) ? nominatorMinStake.dividedBy(taoPerUnit).integerValue(BigN.ROUND_FLOOR) : new BigN(0);

  if (unstakeAll || amount.gte(stake)) {
    return { fullExit: true, unstaked: stake, remaining: new BigN(0), remainderTooSmall: false, minRemaining };
  }

  const remaining = stake.minus(amount);

  return { fullExit: false, unstaked: amount, remaining, remainderTooSmall: !ownsHotkey && remaining.lt(minRemaining), minRemaining };
}
