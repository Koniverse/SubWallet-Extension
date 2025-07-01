// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { useCoreCreateGetChainSlugsByAccountProxy } from '@subwallet/extension-koni-ui/hooks';
import { useGetExcludedTokens } from '@subwallet/extension-koni-ui/hooks/assets';

interface GetChainAndExcludedTokenFunction {
  getAllowedChainsByAccountProxy: (accountProxy: AccountProxy) => string[];
  getExcludedTokensByAccountProxy: (chainList: string[], accountProxy?: AccountProxy) => string[];
}

const useGetChainAndExcludedTokenByAccountProxy = (): GetChainAndExcludedTokenFunction => ({
  getAllowedChainsByAccountProxy: useCoreCreateGetChainSlugsByAccountProxy(),
  getExcludedTokensByAccountProxy: useGetExcludedTokens()
});

export default useGetChainAndExcludedTokenByAccountProxy;
