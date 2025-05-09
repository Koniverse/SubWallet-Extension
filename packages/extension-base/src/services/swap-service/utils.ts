// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { COMMON_ASSETS, COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _AssetRef, _AssetRefPath, _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getAssetOriginChain, _getOriginChainOfAsset, _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { CHAINFLIP_BROKER_API } from '@subwallet/extension-base/services/swap-service/handler/chainflip-handler';
import { BaseSwapStepMetadata, CommonStepDetail, CommonStepType, DynamicSwapAction, DynamicSwapType, SwapStepType } from '@subwallet/extension-base/types';
import { SwapPair, SwapProviderId } from '@subwallet/extension-base/types/swap';
import BigN from 'bignumber.js';

export const CHAIN_FLIP_TESTNET_EXPLORER = 'https://blocks-perseverance.chainflip.io';
export const CHAIN_FLIP_MAINNET_EXPLORER = 'https://scan.chainflip.io';

export const TRANSAK_TEST_MODE = process.env.TRANSAK_TEST_MODE !== undefined ? !!process.env.TRANSAK_TEST_MODE : true;
export const TRANSAK_URL = TRANSAK_TEST_MODE ? 'https://global-stg.transak.com' : 'https://global.transak.com';

export const SIMPLE_SWAP_EXPLORER = 'https://simpleswap.io';

export const SIMPLE_SWAP_SUPPORTED_TESTNET_ASSET_MAPPING: Record<string, string> = {
  'bittensor-NATIVE-TAO': 'tao',
  [COMMON_ASSETS.ETH]: 'eth',
  [COMMON_ASSETS.DOT]: 'dot',
  [COMMON_ASSETS.USDC_ETHEREUM]: 'usdc',
  [COMMON_ASSETS.USDT_ETHEREUM]: 'usdterc20'
};

export const SWAP_QUOTE_TIMEOUT_MAP: Record<string, number> = { // in milliseconds
  default: 90000,
  [SwapProviderId.CHAIN_FLIP_TESTNET]: 30000,
  [SwapProviderId.CHAIN_FLIP_MAINNET]: 30000
};

export const _PROVIDER_TO_SUPPORTED_PAIR_MAP: Record<string, string[]> = {
  [SwapProviderId.HYDRADX_MAINNET]: [COMMON_CHAIN_SLUGS.HYDRADX],
  [SwapProviderId.CHAIN_FLIP_MAINNET]: [COMMON_CHAIN_SLUGS.POLKADOT, COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.ARBITRUM],
  [SwapProviderId.POLKADOT_ASSET_HUB]: [COMMON_CHAIN_SLUGS.POLKADOT_ASSET_HUB],
  [SwapProviderId.KUSAMA_ASSET_HUB]: [COMMON_CHAIN_SLUGS.KUSAMA_ASSET_HUB],
  [SwapProviderId.SIMPLE_SWAP]: ['bittensor', COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.POLKADOT],
  [SwapProviderId.UNISWAP]: [COMMON_CHAIN_SLUGS.ETHEREUM, COMMON_CHAIN_SLUGS.ARBITRUM],

  // testnet
  [SwapProviderId.CHAIN_FLIP_TESTNET]: [COMMON_CHAIN_SLUGS.CHAINFLIP_POLKADOT, COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA],
  [SwapProviderId.HYDRADX_TESTNET]: [COMMON_CHAIN_SLUGS.HYDRADX_TESTNET],
  [SwapProviderId.ROCOCO_ASSET_HUB]: [COMMON_CHAIN_SLUGS.ROCOCO_ASSET_HUB],
  [SwapProviderId.WESTEND_ASSET_HUB]: ['westend_assethub']
};

export const FEE_RATE_MULTIPLIER: Record<string, number> = {
  default: 1,
  medium: 1.2,
  high: 2
};

export function getSupportSwapChain (): string[] {
  return [...new Set<string>(Object.values(_PROVIDER_TO_SUPPORTED_PAIR_MAP).flat())];
}

export function getSwapAlternativeAsset (swapPair: SwapPair): string | undefined {
  return swapPair?.metadata?.alternativeAsset as string;
}

export function getSwapAltToken (chainAsset: _ChainAsset): string | undefined {
  return chainAsset.metadata?.alternativeSwapAsset as string;
}

export function calculateSwapRate (fromAmount: string, toAmount: string, fromAsset: _ChainAsset, toAsset: _ChainAsset) {
  const bnFromAmount = BigN(fromAmount);
  const bnToAmount = BigN(toAmount);

  const decimalDiff = _getAssetDecimals(toAsset) - _getAssetDecimals(fromAsset);
  const bnRate = bnFromAmount.div(bnToAmount);

  return 1 / bnRate.times(10 ** decimalDiff).toNumber();
}

export function convertSwapRate (rate: string, fromAsset: _ChainAsset, toAsset: _ChainAsset) {
  const decimalDiff = _getAssetDecimals(toAsset) - _getAssetDecimals(fromAsset);
  const bnRate = BigN(rate);

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
      slug: `${from}___${to}`, // todo: recheck with assetRef format from chain list
      from,
      to
    }
  };
}

export function getSwapStep (from: string, to: string): DynamicSwapAction {
  return {
    action: DynamicSwapType.SWAP,
    pair: {
      slug: `${from}___${to}`, // todo: recheck with assetRef format from chain list
      from,
      to
    }
  };
}

export function findBridgeTransitDestination (assetRefMap: Record<string, _AssetRef>, fromToken: _ChainAsset, toToken: _ChainAsset): string | undefined {
  const foundAssetRef = Object.values(assetRefMap).find((assetRef) =>
    assetRef.srcAsset === fromToken.slug &&
    assetRef.destChain === _getAssetOriginChain(toToken) &&
    assetRef.path === _AssetRefPath.XCM
  );

  if (foundAssetRef) {
    return foundAssetRef.destAsset;
  }

  return undefined;
}

export function findSwapTransitDestination (assetRefMap: Record<string, _AssetRef>, fromToken: _ChainAsset, toToken: _ChainAsset): string | undefined {
  const foundAssetRef = Object.values(assetRefMap).find((assetRef) =>
    assetRef.destAsset === toToken.slug &&
    assetRef.srcChain === _getAssetOriginChain(fromToken) &&
    assetRef.path === _AssetRefPath.XCM
  );

  if (foundAssetRef) {
    return foundAssetRef.srcAsset;
  }

  return undefined;
}

export function findAllBridgeDestinations (assetRefMap: Record<string, _AssetRef>, fromToken: _ChainAsset): string[] {
  const foundAssetRefs = Object.values(assetRefMap).filter((assetRef) =>
    assetRef.srcAsset === fromToken.slug &&
    assetRef.path === _AssetRefPath.XCM
  );

  return foundAssetRefs.map((assetRef) => assetRef.destAsset);
}

export function getAmountAfterSlippage (amount: string, slippage: number): string {
  return BigN(amount).multipliedBy(BigN(1).minus(BigN(slippage))).integerValue(BigN.ROUND_DOWN).toString();
}

export function isChainsHasSameProvider (fromChain: string, toChain: string): boolean {
  // todo: a provider may support multiple chains but not cross-chain swaps
  for (const group of Object.values(_PROVIDER_TO_SUPPORTED_PAIR_MAP)) {
    if (group.includes(fromChain) && group.includes(toChain)) {
      return true;
    }
  }

  return false;
}

export function getLastAmountFromSteps (steps: CommonStepDetail[]): string | undefined {
  const lastStep = steps[steps.length - 1]; // last step
  const lastAmount = lastStep?.metadata?.destinationValue as string;

  return lastAmount ?? undefined;
}

export function getFirstAmountFromSteps (steps: CommonStepDetail[]): string | undefined {
  const firstStep = steps[1]; // first step after default step
  const firstAmount = firstStep?.metadata?.sendingValue as string;

  return firstAmount ?? undefined;
}

export function getChainRouteFromSteps (steps: CommonStepDetail[]): string[] {
  // todo: handle metadata for other providers than hydra & pah. Also add validate metadata.
  const mainSteps = steps.filter((step) => step.type !== CommonStepType.DEFAULT);

  return mainSteps.reduce((chainRoute, currentStep, currentIndex) => {
    const metadata = currentStep.metadata as unknown as BaseSwapStepMetadata;

    if (!metadata) {
      console.error('Step has no metadata');

      return chainRoute;
    }

    if (currentIndex === 0) {
      chainRoute.push(metadata.originTokenInfo.originChain);
      chainRoute.push(metadata.destinationTokenInfo.originChain);
    } else {
      chainRoute.push(metadata.destinationTokenInfo.originChain);
    }

    return chainRoute;
  }, [] as string[]);
}

// note: this function may return undefined if metadata version is < 2 or does not exist
export function getTokenPairFromStep (steps: CommonStepDetail[]): SwapPair | undefined {
  // todo: review this
  const mainSteps = steps.filter((step) => step.type !== CommonStepType.DEFAULT && step.type !== CommonStepType.TOKEN_APPROVAL && step.type !== SwapStepType.PERMIT);

  if (!mainSteps.length) {
    return undefined;
  }

  const isStepValidIfSwap = (step: CommonStepDetail) => {
    const metadata = step.metadata as unknown as (BaseSwapStepMetadata | undefined);

    return step.type !== SwapStepType.SWAP || (!!metadata?.version && (metadata?.version >= 2));
  };

  if (mainSteps.length === 1) {
    if (!isStepValidIfSwap(mainSteps[0])) {
      return undefined;
    }

    const metadata = mainSteps[0].metadata as unknown as BaseSwapStepMetadata;

    if (!metadata) {
      return undefined;
    }

    return {
      from: metadata.originTokenInfo.slug,
      to: metadata.destinationTokenInfo.slug,
      slug: _parseAssetRefKey(metadata.originTokenInfo.slug, metadata.destinationTokenInfo.slug)
    };
  }

  const firstStep = mainSteps[0];
  const lastStep = mainSteps[mainSteps.length - 1];

  if (!isStepValidIfSwap(firstStep) || !isStepValidIfSwap(lastStep)) {
    return undefined;
  }

  const firstMetadata = firstStep.metadata as unknown as BaseSwapStepMetadata;
  const lastMetadata = lastStep.metadata as unknown as BaseSwapStepMetadata;

  if (!firstMetadata || !lastMetadata) {
    return undefined;
  }

  return {
    from: firstMetadata.originTokenInfo.slug,
    to: lastMetadata.destinationTokenInfo.slug,
    slug: _parseAssetRefKey(firstMetadata.originTokenInfo.slug, lastMetadata.destinationTokenInfo.slug)
  };
}

export function getSwapChainsFromPath (path: DynamicSwapAction[]): string[] {
  const swapChains: string[] = [];

  path.forEach((pathElement) => {
    const fromAssetOriginChain = _getOriginChainOfAsset(pathElement.pair.from);
    const toAssetOriginChain = _getOriginChainOfAsset(pathElement.pair.to);

    if (swapChains.at(-1) !== fromAssetOriginChain) {
      swapChains.push(fromAssetOriginChain);
    }

    if (swapChains.at(-1) !== toAssetOriginChain) {
      swapChains.push(toAssetOriginChain);
    }
  });

  return swapChains;
}

export const DEFAULT_EXCESS_AMOUNT_WEIGHT = 1.04; // add 2%
