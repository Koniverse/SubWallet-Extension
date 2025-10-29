// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetSubstrateProxyAccountInfo, SubstrateProxyAccountInfo } from '@subwallet/extension-base/types';
import { getSubstrateProxyAccountInfo } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_PROXY_ACCOUNTS: SubstrateProxyAccountInfo = {
  substrateProxies: [],
  substrateProxyDeposit: '0'
};

export function useGetSubstrateProxyAccountsInfoByAddress (address: string, chain: string): SubstrateProxyAccountInfo {
  const [proxies, setProxies] = useState<SubstrateProxyAccountInfo>(DEFAULT_PROXY_ACCOUNTS);
  const fetchProxyData = useCallback(async () => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        setProxies(DEFAULT_PROXY_ACCOUNTS);

        return;
      }

      const request: RequestGetSubstrateProxyAccountInfo = {
        chain,
        address
      };

      const proxyInfo = await getSubstrateProxyAccountInfo(request);

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
