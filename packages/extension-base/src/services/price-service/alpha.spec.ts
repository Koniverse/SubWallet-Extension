// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getAlphaPrices, getAlphaPriceIdByNetuid } from './alpha';

const TAO_ID = 'bittensor';

describe('Alpha prices on chain (EXT-2)', () => {
  const priceMap = { [TAO_ID]: 300, apex: 4.2, templar: 1.1 };
  const price24hMap = { [TAO_ID]: 290, apex: 4.0, templar: 1.1 };

  it('values alpha as on-chain alpha → TAO × TAO, not at the CoinGecko listing', () => {
    // CoinGecko's apex sits above spot × its own TAO price, as 117 of 125 subnets did on 10-14
    const result = getAlphaPrices({ taoPerAlpha: { 1: 0.0138 }, coingeckoIds: { 1: 'apex' }, taoPriceId: TAO_ID, priceMap, price24hMap });

    expect(result.priceMap[getAlphaPriceIdByNetuid(1)]).toBeCloseTo(4.14, 10);
  });

  it('keeps CoinGecko\'s relative 24h move on top of the on-chain price', () => {
    const result = getAlphaPrices({ taoPerAlpha: { 1: 0.0138 }, coingeckoIds: { 1: 'apex' }, taoPriceId: TAO_ID, priceMap, price24hMap });
    const key = getAlphaPriceIdByNetuid(1);

    // CoinGecko moved 4.0 → 4.2 (+5%), so the on-chain price shows +5% too
    expect(result.priceMap[key] / result.price24hMap[key]).toBeCloseTo(4.2 / 4.0, 10);
  });

  it('prices a subnet with no CoinGecko id, with no 24h change', () => {
    const result = getAlphaPrices({ taoPerAlpha: { 83: 0.01 }, coingeckoIds: {}, taoPriceId: TAO_ID, priceMap, price24hMap });
    const key = getAlphaPriceIdByNetuid(83);

    expect(result.priceMap[key]).toBeCloseTo(3, 10);
    expect(result.price24hMap[key]).toBe(result.priceMap[key]);
  });

  it('falls back to CoinGecko when the chain cannot be read', () => {
    const result = getAlphaPrices({ taoPerAlpha: {}, coingeckoIds: { 3: 'templar' }, taoPriceId: TAO_ID, priceMap, price24hMap });

    expect(result.priceMap[getAlphaPriceIdByNetuid(3)]).toBe(1.1);
  });

  it('leaves out root and subnets nothing can price', () => {
    const result = getAlphaPrices({ taoPerAlpha: { 0: 1, 7: 0 }, coingeckoIds: { 9: 'unknown' }, taoPriceId: TAO_ID, priceMap, price24hMap });

    expect(Object.keys(result.priceMap)).toEqual([]);
  });

  it('prices nothing on chain without TAO\'s price', () => {
    const result = getAlphaPrices({ taoPerAlpha: { 83: 0.01 }, coingeckoIds: {}, taoPriceId: TAO_ID, priceMap: {}, price24hMap: {} });

    expect(result.priceMap).toEqual({});
  });
});
