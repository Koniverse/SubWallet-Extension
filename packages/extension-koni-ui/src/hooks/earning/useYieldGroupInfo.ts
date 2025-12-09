// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _BALANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { AccountProxyType, YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import { useAccountBalance, useGetChainAndExcludedTokenByCurrentAccountProxy, useSelector, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { BalanceValueInfo, YieldGroupInfo } from '@subwallet/extension-koni-ui/types';
import { getExtrinsicTypeByPoolInfo, getTransactionActionsByAccountProxy } from '@subwallet/extension-koni-ui/utils';
import BigN from 'bignumber.js';
import { useMemo } from 'react';

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const { assetRegistry, multiChainAssetMap } = useSelector((state) => state.assetRegistry);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { accountProxies, currentAccountProxy } = useSelector((state) => state.accountState);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const { tokenGroupMap } = useTokenGroup(allowedChains, excludedTokens);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, true);

  const extrinsicTypeSupported = useMemo(() => {
    if (!currentAccountProxy) {
      return null;
    }

    return getTransactionActionsByAccountProxy(currentAccountProxy, accountProxies);
  }, [accountProxies, currentAccountProxy]);

  const hasWatchOnlyAccount = useMemo(() => {
    if (!currentAccountProxy) {
      return false;
    }

    if (isAccountAll(currentAccountProxy.id)) {
      return accountProxies.some((item) => item.accountType === AccountProxyType.READ_ONLY);
    } else {
      return currentAccountProxy.accountType === AccountProxyType.READ_ONLY;
    }
  }, [accountProxies, currentAccountProxy]);

  return useMemo(() => {
    const result: Record<string, YieldGroupInfo> = {};

    for (const pool of Object.values(poolInfoMap)) {
      const chain = pool.chain;
      const extrinsicType = getExtrinsicTypeByPoolInfo(pool);

      if (!hasWatchOnlyAccount && extrinsicTypeSupported && !extrinsicTypeSupported.includes(extrinsicType)) {
        continue;
      }

      if (allowedChains.includes(chain)) {
        const group = pool.group;
        const exists = result[group];
        const chainInfo = chainInfoMap[chain];

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
              const reserved = new BigN(balanceItem.lockedDetails?.reserved || 0);
              const staking = new BigN(balanceItem.lockedDetails?.staking || 0);
              const subtractAmount = BigN.max(reserved, staking);

              exists.balance.value = exists.balance.value
                .plus(balanceItem.free.value)
                .plus(balanceItem.locked.value)
                .minus(subtractAmount);

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
            if (_BALANCE_CHAIN_GROUP.notSupportGetBalanceByType.includes(chainInfo.slug)) {
              freeBalance.value = freeBalance.value.plus(balanceItem.free.value);
            } else {
              const reserved = new BigN(balanceItem.lockedDetails?.reserved || 0);
              const staking = new BigN(balanceItem.lockedDetails?.staking || 0);
              const subtractAmount = BigN.max(reserved, staking);

              freeBalance.value = freeBalance.value
                .plus(balanceItem.free.value)
                .plus(balanceItem.locked.value)
                .minus(subtractAmount);
            }

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
  }, [poolInfoMap, hasWatchOnlyAccount, extrinsicTypeSupported, allowedChains, chainInfoMap, tokenBalanceMap, multiChainAssetMap, assetRegistry, excludedTokens]);
};

export default useYieldGroupInfo;
