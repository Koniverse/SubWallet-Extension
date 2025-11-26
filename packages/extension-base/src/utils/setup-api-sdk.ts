// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APP_VERSION, BACKEND_API_URL, CACHED_API_URL, isProductionMode, STATIC_CONTENT_API_URL, STATIC_DATA_CACHING_API_URL } from '@subwallet/extension-base/constants';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

import { TARGET_ENV } from './environment';

const CHAIN_LIST_VERSION = process.env.CHAIN_LIST_VERSION as string;

export function setupApiSDK () {
  subwalletApiSdk.updateConfig({
    appVersion: APP_VERSION,
    baseUrl: BACKEND_API_URL,
    platform: TARGET_ENV,
    chainListVersion: CHAIN_LIST_VERSION,
    isProduction: isProductionMode
  });

  subwalletApiSdk.staticDataCacheApi.updateConfig({
    baseUrl: STATIC_DATA_CACHING_API_URL
  });

  subwalletApiSdk.staticContentApi.updateConfig({
    baseUrl: STATIC_CONTENT_API_URL
  });

  subwalletApiSdk.externalCacheClientApi.updateConfig({
    baseUrl: CACHED_API_URL
  });
}
