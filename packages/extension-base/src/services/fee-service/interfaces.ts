// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { BalanceItem } from '@subwallet/extension-base/types';

export interface TokenHasBalanceInfo {
  slug: string;
  free: string;
  rate: string; // rate = payFeeToken / nativeToken
}

export interface TokenPayFeeInfo {
  tokensCanPayFee: TokenHasBalanceInfo[];
  defaultTokenSlug: string;
}

export interface RequestAssetHubTokensCanPayFee {
  substrateApi: _SubstrateApi;
  chainService: ChainService;
  nativeTokenInfo: _ChainAsset;
  nativeBalanceInfo: TokenHasBalanceInfo;
  tokensHasBalanceInfoMap: Record<string, BalanceItem>;
  feeAmount?: string
}

export interface RequestHydrationTokensCanPayFee {
  substrateApi: _SubstrateApi;
  chainService: ChainService;
  nativeTokenInfo: _ChainAsset;
  nativeBalanceInfo: TokenHasBalanceInfo;
  tokensHasBalanceInfoMap: Record<string, BalanceItem>;
  priceMap: Record<string, number>;
  defaultTokenSlug: string;
  feeAmount?: string;
}
