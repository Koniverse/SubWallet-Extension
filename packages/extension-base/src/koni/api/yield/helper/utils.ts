// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { RuntimeDispatchInfo, SpecialYieldPoolInfo, YieldStepDetail, YieldStepType } from '@subwallet/extension-base/types';
import { BN_TEN } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

export const syntheticSelectedValidators = [
  '15MLn9YQaHZ4GMkhK3qXqR5iGGSdULyJ995ctjeBgFRseyi6',
  '1REAJ1k691g5Eqqg9gL7vvZCBG7FCCZ8zgQkZWd4va5ESih',
  '1yGJ3h7TQuJWLYSsUVPZbM8aR8UsQXCqMvrFx5Fn1ktiAmq',
  '16GDRhRYxk42paoK6TfHAqWej8PdDDUwdDazjv4bAn4KGNeb',
  '13Ybj8CPEArUee78DxUAP9yX3ABmFNVQME1ZH4w8HVncHGzc',
  '14yx4vPAACZRhoDQm1dyvXD3QdRQyCRRCe5tj1zPomhhS29a',
  '14Vh8S1DzzycngbAB9vqEgPFR9JpSvmF1ezihTUES1EaHAV',
  '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC',
  '1LUckyocmz9YzeQZHVpBvYYRGXb3rnSm2tvfz79h3G3JDgP',
  '14oRE62MB1SWR6h5RTx3GY5HK2oZipi1Gp3zdiLwVYLfEyRZ',
  '1cFsLn7o74nmjbRyDtMAnMpQMc5ZLsjgCSz9Np2mcejUK83',
  '15ZvLonEseaWZNy8LDkXXj3Y8bmAjxCjwvpy4pXWSL4nGSBs',
  '1NebF2xZHb4TJJpiqZZ3reeTo8dZov6LZ49qZqcHHbsmHfo',
  '1HmAqbBRrWvsqbLkvpiVDkdA2PcctUE5JUe3qokEh1FN455',
  '15tfUt4iQNjMyhZiJGBf4EpETE2KqtW1nfJwbBT1MvWjvcK9',
  '12RXTLiaYh59PokjZVhQvKzcfBEB5CvDnjKKUmDUotzcTH3S'
];

export function calculateAlternativeFee (feeInfo: RuntimeDispatchInfo) {
  return feeInfo.partialFee;
}

export const DEFAULT_YIELD_FIRST_STEP: YieldStepDetail = {
  id: 0,
  name: 'Fill information',
  type: YieldStepType.DEFAULT
};

export const YIELD_EXTRINSIC_TYPES = [
  ExtrinsicType.MINT_VDOT,
  ExtrinsicType.MINT_LDOT,
  ExtrinsicType.MINT_SDOT,
  ExtrinsicType.MINT_QDOT,
  ExtrinsicType.MINT_STDOT,
  ExtrinsicType.REDEEM_QDOT,
  ExtrinsicType.REDEEM_SDOT,
  ExtrinsicType.REDEEM_VDOT,
  ExtrinsicType.REDEEM_LDOT,
  ExtrinsicType.REDEEM_STDOT,
  ExtrinsicType.STAKING_JOIN_POOL,
  ExtrinsicType.STAKING_CLAIM_REWARD,
  ExtrinsicType.STAKING_LEAVE_POOL,
  ExtrinsicType.STAKING_POOL_WITHDRAW
];

export const YIELD_POOL_STAT_REFRESH_INTERVAL = 90000;

export const YIELD_POOL_MIN_AMOUNT_PERCENT: Record<string, number> = {
  DOT___acala_liquid_staking: 0.98,
  DOT___bifrost_liquid_staking: 0.99,
  DOT___parallel_liquid_staking: 0.97,
  default: 0.98
};

export function convertDerivativeToOriginToken (amount: string, poolInfo: SpecialYieldPoolInfo, derivativeTokenInfo: _ChainAsset, originTokenInfo: _ChainAsset) {
  const derivativeDecimals = _getAssetDecimals(derivativeTokenInfo);
  const originDecimals = _getAssetDecimals(originTokenInfo);

  const exchangeRate = poolInfo.statistic?.assetEarning?.[0].exchangeRate || 1;
  const formattedAmount = new BigN(amount).dividedBy(BN_TEN.pow(derivativeDecimals)); // TODO: decimals
  const minAmount = formattedAmount.multipliedBy(exchangeRate);

  return minAmount.multipliedBy(BN_TEN.pow(originDecimals)).toFixed(0);
}
