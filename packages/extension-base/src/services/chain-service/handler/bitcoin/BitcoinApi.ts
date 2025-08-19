// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BlockStreamTestnetRequestStrategy, MempoolTestnetRequestStrategy } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/BlockStreamTestnet';
import { SubWalletMainnetRequestStrategy } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/SubWalletMainnet';
import { BitcoinApiStrategy } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils/promise';
import { BehaviorSubject } from 'rxjs';

import { _ApiOptions } from '../../handler/types';
import { _BitcoinApi, _ChainConnectionStatus } from '../../types';

// const isBlockStreamProvider = (apiUrl: string): boolean => apiUrl === 'https://blockstream-testnet.openbit.app' || apiUrl === 'https://electrs.openbit.app';
// const BLOCKSTREAM_TESTNET_API_URL = 'https://blockstream.info/testnet/api/';
// const MEMPOOL_TESTNET_V4_API_URL = 'https://mempool.space/testnet4/api/';
// const BTC_TESTNET_API_URL = 'https://btc-api-testnet.koni.studio';

export class BitcoinApi implements _BitcoinApi {
  chainSlug: string;
  apiUrl: string;
  apiError?: string;
  apiRetry = 0;
  public readonly isApiConnectedSubject = new BehaviorSubject(false);
  public readonly connectionStatusSubject = new BehaviorSubject(_ChainConnectionStatus.DISCONNECTED);
  isApiReady = false;
  isApiReadyOnce = false;
  isReadyHandler: PromiseHandler<_BitcoinApi>;

  providerName: string;
  api: BitcoinApiStrategy;

  constructor (chainSlug: string, apiUrl: string, { providerName }: _ApiOptions = {}) {
    this.chainSlug = chainSlug;
    this.apiUrl = apiUrl;
    this.providerName = providerName || 'unknown';
    this.isReadyHandler = createPromiseHandler<_BitcoinApi>();
    this.api = this.createApiStrategy(apiUrl);

    this.connect();
  }

  get isApiConnected (): boolean {
    return this.isApiConnectedSubject.getValue();
  }

  private createApiStrategy(apiUrl: string): BitcoinApiStrategy {
    const isTestnet = apiUrl.includes('testnet');
    const isBlockstream = apiUrl.includes('blockstream');
    const isMempool= apiUrl.includes('mempool.space');

    if (isTestnet && isBlockstream) {
      return new BlockStreamTestnetRequestStrategy(apiUrl);
    }

    if (isTestnet && isMempool) {
      return new MempoolTestnetRequestStrategy(apiUrl);
    }

    return new SubWalletMainnetRequestStrategy(apiUrl);
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

  get isReady (): Promise<_BitcoinApi> {
    return this.isReadyHandler.promise;
  }

  async updateApiUrl (apiUrl: string) {
    if (this.apiUrl === apiUrl) {
      return;
    }

    await this.disconnect();
    this.apiUrl = apiUrl;

    this.api = this.createApiStrategy(apiUrl);

    this.connect();
  }

  async recoverConnect () {
    await this.isReadyHandler.promise;
  }

  connect (): void {
    this.updateConnectionStatus(_ChainConnectionStatus.CONNECTING);

    this.onConnect();
  }

  async disconnect () {
    this.onDisconnect();

    this.updateConnectionStatus(_ChainConnectionStatus.DISCONNECTED);

    return Promise.resolve();
  }

  destroy () {
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
      this.isReadyHandler = createPromiseHandler<_BitcoinApi>();
    }
  }
}
