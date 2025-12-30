// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { createLogger } from '@subwallet/extension-base/utils/logger';

import { AbstractChainHandler } from '../AbstractChainHandler';

const bitcoinChainHandlerLogger = createLogger('BitcoinChainHandler');
import { _ApiOptions } from '../types';
import { BitcoinApi } from './BitcoinApi';

export class BitcoinChainHandler extends AbstractChainHandler {
  private apiMap: Record<string, BitcoinApi> = {};

  // eslint-disable-next-line no-useless-constructor
  constructor (parent?: ChainService) {
    super(parent);
  }

  public getApiMap () {
    return this.apiMap;
  }

  public getApiByChain (chain: string) {
    return this.apiMap[chain];
  }

  public setApi (chainSlug: string, api: BitcoinApi) {
    this.apiMap[chainSlug] = api;
  }

  public async initApi (chainSlug: string, apiUrl: string, { onUpdateStatus, providerName }: Omit<_ApiOptions, 'metadata'> = {}) {
    const existed = this.getApiByChain(chainSlug);

    if (existed) {
      existed.connect();

      if (apiUrl !== existed.apiUrl) {
        existed.updateApiUrl(apiUrl).catch((error) => bitcoinChainHandlerLogger.error('Error updating Bitcoin API URL', error));
      }

      return existed;
    }

    const apiObject = new BitcoinApi(chainSlug, apiUrl, { providerName });

    apiObject.connectionStatusSubject.subscribe(this.handleConnection.bind(this, chainSlug));
    apiObject.connectionStatusSubject.subscribe(onUpdateStatus);

    return Promise.resolve(apiObject);
  }

  public async recoverApi (chainSlug: string): Promise<void> {
    const existed = this.getApiByChain(chainSlug);

    if (existed && !existed.isApiReadyOnce) {
      bitcoinChainHandlerLogger.info(`Reconnect ${existed.providerName || existed.chainSlug} at ${existed.apiUrl}`);

      return existed.recoverConnect();
    }
  }

  destroyApi (chain: string) {
    const api = this.getApiByChain(chain);

    api?.destroy().catch((error) => bitcoinChainHandlerLogger.error('Error destroying Bitcoin API', error));
  }

  async sleep () {
    this.isSleeping = true;
    this.cancelAllRecover();

    await Promise.all(Object.values(this.getApiMap()).map((evmApi) => {
      return evmApi.disconnect().catch((error) => bitcoinChainHandlerLogger.error('Error disconnecting Bitcoin API', error));
    }));

    return Promise.resolve();
  }

  wakeUp () {
    this.isSleeping = false;
    const activeChains = this.parent?.getActiveChains() || [];

    for (const chain of activeChains) {
      const api = this.getApiByChain(chain);

      api?.connect();
    }

    return Promise.resolve();
  }
}
