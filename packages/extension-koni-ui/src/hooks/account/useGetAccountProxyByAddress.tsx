// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetAccountProxyByAddress = (address?: string): AccountProxy | null => {
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);

  return useMemo((): AccountProxy | null => {
    if (!address) {
      return null;
    }

    for (const ap of accountProxies) {
      const found = ap.accounts.find((acc) => findAccountByAddress([acc], address));

      if (found) {
        return ap;
      }
    }

    return null;
  }, [accountProxies, address]);
};

export default useGetAccountProxyByAddress;
