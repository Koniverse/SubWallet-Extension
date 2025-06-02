// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

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

export function formatExternalServiceApi (baseUrl: string, isTestnet: boolean): string {
  const network = isTestnet ? 'testnet' : 'mainnet';

  return `${baseUrl}/${network}`;
}
