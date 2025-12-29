// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getBlockExplorerFromChain, _isChainTestNet, _isPureBitcoinChain, _isPureCardanoChain, _isPureEvmChain, _isPureTonChain } from '@subwallet/extension-base/services/chain-service/utils';
import { CHAIN_FLIP_MAINNET_EXPLORER, CHAIN_FLIP_TESTNET_EXPLORER, SIMPLE_SWAP_EXPLORER } from '@subwallet/extension-base/services/swap-service/utils';
import { ChainflipSwapTxData, SimpleSwapTxData } from '@subwallet/extension-base/types/swap';

import { hexAddPrefix, isHex, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { fetchStaticData } from "@subwallet/extension-base/utils";
import { blockExplorerRouteMap } from "@subwallet/extension-base/utils/staticData";

interface ExplorerRouteMap {
  default: string;
  domains: Record<string, string>;
  slugs?: Record<string, string>;
}

export interface ExplorerRoute {
  account: ExplorerRouteMap;
  extrinsic: ExplorerRouteMap;
}

// @ts-ignore
export function parseTransactionData<T extends ExtrinsicType> (data: unknown): ExtrinsicDataTypeMap[T] {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data as ExtrinsicDataTypeMap[T];
}

export function getLatestExplorerRouteMap(): ExplorerRoute {
  let cachedExplorerRouteMap= blockExplorerRouteMap;

  fetchStaticData<ExplorerRoute>('chains/block-explorer-route-map')
    .then((data) => {
      if (data) {
        cachedExplorerRouteMap = data;
      }
    })

  return cachedExplorerRouteMap;
}

function getBlockExplorerAccountRoute (explorerLink: string) {
  const blockExplorerAccountRoute = getLatestExplorerRouteMap().account;

  for (const [domain, route] of Object.entries(blockExplorerAccountRoute.domains)) {
    if (explorerLink.includes(domain)) {
      return route;
    }
  }

  return blockExplorerAccountRoute.default;
}

function getBlockExplorerTxRoute(chainInfo: _ChainInfo) {
  const blockExplorerExtrinsicRoute = getLatestExplorerRouteMap().extrinsic;

  if (_isPureEvmChain(chainInfo) || _isPureBitcoinChain(chainInfo)) {
    return 'tx';
  }

  if (_isPureCardanoChain(chainInfo) || _isPureTonChain(chainInfo)) {
    return 'transaction';
  }

  if (blockExplorerExtrinsicRoute.slugs) {
    const slugRoute = blockExplorerExtrinsicRoute.slugs[chainInfo.slug];

    if (slugRoute) {
      return slugRoute;
    }
  }

  const explorerLink = _getBlockExplorerFromChain(chainInfo);
  if (explorerLink) {
    for (const [domain, route] of Object.entries(blockExplorerExtrinsicRoute.domains)) {
      if (explorerLink.includes(domain)) {
        return route;
      }
    }
  }

  return blockExplorerExtrinsicRoute.default;
}

export function getExplorerLink (chainInfo: _ChainInfo, value: string, type: 'account' | 'tx'): string | undefined {
  const explorerLink = _getBlockExplorerFromChain(chainInfo);

  if (explorerLink && type === 'account') {
    const route = getBlockExplorerAccountRoute(explorerLink);

    if (['truth_network', 'aventus'].includes(chainInfo.slug)) {
      const address = u8aToHex(decodeAddress(value));

      return `${explorerLink}${explorerLink.endsWith('/') ? '' : '/'}${route}/${address}`;
    }

    return `${explorerLink}${explorerLink.endsWith('/') ? '' : '/'}${route}/${value}`;
  }

  if (explorerLink && isHex(hexAddPrefix(value))) {
    const route = getBlockExplorerTxRoute(chainInfo);

    if (chainInfo.slug === 'tangle') {
      return (`${explorerLink}${explorerLink.endsWith('/') ? '' : '/'}extrinsic/${value}${route}/${value}`);
    }

    if (chainInfo.slug === 'xode') {
      return (`${explorerLink}${explorerLink.endsWith('/') ? '' : '/'}polkadot-chain-transaction?search=${value}`);
    }

    if (['truth_network', 'aventus'].includes(chainInfo.slug)) {
      return undefined;
    }

    return (`${explorerLink}${explorerLink.endsWith('/') ? '' : '/'}${route}/${value}`);
  }

  return undefined;
}

export function getChainflipExplorerLink (data: ChainflipSwapTxData, chainInfo: _ChainInfo) {
  const chainflipDomain = _isChainTestNet(chainInfo) ? CHAIN_FLIP_TESTNET_EXPLORER : CHAIN_FLIP_MAINNET_EXPLORER;

  return `${chainflipDomain}/channels/${data.depositChannelId}`;
}

export function getSimpleSwapExplorerLink (data: SimpleSwapTxData) {
  return `${SIMPLE_SWAP_EXPLORER}/exchange?id=${data.id}`;
}
