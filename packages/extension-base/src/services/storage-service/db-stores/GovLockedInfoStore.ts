// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVotingInfo } from '../../open-gov/interface';
import BaseStore from './BaseStore';

export default class GovLockedInfoStore extends BaseStore<GovVotingInfo> {
  async getAll () {
    return this.table.toArray();
  }

  async getByAddresses (addresses: string[]) {
    if (addresses.length === 0) {
      return this.getAll();
    }

    return this.table.where('address').anyOfIgnoreCase(addresses).toArray();
  }

  async getByAddressesAndChains (addresses: string[], chains: string[]) {
    return this.table
      .where('address')
      .anyOfIgnoreCase(addresses)
      .filter((item) => chains.includes(item.chain))
      .toArray();
  }

  async upsertMany (infos: GovVotingInfo[]) {
    return this.table.bulkPut(infos);
  }

  removeByAddresses (addresses: string[]) {
    return this.table.where('address').anyOf(addresses).delete();
  }

  removeByChains (chains: string[]) {
    return this.table.where('chain').anyOf(chains).delete();
  }
}
