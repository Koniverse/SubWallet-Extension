// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CreateBuyOrderFunction } from '@subwallet/extension-koni-ui/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

export const createCoinbaseOrder: CreateBuyOrderFunction = (asset, address, network) => {
  return subwalletApiSdk.onrampCoinbaseApi.generateOnRampUrl({
    assets: [asset],
    address,
    networks: [network]
  });
};
