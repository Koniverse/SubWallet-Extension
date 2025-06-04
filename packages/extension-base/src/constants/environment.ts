// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TARGET_ENV } from '../utils';

const PRODUCTION_BRANCHES = ['master', 'webapp', 'webapp-dev'];
const branchName = process.env.BRANCH_NAME || 'subwallet-dev';

export const isProductionMode = PRODUCTION_BRANCHES.indexOf(branchName) > -1;
export const BACKEND_API_URL = process.env.SUBWALLET_API || (isProductionMode ? 'https://sw-services.subwallet.app/api' : 'https://be-dev.subwallet.app/api');
export const BACKEND_PRICE_HISTORY_URL = process.env.SUBWALLET_PRICE_HISTORY_API || (isProductionMode ? 'https://price-history.subwallet.app/api' : 'https://price-history-dev.subwallet.app/api');

export const SW_EXTERNAL_SERVICES_API = process.env.SW_EXTERNAL_SERVICES_API || (isProductionMode ? 'https://external-services.subwallet.app/' : 'https://external-services-dev.subwallet.app/');

export enum ProxyServiceRoute {
  BITTENSOR = 'bittensor',
  CHAINFLIP = 'chainflip',
  KYBER = 'kyber',
  SIMPLESWAP = 'simpleswap',
  UNISWAP = 'uniswap',
  CARDANO = 'cardano',
  PARASPELL = 'paraspell',
}

export function formatExternalServiceApi (url: string, isTestnet?: boolean): string {
  if (isTestnet === true) {
    return `${url}/testnet`;
  }

  if (isTestnet === false) {
    return `${url}/mainnet`;
  }

  return url;
}

export enum HEADERS {
  PLATFORM = 'Platform'
}

export async function fetchFromProxyService (service: ProxyServiceRoute, path: string, options: RequestInit, isTestnet?: boolean) {
  const baseUrl = formatExternalServiceApi(`${SW_EXTERNAL_SERVICES_API}${service}`, isTestnet);
  const url = `${baseUrl}${path}`;
  const headers = {
    [HEADERS.PLATFORM]: TARGET_ENV,
    ...(options.headers || {})
  };

  console.log('hmm', [url, options, headers]);

  return fetch(url, {
    ...options,
    headers
  });
}
