// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountChainType, AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';

export * from './authorizeAccountProxy';

export function isSoloTonAccountProxy (accountProxy: AccountProxy | null | undefined) {
  if (!accountProxy) {
    return false;
  }

  if (isAccountAll(accountProxy.id)) {
    return accountProxy.chainTypes.length === 1 && accountProxy.chainTypes.includes(AccountChainType.TON);
  }

  return accountProxy.accounts.length === 1 && accountProxy.chainTypes.includes(AccountChainType.TON);
}
