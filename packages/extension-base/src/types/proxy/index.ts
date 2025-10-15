// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

export interface RequestGetProxyAccounts {
  chain: string;
  address: string;
  type?: ExtrinsicType
  selectedProxyAdress?: string[]
}

export interface ProxyItem {
  proxyAddress: string;
  proxyType: string;
}

export interface ProxyAccounts {
  proxies: ProxyItem[];
  deposit: string;
}
