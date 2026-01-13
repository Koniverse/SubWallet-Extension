// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

export interface ExcludedSubstrateProxyAccounts {
  substrateProxyAddress: string
  substrateProxyType: SubstrateProxyType
}
export interface RequestGetSubstrateProxyAccountGroup {
  chain: string;
  address: string;
  type?: ExtrinsicType
  excludedSubstrateProxyAccounts?: ExcludedSubstrateProxyAccounts[]
}

// All possible proxy types in Substrate in this article: https://wiki.polkadot.com/learn/learn-proxies/#proxy-types
// Only support these 4 types for now
export type SubstrateProxyType = 'Any' | 'NonTransfer' | 'Governance' | 'Staking';

export interface SubstrateProxyAccountItem {
  substrateProxyAddress: string;
  substrateProxyType: SubstrateProxyType
  delay: number;
  proxyId?: string; // proxyId is the ID of the account proxy (including solo and unified accounts) managed in this wallet.
}

export interface SubstrateProxyAccountGroup {
  substrateProxyAccounts: SubstrateProxyAccountItem[];
  substrateProxyDeposit: string;
}

export * from './actions';
