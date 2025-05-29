// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BACKEND_PROXY_API_URL, ProxyServiceRoute } from '@subwallet/extension-base/constants';
import { CardanoAddressBalance, CardanoBalanceItem, CardanoUtxosItem, TransactionUtxosItem } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';
import { cborToBytes, retryCardanoTxStatus } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/utils';
import { _ApiOptions } from '@subwallet/extension-base/services/chain-service/handler/types';
import { _CardanoApi, _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils';
import { BehaviorSubject } from 'rxjs';

import { hexAddPrefix, isHex } from '@polkadot/util';

// export const API_KEY = {
//   mainnet: process.env.BLOCKFROST_API_KEY_MAIN || '',
//   testnet: process.env.BLOCKFROST_API_KEY_PREP || ''
// };

const proxyApi = `${BACKEND_PROXY_API_URL}${ProxyServiceRoute.CARDANO}`;

export class CardanoApi implements _CardanoApi {
  chainSlug: string;
  // private api: BlockFrostAPI;
  apiUrl: string;
  apiError?: string;
  apiRetry = 0;
  public readonly isApiConnectedSubject = new BehaviorSubject(false);
  public readonly connectionStatusSubject = new BehaviorSubject(_ChainConnectionStatus.DISCONNECTED);
  isApiReady = false;
  isApiReadyOnce = false;
  isReadyHandler: PromiseHandler<_CardanoApi>;
  isTestnet: boolean; // todo: add api with interface BlockFrostAPI to remove isTestnet check

  providerName: string;

  constructor (chainSlug: string, apiUrl: string, { isTestnet, providerName }: _ApiOptions) {
    this.chainSlug = chainSlug;
    this.apiUrl = apiUrl;
    this.isTestnet = isTestnet ?? true;
    this.providerName = providerName || 'unknown';
    // this.api = this.createProvider(isTestnet);
    this.isReadyHandler = createPromiseHandler<_CardanoApi>();

    this.connect();
  }

  get isApiConnected (): boolean {
    return this.isApiConnectedSubject.getValue();
  }

  get connectionStatus (): _ChainConnectionStatus {
    return this.connectionStatusSubject.getValue();
  }

  private updateConnectionStatus (status: _ChainConnectionStatus): void {
    const isConnected = status === _ChainConnectionStatus.CONNECTED;

    if (isConnected !== this.isApiConnectedSubject.value) {
      this.isApiConnectedSubject.next(isConnected);
    }

    if (status !== this.connectionStatusSubject.value) {
      this.connectionStatusSubject.next(status);
    }
  }

  get isReady (): Promise<_CardanoApi> {
    return this.isReadyHandler.promise;
  }

  async updateApiUrl (apiUrl: string) {
    if (this.apiUrl === apiUrl) {
      return;
    }

    await this.disconnect();

    this.apiUrl = apiUrl;
    // this.api = this.createProvider();
  }

  async recoverConnect () {
    await this.disconnect();
    this.connect();

    await this.isReadyHandler.promise;
  }

  // private createProvider (isTestnet = true): BlockFrostAPI {
  //   const projectId = isTestnet ? API_KEY.testnet : API_KEY.mainnet;
  //
  //   return new BlockFrostAPI({
  //     projectId
  //   });
  // }

  connect (): void {
    this.updateConnectionStatus(_ChainConnectionStatus.CONNECTING);
    // There isn't a persistent network connection underlying TonClient. Cant check connection status.
    // this.isApiReadyOnce = true;
    this.onConnect();
  }

  async disconnect () {
    this.onDisconnect();
    this.updateConnectionStatus(_ChainConnectionStatus.DISCONNECTED);

    return Promise.resolve();
  }

  destroy () {
    // Todo: implement this in the future
    return this.disconnect();
  }

  onConnect (): void {
    if (!this.isApiConnected) {
      console.log(`Connected to ${this.chainSlug} at ${this.apiUrl}`);
      this.isApiReady = true;

      if (this.isApiReadyOnce) {
        this.isReadyHandler.resolve(this);
      }
    }

    this.updateConnectionStatus(_ChainConnectionStatus.CONNECTED);
  }

  onDisconnect (): void {
    this.updateConnectionStatus(_ChainConnectionStatus.DISCONNECTED);

    if (this.isApiConnected) {
      console.warn(`Disconnected from ${this.chainSlug} of ${this.apiUrl}`);
      this.isApiReady = false;
      this.isReadyHandler = createPromiseHandler<_CardanoApi>();
    }
  }

  async getBalanceMap (address: string): Promise<CardanoBalanceItem[]> {
    try {
      const url = `${proxyApi}/addresses/${address}?isTestnet=${this.isTestnet.toString()}`;

      const response = await fetch(
        url, {
          method: 'GET'
        }
      );

      const addressBalance = await response.json() as CardanoAddressBalance;

      console.log('addressBalance', addressBalance);

      return addressBalance.amount;
    } catch (e) {
      console.error('Error on getting account balance', e);

      return [];
    }
  }

  async getUtxos (address: string, page: number, limit: number): Promise<CardanoUtxosItem[]> {
    try {
      let url = `${proxyApi}/addresses/${address}/utxos?isTestnet=${this.isTestnet.toString()}`;

      url += `&page=${page}&count=${limit}`;

      const response = await fetch(
        url, {
          method: 'GET'
        }
      );

      const utxos = await response.json() as CardanoUtxosItem[];

      return utxos;
    } catch (e) {
      console.error('Error on getting account balance', e);

      return [];
    }
  }

  async getSpecificUtxo (txHash: string): Promise<TransactionUtxosItem> {
    try {
      const url = `${proxyApi}/txs/${txHash}/utxos?isTestnet=${this.isTestnet.toString()}`;

      const response = await fetch(
        url, {
          method: 'GET'
        }
      );

      const utxo = await response.json() as TransactionUtxosItem;

      return utxo;
    } catch (e) {
      console.error('Error on getting account balance', e);

      return {} as TransactionUtxosItem;
    }
  }

  async sendCardanoTxReturnHash (tx: string): Promise<string> {
    try {
      const url = `${proxyApi}/tx/submit?isTestnet=${this.isTestnet.toString()}`;
      const response = await fetch(
        url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/cbor'
          },
          body: cborToBytes(tx)
        }
      );

      const hash = (await response.text()).replace(/^"|"$/g, '');

      if (isHex(hexAddPrefix(hash))) {
        return hash;
      } else {
        console.error('Error on submitting cardano tx');

        return '';
      }
    } catch (e) {
      console.error('Error on submitting cardano tx', e);

      return '';
    }
  }

  async getStatusByTxHash (txHash: string, ttl: number): Promise<boolean> {
    const cronTime = 30000;

    return retryCardanoTxStatus(async () => {
      const url = `${proxyApi}/txs/${txHash}?isTestnet=${this.isTestnet.toString()}`;
      const response = await fetch(
        url, {
          method: 'GET'
        }
      );

      const txInfo = await response.json() as { hash: string, block: string, index: number };

      if (txInfo.block && txInfo.hash && txInfo.index >= 0) {
        return true;
      }

      throw new Error('Transaction not found');
    }, { retries: ttl / cronTime, delay: cronTime });
  }
}
