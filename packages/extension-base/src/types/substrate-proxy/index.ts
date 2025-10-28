// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

export interface RequestGetSubstrateProxyAccounts {
  chain: string;
  address: string;
  type?: ExtrinsicType
  selectedSubstrateProxyAddress?: string[]
}

export type SubstrateProxyType = 'Any' | 'NonTransfer' | 'Governance' | 'Staking';

export interface SubstrateProxyItem {
  substrateProxyAddress: string;
  substrateProxyType: SubstrateProxyType
  delay: number;
  proxyId?: string;
}

export interface SubstrateProxyAccounts {
  substrateProxies: SubstrateProxyItem[];
  substrateProxyDeposit: string;
}

export * from './actions';
