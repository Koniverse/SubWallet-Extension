// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetSubstrateProxyAccountGroup, SubstrateProxyAccountGroup } from '@subwallet/extension-base/types';
import { getSubstrateProxyAccountGroup } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_PROXY_ACCOUNTS: SubstrateProxyAccountGroup = {
  substrateProxyAccounts: [],
  substrateProxyDeposit: '0'
};

export function useGetSubstrateProxyAccountGroupByAddress (address: string, chain: string): SubstrateProxyAccountGroup {
  const [substrateProxyAccountGroup, setSubstrateProxyAccountGroup] = useState<SubstrateProxyAccountGroup>(DEFAULT_PROXY_ACCOUNTS);

  const fetchSubstrateProxyAccountData = useCallback(async (isSync: boolean) => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        if (isSync) {
          setSubstrateProxyAccountGroup(DEFAULT_PROXY_ACCOUNTS);
        }

        return;
      }

      const request: RequestGetSubstrateProxyAccountGroup = {
        chain,
        address
      };

      const substrateProxyAccountGroup = await getSubstrateProxyAccountGroup(request);

      if (isSync) {
        setSubstrateProxyAccountGroup(substrateProxyAccountGroup);
      }
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      if (isSync) {
        setSubstrateProxyAccountGroup(DEFAULT_PROXY_ACCOUNTS);
      }
    }
  }, [address, chain]);

  useEffect(() => {
    let isSync = true;

    fetchSubstrateProxyAccountData(isSync).catch(console.error);

    return () => {
      isSync = false;
    };
  }, [fetchSubstrateProxyAccountData]);

  return substrateProxyAccountGroup;
}
