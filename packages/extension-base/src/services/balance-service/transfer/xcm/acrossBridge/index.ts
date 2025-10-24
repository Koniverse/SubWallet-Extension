// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _isAcrossBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

import { CreateXcmExtrinsicProps } from '..';

// Across Bridge
const acrossPairsMap = new Map([
  [COMMON_CHAIN_SLUGS.ETHEREUM, new Set(['optimism', 'base_mainnet', 'arbitrum_one'])],
  ['optimism', new Set([COMMON_CHAIN_SLUGS.ETHEREUM, 'base_mainnet', 'arbitrum_one'])],
  ['base_mainnet', new Set([COMMON_CHAIN_SLUGS.ETHEREUM, 'optimism', 'arbitrum_one'])],
  ['arbitrum_one', new Set([COMMON_CHAIN_SLUGS.ETHEREUM, 'optimism', 'base_mainnet'])],
  [COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA, new Set(['base_sepolia', 'arbitrum_sepolia'])], // TESTNET START HERE
  ['base_sepolia', new Set([COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA])],
  ['arbitrum_sepolia', new Set([COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA])]
]);

export function _isAcrossChainBridge (srcChain: string, destChain: string): boolean {
  return acrossPairsMap.get(srcChain)?.has(destChain) ?? false;
}

export function _isAcrossTestnetBridge (srcChain: string): boolean {
  return srcChain === 'base_sepolia' || srcChain === 'arbitrum_sepolia' || srcChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA;
}

export interface AcrossQuote {
  outputAmount: string;
  rate: string;
}

interface XcmApiResponse {
  sender: string;
  to: string;
  transferEncodedCall: string;
  value: string;
  metadata?: any;
}

// Calculate fee for across bridge transfer
export const getAcrossQuote = async ({ destinationChain,
  destinationTokenInfo,
  originChain,
  originTokenInfo,
  recipient,
  sender,
  sendingValue }: CreateXcmExtrinsicProps) => {
  const isAcrossBridgeXcm = _isAcrossBridgeXcm(originChain, destinationChain);

  if (!isAcrossBridgeXcm) {
    throw new Error('This is not a valid AcrossBridge transfer');
  }

  if (!sender) {
    throw new Error('Sender is required');
  }

  try {
    const data = await subwalletApiSdk.xcmApi.fetchXcmData({
      address: sender,
      from: originTokenInfo.slug,
      to: destinationTokenInfo.slug,
      recipient,
      value: sendingValue
    });

    if (!data) {
      return Promise.reject(new Error('Failed to fetch Across Bridge Data. Please try again later'));
    }

    return data as XcmApiResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Promise.reject(new Error('Unable to perform this transaction at the moment. Try again later'));
    }

    return Promise.reject(new Error((error as Error)?.message || 'Unable to perform this transaction at the moment. Try again later'));
  }
};
