// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountChainType, AccountSignMode, RequestGetSubstrateProxyAccountInfo, SubstrateProxyItem } from '@subwallet/extension-base/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getSubstrateProxyAccountInfo } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useState } from 'react';

export type SetSubstrateProxyAccountsToSign = (chain: string, address?: string, type?: ExtrinsicType, selectedProxyAddress?: string[]) => void;

export function useSubstrateProxyAccountsToSign (): [SubstrateProxyItem[], SetSubstrateProxyAccountsToSign] {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const [proxies, setProxies] = useState<SubstrateProxyItem[]>([]);

  const fetchProxyAccountToSign = useCallback(async (chain: string, address?: string, type?: ExtrinsicType, selectedSubstrateProxyAddress?: string[]): Promise<void> => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        setProxies([]);

        return;
      }

      const request: RequestGetSubstrateProxyAccountInfo = {
        chain,
        address,
        type,
        selectedSubstrateProxyAddresses: selectedSubstrateProxyAddress
      };

      const proxyAccounts = await getSubstrateProxyAccountInfo(request);

      if (!proxyAccounts?.substrateProxies?.length) {
        setProxies([]);

        return;
      }

      const validAccounts = allAccounts.filter(
        (acc) => acc.chainType === AccountChainType.SUBSTRATE && acc.signMode !== AccountSignMode.READ_ONLY
      );

      setProxies(proxyAccounts.substrateProxies.filter((proxy) =>
        validAccounts.some((acc) => isSameAddress(acc.address, proxy.substrateProxyAddress))
      ));
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      setProxies([]);
    }
  }, [allAccounts]);

  return [proxies, fetchProxyAccountToSign];
}
