// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

/**
 * Each account's alpha by netuid, counting only the stake Earning shows: a hotkey whose stake is worth
 * at least 1 rao of TAO (`parseNominatorMetadataBase`). Unstaking leaves 1 rao behind on a subnet;
 * counted, it shows as a "0" balance that "Show zero balance" cannot hide (EXT-39).
 */
export const getShownAlphaStakes = (rows: Array<[string, Array<{ netuid: number, stake: string | number }>]>, taoPerAlpha: Record<number, BigN>): Array<Record<number, BigN>> => {
  return rows.map(([, stakes]) => {
    const byNetuid: Record<number, BigN> = {};

    stakes.forEach(({ netuid, stake }) => {
      const value = new BigN(stake);

      if (new BigN(value.multipliedBy(taoPerAlpha[netuid] || 0).toFixed(0)).gt(0)) {
        byNetuid[netuid] = (byNetuid[netuid] || new BigN(0)).plus(value);
      }
    });

    return byNetuid;
  });
};

/** TAO per alpha by netuid from `current_alpha_price_all`, whose prices are rao per alpha. */
export const getTaoPerAlphaMap = (prices: Array<{ netuid: number, price: string | number }>): Record<number, BigN> => {
  const result: Record<number, BigN> = {};

  prices.forEach(({ netuid, price }) => {
    result[netuid] = netuid === 0 ? new BigN(1) : new BigN(price).dividedBy(1e9);
  });

  return result;
};
