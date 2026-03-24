// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BITTENSOR_REFRESH_STAKE_INFO } from '@subwallet/extension-base/constants';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import BigNumber from 'bignumber.js';

type AllCacheItem = {
  values: Map<number, BigNumber>;
  expiredAt: number;
}

type SubnetPriceItem = {
  netuid: number;
  price: string | number;
}

class AlphaPriceCache {
  // Cache one full price table per chain: netuid -> raw alpha price.
  private readonly allValueCache = new Map<string, AllCacheItem>();
  private readonly TTL = BITTENSOR_REFRESH_STAKE_INFO;

  public async getAlphaPriceMap (
    chain: string,
    fetcher: () => Promise<Map<number, BigNumber>>
  ): Promise<Map<number, BigNumber>> {
    // Return hot cache when it is still inside TTL window.
    const now = Date.now();
    const allCached = this.allValueCache.get(chain);

    if (allCached && allCached.expiredAt > now) {
      return allCached.values;
    }

    const allValues = await fetcher();
    const expiredAt = now + this.TTL;

    // Store the whole map once so callers can do O(1) lookup by netuid.
    this.allValueCache.set(chain, {
      values: allValues,
      expiredAt
    });

    return allValues;
  }

  public clearAll () {
    this.allValueCache.clear();
  }
}

export const alphaPriceCache = new AlphaPriceCache();

export const getAlphaToTaoRate = async (
  substrateApi: _SubstrateApi,
  chain: string,
  netuid: number,
  nativeTokenDecimals: number
): Promise<BigNumber> => {
  // netuid=0 is native TAO, so alpha->TAO rate is always 1.
  if (netuid === 0) {
    return new BigNumber(1);
  }

  const priceMap = await alphaPriceCache.getAlphaPriceMap(
    chain,
    async () => {
      // Runtime API returns all subnet prices in one call, then we index by netuid.
      const pricesRaw = await substrateApi.api.call.swapRuntimeApi.currentAlphaPriceAll();
      const prices = pricesRaw.toPrimitive() as Array<SubnetPriceItem | [number, string | number]>;
      const result = new Map<number, BigNumber>();

      prices.forEach((item) => {
        if (Array.isArray(item)) {
          const [rawNetuid, rawPrice] = item;

          result.set(Number(rawNetuid), new BigNumber(rawPrice));

          return;
        }

        const netuid = Number(item?.netuid);
        const rawPrice = item?.price;

        if (!Number.isNaN(netuid) && !!rawPrice) {
          result.set(netuid, new BigNumber(rawPrice));
        }
      });

      return result;
    }
  );

  const price = priceMap.get(netuid);

  if (!price) {
    throw new Error(`Missing alpha price for netuid ${netuid}`);
  }

  // Convert raw runtime price to TAO-denominated rate by native token decimals.
  return price.dividedBy(new BigNumber(10).pow(nativeTokenDecimals));
};
