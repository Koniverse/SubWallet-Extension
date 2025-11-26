// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CurrencyJson, CurrencyType, ExchangeRateJSON, HistoryTokenPriceJSON, PriceChartTimeframe, PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { DerivativeTokenPrice, ExchangeRateItem, GeckoItem, staticData, StaticKey } from '@subwallet-monorepos/subwallet-services-sdk/services';

const DEFAULT_CURRENCY = 'USD';
const DERIVATIVE_TOKEN_SLUG_LIST = ['susds', 'savings-dai'];

let useBackupApi = false;

export const getExchangeRateMap = async (): Promise<Record<CurrencyType, ExchangeRateJSON>> => {
  let responseDataExchangeRate: ExchangeRateItem | undefined;

  try {
    try {
      responseDataExchangeRate = await subwalletApiSdk.externalCacheClientApi.fetchLastedExchangeRate();
    } catch (e) {}

    if (!responseDataExchangeRate) {
      try {
        responseDataExchangeRate = await subwalletApiSdk.staticDataCacheApi.fetchExchangeRatesStatic();
      } catch (e) {}
    }

    if (!responseDataExchangeRate) {
      return {} as Record<CurrencyType, ExchangeRateJSON>;
    }

    return Object.keys(responseDataExchangeRate.conversion_rates)
      .reduce((map, exchangeKey) => {
        const staticCurrencyData = staticData[StaticKey.CURRENCY_SYMBOL];

        if (!staticCurrencyData[exchangeKey]) {
          return map;
        }

        map[exchangeKey as CurrencyType] = {
          exchange: responseDataExchangeRate?.conversion_rates[exchangeKey] || 0,
          label: (staticCurrencyData[exchangeKey] as CurrencyJson).label
        };

        return map;
      }, {} as Record<CurrencyType, ExchangeRateJSON>);
  } catch (e) {
    return {} as Record<CurrencyType, ExchangeRateJSON>;
  }
};

const fetchDerivativeTokenSlugs = async () => {
  try {
    const data = await subwalletApiSdk.externalCacheClientApi.fetchDerivationTokenSlugs();
    const apiSlugs: string[] = Array.isArray(data) && data.every((item) => typeof item === 'string')
      ? (data)
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
    let responseDataPrice: GeckoItem[] = [];

    if (!skipDerivativePrice) {
      try {
        const generateDerivativePriceRaw = await subwalletApiSdk.externalCacheClientApi.fetchDerivativeTokens();

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
        responseDataPrice = (await response.json()) as GeckoItem[];
      } catch (err) {
        useBackupApi = true;
      }
    }

    if (useBackupApi || response?.status !== 200) {
      useBackupApi = true;

      try {
        responseDataPrice = await subwalletApiSdk.externalCacheClientApi.fetchLastedPriceList(idStr);
      } catch (e) {}

      if (!response) {
        try {
          responseDataPrice = await subwalletApiSdk.staticDataCacheApi.fetchPriceListStatic();
        } catch (e) {}
      }
    }

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
