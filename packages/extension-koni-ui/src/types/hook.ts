// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ExcludedSubstrateProxyAccounts } from '@subwallet/extension-base/types';
import { WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types/account';
import { PriceChangeStatus, TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import BigN from 'bignumber.js';

export type TokenGroupHookType = {
  tokenGroupMap: Record<string, string[]>,
  tokenGroups: string[],
  tokenSlugs: string[],
}

export type AccountBalanceHookType = {
  tokenBalanceMap: Record<string, TokenBalanceItemType>
  tokenGroupBalanceMap: Record<string, TokenBalanceItemType>,
  totalBalanceInfo: {
    convertedValue: BigN,
    converted24hValue: BigN,
    change: {
      value: BigN,
      status?: PriceChangeStatus,
      percent: BigN
    }
  },
}

// useGetWrappedTransactionSigners

export type ResolveWrappedTransactionSignersHookParams = {
  chainSlug: string;
  targetAddress?: string;
  extrinsicType?: ExtrinsicType;

  // List of substrate proxy accounts to be excluded from selection
  excludedSubstrateProxyAccounts?: ExcludedSubstrateProxyAccounts[];
};

export type ResolveWrappedTransactionSigners = (params: ResolveWrappedTransactionSignersHookParams) => Promise<WrappedTransactionSigner[]>;

export type GetWrappedTransactionSignersHookType = (
  params: ResolveWrappedTransactionSignersHookParams
) => Promise<WrappedTransactionSigner[]>;

// useGetWrappedTransactionSigners
