// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountChainType, AccountSignMode } from '@subwallet/extension-base/types';
import { ProxyItem, RequestGetProxyAccounts } from '@subwallet/extension-base/types/proxy';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getProxyAccounts } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useState } from 'react';

export type SetProxyAccountsToSign = (chain: string, address?: string, type?: ExtrinsicType, selectedProxyAddress?: string[]) => void;

export function useProxyAccountsToSign (): [ProxyItem[], SetProxyAccountsToSign] {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const [proxies, setProxies] = useState<ProxyItem[]>([]);

  const fetchProxyAccountToSign = useCallback(async (chain: string, address?: string, type?: ExtrinsicType, selectedProxyAddress?: string[]): Promise<void> => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        setProxies([]);

        return;
      }

      const request: RequestGetProxyAccounts = {
        chain,
        address,
        type,
        selectedProxyAddress
      };

      const proxyAccounts = await getProxyAccounts(request);

      if (!proxyAccounts?.proxies?.length) {
        setProxies([]);

        return;
      }

      const validAccounts = allAccounts.filter(
        (acc) => acc.chainType === AccountChainType.SUBSTRATE && acc.signMode !== AccountSignMode.READ_ONLY
      );

      setProxies(proxyAccounts.proxies.filter((proxy) =>
        validAccounts.some((acc) => isSameAddress(acc.address, proxy.proxyAddress))
      ));
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      setProxies([]);
    }
  }, [allAccounts]);

  return [proxies, fetchProxyAccountToSign];
}
