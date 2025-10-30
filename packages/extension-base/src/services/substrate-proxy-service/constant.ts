// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SubstrateProxyType } from '@subwallet/extension-base/types/substrateProxyAccount';

const SUBSTRATE_PROXY_ACCOUNT_EXTRINSIC_GROUPS: Record<string, ExtrinsicType[]> = {
  STAKING: [
    ExtrinsicType.STAKING_BOND,
    ExtrinsicType.STAKING_UNBOND,
    ExtrinsicType.STAKING_WITHDRAW,
    ExtrinsicType.STAKING_JOIN_POOL,
    ExtrinsicType.STAKING_LEAVE_POOL
  ]
};

export const txTypeToSubstrateProxyMap: Partial<Record<ExtrinsicType, SubstrateProxyType[]>> = {
  ...Object.fromEntries(SUBSTRATE_PROXY_ACCOUNT_EXTRINSIC_GROUPS.STAKING.map((t) => [t, ['Staking', 'NonTransfer']]))
};

export const UNSUPPORTED_SUBSTRATE_PROXY_NETWORKS = [
  'bridgeHubPolkadot',
  'aventus',
  'xode',
  'autonomys_taurus',
  'ternoa',
  'jamton',
  'robonomics',
  'bridgeHubKusama',
  'mandalaTest',
  'commune',
  'torus',
  'logion',
  'sora_ksm',
  'acurast',
  'autonomys',
  'humanode',
  'quantum_fusion',
  'manta_network',
  'unique_network',
  'krest_network',
  'auto_evm',
  'polymesh',
  'sora_substrate',
  'nodle'
];
