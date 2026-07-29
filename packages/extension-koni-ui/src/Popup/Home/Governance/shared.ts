// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const chainSlugToSubsquareApi: Record<string, string> = {
  statemint: 'polkadot',
  bifrost_dot: 'bifrost',
  hydradx_main: 'hydration',
  statemine: 'kusama',
  bifrost: 'bifrostk',
  basilisk: 'basilisk',
  westend_assethub: 'westend',
  paseo_assethub: 'paseo',
  vara_network: 'vara',
  zkverify: 'zkv',
  zkverify_testnet: 'zkvt',
  ajunaPolkadot: 'ajuna',
  astar: 'astar',
  phala: 'phala',
  litentry: 'heima',
  acala: 'acala',
  centrifuge: 'centrifuge',
  interlay: 'interlay',
  laos_network: 'laos',
  karura: 'karura',
  kintsugi: 'kintsugi'
};

export const chainSlugToSubsquareSite: Record<string, string> = {
  statemint: 'polkadot',
  bifrost_dot: 'bifrost',
  hydradx_main: 'hydration',
  statemine: 'kusama',
  bifrost: 'bifrost-kusama',
  basilisk: 'basilisk',
  westend_assethub: 'westend',
  paseo_assethub: 'paseo',
  vara_network: 'vara',
  zkverify: 'zkverify',
  zkverify_testnet: 'zkverify-testnet',
  ajunaPolkadot: 'ajuna',
  astar: 'astar',
  phala: 'phala',
  litentry: 'heima',
  acala: 'acala',
  centrifuge: 'centrifuge',
  interlay: 'interlay',
  laos_network: 'laos',
  karura: 'karura',
  kintsugi: 'kintsugi'
};

export const chainSlugToPolkassemblySite: Record<string, string> = {
  statemint: 'polkadot',
  hydradx_main: 'hydradx',
  statemine: 'kusama',
  basilisk: 'basilisk',
  westend_assethub: 'westend',
  paseo_assethub: 'paseo',
  vara_network: 'vara'
};
