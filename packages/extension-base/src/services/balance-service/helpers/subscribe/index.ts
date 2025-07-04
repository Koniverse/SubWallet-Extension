// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { APIItemState, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { subscribeBitcoinBalance } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/bitcoin';
import { subscribeCardanoBalance } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano';
import { _BitcoinApi, _CardanoApi, _EvmApi, _SubstrateApi, _TonApi } from '@subwallet/extension-base/services/chain-service/types';
import { _isPureBitcoinChain, _isPureCardanoChain, _isPureEvmChain, _isPureTonChain } from '@subwallet/extension-base/services/chain-service/utils';
import { BalanceItem } from '@subwallet/extension-base/types';
import { filterAddressByChainInfo, filterAssetsByChainAndType } from '@subwallet/extension-base/utils';

import { subscribeTonBalance } from './ton/ton';
import { subscribeEVMBalance } from './evm';
import { subscribeSubstrateBalance } from './substrate';

const handleUnsupportedOrPendingAddresses = (
  addresses: string[],
  chainSlug: string,
  chainAssetMap: Record<string, _ChainAsset>,
  state: APIItemState,
  callback: (rs: BalanceItem[]) => void
) => {
  const tokens = filterAssetsByChainAndType(chainAssetMap, chainSlug, [
    _AssetType.NATIVE,
    _AssetType.ERC20,
    _AssetType.PSP22,
    _AssetType.LOCAL,
    _AssetType.GRC20,
    _AssetType.VFT,
    _AssetType.TEP74,
    _AssetType.CIP26
  ]);

  const now = new Date().getTime();

  Object.values(tokens).forEach((token) => {
    const items: BalanceItem[] = addresses.map((address): BalanceItem => ({
      address,
      tokenSlug: token.slug,
      free: '0',
      locked: '0',
      state,
      timestamp: now
    }));

    callback(items);
  });
};

// main subscription, use for multiple chains, multiple addresses and multiple tokens
export function subscribeBalance (
  addresses: string[],
  chains: string[],
  tokens: string[],
  _chainAssetMap: Record<string, _ChainAsset>,
  _chainInfoMap: Record<string, _ChainInfo>,
  substrateApiMap: Record<string, _SubstrateApi>,
  evmApiMap: Record<string, _EvmApi>,
  tonApiMap: Record<string, _TonApi>,
  cardanoApiMap: Record<string, _CardanoApi>,
  bitcoinApiMap: Record<string, _BitcoinApi>,
  callback: (rs: BalanceItem[]) => void,
  extrinsicType?: ExtrinsicType
) {
  // Filter chain and token
  const chainAssetMap: Record<string, _ChainAsset> = Object.fromEntries(Object.entries(_chainAssetMap).filter(([token]) => tokens.includes(token)));
  const chainInfoMap: Record<string, _ChainInfo> = Object.fromEntries(Object.entries(_chainInfoMap).filter(([chain]) => chains.includes(chain)));

  // Looping over each chain
  const unsubList = Object.values(chainInfoMap).map(async (chainInfo) => {
    const chainSlug = chainInfo.slug;
    const [useAddresses, notSupportAddresses] = filterAddressByChainInfo(addresses, chainInfo);

    if (notSupportAddresses.length) {
      handleUnsupportedOrPendingAddresses(
        notSupportAddresses,
        chainSlug,
        chainAssetMap,
        APIItemState.NOT_SUPPORT,
        callback
      );
    }

    const evmApi = evmApiMap[chainSlug];

    if (_isPureEvmChain(chainInfo)) {
      return subscribeEVMBalance({
        addresses: useAddresses,
        assetMap: chainAssetMap,
        callback,
        chainInfo,
        evmApi
      });
    }

    const tonApi = tonApiMap[chainSlug];

    if (_isPureTonChain(chainInfo)) {
      return subscribeTonBalance({
        addresses: useAddresses,
        assetMap: chainAssetMap,
        callback,
        chainInfo,
        tonApi
      });
    }

    const cardanoApi = cardanoApiMap[chainSlug];

    if (_isPureCardanoChain(chainInfo)) {
      return subscribeCardanoBalance({
        addresses: useAddresses,
        assetMap: chainAssetMap,
        callback,
        chainInfo,
        cardanoApi
      });
    }

    const bitcoinApi = bitcoinApiMap[chainSlug];

    if (_isPureBitcoinChain(chainInfo)) {
      return subscribeBitcoinBalance({
        addresses: useAddresses,
        assetMap: chainAssetMap,
        bitcoinApi,
        callback,
        chainInfo
      });
    }

    // If the chain is not ready, return pending state
    if (!substrateApiMap[chainSlug].isApiReady) {
      handleUnsupportedOrPendingAddresses(
        useAddresses,
        chainSlug,
        chainAssetMap,
        APIItemState.PENDING,
        callback
      );
    }

    const substrateApi = await substrateApiMap[chainSlug].isReady;

    return subscribeSubstrateBalance(useAddresses, chainInfo, chainAssetMap, substrateApi, evmApi, callback, extrinsicType);
  });

  return () => {
    unsubList.forEach((subProm) => {
      subProm.then((unsub) => {
        unsub && unsub();
      }).catch(console.error);
    });
  };
}
