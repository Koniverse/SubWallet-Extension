// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MELD_URL, MELD_WIZARD_KEY } from '@subwallet/extension-koni-ui/constants';
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

    const query = qs.stringify(params);

    resolve(`${MELD_URL}?publicKey=${MELD_WIZARD_KEY}&${query}`);
  });
};
