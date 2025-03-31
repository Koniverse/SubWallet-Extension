// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';

export const XCM_VERSION = {
  V3: 'V3',
  V4: 'V4'
};

const paraSpellEndpoint = 'https://api.lightspell.xyz';

export const paraSpellApi = {
  buildXcm: `${paraSpellEndpoint}/x-transfer`
};

export const paraSpellKey = process.env.PARASPELL_API_KEY || '';
export const lightSpellChainMapping: Record<string, string> = {
  statemint: 'AssetHubPolkadot',
  acala: 'Acala',
  astar: 'Astar',
  bifrost_dot: 'BifrostPolkadot',
  bitgreen: 'Bitgreen',
  bridgeHubPolkadot: 'BridgeHubPolkadot',
  bridgeHubKusama: 'BridgeHubKusama',
  centrifuge: 'Centrifuge',
  hydradx_main: 'Hydration',
  interlay: 'Interlay',
  moonbeam: 'Moonbeam',
  amplitude: 'Amplitude',
  statemine: 'AssetHubKusama',
  bifrost: 'BifrostKusama',
  karura: 'Karura',
  moonriver: 'Moonriver',
  shiden: 'Shiden',
  manta_network: 'Manta',
  pendulum: 'Pendulum',
  phala: 'Phala',
  mythos: 'Mythos',
  ethereum: 'Ethereum',
  polkadot: 'Polkadot',
  kusama: 'Kusama'
};

// todo: remove
export const STABLE_XCM_VERSION = 3;

// todo: remove
export function isUseTeleportProtocol (originChainInfo: _ChainInfo, destChainInfo: _ChainInfo, tokenSlug?: string) {
  const relayChainToSystemChain =
    (['polkadot'].includes(originChainInfo.slug) && ['statemint'].includes(destChainInfo.slug)) ||
    (['kusama'].includes(originChainInfo.slug) && ['statemine'].includes(destChainInfo.slug)) ||
    (['rococo'].includes(originChainInfo.slug) && ['rococo_assethub'].includes(destChainInfo.slug)) ||
    (['westend'].includes(originChainInfo.slug) && ['westend_assethub'].includes(destChainInfo.slug));
  const systemChainToRelayChain =
    (['polkadot'].includes(destChainInfo.slug) && ['statemint'].includes(originChainInfo.slug)) ||
    (['kusama'].includes(destChainInfo.slug) && ['statemine'].includes(originChainInfo.slug)) ||
    (['rococo'].includes(destChainInfo.slug) && ['rococo_assethub'].includes(originChainInfo.slug)) ||
    (['westend'].includes(destChainInfo.slug) && ['westend_assethub'].includes(originChainInfo.slug));
  const isXcmMythos =
    (originChainInfo.slug === 'mythos' && destChainInfo.slug === 'statemint' && tokenSlug === 'mythos-NATIVE-MYTH') ||
    (originChainInfo.slug === 'statemint' && destChainInfo.slug === 'mythos' && tokenSlug === 'statemint-LOCAL-MYTH');

  return relayChainToSystemChain || systemChainToRelayChain || isXcmMythos;
}
