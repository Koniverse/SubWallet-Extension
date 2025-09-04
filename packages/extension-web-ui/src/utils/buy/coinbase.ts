// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CreateBuyOrderFunction } from '@subwallet/extension-web-ui/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

export const createCoinbaseOrder: CreateBuyOrderFunction = ({ address, network, symbol }) => {
  return subwalletApiSdk.onrampCoinbaseApi.generateOnRampUrl({
    assets: [symbol],
    address,
    networks: [network]
  });
};
