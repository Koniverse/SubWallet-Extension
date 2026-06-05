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

  const aggregated = items.reduce((acc, item) => {
    const lockedDetails = item.lockedDetails;

    return {
      free: acc.free.plus(new BigN(item.free)),
      locked: acc.locked.plus(new BigN(item.locked)),
      staking: acc.staking.plus(new BigN(lockedDetails?.staking || '0')),
      governance: acc.governance.plus(new BigN(lockedDetails?.governance || '0')),
      democracy: acc.democracy.plus(new BigN(lockedDetails?.democracy || '0')),
      reserved: acc.reserved.plus(new BigN(lockedDetails?.reserved || '0')),
      others: acc.others.plus(new BigN(lockedDetails?.others || '0'))
    };
  }, {
    free: new BigN(0),
    locked: new BigN(0),
    staking: new BigN(0),
    governance: new BigN(0),
    democracy: new BigN(0),
    reserved: new BigN(0),
    others: new BigN(0)
  });

  const hasLockedDetails = aggregated.staking.gt(0) || aggregated.governance.gt(0) || aggregated.democracy.gt(0) || aggregated.others.gt(0);

  return {
    address,
    tokenSlug: token,
    free: aggregated.free.toFixed(),
    locked: aggregated.locked.toFixed(),
    lockedDetails: hasLockedDetails
      ? {
        staking: aggregated.staking.toFixed(),
        governance: aggregated.governance.toFixed(),
        democracy: aggregated.democracy.toFixed(),
        reserved: aggregated.reserved.toFixed(),
        others: aggregated.others.toFixed()
      }
      : undefined,
    state: states.every((item) => item === APIItemState.NOT_SUPPORT)
      ? APIItemState.NOT_SUPPORT
      : states.some((item) => item === APIItemState.READY)
        ? APIItemState.READY
        : APIItemState.PENDING
  };
};
