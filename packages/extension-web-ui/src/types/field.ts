// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceValueInfo } from '@subwallet/extension-web-ui/types/balance';

export type TokenSelectorItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
  balanceInfo?: {
    isReady: boolean;
    isNotSupport: boolean;
    isTestnet: boolean;
    free: BalanceValueInfo;
    locked: BalanceValueInfo;
    total: BalanceValueInfo;
    currency?: CurrencyJson;
  };
  showBalance?: boolean;
};
