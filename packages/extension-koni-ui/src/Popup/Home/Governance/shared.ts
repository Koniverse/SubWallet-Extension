// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const chainSlugToSubsquareApi: Record<string, string> = {
  polkadot: 'polkadot',
  bifrost_dot: 'bifrost',
  hydradx_main: 'hydration',
  kusama: 'kusama',
  bifrost: 'bifrostk',
  basilisk: 'basilisk',
  westend_assethub: 'westend',
  paseo_assethub: 'paseo',
  vara_network: 'vara',
  zkverify: 'zkv',
  zkverify_testnet: 'zkvt',
  ajuna: 'ajunaPolkadot',
  astar: 'astar',
  phala: 'phala',
  heima: 'litentry',
  acala: 'acala',
  centrifuge: 'centrifuge',
  interlay: 'interlay',
  laos: 'laos',
  karura: 'karura',
  kintsugi: 'kintsugi'
};

export const chainSlugToSubsquareSite: Record<string, string> = {
  polkadot: 'polkadot',
  bifrost_dot: 'bifrost',
  hydradx_main: 'hydration',
  kusama: 'kusama',
  bifrost: 'bifrost-kusama',
  basilisk: 'basilisk',
  westend_assethub: 'westend',
  paseo_assethub: 'paseo',
  vara_network: 'vara',
  zkverify: 'zkverify',
  zkverify_testnet: 'zkverify-testnet'
};

export const chainSlugToPolkassemblySite: Record<string, string> = {
  polkadot: 'polkadot',
  hydradx_main: 'hydradx',
  kusama: 'kusama',
  basilisk: 'basilisk',
  westend_assethub: 'westend',
  paseo_assethub: 'paseo',
  vara_network: 'vara'
};
