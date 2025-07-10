// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getBlockExplorerFromChain, _isChainTestNet, _isPureBitcoinChain, _isPureCardanoChain, _isPureEvmChain, _isPureTonChain } from '@subwallet/extension-base/services/chain-service/utils';
import { CHAIN_FLIP_MAINNET_EXPLORER, CHAIN_FLIP_TESTNET_EXPLORER, SIMPLE_SWAP_EXPLORER } from '@subwallet/extension-base/services/swap-service/utils';
import { ChainflipSwapTxData, SimpleSwapTxData } from '@subwallet/extension-base/types/swap';

import { hexAddPrefix, isHex, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

// @ts-ignore
export function parseTransactionData<T extends ExtrinsicType> (data: unknown): ExtrinsicDataTypeMap[T] {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data as ExtrinsicDataTypeMap[T];
}

function getBlockExplorerAccountRoute (explorerLink: string) {
  if (explorerLink.includes('explorer.subspace.network')) {
    return 'accounts';
  }

  if (explorerLink.includes('deeperscan.io')) {
    return 'account';
  }

  if (explorerLink.includes('subscan.io')) {
    return 'account';
  }

  if (explorerLink.includes('3dpscan.io')) {
    return 'account';
  }

  if (explorerLink.includes('statescan.io')) {
    return '#/accounts';
  }

  if (explorerLink.includes('explorer.gen6.app')) {
    return '#/accounts';
  }

  if (explorerLink.includes('astral.autonomys')) {
    return 'accounts';
  }

  if (explorerLink.includes('taostats.io')) {
    return 'account';
  }

  if (explorerLink.includes('tonviewer.com')) {
    return '';
  }

  if (explorerLink.includes('devnet-explorer.mosaicchain.io')) {
    return 'accounts';
  }

  return 'address';
}

function getBlockExplorerTxRoute (chainInfo: _ChainInfo) {
  if (_isPureEvmChain(chainInfo) || _isPureBitcoinChain(chainInfo)) {
    return 'tx';
  }

  if (_isPureCardanoChain(chainInfo) || _isPureTonChain(chainInfo)) {
    return 'transaction';
  }

  if (['aventus', 'deeper_network'].includes(chainInfo.slug)) {
    return 'transaction';
  }

  if (['gen6_public'].includes(chainInfo.slug)) {
    return '#/extrinsics';
  }

  if (['mosaicTest'].includes(chainInfo.slug)) {
    return 'transactions';
  }

  const explorerLink = _getBlockExplorerFromChain(chainInfo);

  if (explorerLink && explorerLink.includes('statescan.io')) {
    return '#/extrinsics';
  }

  return 'extrinsic';
}

// export function getTransactionId (value: string): Promise<string> {
//   const query = `
//     query ExtrinsicQuery {
//       extrinsics(where: {hash_eq: ${value}}, limit: 1) {
//         id
//       }
//     }`;
//
//   const apiUrl = 'https://archive-explorer.truth-network.io/graphql';
//
//   return fetch(apiUrl, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ query })
//   })
//     .then((response) => response.json())
//     .then((result: SWApiResponse<ExtrinsicsDataResponse>) => result.data.extrinsics[0].id);
// }

export function getExplorerLink (chainInfo: _ChainInfo, value: string, type: 'account' | 'tx'): string | undefined {
  const explorerLink = _getBlockExplorerFromChain(chainInfo);

  if (explorerLink && type === 'account') {
    const route = getBlockExplorerAccountRoute(explorerLink);

    if (chainInfo.slug === 'truth_network') {
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

    if (chainInfo.slug === 'truth_network') {
      // getTransactionId(value)
      //   .then((transactionId) => {
      //     return (`${explorerLink}${explorerLink.endsWith('/') ? '' : '/'}${route}/${transactionId}`);
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   });

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
