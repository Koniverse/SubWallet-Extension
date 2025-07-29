// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APP_VERSION, BACKEND_API_URL, BACKEND_PRICE_HISTORY_URL } from '@subwallet/extension-base/constants';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

import { ChainListVersion } from '../services/chain-service/utils';
import { TARGET_ENV } from './environment';

export function setupApiSDK () {
  // todo: appVersion packageInfo.version
  subwalletApiSdk.updateConfig({
    appVersion: APP_VERSION,
    baseUrl: BACKEND_API_URL,
    platform: TARGET_ENV,
    chainListVersion: ChainListVersion
  });

  // Custom the price history API with other different base URL
  subwalletApiSdk.priceHistoryApi.updateConfig({
    baseUrl: BACKEND_PRICE_HISTORY_URL
  });
}
