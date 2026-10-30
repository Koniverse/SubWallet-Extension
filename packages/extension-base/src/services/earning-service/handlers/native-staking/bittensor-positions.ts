// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

/**
 * Decides, read after read, which of an account's subnet positions to send (EXT-34). Each read lists every subnet for
 * every account, nearly all without stake; sending each of those every 30 s rewrote 128 rows per account into the
 * position store and IndexedDB, about 6.5 MiB an hour for one account (10-27). An empty position is now sent once —
 * it clears what the store kept from before — and again only once a stake there is gone. A position with stake is
 * sent on every read: its value moves with the price and every epoch.
 */
export const createPositionGate = (): ((address: string, slug: string, hasStake: boolean) => boolean) => {
  const emptySent = new Set<string>();

  return (address, slug, hasStake) => {
    const key = `${address}|${slug}`;

    if (hasStake) {
      emptySent.delete(key);

      return true;
    }

    if (emptySent.has(key)) {
      return false;
    }

    emptySent.add(key);

    return true;
  };
};
