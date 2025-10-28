// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetSubstrateProxyAccounts, SubstrateProxyAccounts } from '@subwallet/extension-base/types';
import { getSubstrateProxyAccounts } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_PROXY_ACCOUNTS: SubstrateProxyAccounts = {
  substrateProxies: [],
  substrateProxyDeposit: '0'
};

export function useGetSubstrateProxyAccountsInfoByAddress (address: string, chain: string): SubstrateProxyAccounts {
  const [proxies, setProxies] = useState<SubstrateProxyAccounts>(DEFAULT_PROXY_ACCOUNTS);
  const fetchProxyData = useCallback(async () => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        setProxies(DEFAULT_PROXY_ACCOUNTS);

        return;
      }

      const request: RequestGetSubstrateProxyAccounts = {
        chain,
        address
      };

      const proxyInfo = await getSubstrateProxyAccounts(request);

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
