// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { _UNISAT_API_URL, _UNISAT_API_URL_TEST, _UNISAT_PAGE_SIZE } from '@subwallet/extension-base/services/chain-service/constants';
import { Inscription, InscriptionFetchedData, RuneUtxo, RuneUtxoResponse, UniSatApiResponse, UniSatInscriptionInUtxo, UniSatInscriptionUtxo, UniSatInscriptionUtxoResponse, UniSatRuneBalance, UniSatRuneBalanceListResponse, UniSatRuneUtxo, UniSatRuneUtxoResponse } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { BaseApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy';
import { BaseApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import { getRequest } from '@subwallet/extension-base/strategy/api-request-strategy/utils';

export class UnisatService extends BaseApiRequestStrategy {
  baseUrl: string;

  private constructor (url: string) {
    const context = new BaseApiRequestContext();

    super(context);

    this.baseUrl = url;
  }

  private get headers (): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    return headers;
  }

  isRateLimited (): boolean {
    return false;
  }

  getUrl (path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  getAddressInscriptionsInfo (params: Record<string, string>): Promise<InscriptionFetchedData> {
    return this.addRequest(async () => {
      const cursor = params.offset || '0';
      const size = params.limit || '60';
      const address = params.address;
      const response = await getRequest(this.getUrl(`v1/indexer/address/${address}/inscription-utxo-data`), {
        cursor,
        size
      }, this.headers);

      const rs = await response.json() as UniSatApiResponse<UniSatInscriptionUtxoResponse>;

      if (!response.ok || rs.code !== 0) {
        throw new SWError('UnisatService.getAddressInscriptionsInfo', rs.msg || response.statusText);
      }

      const results: Inscription[] = [];

      rs.data.utxo.forEach((utxo) => {
        utxo.inscriptions.forEach((inscription) => {
          results.push(this.parseInscription(address, utxo, inscription));
        });
      });

      return {
        limit: Number(size),
        offset: Number(cursor),
        total: rs.data.total,
        results
      };
    }, 0);
  }

  getAddressRuneUtxos (address: string): Promise<RuneUtxoResponse> {
    return this.addRequest(async () => {
      const runeBalances = await this.getAddressRuneBalances(address);
      const runeUtxoMap = new Map<string, RuneUtxo>();

      for (const runeBalance of runeBalances) {
        const runeUtxos = await this.getAddressRuneUtxosByRuneId(address, runeBalance.runeid);

        runeUtxos.forEach((utxo) => {
          const key = `${utxo.txid}:${utxo.vout}`;
          const parsedUtxo = this.parseRuneUtxo(utxo);
          const existingUtxo = runeUtxoMap.get(key);

          if (existingUtxo) {
            existingUtxo.runes.push(...parsedUtxo.runes);
          } else {
            runeUtxoMap.set(key, parsedUtxo);
          }
        });
      }

      const results = Array.from(runeUtxoMap.values());

      return {
        total: results.length,
        results
      };
    }, 0);
  }

  private async getAddressRuneBalances (address: string): Promise<UniSatRuneBalance[]> {
    const results: UniSatRuneBalance[] = [];
    let start = 0;

    while (true) {
      const response = await getRequest(this.getUrl(`v1/indexer/address/${address}/runes/balance-list`), {
        start: String(start),
        limit: String(_UNISAT_PAGE_SIZE)
      }, this.headers);
      const rs = await response.json() as UniSatApiResponse<UniSatRuneBalanceListResponse>;

      if (!response.ok || rs.code !== 0) {
        throw new SWError('UnisatService.getAddressRuneBalances', rs.msg || response.statusText);
      }

      results.push(...rs.data.detail);

      if (!rs.data.detail.length || results.length >= rs.data.total) {
        break;
      }

      start += _UNISAT_PAGE_SIZE;
    }

    return results;
  }

  private async getAddressRuneUtxosByRuneId (address: string, runeid: string): Promise<UniSatRuneUtxo[]> {
    const results: UniSatRuneUtxo[] = [];
    let start = 0;

    while (true) {
      const response = await getRequest(this.getUrl(`v1/indexer/address/${address}/runes/${encodeURIComponent(runeid)}/utxo`), {
        start: String(start),
        limit: String(_UNISAT_PAGE_SIZE)
      }, this.headers);
      const rs = await response.json() as UniSatApiResponse<UniSatRuneUtxoResponse>;

      if (!response.ok || rs.code !== 0) {
        throw new SWError('UnisatService.getAddressRuneUtxosByRuneId', rs.msg || response.statusText);
      }

      results.push(...rs.data.utxo);

      if (!rs.data.utxo.length || results.length >= rs.data.total) {
        break;
      }

      start += _UNISAT_PAGE_SIZE;
    }

    return results;
  }

  private parseInscription (address: string, utxo: UniSatInscriptionUtxo, inscription: UniSatInscriptionInUtxo): Inscription {
    return {
      id: inscription.inscriptionId,
      number: inscription.inscriptionNumber,
      address,
      genesis_block_height: utxo.height,
      genesis_block_hash: '',
      genesis_timestamp: 0,
      tx_id: utxo.txid,
      location: `${utxo.txid}:${utxo.vout}:${inscription.offset}`,
      output: `${utxo.txid}:${utxo.vout}`,
      value: String(utxo.satoshi),
      offset: String(inscription.offset),
      fee: 0,
      sat_ordinal: '',
      sat_rarity: '',
      content_type: '',
      content_length: 0
    };
  }

  private parseRuneUtxo (utxo: UniSatRuneUtxo): RuneUtxo {
    return {
      height: 0,
      confirmations: 0,
      address: utxo.address,
      satoshi: utxo.satoshi,
      scriptPk: utxo.scriptPk,
      txid: utxo.txid,
      vout: utxo.vout,
      runes: utxo.runes.map((rune) => ({
        rune: rune.rune,
        runeid: rune.runeid,
        spacedRune: rune.spacedRune,
        amount: rune.amount,
        symbol: rune.symbol,
        divisibility: rune.divisibility
      }))
    };
  }

  // Singleton
  private static mainnet: UnisatService;
  private static testnet: UnisatService;

  public static getInstance (isTestnet = false) {
    if (isTestnet) {
      if (!UnisatService.testnet) {
        UnisatService.testnet = new UnisatService(_UNISAT_API_URL_TEST);
      }

      return UnisatService.testnet;
    } else {
      if (!UnisatService.mainnet) {
        UnisatService.mainnet = new UnisatService(_UNISAT_API_URL);
      }

      return UnisatService.mainnet;
    }
  }
}
