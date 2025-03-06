// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_ASSETS, COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getFungibleAssetType, _getMultiChainAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { CHAINFLIP_BROKER_API } from '@subwallet/extension-base/services/swap-service/handler/chainflip-handler';
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
  [SwapProviderId.HYDRADX_TESTNET]: [COMMON_CHAIN_SLUGS.HYDRADX_TESTNET],
  [SwapProviderId.CHAIN_FLIP_MAINNET]: [COMMON_CHAIN_SLUGS.POLKADOT, COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.ARBITRUM],
  [SwapProviderId.CHAIN_FLIP_TESTNET]: [COMMON_CHAIN_SLUGS.CHAINFLIP_POLKADOT, COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA],
  [SwapProviderId.POLKADOT_ASSET_HUB]: [COMMON_CHAIN_SLUGS.POLKADOT_ASSET_HUB],
  [SwapProviderId.KUSAMA_ASSET_HUB]: [COMMON_CHAIN_SLUGS.KUSAMA_ASSET_HUB],
  [SwapProviderId.ROCOCO_ASSET_HUB]: [COMMON_CHAIN_SLUGS.ROCOCO_ASSET_HUB],
  [SwapProviderId.WESTEND_ASSET_HUB]: ['westend_assethub'],
  [SwapProviderId.SIMPLE_SWAP]: ['bittensor', COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.POLKADOT]
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

export function generateSwapPairs (substrateApi: _SubstrateApi, chainService: ChainService, fromAsset: _ChainAsset, maxPathLength = 1) {
  if (maxPathLength < 1) {
    return [];
  }

  let currentTargets: _ChainAsset[] = [];
  let newTargets: _ChainAsset[] = [];
  let currentStep = 1;

  // step 1:
  newTargets = findDestinations(chainService, fromAsset);
  currentTargets = mergeWithoutDuplicate<_ChainAsset>(currentTargets, newTargets);
  currentStep += 1;

  // step 2 - n
  while (currentStep <= maxPathLength) { // todo: improve by stop when nothing new
    newTargets = Array.from(newTargets.reduce((farChildTargets, currentTarget) => {
      const farChildTargetsLocal = findDestinations(chainService, currentTarget);

      return new Set([...farChildTargets, ...farChildTargetsLocal]);
    }, new Set<_ChainAsset>()));
    currentTargets = mergeWithoutDuplicate<_ChainAsset>(currentTargets, newTargets);
    currentStep += 1;
  }

  return currentTargets;
}

function findDestinations (chainService: ChainService, chainAsset: _ChainAsset) {
  const xcmTargets = findXcmDestinations(chainService, chainAsset);
  const swapTargets = findSwapDestinations(chainService, chainAsset);

  return mergeWithoutDuplicate<_ChainAsset>(xcmTargets, swapTargets);
}

function findXcmDestinations (chainService: ChainService, chainAsset: _ChainAsset) {
  const xcmTargets: _ChainAsset[] = [];
  const multichainAssetSlug = _getMultiChainAsset(chainAsset);

  if (!multichainAssetSlug) {
    return xcmTargets;
  }

  const assetRegistry = chainService.getAssetRegistry();

  for (const asset of Object.values(assetRegistry)) {
    if (multichainAssetSlug === _getMultiChainAsset(asset)) {
      xcmTargets.push(asset);
    }
  }

  return xcmTargets;
}

function findSwapDestinations (chainService: ChainService, chainAsset: _ChainAsset) {
  const chain = chainAsset.originChain;
  const swapTargets: _ChainAsset[] = [];

  const availableChains = Object.values(_PROVIDER_TO_SUPPORTED_PAIR_MAP).reduce((remainChains, currentChains) => {
    if (currentChains.includes(chain)) {
      currentChains.forEach((candidate) => {
        remainChains.add(candidate);
      });
    }

    return remainChains;
  }, new Set<string>());

  availableChains.forEach((candidate) => {
    const assets = chainService.getAssetByChainAndType(candidate, _getFungibleAssetType()); // todo: recheck assetType

    swapTargets.push(...Object.values(assets));
  });

  return swapTargets;
}

// @ts-ignore
export function findSwapDestinationsV2 (chainService: ChainService, chainAsset: _ChainAsset) {
  const chain = chainAsset.originChain;
  const swapTargets: _ChainAsset[] = [];

  // Convert to Set once at the start
  const availableChains = new Set<string>(
    Object.values(_PROVIDER_TO_SUPPORTED_PAIR_MAP)
      .filter((chains) => chains.includes(chain))
      .flat()
  );

  // Use Set for O(1) lookup instead of includes()
  for (const candidate of availableChains) {
    const assets = chainService.getAssetByChainAndType(
      candidate,
      _getFungibleAssetType()
    );

    swapTargets.push(...Object.values(assets));
  }

  return swapTargets;
}

// @ts-ignore
async function isHasXcmChannelSubstrate (substrateApi: _SubstrateApi, fromChain: _ChainInfo, toChain: _ChainInfo) {
  const channel = await substrateApi.api.query.hrmp.hrmpChainnels(fromChain.substrateInfo?.paraId, toChain.substrateInfo?.paraId);

  return !!channel.toPrimitive();
}

// @ts-ignore
export async function getAllXcmChannelSubstrate (substrateApi: _SubstrateApi) {
  const channels = await substrateApi.api.query.hrmp?.hrmpChannels?.keys();
  const allKeys = [];

  for (const key of channels) {
    allKeys.push(key.args[0].toPrimitive());
  }

  return allKeys;
}

// todo: improve
// function isHasBridgeChanel ()

function mergeWithoutDuplicate<T> (arr1: T[], arr2: T[]): T[] {
  return Array.from(new Set([...arr1, ...arr2]));
}
