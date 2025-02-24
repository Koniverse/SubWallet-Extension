// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset } from '@subwallet/chain-list/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { checkLiquidityForPool, estimateTokensForPool, getReserveForPool } from '@subwallet/extension-base/services/swap-service/handler/asset-hub/utils';
import { BalanceItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';

export async function getAssetHubTokensCanPayFee (substrateApi: _SubstrateApi, chainService: ChainService, nativeTokenInfo: _ChainAsset, nativeBalanceInfo: TokenHasBalanceInfo, tokensHasBalanceInfoMap: Record<string, BalanceItem>, feeAmount?: string): Promise<TokenHasBalanceInfo[]> {
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

export async function getHydrationTokensCanPayFee (substrateApi: _SubstrateApi, chainService: ChainService, nativeTokenInfo: _ChainAsset, nativeBalanceInfo: TokenHasBalanceInfo, tokensHasBalanceInfoMap: Record<string, BalanceItem>, feeAmount?: string): Promise<TokenHasBalanceInfo[]> {
  const tokensList: TokenHasBalanceInfo[] = [nativeBalanceInfo];
  const _acceptedCurrencies = await substrateApi.api.query.multiTransactionPayment.acceptedCurrencies.entries();

  const supportedAssetIds = _acceptedCurrencies.map((_assetId) => {
    const assetId = _assetId[0].toHuman() as string[];

    return assetId[0].replaceAll(',', '');
  });

  const tokenInfos = Object.keys(tokensHasBalanceInfoMap).map((tokenSlug) => chainService.getAssetBySlug(tokenSlug)).filter((token) => (
    token.originChain === substrateApi.chainSlug &&
    token.assetType !== _AssetType.NATIVE &&
    !!token.metadata &&
    !!token.metadata.assetId
  ));

  tokenInfos.forEach((tokenInfo) => {
    // @ts-ignore
    if (supportedAssetIds.includes(tokenInfo.metadata.assetId)) {
      tokensList.push({
        slug: tokenInfo.slug,
        free: tokensHasBalanceInfoMap[tokenInfo.slug].free,
        rate: '1' // todo: handle this
      });
    }
  });

  return tokensList;
}

export function batchExtrinsicSetFeeHydration (api: ApiPromise, tx: SubmittableExtrinsic, assetId?: string): SubmittableExtrinsic {
  if (!assetId || assetId === '0') {
    return tx;
  }

  return api.tx.utility.batch([
    api.tx.multiTransactionPayment.setCurrency(assetId),
    tx,
    api.tx.multiTransactionPayment.setCurrency('0') // set HDX
  ]);
}
