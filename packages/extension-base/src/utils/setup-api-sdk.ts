// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APP_VERSION, BACKEND_API_URL, CACHED_API_URL, isProductionMode, STATIC_CONTENT_API_URL, STATIC_DATA_CACHING_API_URL } from '@subwallet/extension-base/constants';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

import { TARGET_ENV } from './environment';

const CHAIN_LIST_VERSION = process.env.CHAIN_LIST_VERSION as string;

const staticContentFallbackLoader = async <T>(slug: string): Promise<T | undefined> => {
  const safe = slug.replace(/\//g, '_');

  try {
    const mod = await import(
      `@subwallet-monorepos/subwallet-services-sdk/data/staticData/staticContent/${safe}.json`
    ) as { default?: T } | T;

    if (mod && typeof mod === 'object' && 'default' in mod) {
      return (mod as { default?: T }).default as T;
    }

    return mod as T;
  } catch (e) {
    return undefined;
  }
};

export function setupApiSDK () {
  subwalletApiSdk.updateConfig({
    appVersion: APP_VERSION,
    baseUrl: BACKEND_API_URL,
    platform: TARGET_ENV,
    chainListVersion: CHAIN_LIST_VERSION,
    isProduction: isProductionMode,
    fallbackLoader: {
      staticContent: staticContentFallbackLoader
    }
  });

  subwalletApiSdk.staticDataCacheApi.updateConfig({
    baseUrl: STATIC_DATA_CACHING_API_URL
  });

  subwalletApiSdk.staticContentApi.updateConfig({
    baseUrl: STATIC_CONTENT_API_URL
  });

  subwalletApiSdk.dynamicCacheApi.updateConfig({
    baseUrl: CACHED_API_URL
  });
}
