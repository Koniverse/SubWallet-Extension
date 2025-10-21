// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export const _STAKING_CHAIN_GROUP = {
  relay: ['polkadot', 'kusama', 'aleph', 'polkadex', 'ternoa', 'alephTest', 'polkadexTest', 'westend', 'kate', 'edgeware', 'creditcoin', 'vara_network', 'goldberg_testnet', 'availTuringTest', 'avail_mainnet', 'vara_testnet', 'dentnet', 'cere', 'paseoTest'],
  assetHub: ['statemine', 'statemint', 'westend_assethub', 'paseo_assethub'],
  para: ['moonbeam', 'moonriver', 'moonbase', 'turing', 'turingStaging', 'bifrost', 'bifrost_testnet', 'calamari_test', 'calamari', 'manta_network', 'polimec'],
  astar: ['astar', 'shiden', 'shibuya'],
  amplitude: ['amplitude', 'amplitude_test', 'kilt', 'kilt_peregrine', 'pendulum', 'krest_network'], // amplitude and kilt only share some common logic
  kilt: ['kilt', 'kilt_peregrine'],
  nominationPool: ['polkadot', 'kusama', 'westend', 'alephTest', 'aleph', 'kate', 'vara_network', 'goldberg_testnet', 'availTuringTest', 'avail_mainnet', 'vara_testnet', 'cere', 'analog_timechain', 'paseoTest'],
  bifrost: ['bifrost', 'bifrost_testnet'],
  aleph: ['aleph', 'alephTest'], // A0 has distinct tokenomics
  ternoa: ['ternoa'],
  liquidStaking: ['bifrost_dot', 'acala', 'parallel', 'moonbeam'],
  lending: ['interlay'],
  krest_network: ['krest_network'],
  manta: ['manta_network'],
  bittensor: ['bittensor', 'bittensor_testnet'],
  energy: ['energy_web_x_testnet', 'energy_web_x'],
  mythos: ['mythos', 'muse_testnet']
};

export const RELAY_HANDLER_DIRECT_STAKING_CHAINS = [
  ..._STAKING_CHAIN_GROUP.relay,
  ..._STAKING_CHAIN_GROUP.assetHub
];

export const TON_CHAINS = ['ton', 'ton_testnet'];

export const MaxEraRewardPointsEras = 14;

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
export const ST_LIQUID_TOKEN_ABI: Record<string, any> = require('./abis/st_liquid_token_abi.json');

export const MANTA_VALIDATOR_POINTS_PER_BLOCK = 20;
export const MANTA_MIN_DELEGATION = 500;

export const CHANNEL_ID = 7;

export const STAKING_IDENTITY_API_SLUG: Record<string, string> = {
  polkadot: 'polkadot_people',
  statemine: 'peopleKusama',
  statemint: 'polkadot_people'
};
export const _SUPPORT_CHANGE_VALIDATOR_CHAIN = ['polkadot', 'kusama'];
