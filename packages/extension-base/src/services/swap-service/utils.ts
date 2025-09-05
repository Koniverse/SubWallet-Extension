// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getOriginChainOfAsset, _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { BaseSwapStepMetadata, CommonStepDetail, CommonStepType, DynamicSwapAction, DynamicSwapType, SwapStepType } from '@subwallet/extension-base/types';
import { SwapPair, SwapProviderId } from '@subwallet/extension-base/types/swap';
import BigN from 'bignumber.js';

export const CHAIN_FLIP_TESTNET_EXPLORER = 'https://blocks-perseverance.chainflip.io';
export const CHAIN_FLIP_MAINNET_EXPLORER = 'https://scan.chainflip.io';

export const SIMPLE_SWAP_EXPLORER = 'https://simpleswap.io';

export const SWAP_QUOTE_TIMEOUT_MAP: Record<string, number> = { // in milliseconds
  default: 90000,
  [SwapProviderId.CHAIN_FLIP_TESTNET]: 30000,
  [SwapProviderId.CHAIN_FLIP_MAINNET]: 30000,
  error: 10000
};

export const FEE_RATE_MULTIPLIER: Record<string, number> = {
  default: 1,
  medium: 1.2,
  high: 2
};

export function getSwapAlternativeAsset (swapPair: SwapPair): string | undefined {
  return swapPair?.metadata?.alternativeAsset as string;
}

export function getSwapAltToken (chainAsset: _ChainAsset): string | undefined {
  return chainAsset.metadata?.alternativeSwapAsset as string;
}

export function getAmountAfterSlippage (amount: string, slippage: number): string {
  return BigN(amount).multipliedBy(BigN(1).minus(BigN(slippage))).integerValue(BigN.ROUND_DOWN).toString();
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

export function processStepsToPathActions (steps: CommonStepDetail[]): DynamicSwapType[] {
  const path: DynamicSwapType[] = [];

  for (const step of steps) {
    if (step.type === CommonStepType.XCM) {
      path.push(DynamicSwapType.BRIDGE);
    }

    if (step.type === SwapStepType.SWAP) {
      path.push(DynamicSwapType.SWAP);
    }
  }

  return path;
}

export const DEFAULT_EXCESS_AMOUNT_WEIGHT = 1.04; // add 2%
