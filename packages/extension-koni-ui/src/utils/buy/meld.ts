// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MELD_API_KEY, MELD_TEST_MODE, MELD_URL } from '@subwallet/extension-koni-ui/constants';
import { CreateBuyOrderFunction } from '@subwallet/extension-koni-ui/types';
import qs from 'querystring';

type Params = {
  publicKey?: string,
  destinationCurrencyCode: string,
  walletAddress: string
}

export const createMeldOrder: CreateBuyOrderFunction = (symbol, address) => {
  return new Promise((resolve) => {
    const params: Params = {
      destinationCurrencyCode: symbol,
      walletAddress: address
    };

    if (!MELD_TEST_MODE) {
      params.publicKey = MELD_API_KEY;
    }

    const query = qs.stringify(params);

    resolve(`${MELD_URL}?${query}`);
  });
};
