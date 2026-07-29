// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APP_VERSION, BACKEND_API_URL } from '@subwallet/extension-base/constants';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

import { TARGET_ENV } from './environment';

const CHAIN_LIST_VERSION = process.env.CHAIN_LIST_VERSION as string;

export function setupApiSDK () {
  subwalletApiSdk.updateConfig({
    appVersion: APP_VERSION,
    baseUrl: BACKEND_API_URL,
    platform: TARGET_ENV,
    chainListVersion: CHAIN_LIST_VERSION
  });
}
