// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { AbstractChainHandler } from '@subwallet/extension-base/services/chain-service/handler/AbstractChainHandler';
import { TonApi } from '@subwallet/extension-base/services/chain-service/handler/TonApi';
import { _ApiOptions } from '@subwallet/extension-base/services/chain-service/handler/types';
import { createLogger } from '@subwallet/extension-base/utils/logger';

const tonChainHandlerLogger = createLogger('TonChainHandler');

export class TonChainHandler extends AbstractChainHandler {
  private tonApiMap: Record<string, TonApi> = {};

  // eslint-disable-next-line no-useless-constructor
  constructor (parent?: ChainService) {
    super(parent);
  }

  public getTonApiMap () {
    return this.tonApiMap;
  }

  public getTonApiByChain (chain: string) {
    return this.tonApiMap[chain];
  }

  public getApiByChain (chain: string) {
    return this.getTonApiByChain(chain);
  }

  public setTonApi (chain: string, tonApi: TonApi) {
    this.tonApiMap[chain] = tonApi;
  }

  public async initApi (chainSlug: string, apiUrl: string, { onUpdateStatus, providerName }: Omit<_ApiOptions, 'metadata'> = {}) {
    const existed = this.getTonApiByChain(chainSlug);

    if (existed) {
      existed.connect();

      if (apiUrl !== existed.apiUrl) {
        existed.updateApiUrl(apiUrl).catch((error) => tonChainHandlerLogger.error('Error updating TON API URL', error));
      }

      return existed;
    }

    const apiObject = new TonApi(chainSlug, apiUrl, { providerName });

    apiObject.connectionStatusSubject.subscribe(this.handleConnection.bind(this, chainSlug));
    apiObject.connectionStatusSubject.subscribe(onUpdateStatus);

    return Promise.resolve(apiObject);
  }

  public async recoverApi (chain: string): Promise<void> {
    const existed = this.getTonApiByChain(chain);

    if (existed && !existed.isApiReadyOnce) {
      tonChainHandlerLogger.info(`Reconnect ${existed.providerName || existed.chainSlug} at ${existed.apiUrl}`);

      return existed.recoverConnect();
    }
  }

  destroyTonApi (chain: string) {
    const tonApi = this.getTonApiByChain(chain);

    tonApi?.destroy().catch((error) => tonChainHandlerLogger.error('Error destroying TON API', error));
  }

  async sleep () {
    this.isSleeping = true;
    this.cancelAllRecover();

    await Promise.all(Object.values(this.getTonApiMap()).map((tonApi) => {
      return tonApi.disconnect().catch((error) => tonChainHandlerLogger.error('Error disconnecting TON API', error));
    }));

    return Promise.resolve();
  }

  wakeUp () {
    this.isSleeping = false;
    const activeChains = this.parent?.getActiveChains() || [];

    for (const chain of activeChains) {
      const tonApi = this.getTonApiByChain(chain);

      tonApi?.connect();
    }

    return Promise.resolve();
  }
}
