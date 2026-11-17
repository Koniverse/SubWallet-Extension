// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CurrencyJson, CurrencyType, ExchangeRateJSON, HistoryTokenPriceJSON, PriceChartTimeframe, PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import { isProductionMode } from '@subwallet/extension-base/constants';
import { staticData, StaticKey } from '@subwallet/extension-base/utils/staticData';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

import { isArray } from '@polkadot/util';

interface GeckoItem {
  id: string,
  name: string,
  current_price: number,
  price_change_24h: number,
  symbol: string,
  last_updated?: string,
  last_updated_at?: string
}

interface DerivativeTokenPrice {
  id: string;
  origin_id: string;
  origin_price: number;
  rate: number;
  derived_price: number;
  cached_at: number;
}

interface ExchangeRateItem {
  result: string,
  time_last_update_unix: number,
  time_last_update_utc: string,
  time_next_update_unix: number,
  time_next_update_utc: number,
  base_code: string,
  conversion_rates: Record<string, number>
}

const DEFAULT_CURRENCY = 'USD';
const DERIVATIVE_TOKEN_SLUG_LIST = ['susds', 'savings-dai'];

let useBackupApi = false;

const apiCacheDomain = isProductionMode ? 'https://api-cache.subwallet.app' : 'https://api-cache-dev.subwallet.app';

export const getExchangeRateMap = async (): Promise<Record<CurrencyType, ExchangeRateJSON>> => {
  let response: Response | undefined;

  try {
    try {
      response = await fetch('https://api-cache.subwallet.app/exchange-rate');
    } catch (e) {}

    if (response?.status !== 200) {
      try {
        response = await fetch('https://static-cache.subwallet.app/exchange-rate/data.json');
      } catch (e) {}
    }

    const responseDataExchangeRate = (await response?.json()) as ExchangeRateItem || {};

    const exchangeRateMap: Record<CurrencyType, ExchangeRateJSON> = Object.keys(responseDataExchangeRate.conversion_rates)
      .reduce((map, exchangeKey) => {
        if (!staticData[StaticKey.CURRENCY_SYMBOL][exchangeKey]) {
          return map;
        }

        map[exchangeKey as CurrencyType] = {
          exchange: responseDataExchangeRate.conversion_rates[exchangeKey],
          label: (staticData[StaticKey.CURRENCY_SYMBOL][exchangeKey] as CurrencyJson).label
        };

        return map;
      }, {} as Record<CurrencyType, ExchangeRateJSON>);

    return exchangeRateMap;
  } catch (e) {
    return {} as Record<CurrencyType, ExchangeRateJSON>;
  }
};

const fetchDerivativeTokenSlugs = async () => {
  try {
    const response = await fetch(`${apiCacheDomain}/api/price/derivative-list`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: unknown = await response.json();
    const apiSlugs: string[] = Array.isArray(data) && data.every((item) => typeof item === 'string')
      ? (data as string[])
      : [];

    return new Set(apiSlugs.length > 0 ? apiSlugs : DERIVATIVE_TOKEN_SLUG_LIST);
  } catch (error) {
    console.error('Error fetching derivative token slugs from API:', error);

    return new Set(DERIVATIVE_TOKEN_SLUG_LIST);
  }
};

/** `coins/markets` answers at most this many coins a request, and cuts the rest without an error (EXT-40) */
export const PRICE_PAGE_SIZE = 250;

/** One page of prices: CoinGecko, then the backup API, then the static cache; undefined when all of them fail. */
const fetchPricePage = async (ids: string[], currency: CurrencyType): Promise<GeckoItem[] | undefined> => {
  const idStr = ids.join(',');
  let response: Response | undefined;

  if (!useBackupApi) {
    try {
      response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&per_page=${PRICE_PAGE_SIZE}&ids=${idStr}`);
    } catch (err) {
      useBackupApi = true;
    }
  }

  if (useBackupApi || response?.status !== 200) {
    useBackupApi = true;

    try {
      response = await fetch(`${apiCacheDomain}/api/price/get?ids=${idStr}`);
    } catch (e) {}

    if (response?.status !== 200) {
      try {
        response = await fetch('https://static-cache.subwallet.app/price/data.json');
      } catch (e) {}
    }
  }

  if (response?.status !== 200) {
    return undefined;
  }

  const generateDataPriceRaw = await response.json() as unknown || [];

  return isArray(generateDataPriceRaw)
    ? generateDataPriceRaw as Array<GeckoItem>
    : Object.entries(generateDataPriceRaw as Record<string, Omit<GeckoItem, 'id'>>).map(([id, value]) => ({ ...value, id }) as GeckoItem);
};

/**
 * Prices for `priceIds`, asked in pages of `PRICE_PAGE_SIZE`: one request for every id lost all past the
 * 250 largest. A page no source answers keeps its ids' `previous` prices instead of reading as $0.
 */
export const getPriceMap = async (priceIds: Set<string>, currency: CurrencyType = 'USD', skipDerivativePrice?: boolean, previous?: Partial<Omit<PriceJson, 'exchangeRateMap'>>): Promise<Omit<PriceJson, 'exchangeRateMap'>> => {
  const ids = Array.from(priceIds);

  try {
    const derivativePriceMap: Record<string, number> = {};
    const lastUpdatedMap: Record<string, Date> = {};
    let derivativeApiError = false;

    if (!skipDerivativePrice) {
      try {
        const responseDerivativeTokens = await fetch(`${apiCacheDomain}/api/price/derivative-get`);
        const generateDerivativePriceRaw = await responseDerivativeTokens?.json() as unknown || [];

        if (Array.isArray(generateDerivativePriceRaw)) {
          generateDerivativePriceRaw.forEach((token: DerivativeTokenPrice) => {
            if (token.id) {
              derivativePriceMap[token.id] = token.derived_price;
              lastUpdatedMap[token.id] = new Date(token.cached_at || Date.now());
            }
          });
        } else {
          console.warn('Invalid data from derivative API:', generateDerivativePriceRaw);
          derivativeApiError = true;
        }
      } catch (error) {
        console.error('Error fetching derivative API:', error);
        derivativeApiError = true;
      }
    }

    const currencyData = staticData[StaticKey.CURRENCY_SYMBOL][currency || DEFAULT_CURRENCY] as CurrencyJson;
    const priceMap: Record<string, number> = {};
    const price24hMap: Record<string, number> = {};
    const supported = new Set<string>();

    // One page after another, to stay inside CoinGecko's rate limit
    for (let start = 0; start < ids.length; start += PRICE_PAGE_SIZE) {
      const page = ids.slice(start, start + PRICE_PAGE_SIZE);
      const responseDataPrice = await fetchPricePage(page, currency);

      if (!responseDataPrice) {
        page.forEach((id) => {
          if (previous?.priceMap?.[id] !== undefined) {
            priceMap[id] = previous.priceMap[id];
            price24hMap[id] = previous.price24hMap?.[id] ?? previous.priceMap[id];
            previous.lastUpdatedMap?.[id] && (lastUpdatedMap[id] = previous.lastUpdatedMap[id]);
            previous.priceCoinGeckoSupported?.includes(id) && supported.add(id);
          }
        });

        continue;
      }

      responseDataPrice.forEach((val) => {
        const currentPrice = val.current_price || 0;
        const price24h = currentPrice - (val.price_change_24h || 0);

        supported.add(val.id);
        priceMap[val.id] = currentPrice;
        price24hMap[val.id] = price24h;
        lastUpdatedMap[val.id] = new Date(val.last_updated || val.last_updated_at || Date.now());
      });
    }

    const priceCoinGeckoSupported = [...supported];

    const derivativeTokenSlugs = await fetchDerivativeTokenSlugs();

    // TODO: The API for derivatives does not provide a 24-hour price change value.
    if (derivativeApiError) {
      derivativeTokenSlugs.forEach((slug) => {
        priceMap[slug] = 0;
      });
    } else {
      Object.entries(derivativePriceMap).forEach(([slug, derivedPrice]) => {
        priceMap[slug] = derivedPrice;
      });
    }

    return {
      currency,
      currencyData,
      priceMap,
      price24hMap,
      priceCoinGeckoSupported,
      lastUpdatedMap
    };
  } catch (e) {
    return {} as Omit<PriceJson, 'exchangeRateMap'>;
  }
};

export const getHistoryPrice = async (priceId: string, type: PriceChartTimeframe): Promise<HistoryTokenPriceJSON> => {
  try {
    const response = await subwalletApiSdk.priceHistoryApi.getPriceHistory(priceId, type);

    if (response) {
      return response;
    }
  } catch (e) {
    console.error('Error fetching price history:', e);
  }

  return { history: [] };
};
