// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getAssetNetuid, _getContractAddressOfToken, _isNativeToken, _isSubstrateEvmCompatibleChain, _isTokenTransferredByEvm } from '@subwallet/extension-base/services/chain-service/utils';

export const filterAssetsByChainAndType = (chainAssetMap: Record<string, _ChainAsset>, chain: string, assetTypes: _AssetType[]): Record<string, _ChainAsset> => {
  const result: Record<string, _ChainAsset> = {};

  Object.values(chainAssetMap).forEach((assetInfo) => {
    if (assetTypes.includes(assetInfo.assetType) && assetInfo.originChain === chain) {
      result[assetInfo.slug] = assetInfo;
    }
  });

  return result;
};

export const filterAlphaAssetsByChain = (chainAssetMap: Record<string, _ChainAsset>, chain: string): Record<string, _ChainAsset> => {
  const result: Record<string, _ChainAsset> = {};

  Object.values(chainAssetMap).forEach((assetInfo) => {
    if (assetInfo.assetType === _AssetType.LOCAL && assetInfo.originChain === chain) {
      const netuid = _getAssetNetuid(assetInfo);

      if (netuid !== -1) {
        result[assetInfo.slug] = assetInfo;
      }
    }
  });

  return result;
};

export const isSubstrateEcdsaLedgerAssetSupported = (chainsAsset: _ChainAsset, chainInfo: _ChainInfo) => {
  if (!_isSubstrateEvmCompatibleChain(chainInfo)) {
    return false;
  }

  return _isNativeToken(chainsAsset) || !_getContractAddressOfToken(chainsAsset);
};
