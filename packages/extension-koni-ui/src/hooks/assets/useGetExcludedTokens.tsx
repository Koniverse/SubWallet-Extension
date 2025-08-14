// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy, AccountSignMode } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getExcludedTokensForSubstrateEcdsa, getSignModeByAccountProxy, hasOnlySubstrateEcdsaAccountProxy } from '@subwallet/extension-koni-ui/utils';
import { useCallback } from 'react';

// This hook retrieves a list of excluded tokens based on the provided chain list and account proxy.
// For Substrate ECDSA Ledger accounts, excluded tokens are those that are non-native and backed by smart contracts (e.g., ERC-20).
const useGetExcludedTokens = () => {
  const assetRegistry = useSelector((root) => root.assetRegistry.assetRegistry);
  const accountProxies = useSelector((state) => state.accountState.accountProxies);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);

  return useCallback((chainList: string[], accountProxy?: AccountProxy): string[] => {
    const chainAssetList = Object.values(assetRegistry);
    const targetAccountProxy = accountProxy || currentAccountProxy;

    if (!targetAccountProxy) {
      return [];
    }

    if (isAccountAll(targetAccountProxy.id)) {
      const hasOnlySubstrateEcdsa = hasOnlySubstrateEcdsaAccountProxy(accountProxies);

      if (hasOnlySubstrateEcdsa) {
        return getExcludedTokensForSubstrateEcdsa(chainAssetList, chainList, chainInfoMap);
      }
    } else {
      const signMode = getSignModeByAccountProxy(targetAccountProxy);

      if (signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
        return getExcludedTokensForSubstrateEcdsa(chainAssetList, chainList, chainInfoMap);
      }
    }

    return [];
  }, [accountProxies, assetRegistry, chainInfoMap, currentAccountProxy]);
};

export default useGetExcludedTokens;
