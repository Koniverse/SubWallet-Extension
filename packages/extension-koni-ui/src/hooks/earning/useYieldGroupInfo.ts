// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { YieldPoolType } from '@subwallet/extension-base/types';
import { BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import { useAccountBalance, useGetChainAndExcludedTokenByCurrentAccountProxy, useSelector, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { BalanceValueInfo, YieldGroupInfo } from '@subwallet/extension-koni-ui/types';
import { useMemo } from 'react';

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const { assetRegistry, multiChainAssetMap } = useSelector((state) => state.assetRegistry);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const { tokenGroupMap } = useTokenGroup(allowedChains, excludedTokens);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, true);

  return useMemo(() => {
    const result: Record<string, YieldGroupInfo> = {};

    for (const pool of Object.values(poolInfoMap)) {
      const chain = pool.chain;
      const chainInfo = chainInfoMap[chain];

      if (allowedChains.includes(chain)) {
        const group = pool.group;
        const exists = result[group];

        if (exists) {
          let apy: undefined | number;

          exists.poolListLength = exists.poolListLength + 1;

          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          if (apy !== undefined) {
            if (pool.chain === 'bittensor' || pool.chain === 'bittensor_testnet') {
              if (pool.type === YieldPoolType.SUBNET_STAKING) {
                exists.maxApy = Math.max(exists.maxApy || 0, 0);
              }
            } else {
              exists.maxApy = Math.max(exists.maxApy || 0, apy);
            }
          }

          exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
          exists.poolSlugs.push(pool.slug);

          const inputAsset = pool.metadata.inputAsset;

          if (!exists.assetSlugs.includes(inputAsset)) {
            exists.assetSlugs.push(inputAsset);

            const balanceItem = tokenBalanceMap[inputAsset];

            if (balanceItem) {
              exists.balance.value = exists.balance.value.plus(balanceItem.free.value);
              exists.balance.convertedValue = exists.balance.convertedValue.plus(balanceItem.free.convertedValue);
              exists.balance.pastConvertedValue = exists.balance.pastConvertedValue.plus(balanceItem.free.pastConvertedValue);
            }
          }
        } else {
          const token = multiChainAssetMap[group] || assetRegistry[group];

          if (!token) {
            continue;
          }

          const freeBalance: BalanceValueInfo = {
            value: BN_ZERO,
            convertedValue: BN_ZERO,
            pastConvertedValue: BN_ZERO
          };

          let apy: undefined | number;

          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          const inputAsset = pool.metadata.inputAsset;
          const balanceItem = tokenBalanceMap[inputAsset];

          if (excludedTokens.includes(inputAsset)) {
            continue;
          }

          if (balanceItem) {
            freeBalance.value = freeBalance.value.plus(balanceItem.free.value);
            freeBalance.convertedValue = freeBalance.convertedValue.plus(balanceItem.free.convertedValue);
            freeBalance.pastConvertedValue = freeBalance.pastConvertedValue.plus(balanceItem.free.pastConvertedValue);
          }

          result[group] = {
            group: group,
            token: token.slug,
            maxApy: apy,
            symbol: token.symbol,
            balance: freeBalance,
            isTestnet: chainInfo.isTestnet,
            name: token.name,
            chain: chain,
            poolListLength: 1,
            poolSlugs: [pool.slug],
            assetSlugs: [pool.metadata.inputAsset]
          };
        }
      }
    }

    return Object.values(result);
  }, [poolInfoMap, allowedChains, chainInfoMap, tokenBalanceMap, multiChainAssetMap, assetRegistry, excludedTokens]);
};

export default useYieldGroupInfo;
