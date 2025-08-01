// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _MANTA_ZK_CHAIN_GROUP, _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { _getMultiChainAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { useIsMantaPayEnabled } from '@subwallet/extension-web-ui/hooks/account/useIsMantaPayEnabled';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { AssetRegistryStore } from '@subwallet/extension-web-ui/stores/types';
import { TokenGroupHookType } from '@subwallet/extension-web-ui/types/hook';
import { isTokenAvailable } from '@subwallet/extension-web-ui/utils/chain/chainAndAsset';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

function getTokenGroup (assetRegistryMap: AssetRegistryStore['assetRegistry'], filteredChains?: string[]): TokenGroupHookType {
  const result: TokenGroupHookType = {
    tokenGroupMap: {},
    tokenGroups: [],
    tokenSlugs: []
  };

  Object.values(assetRegistryMap).forEach((chainAsset) => {
    const chain = chainAsset.originChain;

    if (filteredChains && !filteredChains.includes(chain)) {
      return;
    }

    const multiChainAsset = _getMultiChainAsset(chainAsset);
    const tokenGroupKey = multiChainAsset || chainAsset.slug;

    if (result.tokenGroupMap[tokenGroupKey]) {
      result.tokenGroupMap[tokenGroupKey].push(chainAsset.slug);
    } else {
      result.tokenGroupMap[tokenGroupKey] = [chainAsset.slug];
      result.tokenGroups.push(tokenGroupKey);
    }
  });

  result.tokenGroups.forEach((tokenGroup) => {
    result.tokenSlugs.push(...result.tokenGroupMap[tokenGroup]);
  });

  return result;
}

export default function useTokenGroup (filteredChains?: string[], excludedAssetsByAccount?: string[]): TokenGroupHookType {
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const assetSettingMap = useSelector((state: RootState) => state.assetRegistry.assetSettingMap);
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);
  const isMantaEnabled = useIsMantaPayEnabled();

  const excludedAssets = useMemo(() => {
    const excludedAssets: string[] = excludedAssetsByAccount || [];

    // exclude zkAssets if not enabled
    if (!isMantaEnabled) {
      Object.values(assetRegistryMap).forEach((chainAsset) => {
        if (_MANTA_ZK_CHAIN_GROUP.includes(chainAsset.originChain) && chainAsset.symbol.startsWith(_ZK_ASSET_PREFIX)) {
          excludedAssets.push(chainAsset.slug);
        }
      });
    }

    return excludedAssets;
  }, [assetRegistryMap, excludedAssetsByAccount, isMantaEnabled]);

  // only get fungible tokens of active chains which has visibility = 0
  const filteredAssetRegistryMap = useMemo(() => {
    const filteredAssetRegistryMap: Record<string, _ChainAsset> = {};

    Object.values(assetRegistryMap).forEach((chainAsset) => {
      if (isTokenAvailable(chainAsset, assetSettingMap, chainStateMap, true) && !excludedAssets.includes(chainAsset.slug)) {
        filteredAssetRegistryMap[chainAsset.slug] = chainAsset;
      }
    });

    return filteredAssetRegistryMap;
  }, [assetRegistryMap, assetSettingMap, chainStateMap, excludedAssets]);

  return useMemo<TokenGroupHookType>(() => {
    return getTokenGroup(filteredAssetRegistryMap, filteredChains);
  }, [filteredAssetRegistryMap, filteredChains]);
}
