// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BaseRequestSign, InternalRequestSign } from '../../transaction';
import { SubstrateProxyItem, SubstrateProxyType } from '..';

export interface AddSubstrateProxyAccountParams extends BaseRequestSign {
  address: string;
  chain: string;
  substrateProxyAddress: string;
  substrateProxyType: SubstrateProxyType;
  substrateProxyDeposit: string;
}

export type RequestAddSubstrateProxyAccount = InternalRequestSign<AddSubstrateProxyAccountParams>;

export interface RemoveSubstrateProxyAccountParams extends BaseRequestSign {
  address: string;
  chain: string;
  selectedSubstrateProxyAccounts: SubstrateProxyItem[]
  isRemoveAll?: boolean;
}

export type RequestRemoveSubstrateProxyAccount = InternalRequestSign<RemoveSubstrateProxyAccountParams>;
