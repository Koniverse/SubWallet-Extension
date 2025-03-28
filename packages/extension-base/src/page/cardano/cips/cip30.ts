// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SendRequest } from '@subwallet/extension-base/page/types';

export class CIP30Api {
  private sendMessage: SendRequest;

  constructor (sendMessage: SendRequest) {
    this.sendMessage = sendMessage;
  }

  getExtension () {
    // Implementation here
  }

  getNetworkId () {
    return 0;
  }

  getUtxos () {
    console.log('getUtxos');
  }

  async getUsedAddresses () {
    const accounts = await this.sendMessage('pub(accounts.listV2)', { accountAuthType: 'cardano' });

    return accounts.map((account) => account.address);
  }

  getChangeAddress (x?: any) {
    console.log('getChangeAddress');
  }

  getUnusedAddresses (x?: any) {
    console.log('getUnusedAddresses');
  }

  signTx () {
    // Implementation here
  }

  async signData (address: string, payload: string) {
    return await this.sendMessage('cardano(sign.data)', { address, payload });
  }

  submitTx () {
    // Implementation here
  }
}
