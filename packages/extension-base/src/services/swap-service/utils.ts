// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_ASSETS, COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _AssetRef, _AssetRefPath, _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { CHAINFLIP_BROKER_API } from '@subwallet/extension-base/services/swap-service/handler/chainflip-handler';
import { DynamicSwapAction, DynamicSwapType } from '@subwallet/extension-base/services/swap-service/interface';
import { SwapPair, SwapProviderId } from '@subwallet/extension-base/types/swap';
import BigN from 'bignumber.js';

export const CHAIN_FLIP_TESTNET_EXPLORER = 'https://blocks-perseverance.chainflip.io';
export const CHAIN_FLIP_MAINNET_EXPLORER = 'https://scan.chainflip.io';

export const SIMPLE_SWAP_EXPLORER = 'https://simpleswap.io';

export const SIMPLE_SWAP_SUPPORTED_TESTNET_ASSET_MAPPING: Record<string, string> = {
  'bittensor-NATIVE-TAO': 'tao',
  [COMMON_ASSETS.ETH]: 'eth',
  [COMMON_ASSETS.DOT]: 'dot',
  [COMMON_ASSETS.USDC_ETHEREUM]: 'usdc',
  [COMMON_ASSETS.USDT_ETHEREUM]: 'usdterc20'
};

export const SWAP_QUOTE_TIMEOUT_MAP: Record<string, number> = { // in milliseconds
  default: 30000,
  [SwapProviderId.CHAIN_FLIP_TESTNET]: 30000,
  [SwapProviderId.CHAIN_FLIP_MAINNET]: 30000
};

export const _PROVIDER_TO_SUPPORTED_PAIR_MAP: Record<string, string[]> = {
  [SwapProviderId.HYDRADX_MAINNET]: [COMMON_CHAIN_SLUGS.HYDRADX],
  [SwapProviderId.CHAIN_FLIP_MAINNET]: [COMMON_CHAIN_SLUGS.POLKADOT, COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.ARBITRUM],
  [SwapProviderId.POLKADOT_ASSET_HUB]: [COMMON_CHAIN_SLUGS.POLKADOT_ASSET_HUB],
  [SwapProviderId.KUSAMA_ASSET_HUB]: [COMMON_CHAIN_SLUGS.KUSAMA_ASSET_HUB],
  [SwapProviderId.SIMPLE_SWAP]: ['bittensor', COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.POLKADOT],
  [SwapProviderId.UNISWAP]: [COMMON_CHAIN_SLUGS.ETHEREUM],

  // testnet
  [SwapProviderId.CHAIN_FLIP_TESTNET]: [COMMON_CHAIN_SLUGS.CHAINFLIP_POLKADOT, COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA],
  [SwapProviderId.HYDRADX_TESTNET]: [COMMON_CHAIN_SLUGS.HYDRADX_TESTNET],
  [SwapProviderId.ROCOCO_ASSET_HUB]: [COMMON_CHAIN_SLUGS.ROCOCO_ASSET_HUB],
  [SwapProviderId.WESTEND_ASSET_HUB]: ['westend_assethub']
};

export function getSwapAlternativeAsset (swapPair: SwapPair): string | undefined {
  return swapPair?.metadata?.alternativeAsset as string;
}

export function getSwapAltToken (chainAsset: _ChainAsset): string | undefined {
  return chainAsset.metadata?.alternativeSwapAsset as string;
}

export function calculateSwapRate (fromAmount: string, toAmount: string, fromAsset: _ChainAsset, toAsset: _ChainAsset) {
  const bnFromAmount = new BigN(fromAmount);
  const bnToAmount = new BigN(toAmount);

  const decimalDiff = _getAssetDecimals(toAsset) - _getAssetDecimals(fromAsset);
  const bnRate = bnFromAmount.div(bnToAmount);

  return 1 / bnRate.times(10 ** decimalDiff).toNumber();
}

export function convertSwapRate (rate: string, fromAsset: _ChainAsset, toAsset: _ChainAsset) {
  const decimalDiff = _getAssetDecimals(toAsset) - _getAssetDecimals(fromAsset);
  const bnRate = new BigN(rate);

  return bnRate.times(10 ** decimalDiff).pow(-1).toNumber();
}

export function getChainflipOptions (isTestnet: boolean) {
  if (isTestnet) {
    return {
      network: getChainflipNetwork(isTestnet)
    };
  }

  return {
    network: getChainflipNetwork(isTestnet),
    broker: getChainflipBroker(isTestnet)
  };
}

function getChainflipNetwork (isTestnet: boolean) {
  return isTestnet ? 'perseverance' : 'mainnet';
}

export function getChainflipBroker (isTestnet: boolean) { // noted: currently not use testnet broker
  if (isTestnet) {
    return {
      url: `https://perseverance.chainflip-broker.io/rpc/${CHAINFLIP_BROKER_API}`
    };
  } else {
    return {
      url: `https://chainflip-broker.io/rpc/${CHAINFLIP_BROKER_API}`
    };
  }
}

export function getChainflipSwap (isTestnet: boolean) {
  if (isTestnet) {
    return `https://perseverance.chainflip-broker.io/swap?apikey=${CHAINFLIP_BROKER_API}`;
  } else {
    return `https://chainflip-broker.io/swap?apikey=${CHAINFLIP_BROKER_API}`;
  }
}

export function getBridgeStep (from: string, to: string): DynamicSwapAction {
  return {
    action: DynamicSwapType.BRIDGE,
    pair: {
      slug: `${from}___${to}`,
      from,
      to
    }
  };
}

export function getSwapStep (from: string, to: string): DynamicSwapAction {
  return {
    action: DynamicSwapType.SWAP,
    pair: {
      slug: `${from}___${to}`,
      from,
      to
    }
  };
}

export function findXcmDestination (assetRefMap: Record<string, _AssetRef>, chainAsset: _ChainAsset, destChain: string) {
  const foundAssetRef = Object.values(assetRefMap).find((assetRef) =>
    assetRef.srcAsset === chainAsset.slug &&
    assetRef.destChain === destChain &&
    assetRef.path === _AssetRefPath.XCM
  );

  if (foundAssetRef) {
    return foundAssetRef.destAsset;
  }

  return undefined;
}

export function isChainsHasSameProvider (fromChain: string, toChain: string) {
  // todo: a provider may support multiple chains but not cross-chain swaps
  for (const group of Object.values(_PROVIDER_TO_SUPPORTED_PAIR_MAP)) {
    if (group.includes(fromChain) && group.includes(toChain)) {
      return true;
    }
  }

  return false;
}
