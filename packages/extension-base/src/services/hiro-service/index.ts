// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { _BTC_SERVICE_TOKEN } from '@subwallet/extension-base/services/chain-service/constants';
import { Brc20BalanceFetchedData, Brc20MetadataFetchedData, InscriptionFetchedData } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { OBResponse } from '@subwallet/extension-base/services/chain-service/types';
import { BaseApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy';
import { BaseApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import { getRequest } from '@subwallet/extension-base/strategy/api-request-strategy/utils';

const BITCOIN_API_URL = 'https://btc-api.koni.studio';
const BITCOIN_API_URL_TEST = 'https://api-testnet.openbit.app';

export class HiroService extends BaseApiRequestStrategy {
  baseUrl: string;

  private constructor (url: string) {
    const context = new BaseApiRequestContext();

    super(context);

    this.baseUrl = url;
  }

  private headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${_BTC_SERVICE_TOKEN}`
  };

  isRateLimited (): boolean {
    return false;
  }

  getUrl (path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  getBRC20Metadata (ticker: string): Promise<Brc20MetadataFetchedData> {
    return this.addRequest(async () => {
      const rs = await getRequest<OBResponse<Brc20MetadataFetchedData>>(this.getUrl(`brc-20/tokens/${ticker}`), {
        headers: this.headers,
        onError: (res) => {
          throw new SWError('HiroService.getBRC20Metadata', `Failed to fetch BRC20 metadata: ${res?.statusText || 'Unknown error'}`);
        }
      });

      return rs.result;
    }, 3);
  }

  getAddressBRC20BalanceInfo (address: string, params: Record<string, string>): Promise<Brc20BalanceFetchedData> {
    return this.addRequest(async () => {
      const rs = await getRequest<OBResponse<Brc20BalanceFetchedData>>(this.getUrl(`brc-20/balances/${address}`), {
        params,
        headers: this.headers,
        onError: (res) => {
          throw new SWError('HiroService.getAddressBRC20BalanceInfo', `Failed to fetch BRC20 balance: ${res?.statusText || 'Unknown error'}`);
        }
      });

      return rs.result;
    }, 3);
  }

  getAddressInscriptionsInfo (params: Record<string, string>): Promise<InscriptionFetchedData> {
    return this.addRequest(async () => {
      const rs = await getRequest<OBResponse<InscriptionFetchedData>>(this.getUrl('inscriptions'), {
        params,
        headers: this.headers,
        onError: (res) => {
          throw new SWError('HiroService.getAddressInscriptionsInfo', `Failed to fetch inscriptions: ${res?.statusText || 'Unknown error'}`);
        }
      });

      return rs.result;
    }, 0);
  }

  getInscriptionContent (inscriptionId: string): Promise<Record<string, any>> {
    return this.addRequest(async () => {
      const rs = await getRequest<OBResponse<Record<string, any>>>(this.getUrl(`inscriptions/${inscriptionId}/content`), {
        headers: this.headers,
        onError: (res) => {
          throw new SWError('HiroService.getInscriptionContent', `Failed to fetch inscription content: ${res?.statusText || 'Unknown error'}`);
        }
      });

      return rs.result;
    }, 0);
  }

  // todo: handle token authen for url preview
  getPreviewUrl (inscriptionId: string) {
    return `${BITCOIN_API_URL}/inscriptions/${inscriptionId}/content`;
  }

  // Singleton
  private static mainnet: HiroService;
  private static testnet: HiroService;

  public static getInstance (isTestnet = false) {
    if (isTestnet) {
      if (!HiroService.testnet) {
        HiroService.testnet = new HiroService(BITCOIN_API_URL_TEST);
      }

      return HiroService.testnet;
    } else {
      if (!HiroService.mainnet) {
        HiroService.mainnet = new HiroService(BITCOIN_API_URL);
      }

      return HiroService.mainnet;
    }
  }
}
