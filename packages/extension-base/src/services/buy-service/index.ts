// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { ListBuyServicesResponse, ListBuyTokenResponse } from '@subwallet/extension-base/services/buy-service/types';
import { AccountChainType, BuyServiceInfo, BuyTokenInfo, OnrampAccountSupportType, SupportService } from '@subwallet/extension-base/types';
import { fetchStaticData } from '@subwallet/extension-base/utils/fetchStaticData';
import { BehaviorSubject } from 'rxjs';

import { DEFAULT_SERVICE_INFO } from './constants';

const convertSupportType = (support: OnrampAccountSupportType): AccountChainType | null => {
  switch (support) {
    case 'ETHEREUM':
      return AccountChainType.ETHEREUM;
    case 'SUBSTRATE':
      return AccountChainType.SUBSTRATE;
    case 'CARDANO':
      return AccountChainType.CARDANO;
    case 'TON':
      return AccountChainType.TON;
    case 'BITCOIN':
      return AccountChainType.BITCOIN;
    default:
      return null;
  }
};

export default class BuyService {
  readonly #state: KoniState;

  private buyTokensSubject = new BehaviorSubject<Record<string, BuyTokenInfo>>({});
  private buyServicesSubject = new BehaviorSubject<Record<string, BuyServiceInfo>>({});

  constructor (state: KoniState) {
    this.#state = state;

    this.buyTokensSubject.next({});
    this.buyServicesSubject.next({});

    this.fetchTokens()
      .catch((e) => {
        console.error('Error on fetch buy tokens', e);
        this.#state.eventService.emit('buy.tokens.ready', true);
      });

    this.fetchServices()
      .catch((e) => {
        console.error('Error on fetch buy services', e);
        this.#state.eventService.emit('buy.services.ready', true);
      });
  }

  private async fetchTokens () {
    const data = await fetchStaticData<ListBuyTokenResponse>('buy-token-configs');

    const result: Record<string, BuyTokenInfo> = {};

    for (const datum of data) {
      const support = convertSupportType(datum.support);

      if (!support) {
        continue;
      }

      const temp: BuyTokenInfo = {
        serviceInfo: {
          ...DEFAULT_SERVICE_INFO
        },
        support,
        services: [],
        slug: datum.slug,
        symbol: datum.symbol,
        network: datum.network
      };

      for (const [_service, info] of Object.entries(datum.serviceInfo)) {
        const service = _service as SupportService;

        if (info.isSuspended) {
          continue;
        }

        temp.serviceInfo[service] = {
          network: info.network,
          symbol: info.symbol
        };

        temp.services.push(service);
      }

      if (temp.services.length) {
        result[temp.slug] = temp;
      }
    }

    this.buyTokensSubject.next(result);

    this.#state.eventService.emit('buy.tokens.ready', true);
  }

  private async fetchServices () {
    const data = await fetchStaticData<ListBuyServicesResponse>('buy-service-infos');

    const result: Record<string, BuyServiceInfo> = {};

    for (const datum of data) {
      const { id, slug, ...info } = datum;

      result[slug] = { ...info };
    }

    this.buyServicesSubject.next(result);

    this.#state.eventService.emit('buy.services.ready', true);
  }

  public subscribeBuyTokens (callback: (data: Record<string, BuyTokenInfo>) => void) {
    return this.buyTokensSubject.subscribe({
      next: callback
    });
  }

  public getBuyTokens () {
    return this.buyTokensSubject.getValue();
  }

  public subscribeBuyServices (callback: (data: Record<string, BuyServiceInfo>) => void) {
    return this.buyServicesSubject.subscribe({
      next: callback
    });
  }

  public getBuyServices () {
    return this.buyServicesSubject.getValue();
  }
}
