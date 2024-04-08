// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';

export async function getEVMBalance (networkKey: string, addresses: string[], web3Api: _EvmApi): Promise<string[]> {
  return await Promise.all(addresses.map(async (address) => {
    try {
      return await web3Api.api.eth.getBalance(address);
    } catch (e) {
      return '0';
    }
  }));
}
