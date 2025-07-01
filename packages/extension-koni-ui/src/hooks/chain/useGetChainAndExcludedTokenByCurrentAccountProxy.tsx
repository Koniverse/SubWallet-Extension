// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCreateGetChainAndExcludedTokenByAccountProxy, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

interface ChainAndExcludedTokenInfo {
  allowedChains: string[];
  excludedTokens: string[];
}

const useGetChainAndExcludedTokenByCurrentAccountProxy = (): ChainAndExcludedTokenInfo => {
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  return useMemo<ChainAndExcludedTokenInfo>(() => {
    if (!currentAccountProxy) {
      return { allowedChains: [], excludedTokens: [] };
    }

    return getChainAndExcludedTokenByAccountProxy(currentAccountProxy);
  }, [currentAccountProxy, getChainAndExcludedTokenByAccountProxy]);
};

export default useGetChainAndExcludedTokenByCurrentAccountProxy;
