// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export interface TokenHasBalanceInfo {
  slug: string;
  free: string;
  rate: string; // rate = payFeeToken / nativeToken
}
