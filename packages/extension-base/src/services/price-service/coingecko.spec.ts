// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getPriceMap, PRICE_PAGE_SIZE } from './coingecko';

// The real modules read browser globals on import
jest.mock('@subwallet/extension-base/constants', () => ({ isProductionMode: false }));
jest.mock('@subwallet/extension-base/utils/staticData', () => ({ staticData: { currency_symbols: { USD: {} } }, StaticKey: { CURRENCY_SYMBOL: 'currency_symbols' } }));
jest.mock('@subwallet-monorepos/subwallet-services-sdk', () => ({ __esModule: true, default: {} }));

interface FakeResponse { status: number, ok: boolean, json: () => Promise<unknown> }

const respond = (status: number, body: unknown): FakeResponse => ({ status, ok: status === 200, json: () => Promise.resolve(body) });
const idsOf = (url: string) => new URL(url).searchParams.get('ids')?.split(',') || [];
const coin = (id: string) => ({ id, name: id, symbol: id, current_price: 2, price_change_24h: 0.5, last_updated: '2026-10-16T00:00:00Z' });

describe('Price pages (EXT-40)', () => {
  const ids = Array.from({ length: 413 }, (_, i) => `coin-${i}`);
  let calls: string[] = [];

  afterEach(() => {
    calls = [];
  });

  const mockFetch = (coingecko: (url: string) => FakeResponse) => {
    global.fetch = jest.fn((url: string) => {
      calls.push(url);

      if (url.includes('derivative')) {
        return Promise.resolve(respond(200, []));
      }

      if (url.includes('api.coingecko.com')) {
        return Promise.resolve(coingecko(url));
      }

      return Promise.resolve(respond(500, null));
    }) as unknown as typeof fetch;
  };

  it('asks for every id, at most 250 a request, and keeps them all', async () => {
    // CoinGecko answers at most `per_page` coins and drops the rest without an error
    mockFetch((url) => respond(200, idsOf(url).slice(0, PRICE_PAGE_SIZE).map(coin)));

    const result = await getPriceMap(new Set(ids), 'USD', true);
    const pages = calls.filter((url) => url.includes('api.coingecko.com'));

    expect(pages.length).toBe(2);
    expect(pages.every((url) => idsOf(url).length <= PRICE_PAGE_SIZE)).toBe(true);
    expect(Object.keys(result.priceMap).length).toBe(413);
    expect(result.priceMap['coin-412']).toBe(2);
    expect(result.price24hMap['coin-412']).toBe(1.5);
  });

  it('keeps the last prices of a page no source answers, rather than reading them as $0', async () => {
    // The second page fails everywhere: CoinGecko, the backup API and the static cache
    let page = 0;

    mockFetch((url) => (page++ === 0 ? respond(200, idsOf(url).map(coin)) : respond(429, null)));

    const previous = { priceMap: { 'coin-300': 7 }, price24hMap: { 'coin-300': 6 }, priceCoinGeckoSupported: ['coin-300'], lastUpdatedMap: {} };
    const result = await getPriceMap(new Set(ids), 'USD', true, previous);

    expect(result.priceMap['coin-0']).toBe(2);
    expect(result.priceMap['coin-300']).toBe(7);
    expect(result.price24hMap['coin-300']).toBe(6);
    expect(result.priceCoinGeckoSupported).toContain('coin-300');
    expect(result.priceMap['coin-301']).toBeUndefined();
  });
});
