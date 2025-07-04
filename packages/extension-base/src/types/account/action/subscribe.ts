// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionType } from '@subwallet/extension-base/core/types';

export interface RequestInputAccountSubscribe {
  data: string;
  chain: string;
  token?: string;
  actionType?: ActionType
}

export enum AnalyzedGroup {
  WALLET = 'wallet',
  CONTACT = 'contact',
  DOMAIN = 'domain',
  RECENT = 'recent'
}

export interface AnalyzeAddress {
  address: string;
  proxyId?: string;
  formatedAddress: string;
  analyzedGroup: AnalyzedGroup;
  displayName?: string;
}

export interface ResponseInputAccountSubscribe {
  id: string;
  options: AnalyzeAddress[];
  current?: AnalyzeAddress;
}
