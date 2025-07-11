// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MELD_URL, MELD_WIZARD_KEY } from '@subwallet/extension-web-ui/constants';
import { CreateBuyOrderFunction } from '@subwallet/extension-web-ui/types';
import qs from 'querystring';

type Params = {
  publicKey?: string,
  destinationCurrencyCode: string,
  walletAddress: string
}

export const createMeldOrder: CreateBuyOrderFunction = (orderParams) => {
  const { address, symbol } = orderParams;

  return new Promise((resolve) => {
    const params: Params = {
      destinationCurrencyCode: symbol,
      walletAddress: address
    };

    const query = qs.stringify(params);

    resolve(`${MELD_URL}?publicKey=${MELD_WIZARD_KEY}&${query}`);
  });
};
