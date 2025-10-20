// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProxyAccounts } from '@subwallet/extension-base/types';
import { RequestGetProxyAccounts } from '@subwallet/extension-base/types/proxy';
import { getProxyAccounts } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_PROXY_ACCOUNTS: ProxyAccounts = {
  proxies: [],
  proxyDeposit: '0'
};

export function useGetProxyAccountsInfoByAddress (address: string, chain: string): ProxyAccounts {
  const [proxies, setProxies] = useState<ProxyAccounts>(DEFAULT_PROXY_ACCOUNTS);
  const fetchProxyData = useCallback(async () => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        setProxies(DEFAULT_PROXY_ACCOUNTS);

        return;
      }

      const request: RequestGetProxyAccounts = {
        chain,
        address
      };

      const proxyInfo = await getProxyAccounts(request);

      setProxies(proxyInfo);
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);
      setProxies(DEFAULT_PROXY_ACCOUNTS);
    }
  }, [address, chain]);

  useEffect(() => {
    fetchProxyData().catch(console.error);
  }, [fetchProxyData]);

  return proxies;
}
