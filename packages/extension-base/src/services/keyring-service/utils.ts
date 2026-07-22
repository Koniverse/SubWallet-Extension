// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';

export const hasAnyAccountForMigration = (allAccountProxies: AccountProxy[]) => {
  for (const account of allAccountProxies) {
    if (account.isNeedMigrateUnifiedAccount) {
      return true;
    }
  }

  return false;
};

// Check if account is TrustWallet account
export const isTWAccount = (account: AccountProxy) => {
  const isTWDerivation = account.suri === "m/44'/354'/0'/0'/0'";
  const isTWSolo = account.accountType === AccountProxyType.SOLO;
  const isTWKeyPairType = account.accounts[0].type === 'ed25519-tw';

  return isTWDerivation && isTWSolo && isTWKeyPairType;
};
