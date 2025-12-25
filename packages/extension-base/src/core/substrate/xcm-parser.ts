// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { isAvailChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { _isBittensorToSubtensorBridge, _isSubtensorToBittensorBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/bittensorBridge/nativeTokenBridge';
import { _isPolygonChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import { _isPosChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';
import { _getSubstrateRelayParent, _isPureEvmChain } from '@subwallet/extension-base/services/chain-service/utils';

export function _isXcmTransferUnstable (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo, assetSlug: string): boolean {
  return (
    !_isBittensorToSubtensorEvmBridge(originChainInfo, destChainInfo) && !_isSubtensorEvmtoBittensorBridge(originChainInfo, destChainInfo) &&
    (!_isXcmWithinSameConsensus(originChainInfo, destChainInfo) ||
    _isMythosFromHydrationToMythos(originChainInfo, destChainInfo, assetSlug) ||
     _isPolygonBridgeXcm(originChainInfo, destChainInfo) ||
     _isPosBridgeXcm(originChainInfo, destChainInfo)));
}

function getAssetHubBridgeUnstableWarning (originChainInfo: _ChainInfo): string {
  switch (originChainInfo.slug) {
    case COMMON_CHAIN_SLUGS.POLKADOT_ASSET_HUB:
      return 'Cross-chain transfer of this token is not recommended as it is in beta and incurs a transaction fee of 2 DOT. Continue at your own risk';
    case COMMON_CHAIN_SLUGS.KUSAMA_ASSET_HUB:
      return 'Cross-chain transfer of this token is not recommended as it is in beta and incurs a transaction fee of 0.4 KSM. Continue at your own risk';
    default:
      return 'Cross-chain transfer of this token is not recommended as it is in beta and incurs a large transaction fee. Continue at your own risk';
  }
}

function getSnowBridgeUnstableWarning (originChainInfo: _ChainInfo): string {
  switch (originChainInfo.slug) {
    case COMMON_CHAIN_SLUGS.POLKADOT_ASSET_HUB:
      return 'Cross-chain transfer of this token is not recommended as it is in beta, incurs a fee of $70 and takes up to 1 hour to complete. Continue at your own risk';
    case COMMON_CHAIN_SLUGS.ETHEREUM:
      return 'Cross-chain transfer of this token is not recommended as it is in beta, incurs a fee of $5 and takes up to 1 hour to complete. Continue at your own risk';
    default:
      return 'Cross-chain transfer of this token is not recommended as it is in beta, incurs a high fee and takes up to 1 hour to complete. Continue at your own risk';
  }
}

function getMythosFromHydrationToMythosWarning (): string {
  return 'Cross-chain transfer of this token requires a high transaction fee. Do you want to continue?';
}

function getAvailBridgeWarning (): string {
  return 'Cross-chain transfer of this token may take up to 90 minutes, and you’ll need to manually claim the funds on the destination network to complete the transfer. Do you still want to continue?';
}

function getPolygonBridgeWarning (originChainInfo: _ChainInfo): string {
  if (originChainInfo.slug === COMMON_CHAIN_SLUGS.ETHEREUM || originChainInfo.slug === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA) {
    return 'Cross-chain transfer of this token may take up to 40 minutes. Do you still want to continue?';
  } else {
    return 'Cross-chain transfer of this token may take up to 3 hours, and you’ll need to manually claim the funds on the destination network to complete the transfer. Do you still want to continue?';
  }
}

function getPosBridgeWarning (originChainInfo: _ChainInfo): string {
  if (originChainInfo.slug === COMMON_CHAIN_SLUGS.ETHEREUM || originChainInfo.slug === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA) {
    return 'Cross-chain transfer of this token may take up to 22 minutes. Do you still want to continue?';
  } else {
    return 'Cross-chain transfer of this token may take up to 90 minutes, and you’ll need to manually claim the funds on the destination network to complete the transfer. Do you still want to continue?';
  }
}

export function _getXcmUnstableWarning (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo, assetSlug: string): string {
  if (_isPosBridgeXcm(originChainInfo, destChainInfo)) {
    return getPosBridgeWarning(originChainInfo);
  } else if (_isPolygonBridgeXcm(originChainInfo, destChainInfo)) {
    return getPolygonBridgeWarning(originChainInfo);
  } else if (_isAvailBridgeXcm(originChainInfo, destChainInfo)) {
    return getAvailBridgeWarning();
  } else if (_isSnowBridgeXcm(originChainInfo, destChainInfo)) {
    return getSnowBridgeUnstableWarning(originChainInfo);
  } else if (_isMythosFromHydrationToMythos(originChainInfo, destChainInfo, assetSlug)) {
    return getMythosFromHydrationToMythosWarning();
  } else {
    return getAssetHubBridgeUnstableWarning(originChainInfo);
  }
}

export function _isXcmWithinSameConsensus (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return _getSubstrateRelayParent(originChainInfo) === destChainInfo.slug || _getSubstrateRelayParent(destChainInfo) === originChainInfo.slug || _getSubstrateRelayParent(originChainInfo) === _getSubstrateRelayParent(destChainInfo);
}

export function _isSnowBridgeXcm (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return !_isXcmWithinSameConsensus(originChainInfo, destChainInfo) && (_isPureEvmChain(originChainInfo) || _isPureEvmChain(destChainInfo));
}

export function _isAvailBridgeXcm (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  const isAvailBridgeFromEvm = _isPureEvmChain(originChainInfo) && isAvailChainBridge(destChainInfo.slug);
  const isAvailBridgeFromAvail = isAvailChainBridge(originChainInfo.slug) && _isPureEvmChain(destChainInfo);

  return isAvailBridgeFromEvm || isAvailBridgeFromAvail;
}

export function _isMythosFromHydrationToMythos (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo, assetSlug: string): boolean {
  return originChainInfo.slug === 'hydradx_main' && destChainInfo.slug === 'mythos' && assetSlug === 'hydradx_main-LOCAL-MYTH';
}

export function _isPolygonBridgeXcm (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return _isPolygonChainBridge(originChainInfo.slug, destChainInfo.slug);
}

export function _isPosBridgeXcm (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return _isPosChainBridge(originChainInfo.slug, destChainInfo.slug);
}

export function _isAcrossBridgeXcm (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return _isAcrossChainBridge(originChainInfo.slug, destChainInfo.slug);
}

export function _isBittensorToSubtensorEvmBridge (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return _isBittensorToSubtensorBridge(originChainInfo.slug, destChainInfo.slug);
}

export function _isSubtensorEvmtoBittensorBridge (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo): boolean {
  return _isSubtensorToBittensorBridge(originChainInfo.slug, destChainInfo.slug);
}

// ---------------------------------------------------------------------------------------------------------------------

export function _adaptX1Interior (_assetIdentifier: Record<string, any>, version: number): Record<string, any> {
  const assetIdentifier = structuredClone(_assetIdentifier);
  const interior = assetIdentifier.interior as Record<string, any>;
  const isInteriorObj = typeof interior === 'object' && interior !== null;
  const isX1 = isInteriorObj && 'X1' in interior;
  const needModifyX1 = version < 4 && Array.isArray(interior.X1);

  if (isInteriorObj && isX1 && needModifyX1) { // X1 is an object for version < 4. From V4, it's an array
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    interior.X1 = interior.X1[0];
  }

  return assetIdentifier;
}
