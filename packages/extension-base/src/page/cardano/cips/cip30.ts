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

  async getNetworkId () {
    return await this.sendMessage('cardano(network.get.current)');
  }

  async getCollateral () {
    return await this.sendMessage('cardano(account.get.utxos)', {});
  }

  async getUtxos (amount?: Cbor, paginate?: CardanoPaginate) {
    return await this.sendMessage('cardano(account.get.utxos)', { amount, paginate });
  }

  async getUsedAddresses () {
    return await this.sendMessage('cardano(account.get.address)');
  }

  async getChangeAddress () {
    return await this.sendMessage('cardano(account.get.change.address)');
  }

  async getUnusedAddresses (): Promise<string[]> {
    return new Promise((resolve) => resolve([]));
  }

  async getRewardAddresses (): Promise<string[]> {
    return new Promise((resolve) => resolve([]));
  }

  async signTx (tx: Cbor, partialSign = false) {
    return await this.sendMessage('cardano(transaction.sign)', { tx, partialSign });
  }

  async signData (address: string, payload: string) {
    return await this.sendMessage('cardano(data.sign)', { address, payload });
  }

  async submitTx (tx: Cbor) {
    return await this.sendMessage('cardano(transaction.submit)', tx);
  }

  async getBalance () {
    return await this.sendMessage('cardano(account.get.balance)');
  }
}
