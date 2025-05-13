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
      const _rs = await getRequest(this.getUrl(`brc-20/tokens/${ticker}`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<Brc20MetadataFetchedData>;

      if (rs.status_code !== 200) {
        throw new SWError('HiroService.getBRC20Metadata', rs.message);
      }

      return rs.result;
    }, 3);
  }

  getAddressBRC20BalanceInfo (address: string, params: Record<string, string>): Promise<Brc20BalanceFetchedData> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`brc-20/balances/${address}`), params, this.headers);
      const rs = await _rs.json() as OBResponse<Brc20BalanceFetchedData>;

      if (rs.status_code !== 200) {
        throw new SWError('HiroService.getAddressBRC20BalanceInfo', rs.message);
      }

      return rs.result;
    }, 3);
  }

  getAddressInscriptionsInfo (params: Record<string, string>): Promise<InscriptionFetchedData> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl('inscriptions'), params, this.headers);
      const rs = await _rs.json() as OBResponse<InscriptionFetchedData>;

      if (rs.status_code !== 200) {
        throw new SWError('HiroService.getAddressInscriptionsInfo', rs.message);
      }

      return rs.result;
    }, 0);
  }

  getInscriptionContent (inscriptionId: string): Promise<Record<string, any>> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`inscriptions/${inscriptionId}/content`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<Record<string, any>>;

      if (rs.status_code !== 200) {
        throw new SWError('HiroService.getInscriptionContent', rs.message);
      }

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
