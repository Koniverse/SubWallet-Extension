// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { _BALANCE_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetOriginChain, _isAssetFungibleToken, _isChainCompatibleLedgerEvm, _isNativeToken, _isSubstrateEvmCompatibleChain } from '@subwallet/extension-base/services/chain-service/utils';
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

/**
 * The purpose of this function is to exclude tokens from non-EVM chains
 * and those with a chain ID smaller than 1, for example: Mythos, Muse,... .
 */
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

// Get display string for asset
export function getAssetDisplay (assetInfo?: _ChainAsset, defaultDisplay?: string): string | undefined {
  if (!assetInfo) {
    return defaultDisplay;
  }

  // Is subnet token asset of bittensor chain
  if (_BALANCE_CHAIN_GROUP.bittensor.includes(assetInfo.originChain) && !_isNativeToken(assetInfo) && assetInfo.metadata?.netuid != null) {
    return `SN${assetInfo.metadata?.netuid} | ${assetInfo.name} ${assetInfo.symbol}`;
  }

  return defaultDisplay;
}
