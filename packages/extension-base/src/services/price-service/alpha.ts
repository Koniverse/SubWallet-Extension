// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

/** Prefix of the price key every copy of a subnet's alpha shares; see `_getAlphaPriceId`. */
export const ALPHA_PRICE_ID_PREFIX = 'bittensor-alpha-';

export function getAlphaPriceIdByNetuid (netuid: number): string {
  return `${ALPHA_PRICE_ID_PREFIX}${netuid}`;
}

export interface AlphaPriceParams {
  /** TAO per alpha by netuid, from `current_alpha_price_all`; empty when the chain cannot be read */
  taoPerAlpha: Record<number, number>;
  /** The CoinGecko id of each subnet's alpha, where it has one */
  coingeckoIds: Record<number, string>;
  /** TAO's price id */
  taoPriceId: string;
  /** CoinGecko prices, keyed by price id */
  priceMap: Record<string, number>;
  price24hMap: Record<string, number>;
}

export interface AlphaPrices {
  priceMap: Record<string, number>;
  price24hMap: Record<string, number>;
}

/**
 * Alpha prices keyed by netuid (EXT-2): on-chain alpha → TAO × TAO's price, so Assets and Swap value
 * a position as Earning does, and the subnets and copies with no CoinGecko id are priced too.
 * The chain has no price from a day ago, so the 24h figure applies CoinGecko's relative move to the
 * on-chain price; with no CoinGecko figure it equals the price (no change). When the chain cannot be
 * read, CoinGecko's own alpha price stands in.
 */
export function getAlphaPrices ({ coingeckoIds, price24hMap, priceMap, taoPerAlpha, taoPriceId }: AlphaPriceParams): AlphaPrices {
  const result: AlphaPrices = { priceMap: {}, price24hMap: {} };
  const taoPrice = priceMap[taoPriceId] || 0;
  const netuids = new Set([...Object.keys(taoPerAlpha), ...Object.keys(coingeckoIds)].map(Number));

  netuids.forEach((netuid) => {
    // Netuid 0 is TAO itself
    if (!netuid) {
      return;
    }

    const coingeckoId = coingeckoIds[netuid];
    const coingeckoPrice = coingeckoId ? priceMap[coingeckoId] || 0 : 0;
    const coingeckoPrice24h = coingeckoId ? price24hMap[coingeckoId] || 0 : 0;
    const onChainPrice = (taoPerAlpha[netuid] || 0) * taoPrice;
    const price = onChainPrice > 0 ? onChainPrice : coingeckoPrice;

    if (!(price > 0)) {
      return;
    }

    const key = getAlphaPriceIdByNetuid(netuid);

    result.priceMap[key] = price;
    result.price24hMap[key] = coingeckoPrice > 0 && coingeckoPrice24h > 0 ? price * coingeckoPrice24h / coingeckoPrice : price;
  });

  return result;
}
