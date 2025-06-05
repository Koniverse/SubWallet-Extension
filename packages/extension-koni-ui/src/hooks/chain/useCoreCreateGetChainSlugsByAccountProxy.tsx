// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import { _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useCallback } from 'react';

function getChainSlugsByAccountProxySingle (accountProxySingle: AccountProxy, chainInfoMap: Record<string, _ChainInfo>): string[] {
  if (accountProxySingle.specialChain) {
    return accountProxySingle.specialChain in chainInfoMap ? [accountProxySingle.specialChain] : [];
  }

  const slugSet = new Set<string>();

  for (const chainInfo of Object.values(chainInfoMap)) {
    if (accountProxySingle.accounts.some((account) => _isChainInfoCompatibleWithAccountInfo(chainInfo, account.chainType, account.type))) {
      slugSet.add(chainInfo.slug);
    }
  }

  return [...slugSet];
}

function getChainSlugsByAccountProxyAll (accountProxyAll: AccountProxy, accountProxies: AccountProxy[], chainInfoMap: Record<string, _ChainInfo>): string[] {
  const { specialChain } = accountProxyAll;

  if (specialChain) {
    return specialChain in chainInfoMap ? [specialChain] : [];
  }

  const slugSet = new Set<string>();

  for (const accountProxy of accountProxies) {
    for (const slug of getChainSlugsByAccountProxySingle(accountProxy, chainInfoMap)) {
      slugSet.add(slug);
    }
  }

  return [...slugSet];
}

const useCoreCreateGetChainSlugsByAccountProxy = () => {
  const accountProxies = useSelector((state) => state.accountState.accountProxies);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  return useCallback((accountProxy: AccountProxy): string[] => {
    const filteredChainInfoMap = Object.fromEntries(Object.entries(chainInfoMap).filter(([, chainInfo]) => chainInfo.chainStatus === _ChainStatus.ACTIVE));

    if (isAccountAll(accountProxy.id)) {
      return getChainSlugsByAccountProxyAll(accountProxy, accountProxies, filteredChainInfoMap);
    }

    return getChainSlugsByAccountProxySingle(accountProxy, filteredChainInfoMap);
  }, [accountProxies, chainInfoMap]);
};

export default useCoreCreateGetChainSlugsByAccountProxy;
