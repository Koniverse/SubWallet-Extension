// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { useCoreCreateGetChainSlugsByAccountProxy } from '@subwallet/extension-koni-ui/hooks';
import { useGetExcludedTokens } from '@subwallet/extension-koni-ui/hooks/assets';
import { useCallback } from 'react';

export interface ChainAndExcludedTokenInfo {
  allowedChains: string[];
  excludedTokens: string[];
}

const useCreateGetChainAndExcludedTokenByAccountProxy = () => {
  const getAllowedChainsByAccountProxy = useCoreCreateGetChainSlugsByAccountProxy();
  const getExcludedTokensByAccountProxy = useGetExcludedTokens();

  return useCallback((accountProxy: AccountProxy): ChainAndExcludedTokenInfo => {
    const allowedChains = getAllowedChainsByAccountProxy(accountProxy);

    const excludedTokens = getExcludedTokensByAccountProxy(allowedChains, accountProxy);

    return { allowedChains, excludedTokens };
  }, [getAllowedChainsByAccountProxy, getExcludedTokensByAccountProxy]);
};

export default useCreateGetChainAndExcludedTokenByAccountProxy;
