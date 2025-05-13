// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { _BTC_SERVICE_TOKEN } from '@subwallet/extension-base/services/chain-service/constants';
import { RuneMetadata, RunesCollectionInfoResponse, RunesInfoByAddressFetchedData, RuneTxsResponse, RuneUtxoResponse } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/BlockStream/types';
import { OBResponse, OBRuneResponse } from '@subwallet/extension-base/services/chain-service/types';
import { BaseApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy';
import { BaseApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import { getRequest } from '@subwallet/extension-base/strategy/api-request-strategy/utils';

const OPENBIT_URL = 'https://api.openbit.app';
const OPENBIT_URL_TEST = 'https://api-testnet.openbit.app';

export class RunesService extends BaseApiRequestStrategy {
  baseUrl: string;

  private constructor (url: string) {
    const context = new BaseApiRequestContext();

    super(context);

    this.baseUrl = 'https://btc-api.koni.studio';
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

  getAddressRunesInfo (address: string, params: Record<string, string>): Promise<RunesInfoByAddressFetchedData> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`rune/address/${address}`), params, this.headers);
      const rs = await _rs.json() as OBResponse<RunesInfoByAddressFetchedData>;

      if (rs.status_code !== 200) {
        throw new SWError('RuneScanService.getAddressRunesInfo', rs.message);
      }

      return rs.result;
    }, 1);
  }

  // * Deprecated
  getRuneCollectionsByBatch (params: Record<string, string>): Promise<RunesCollectionInfoResponse> {
    return this.addRequest(async () => {
      const url = this.getUrl('rune');
      const rs = await getRequest(url, params);

      if (rs.status !== 200) {
        throw new SWError('RuneScanService.getRuneCollectionsByBatch', await rs.text());
      }

      return (await rs.json()) as RunesCollectionInfoResponse;
    }, 1);
  }

  // * Deprecated
  getAddressRuneTxs (address: string, params: Record<string, string>): Promise<RuneTxsResponse> {
    return this.addRequest(async () => {
      const url = this.getUrl(`address/${address}/txs`);
      const rs = await getRequest(url, params);

      if (rs.status !== 200) {
        throw new SWError('RuneScanService.getAddressRuneTxs', await rs.text());
      }

      return (await rs.json()) as RuneTxsResponse;
    }, 0);
  }

  getRuneMetadata (runeid: string): Promise<RuneMetadata> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`rune/metadata/${runeid}`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<RuneMetadata>;

      if (rs.status_code !== 200) {
        throw new SWError('RuneScanService.getRuneMetadata', rs.message);
      }

      return rs.result;
    }, 0);
  }

  getAddressRuneUtxos (address: string): Promise<RuneUtxoResponse> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`rune/address/${address}/rune/utxo`), undefined, this.headers);

      const rs = await _rs.json() as OBRuneResponse<RuneUtxoResponse>;

      if (rs.status_code !== 200) {
        throw new SWError('RuneScanService.getAddressRuneUtxos', rs.message);
      }

      return rs.result;
    }, 0);
  }

  // Singleton
  private static mainnet: RunesService;
  private static testnet: RunesService;

  public static getInstance (isTestnet = false) {
    if (isTestnet) {
      if (!RunesService.testnet) {
        RunesService.testnet = new RunesService(OPENBIT_URL_TEST);
      }

      return RunesService.testnet;
    } else {
      if (!RunesService.mainnet) {
        RunesService.mainnet = new RunesService(OPENBIT_URL);
      }

      return RunesService.mainnet;
    }
  }
}
