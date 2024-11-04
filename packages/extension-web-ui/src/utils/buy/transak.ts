// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TRANSAK_API_KEY, TRANSAK_URL } from '@subwallet/extension-web-ui/constants';
import { CreateBuyOrderFunction } from '@subwallet/extension-web-ui/types';
import qs from 'querystring';

interface TransakOrderParams {
  apiKey: string;
  defaultCryptoCurrency: string;
  networks: string;
  cryptoCurrencyList: string;
  productsAvailed: string;
  walletAddress?: string;
  partnerCustomerId?: string;
  redirectURL?: string;
  walletRedirection?: boolean;
}

export const createTransakOrder: CreateBuyOrderFunction = (orderParams) => {
  const { action = 'BUY', address, network, slug = '', symbol } = orderParams;

  return new Promise((resolve) => {
    const location = window.location.origin;
    const params: TransakOrderParams = {
      apiKey: '307807a5-5fb3-4add-8a6c-fca4972e0470',
      defaultCryptoCurrency: symbol,
      networks: network,
      cryptoCurrencyList: symbol,
      productsAvailed: action || 'BUY'
    };

    if (action === 'BUY') {
      params.walletAddress = address;
    } else {
      params.partnerCustomerId = address;
      params.redirectURL = `${location}/off-ramp-loading?slug=${slug ?? ''}`;
      params.walletRedirection = true;
    }

    const query = qs.stringify(params as unknown as Record<string, string | number | boolean | null>);

    resolve(`${TRANSAK_URL}?${query}`);
  });
};
