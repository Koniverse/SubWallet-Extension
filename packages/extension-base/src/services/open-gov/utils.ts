// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { Conviction } from './interface';

export const numberToConviction: Record<number, Conviction> = {
  0: Conviction.None,
  1: Conviction.Locked1x,
  2: Conviction.Locked2x,
  3: Conviction.Locked3x,
  4: Conviction.Locked4x,
  5: Conviction.Locked5x,
  6: Conviction.Locked6x
};

export const defaultConvictionDays: Record<Conviction, number> = {
  [Conviction.None]: 0,
  [Conviction.Locked1x]: 7,
  [Conviction.Locked2x]: 14,
  [Conviction.Locked3x]: 28,
  [Conviction.Locked4x]: 56,
  [Conviction.Locked5x]: 112,
  [Conviction.Locked6x]: 224
};

export const specialChainLockConfig: {chains: string[]; daysMap: Record<Conviction, number>;}[] = [
  {
    chains: ['bifrost_dot', 'bifrost'],
    daysMap: {
      [Conviction.None]: 0,
      [Conviction.Locked1x]: 1,
      [Conviction.Locked2x]: 2,
      [Conviction.Locked3x]: 4,
      [Conviction.Locked4x]: 8,
      [Conviction.Locked5x]: 16,
      [Conviction.Locked6x]: 32
    }
  }
];

export function getConvictionDays (chain: string, conviction: Conviction): number {
  const lowerChain = chain.toLowerCase();

  const group = specialChainLockConfig.find((g) =>
    g.chains.includes(lowerChain)
  );

  const daysMap = group?.daysMap ?? defaultConvictionDays;

  return daysMap[conviction] ?? 0;
}

export function getGovConvictionOptions (chain: string) {
  return Object.entries(numberToConviction).map(([value, conviction]) => {
    const days = getConvictionDays(chain, conviction);

    return {
      value: Number(value),
      label: value === '0' ? '0.1x' : `${value}x`,
      description: days === 0 ? 'No lockup' : `~${days}d`
    };
  });
}

export const MIGRATED_CHAINS = [
  'statemine',
  'statemint',
  'paseo_assethub',
  'westend_assethub'
];
