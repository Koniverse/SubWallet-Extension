// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { useGetChainAndExcludedTokenByCurrentProxy, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

const useYieldPoolInfoByGroup = (group: string): YieldPoolInfo[] => {
  const { poolInfoMap } = useSelector((state) => state.earning);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentProxy();

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
