// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

export interface RequestGetProxyAccounts {
  chain: string;
  address: string;
  type?: ExtrinsicType
  selectedProxyAddress?: string[]
}

export type ProxyType = 'Any' | 'NonTransfer' | 'Governance' | 'Staking';

export interface ProxyItem {
  proxyAddress: string;
  proxyType: ProxyType
  delay: number;
  proxyId?: string;
}

export interface ProxyAccounts {
  proxies: ProxyItem[];
  proxyDeposit: string;
}

export * from './actions';
