// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CreateBuyOrderFunction } from '@subwallet/extension-web-ui/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

export const createTransakOrder: CreateBuyOrderFunction = (orderParams) => {
  const { action = 'BUY', address, network, slug = '', symbol } = orderParams;

  const location = window.location.origin;
  // partnerCustomerId is used to determine which account will sell tokens
  const redirectURL = `${location}/off-ramp-loading?slug=${slug ?? ''}&partnerCustomerId=${address}`;

  return subwalletApiSdk.transakApi.generateOrderUrl({
    symbol: symbol,
    address: address,
    network: network,
    walletReference: address,
    action: action,
    redirectURL: redirectURL,
    referrerDomain: 'https://web.subwallet.app'
  });
};
