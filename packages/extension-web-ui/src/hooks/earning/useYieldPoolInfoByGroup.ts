// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { useGetChainAndExcludedTokenByCurrentAccountProxy, useSelector } from '@subwallet/extension-web-ui/hooks';
import { useMemo } from 'react';

const useYieldPoolInfoByGroup = (group: string): YieldPoolInfo[] => {
  const { poolInfoMap } = useSelector((state) => state.earning);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentAccountProxy();

  return useMemo(() => {
    const result: YieldPoolInfo[] = [];

    for (const pool of Object.values(poolInfoMap)) {
      const chain = pool.chain;
      const inputAssets = pool.metadata?.inputAsset || '';

      if (allowedChains.includes(chain) && !excludedTokens.includes(inputAssets) && group === pool.group) {
        result.push(pool);
      }
    }

    return result;
  }, [allowedChains, excludedTokens, group, poolInfoMap]);
};

export default useYieldPoolInfoByGroup;
