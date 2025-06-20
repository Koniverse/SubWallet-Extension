// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AccountChainType, AccountSignMode } from '@subwallet/extension-base/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { findAccountByAddress, getChainsByAccountAll, getChainsByAccountType, getSignModeByAccountProxy, isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

// TODO: Recheck the usages of the address in this hook.
export const useGetChainSlugsByAccount = (address?: string): string[] => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { accountProxies, accounts, currentAccountProxy } = useSelector((state: RootState) => state.accountState);

  const chainTypes = useMemo((): AccountChainType[] => {
    const _address = address || currentAccountProxy?.id;

    if (_address) {
      if (isAccountAll(_address)) {
        const allAccount = accountProxies.find((proxy) => proxy.id === ALL_ACCOUNT_KEY);

        return allAccount?.chainTypes || [];
      }

      const proxy = accountProxies.find((proxy) => proxy.id === _address);

      if (proxy) {
        return proxy.chainTypes;
      }

      const account = findAccountByAddress(accounts, _address);

      if (account) {
        return [account.chainType];
      }
    }

    return [];
  }, [accountProxies, accounts, address, currentAccountProxy]);

  const specialChain = useMemo((): string | undefined => {
    const _address = address || currentAccountProxy?.id;

    if (_address) {
      if (isAccountAll(_address)) {
        const allAccount = accountProxies.find((proxy) => proxy.id === ALL_ACCOUNT_KEY);

        return allAccount?.specialChain;
      }

      const proxy = accountProxies.find((proxy) => proxy.id === _address);

      if (proxy) {
        return proxy.specialChain;
      }

      const account = findAccountByAddress(accounts, _address);

      if (account) {
        return account.specialChain;
      }
    }

    return undefined;
  }, [accountProxies, accounts, address, currentAccountProxy?.id]);

  const accountSignMode = useMemo(() => {
    const _address = address || currentAccountProxy?.id;

    if (_address) {
      if (isAccountAll(_address)) {
        return AccountSignMode.ALL_ACCOUNT;
      }

      const proxy = accountProxies.find((proxy) => proxy.id === _address);

      if (proxy) {
        return getSignModeByAccountProxy(proxy);
      }
    }

    return AccountSignMode.UNKNOWN;
  }, [accountProxies, address, currentAccountProxy?.id]);

  return useMemo<string[]>(() => {
    const _address = address || currentAccountProxy?.id;

    if (_address && isAccountAll(_address)) {
      const allAccount = accountProxies.find((proxy) => proxy.id === ALL_ACCOUNT_KEY);

      return allAccount ? getChainsByAccountAll(allAccount, accountProxies, chainInfoMap) : [];
    }

    return getChainsByAccountType(chainInfoMap, chainTypes, specialChain, accountSignMode);
  }, [address, currentAccountProxy?.id, chainInfoMap, chainTypes, specialChain, accountSignMode, accountProxies]);
};
