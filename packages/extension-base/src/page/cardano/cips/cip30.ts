// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardanoPaginate, Cbor } from '@subwallet/extension-base/background/KoniTypes';
import { SendRequest } from '@subwallet/extension-base/page/types';

export class CIP30Api {
  private readonly sendMessage: SendRequest;

  constructor (sendMessage: SendRequest) {
    this.sendMessage = sendMessage;
  }

  private getExtension () {
    return [{ cip: 30 }];
  }

  private async getNetworkId () {
    return await this.sendMessage('cardano(network.get.current)');
  }

  private async getCollateral (payload: { amount: Cbor }) {
    return await this.sendMessage('cardano(account.get.collateral)', payload);
  }

  private async getUtxos (amount?: Cbor, paginate?: CardanoPaginate) {
    return await this.sendMessage('cardano(account.get.utxos)', { amount, paginate });
  }

  private async getUsedAddresses () {
    return await this.sendMessage('cardano(account.get.address)');
  }

  private async getChangeAddress () {
    return await this.sendMessage('cardano(account.get.change.address)');
  }

  private async getUnusedAddresses (): Promise<string[]> {
    return new Promise((resolve) => resolve([]));
  }

  private async getRewardAddresses (): Promise<string[]> {
    return await this.sendMessage('cardano(account.get.reward.address)');
  }

  private async signTx (tx: Cbor, partialSign = false) {
    return await this.sendMessage('cardano(transaction.sign)', { tx, partialSign });
  }

  private async signData (address: string, payload: string) {
    return await this.sendMessage('cardano(data.sign)', { address, payload });
  }

  private async submitTx (tx: Cbor) {
    return await this.sendMessage('cardano(transaction.submit)', tx);
  }

  private async getBalance () {
    return await this.sendMessage('cardano(account.get.balance)');
  }

  get apis () {
    return {
      getExtension: () => this.getExtension(),
      getNetworkId: () => this.getNetworkId(),
      getCollateral: (payload: { amount: Cbor }) => this.getCollateral(payload),
      getUtxos: (amount?: Cbor, paginate?: CardanoPaginate) => this.getUtxos(amount, paginate),
      getUsedAddresses: () => this.getUsedAddresses(),
      getChangeAddress: () => this.getChangeAddress(),
      getUnusedAddresses: () => this.getUnusedAddresses(),
      getRewardAddresses: () => this.getRewardAddresses(),
      signTx: (tx: Cbor, partialSign = false) => this.signTx(tx, partialSign),
      signData: (address: string, payload: string) => this.signData(address, payload),
      submitTx: (tx: Cbor) => this.submitTx(tx),
      getBalance: () => this.getBalance()
    };
  }
}
