// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BaseRequestSign, InternalRequestSign } from '../../transaction';
import { ProxyItem, ProxyType } from '..';

export interface AddProxyParams extends BaseRequestSign {
  address: string;
  chain: string;
  proxyAddress: string;
  proxyType: ProxyType;
  proxyDeposit: string;
}

export type RequestAddProxy = InternalRequestSign<AddProxyParams>;

export interface RemoveProxyParams extends BaseRequestSign {
  address: string;
  chain: string;
  selectedProxyAccounts: ProxyItem[]
  isRemoveAll?: boolean;
}

export type RequestRemoveProxy = InternalRequestSign<RemoveProxyParams>;
