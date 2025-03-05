// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetDecimals, _getAssetPriceId, _getTokenOnChainAssetId, _isNativeTokenBySlug } from '@subwallet/extension-base/services/chain-service/utils';
import { RequestAssetHubTokensCanPayFee, RequestHydrationTokensCanPayFee, TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { checkLiquidityForPool, estimateTokensForPool, getReserveForPool } from '@subwallet/extension-base/services/swap-service/handler/asset-hub/utils';
import BigN from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';

export async function getAssetHubTokensCanPayFee (request: RequestAssetHubTokensCanPayFee): Promise<TokenHasBalanceInfo[]> {
  const { chainService, feeAmount, nativeBalanceInfo, nativeTokenInfo, substrateApi, tokensHasBalanceInfoMap } = request;
  const tokensList: TokenHasBalanceInfo[] = [nativeBalanceInfo];

  if (!(nativeTokenInfo.metadata && nativeTokenInfo.metadata.multilocation)) {
    return tokensList;
  }

  // ensure nativeTokenInfo and localTokenInfo have multi-location metadata beforehand to improve performance.
  const tokensHasBalanceSlug = Object.keys(tokensHasBalanceInfoMap);
  const tokenInfos = tokensHasBalanceSlug.map((tokenSlug) => chainService.getAssetBySlug(tokenSlug)).filter((token) => (
    token.originChain === substrateApi.chainSlug &&
    token.assetType !== _AssetType.NATIVE &&
    token.metadata &&
    token.metadata.multilocation
  ));

  await Promise.all(tokenInfos.map(async (tokenInfo) => {
    try {
      const tokenSlug = tokenInfo.slug;
      const reserve = await getReserveForPool(substrateApi.api, nativeTokenInfo, tokenInfo);

      if (!reserve || !reserve[0] || !reserve[1] || reserve[0] === '0' || reserve[1] === '0') {
        return;
      }

      const rate = new BigN(reserve[1]).div(reserve[0]).toFixed();
      const tokenCanPayFee = {
        slug: tokenSlug,
        free: tokensHasBalanceInfoMap[tokenSlug].free,
        rate
      };

      if (feeAmount === undefined) {
        tokensList.push(tokenCanPayFee);
      } else {
        const amount = estimateTokensForPool(feeAmount, reserve);
        const liquidityError = checkLiquidityForPool(amount, reserve[0], reserve[1]);

        if (!liquidityError) {
          tokensList.push(tokenCanPayFee);
        }
      }
    } catch (e) {
      console.error('error when fetching pool with token', tokenInfo.slug, e);
    }
  }));

  return tokensList;
}

export async function getHydrationTokensCanPayFee (request: RequestHydrationTokensCanPayFee): Promise<TokenHasBalanceInfo[]> {
  const { chainService, defaultTokenSlug, nativeBalanceInfo, nativeTokenInfo, priceMap, substrateApi, tokensHasBalanceInfoMap } = request;
  const tokensList: TokenHasBalanceInfo[] = [nativeBalanceInfo];
  const _acceptedCurrencies = await substrateApi.api.query.multiTransactionPayment.acceptedCurrencies.entries();

  const supportedAssetIds = _acceptedCurrencies.map((_assetId) => {
    const assetId = _assetId[0].toHuman() as string[];

    return assetId[0].replaceAll(',', '');
  });

  const nativePriceId = _getAssetPriceId(nativeTokenInfo);

  if (!nativePriceId) {
    return tokensList;
  }

  const nativePrice = priceMap[nativePriceId];
  const nativeDecimals = _getAssetDecimals(nativeTokenInfo);
  const tokenInfos = Object.keys(tokensHasBalanceInfoMap).map((tokenSlug) => chainService.getAssetBySlug(tokenSlug)).filter((token) => (
    token.originChain === substrateApi.chainSlug &&
    token.assetType !== _AssetType.NATIVE &&
    !!token.metadata &&
    !!token.metadata.assetId
  ));

  tokenInfos.forEach((tokenInfo) => {
    const priceId = _getAssetPriceId(tokenInfo);

    if (!priceId) {
      return;
    }

    const tokenPrice = priceMap[priceId];
    const tokenDecimals = _getAssetDecimals(tokenInfo);

    const rate = new BigN(nativePrice).div(tokenPrice).multipliedBy(10 ** (tokenDecimals - nativeDecimals)).toFixed();

    // @ts-ignore
    if (supportedAssetIds.includes(_getTokenOnChainAssetId(tokenInfo))) {
      tokensList.push({
        slug: tokenInfo.slug,
        free: tokensHasBalanceInfoMap[tokenInfo.slug].free,
        rate: rate
      });
    }
  });

  // case defaultTokenSlug does not have balance
  const candidateSlugs = tokensList.map((token) => token.slug);

  if (!_isNativeTokenBySlug(defaultTokenSlug) && !candidateSlugs.includes(defaultTokenSlug)) {
    const defaultTokenInfo = chainService.getAssetBySlug(defaultTokenSlug);
    const priceId = _getAssetPriceId(defaultTokenInfo); // todo: handle exception token do not have priceId
    const tokenPrice = priceMap[priceId];
    const tokenDecimals = _getAssetDecimals(defaultTokenInfo);

    const rate = new BigN(nativePrice).div(tokenPrice).multipliedBy(10 ** (tokenDecimals - nativeDecimals)).toFixed();

    tokensList.push({
      slug: defaultTokenSlug,
      free: '0',
      rate: rate
    });
  }

  return tokensList;
}

export function batchExtrinsicSetFeeHydration (substrateApi: _SubstrateApi, tx: SubmittableExtrinsic | null, feeSetting: number | null, assetId?: string): SubmittableExtrinsic | null {
  const api = substrateApi.api;

  const isSettingLocalFee = feeSetting && feeSetting !== 0;
  const isAttendToSetLocalFee = assetId && assetId !== '0';

  if (!tx) {
    return tx;
  }

  // current native - set native
  if (!isSettingLocalFee && !isAttendToSetLocalFee) {
    return tx;
  }

  // current native - set local
  if (!isSettingLocalFee && isAttendToSetLocalFee) {
    return api.tx.utility.batchAll([
      api.tx.multiTransactionPayment.setCurrency(assetId),
      tx,
      api.tx.multiTransactionPayment.setCurrency('0')
    ]);
  }

  // current local - set native
  if (isSettingLocalFee && !isAttendToSetLocalFee) {
    return api.tx.utility.batchAll([
      api.tx.multiTransactionPayment.setCurrency('0'),
      tx
    ]);
  }

  // current local - set local
  if (isSettingLocalFee && isAttendToSetLocalFee) {
    if (assetId === feeSetting.toString()) { // current local = set local
      return api.tx.utility.batchAll([
        tx,
        api.tx.multiTransactionPayment.setCurrency('0')
      ]);
    } else { // current local != set local
      return api.tx.utility.batchAll([
        api.tx.multiTransactionPayment.setCurrency(assetId),
        tx,
        api.tx.multiTransactionPayment.setCurrency('0')
      ]);
    }
  }

  return tx;
}
