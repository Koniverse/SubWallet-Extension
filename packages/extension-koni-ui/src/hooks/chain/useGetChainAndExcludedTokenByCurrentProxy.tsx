// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCoreCreateGetChainSlugsByAccountProxy, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useGetExcludedTokens } from '@subwallet/extension-koni-ui/hooks/assets';
import { useMemo } from 'react';

interface ChainAndExcludedTokenInfo {
  allowedChains: string[];
  excludedTokens: string[];
}

const useGetChainAndExcludedTokenByCurrentProxy = (): ChainAndExcludedTokenInfo => {
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const getChainSlugsByAccountProxy = useCoreCreateGetChainSlugsByAccountProxy();
  const getExcludedTokensByAccountProxy = useGetExcludedTokens();

  return useMemo<ChainAndExcludedTokenInfo>(() => {
    if (!currentAccountProxy) {
      return { allowedChains: [], excludedTokens: [] };
    }

    const allowedChains = getChainSlugsByAccountProxy(currentAccountProxy);
    const excludedTokens = getExcludedTokensByAccountProxy(allowedChains, currentAccountProxy);

    return { allowedChains, excludedTokens };
  }, [currentAccountProxy, getChainSlugsByAccountProxy, getExcludedTokensByAccountProxy]);
};

export default useGetChainAndExcludedTokenByCurrentProxy;
