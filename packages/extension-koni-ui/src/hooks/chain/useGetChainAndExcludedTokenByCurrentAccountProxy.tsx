// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetChainAndExcludedTokenByAccountProxy, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

interface ChainAndExcludedTokenInfo {
  allowedChains: string[];
  excludedTokens: string[];
}

const useGetChainAndExcludedTokenByCurrentAccountProxy = (): ChainAndExcludedTokenInfo => {
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const { getAllowedChainsByAccountProxy, getExcludedTokensByAccountProxy } = useGetChainAndExcludedTokenByAccountProxy();

  return useMemo<ChainAndExcludedTokenInfo>(() => {
    if (!currentAccountProxy) {
      return { allowedChains: [], excludedTokens: [] };
    }

    const allowedChains = getAllowedChainsByAccountProxy(currentAccountProxy);
    const excludedTokens = getExcludedTokensByAccountProxy(allowedChains, currentAccountProxy);

    return { allowedChains, excludedTokens };
  }, [currentAccountProxy, getAllowedChainsByAccountProxy, getExcludedTokensByAccountProxy]);
};

export default useGetChainAndExcludedTokenByCurrentAccountProxy;
