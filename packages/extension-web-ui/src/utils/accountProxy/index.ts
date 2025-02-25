// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountChainType, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';

export * from './authorizeAccountProxy';

export function isSoloTonAccountProxy (accountProxy: AccountProxy | null | undefined) {
  if (!accountProxy) {
    return false;
  }

  return accountProxy.accountType === AccountProxyType.SOLO && accountProxy.chainTypes.includes(AccountChainType.TON);
}
