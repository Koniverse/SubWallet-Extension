// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AccountChainType, AccountSignMode } from '@subwallet/extension-base/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { findAccountByAddress, getChainsByAccountAll, getChainsByAccountType, isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { KeypairType } from '@subwallet/keyring/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * @deprecated Use hook `useGetChainSlugsByCurrentAccountProxy` or 'useCoreCreateGetChainSlugsByAccountProxy' instead.
 */
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

  const accountTypes = useMemo((): KeypairType[] => {
    const types: KeypairType[] = [];
    const _address = address || currentAccountProxy?.id;

    if (_address) {
      if (isAccountAll(_address)) {
        accountProxies.forEach((proxy) => {
          if (proxy.accounts && proxy.accounts.length > 0) {
            proxy.accounts.forEach((account) => {
              if (account.type) {
                types.push(account.type);
              }
            });
          }
        });

        return [...new Set(types)];
      } else {
        const proxy = accountProxies.find((proxy) => proxy.id === _address);

        if (proxy && proxy.accounts && proxy.accounts.length > 0) {
          proxy.accounts.forEach((account) => {
            if (account.type) {
              types.push(account.type);
            }
          });

          return [...new Set(types)];
        }
      }
    }

    return [];
  }, [accountProxies, address, currentAccountProxy?.id]);

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

      return allAccount ? getChainsByAccountAll(allAccount, accountProxies, chainInfoMap, accountTypes) : [];
    }

    return getChainsByAccountType(chainInfoMap, chainTypes, accountTypes, specialChain);
  }, [address, currentAccountProxy?.id, accountProxies, chainInfoMap, chainTypes, specialChain, accountTypes]);
};
