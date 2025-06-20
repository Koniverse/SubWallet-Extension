// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@subwallet/keyring/types';

import { AccountActions, AccountProxyType } from '@subwallet/extension-base/types';

export interface WordItem {
  index: number;
  label: string;
}

export enum AccountAddressType {
  ETHEREUM = 'ethereum',
  SUBSTRATE = 'substrate',
  ALL = 'all',
  UNKNOWN = 'unknown',
}

export type AccountChainAddress = {
  name: string;
  slug: string;
  address: string;
  accountType: KeypairType;
  logoKey?: string
}

export type AccountInfoType = {
  address: string;
  type: KeypairType;
}

export type AccountTokenAddress = {
  accountInfo: AccountInfoType;
  tokenSlug: string;
  chainSlug: string;
}

export interface BitcoinAccountInfo {
  name: string;
  network: string;
  logoKey?: string;
  order: number;
}

export type AccountAddressItemType = {
  accountName: string;
  accountProxyId: string;
  accountProxyType: AccountProxyType;
  accountType: KeypairType;
  address: string;
  accountActions?: AccountActions[]
}
