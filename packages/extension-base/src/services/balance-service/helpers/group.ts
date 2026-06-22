// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { APIItemState } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

/**
 * Group the balance of {token} from {items} into {address}
 * @param {BalanceItem[]} items - List balance want to group
 * @param {string} address - Address will be grouped to
 * @param {string} token - Slug of token will be group balance
 * @return {BalanceItem} - Grouped balance information of token
 */
export const groupBalance = (items: BalanceItem[], address: string, token: string): BalanceItem => {
  const states = items.map((item) => item.state);

  const sum = (selector: (i: BalanceItem) => string) => BigN.sum.apply(null, items.map(selector)).toFixed();

  const staking = sum((i) => i.lockedDetails?.staking ?? '0');
  const governance = sum((i) => i.lockedDetails?.governance ?? '0');
  const democracy = sum((i) => i.lockedDetails?.democracy ?? '0');
  const reserved = sum((i) => i.lockedDetails?.reserved ?? '0');
  const others = sum((i) => i.lockedDetails?.others ?? '0');

  const hasLockedDetails = new BigN(staking).gt(0) || new BigN(governance).gt(0) || new BigN(democracy).gt(0) || new BigN(others).gt(0);

  return {
    address,
    tokenSlug: token,
    free: sum((i) => i.free),
    locked: sum((i) => i.locked),
    lockedDetails: hasLockedDetails
      ? { staking, governance, democracy, reserved, others }
      : undefined,
    state: states.every((item) => item === APIItemState.NOT_SUPPORT)
      ? APIItemState.NOT_SUPPORT
      : states.some((item) => item === APIItemState.READY)
        ? APIItemState.READY
        : APIItemState.PENDING
  };
};
