// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetSubstrateProxyAccountInfo, SubstrateProxyAccountInfo } from '@subwallet/extension-base/types';
import { getSubstrateProxyAccountInfo } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_PROXY_ACCOUNTS: SubstrateProxyAccountInfo = {
  substrateProxyAccounts: [],
  substrateProxyDeposit: '0'
};

export function useGetSubstrateProxyAccountsInfoByAddress (address: string, chain: string): SubstrateProxyAccountInfo {
  const [substrateProxies, setSubstrateProxies] = useState<SubstrateProxyAccountInfo>(DEFAULT_PROXY_ACCOUNTS);

  const fetchProxyData = useCallback(async (isSync: boolean) => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        if (isSync) {
          setSubstrateProxies(DEFAULT_PROXY_ACCOUNTS);
        }

        return;
      }

      const request: RequestGetSubstrateProxyAccountInfo = {
        chain,
        address
      };

      const proxyInfo = await getSubstrateProxyAccountInfo(request);

      if (isSync) {
        setSubstrateProxies(proxyInfo);
      }
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      if (isSync) {
        setSubstrateProxies(DEFAULT_PROXY_ACCOUNTS);
      }
    }
  }, [address, chain]);

  useEffect(() => {
    let isSync = true;

    fetchProxyData(isSync).catch(console.error);

    return () => {
      isSync = false;
    };
  }, [fetchProxyData]);

  return substrateProxies;
}
