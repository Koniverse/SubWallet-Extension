// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _MultiChainAsset } from '@subwallet/chain-list/types';
import { _BALANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _getAssetOriginChain } from '@subwallet/extension-base/services/chain-service/utils';
import { RELAY_HANDLER_DIRECT_STAKING_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { AccountProxyType, YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-web-ui/constants';
import { useAccountBalance, useGetChainAndExcludedTokenByCurrentAccountProxy, useSelector, useTokenGroup } from '@subwallet/extension-web-ui/hooks';
import { BalanceValueInfo, TokenBalanceItemType, YieldGroupInfo } from '@subwallet/extension-web-ui/types';
import { getExtrinsicTypeByPoolInfo, getTransactionActionsByAccountProxy, isRelatedToAstar } from '@subwallet/extension-web-ui/utils';
import BigN from 'bignumber.js';
import { useMemo } from 'react';

const isRelatedToRelayChain = (group: string, assetRegistry: Record<string, _ChainAsset>, multiChainAssetMap: Record<string, _MultiChainAsset>) => {
  if (assetRegistry[group]) {
    return RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(_getAssetOriginChain(assetRegistry[group]));
  }

  if (multiChainAssetMap[group]) {
    const originChainAsset = multiChainAssetMap[group].originChainAsset;

    return RELAY_HANDLER_DIRECT_STAKING_CHAINS.includes(_getAssetOriginChain(assetRegistry[originChainAsset]));
  }

  return false;
};

function calculateTotalValueStaked (poolInfo: YieldPoolInfo, assetRegistry: Record<string, _ChainAsset>, priceMap: Record<string, number>) {
  const asset = assetRegistry[poolInfo.metadata.inputAsset];
  const tvl = poolInfo.statistic?.tvl;

  if (!asset || !asset.priceId || !tvl) {
    return new BigN(0);
  }

  const price = priceMap[asset.priceId] || 0;

  return new BigN(tvl)
    .div(BN_TEN.pow(asset.decimals || 0))
    .multipliedBy(price);
}

function getAvailableEarningBalance (balanceItem: TokenBalanceItemType | undefined, chainSlug: string): BalanceValueInfo {
  const result: BalanceValueInfo = {
    value: BN_ZERO,
    convertedValue: BN_ZERO,
    pastConvertedValue: BN_ZERO
  };

  if (!balanceItem) {
    return result;
  }

  if (_BALANCE_CHAIN_GROUP.notSupportGetBalanceByType.includes(chainSlug)) {
    result.value = result.value.plus(balanceItem.free.value);
  } else {
    const reserved = new BigN(balanceItem.lockedDetails?.reserved || 0);
    const staking = new BigN(balanceItem.lockedDetails?.staking || 0);
    const subtractAmount = BigN.max(reserved, staking);

    result.value = result.value
      .plus(balanceItem.free.value)
      .plus(balanceItem.locked.value)
      .minus(subtractAmount);
  }

  result.convertedValue = result.convertedValue.plus(balanceItem.free.convertedValue);
  result.pastConvertedValue = result.pastConvertedValue.plus(balanceItem.free.pastConvertedValue);

  return result;
}

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const { poolInfoMap } = useSelector((state) => state.earning);
  const { assetRegistry, multiChainAssetMap } = useSelector((state) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state) => state.chainStore);
  const { accountProxies, currentAccountProxy } = useSelector((state) => state.accountState);
  const { allowedChains, excludedTokens } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const { tokenGroupMap } = useTokenGroup(allowedChains, excludedTokens);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, true);
  const { priceMap } = useSelector((state) => state.price);

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

        if (isRelatedToAstar(group)) {
          continue;
        }

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

          if (pool.statistic?.earningThreshold?.join) {
            if (new BigN(exists.minJoin || 0).gt(pool.statistic?.earningThreshold?.join || '0')) {
              exists.description = pool.metadata.description;
            }
          }

          exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
          exists.poolSlugs.push(pool.slug);

          const inputAsset = pool.metadata.inputAsset;

          if (!exists.assetSlugs.includes(inputAsset)) {
            exists.assetSlugs.push(inputAsset);

            const balanceItem = tokenBalanceMap[inputAsset];
            const earningBalance = getAvailableEarningBalance(balanceItem, chainInfo.slug);

            exists.balance.value = exists.balance.value.plus(earningBalance.value);
            exists.balance.convertedValue = exists.balance.convertedValue.plus(earningBalance.convertedValue);
            exists.balance.pastConvertedValue = exists.balance.pastConvertedValue.plus(earningBalance.pastConvertedValue);
          }

          if (exists.isRelatedToRelayChain) {
            if (pool.type === YieldPoolType.NATIVE_STAKING) {
              exists.totalValueStaked = calculateTotalValueStaked(pool, assetRegistry, priceMap);
            }
          } else {
            exists.totalValueStaked = exists.totalValueStaked.plus(calculateTotalValueStaked(pool, assetRegistry, priceMap));
          }
        } else {
          const token = multiChainAssetMap[group] || assetRegistry[group];

          if (!token) {
            continue;
          }

          let apy: undefined | number;

          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          const inputAsset = pool.metadata.inputAsset;

          if (excludedTokens.includes(inputAsset)) {
            continue;
          }

          const checkRelatedRelaChain = isRelatedToRelayChain(group, assetRegistry, multiChainAssetMap);
          const freeBalance = getAvailableEarningBalance(tokenBalanceMap[inputAsset], chainInfo.slug);

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
            description: pool.metadata.description,
            totalValueStaked: (checkRelatedRelaChain && pool.type !== YieldPoolType.NATIVE_STAKING)
              ? BN_ZERO
              : calculateTotalValueStaked(pool, assetRegistry, priceMap),
            minJoin: pool.statistic?.earningThreshold?.join,
            isRelatedToRelayChain: checkRelatedRelaChain,
            assetSlugs: [inputAsset]
          };
        }
      }
    }

    return Object.values(result);
  }, [allowedChains, assetRegistry, chainInfoMap, excludedTokens, extrinsicTypeSupported, hasWatchOnlyAccount, multiChainAssetMap, poolInfoMap, priceMap, tokenBalanceMap]);
};

export default useYieldGroupInfo;
