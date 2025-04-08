// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardanoPaginate, Cbor } from '@subwallet/extension-base/background/KoniTypes';
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

  async getCollateral () {
    return await this.sendMessage('cardano(account.get.utxos)', {});
  }

  async getUtxos (amount?: Cbor, paginate?: CardanoPaginate) {
    return await this.sendMessage('cardano(account.get.utxos)', { amount, paginate });
  }

  async getUsedAddresses () {
    const accounts = await this.sendMessage('pub(accounts.listV2)', { accountAuthType: 'cardano' });

    return accounts.map((account) => account.address);
  }

  async getChangeAddress () {
    const accounts = await this.sendMessage('pub(accounts.listV2)', { accountAuthType: 'cardano' });

    return accounts.map((account) => account.address)[0];
  }

  getUnusedAddresses (x?: any) {
    console.log('getUnusedAddresses');
  }

  async signTx (tx: Cbor, partialSign = false) {
    return await this.sendMessage('cardano(sign.tx)', { tx, partialSign });
  }

  async signData (address: string, payload: string) {
    return await this.sendMessage('cardano(sign.data)', { address, payload });
  }

  async submitTx (tx: Cbor) {
    return await this.sendMessage('cardano(submit.tx)', tx);
  }
}
