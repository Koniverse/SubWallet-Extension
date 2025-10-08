// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { _isAcrossBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { _getAssetDecimals, _getContractAddressOfToken, _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { BasicTxErrorType } from '@subwallet/extension-base/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import BigN from 'bignumber.js';

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

export const AcrossErrorMsg = {
  AMOUNT_TOO_LOW: 'amount too low',
  AMOUNT_TOO_HIGH: 'amount too high'
};

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
    const data = await subwalletApiSdk.bridgeApi.fetchBridgeData({
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

// TODO: update logic after add across metadata for chainlist
const acrossNativeTokenAddresses = {
  mainnet: {
    arbitrum_one: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    base_mainnet: '0x4200000000000000000000000000000000000006',
    ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    optimism: '0x4200000000000000000000000000000000000006'
  },
  testnet: {
    arbitrum_sepolia: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
    base_sepolia: '0x4200000000000000000000000000000000000006',
    sepolia_ethereum: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
  }
};

export const getAcrossSendingValue = async (originChain: _ChainInfo, originTokenInfo: _ChainAsset, destinationChain: _ChainInfo, isTestnet: boolean) => {
  try {
    const originChainId = _getEvmChainId(originChain);
    const destinationChainId = _getEvmChainId(destinationChain);

    if (!originChainId || !destinationChainId) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const contracts = isTestnet ? acrossNativeTokenAddresses.testnet : acrossNativeTokenAddresses.mainnet;
    const fromContract = _getContractAddressOfToken(originTokenInfo) || contracts[originTokenInfo.originChain as keyof typeof contracts];

    const acrossBridgeLimit = await subwalletApiSdk.bridgeApi.getAcrossBridgeLimit(originChainId, destinationChainId, fromContract, isTestnet);

    if (!acrossBridgeLimit.minDeposit || !acrossBridgeLimit.maxDeposit) {
      throw new Error('Invalid Across Bridge response');
    }

    const min = new BigN(acrossBridgeLimit.minDeposit);
    const max = new BigN(acrossBridgeLimit.maxDeposit);
    // Use the midpoint between minDeposit and maxDeposit as a balanced value used for estimating gas fee more accurately
    const sendingValue = min.plus(max).div(2).toFixed(0);

    return sendingValue;
  } catch (error) {
    console.error('Across Bridge error:', error);

    // fallback in case fetch API fail
    const defaultSendingAmount = isTestnet ? 0.0037 : 1;

    return new BigN(defaultSendingAmount).shiftedBy(_getAssetDecimals(originTokenInfo)).toFixed(0, BigN.ROUND_FLOOR);
  }
};
