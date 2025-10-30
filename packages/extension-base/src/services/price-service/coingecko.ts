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

export const getPriceMap = async (priceIds: Set<string>, currency: CurrencyType = 'USD', skipDerivativePrice?: boolean): Promise<Omit<PriceJson, 'exchangeRateMap'>> => {
  const idStr = Array.from(priceIds).join(',');
  let response: Response | undefined;

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

    if (!useBackupApi) {
      try {
        response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&per_page=250&ids=${idStr}`);
      } catch (err) {
        useBackupApi = true;
      }
    }

    if (useBackupApi || response?.status !== 200) {
      useBackupApi = true;

      try {
        response = await fetch(`https://api-cache.subwallet.app/api/price/get?ids=${idStr}`);
      } catch (e) {}

      if (response?.status !== 200) {
        try {
          response = await fetch('https://static-cache.subwallet.app/price/data.json');
        } catch (e) {}
      }
    }

    const generateDataPriceRaw = await response?.json() as unknown || [];
    const responseDataPrice = isArray(generateDataPriceRaw)
      ? generateDataPriceRaw as Array<GeckoItem>
      : Object.entries(generateDataPriceRaw).map(([id, value]) => ({ ...value, id }) as GeckoItem);
    const currencyData = staticData[StaticKey.CURRENCY_SYMBOL][currency || DEFAULT_CURRENCY] as CurrencyJson;
    const priceMap: Record<string, number> = {};
    const price24hMap: Record<string, number> = {};
    const priceCoinGeckoSupported: string[] = [];

    responseDataPrice.forEach((val) => {
      const currentPrice = val.current_price || 0;
      const price24h = currentPrice - (val.price_change_24h || 0);

      priceCoinGeckoSupported.push(val.id);
      priceMap[val.id] = currentPrice;
      price24hMap[val.id] = price24h;
      lastUpdatedMap[val.id] = new Date(val.last_updated || val.last_updated_at || Date.now());
    });

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
