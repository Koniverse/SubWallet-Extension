// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetOriginChain, _isAssetFungibleToken, _isChainCompatibleLedgerEvm, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
import { isSubstrateEcdsaLedgerAssetSupported } from '@subwallet/extension-base/utils';

export function isTokenAvailable (
  chainAsset: _ChainAsset,
  assetSettingMap: Record<string, AssetSetting>,
  chainStateMap: Record<string, _ChainState>,
  filterActiveChain: boolean,
  ledgerNetwork?: string
): boolean {
  const assetSetting = assetSettingMap[chainAsset.slug];

  const isAssetVisible = assetSetting && assetSetting.visible;
  const isAssetFungible = _isAssetFungibleToken(chainAsset);
  const isOriginChainActive = chainStateMap[chainAsset.originChain]?.active;
  const isValidLedger = ledgerNetwork ? ledgerNetwork === chainAsset.originChain : true; // Check if have ledger network

  if (filterActiveChain) {
    return isAssetVisible && isAssetFungible && isOriginChainActive && isValidLedger;
  }

  return isAssetVisible && isAssetFungible && isValidLedger;
}

export function getExcludedTokensForSubstrateEcdsa (chainAssets: _ChainAsset[], chainSlugList: string[], chainInfoMap: Record<string, _ChainInfo>): string[] {
  const chainListAllowed = new Set(
    chainSlugList.filter((slug) => _isSubstrateEvmCompatibleChain(chainInfoMap[slug]))
  );

  return chainAssets
    .filter((chainAsset) => {
      const originChain = _getAssetOriginChain(chainAsset);

      return chainListAllowed.has(originChain) && !isSubstrateEcdsaLedgerAssetSupported(chainAsset, chainInfoMap[originChain]);
    })
    .map((chainAsset) => chainAsset.slug);
}

export function getExcludedTokensForLedgerEvm (chainAssets: _ChainAsset[], chainSlugList: string[], chainInfoMap: Record<string, _ChainInfo>): string[] {
  const chainListAllowed = new Set(
    chainSlugList.filter((slug) => !_isChainCompatibleLedgerEvm(chainInfoMap[slug]))
  );

  return chainAssets
    .filter((chainAsset) => {
      const originChain = _getAssetOriginChain(chainAsset);

      return chainListAllowed.has(originChain);
    })
    .map((chainAsset) => chainAsset.slug);
}
