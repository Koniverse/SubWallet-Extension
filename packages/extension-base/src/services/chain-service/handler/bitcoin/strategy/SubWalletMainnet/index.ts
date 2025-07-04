// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { _BTC_SERVICE_TOKEN } from '@subwallet/extension-base/services/chain-service/constants';
import { BitcoinAddressSummaryInfo, BitcoinApiStrategy, BitcoinTransactionEventMap, BlockStreamBlock, BlockStreamFeeEstimates, BlockStreamTransactionDetail, BlockStreamTransactionStatus, Inscription, InscriptionFetchedData, RecommendedFeeEstimates, RunesInfoByAddress, RunesInfoByAddressFetchedData, UpdateOpenBitUtxo } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { OBResponse } from '@subwallet/extension-base/services/chain-service/types';
import { HiroService } from '@subwallet/extension-base/services/hiro-service';
import { RunesService } from '@subwallet/extension-base/services/rune-service';
import { BaseApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy';
import { BaseApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import { getRequest, postRequest } from '@subwallet/extension-base/strategy/api-request-strategy/utils';
import { BitcoinFeeInfo, BitcoinTx, UtxoResponseItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import EventEmitter from 'eventemitter3';

export class SubWalletMainnetRequestStrategy extends BaseApiRequestStrategy implements BitcoinApiStrategy {
  private readonly baseUrl: string;
  private readonly isTestnet: boolean;
  private timePerBlock = 0; // in milliseconds

  constructor (url: string) {
    const context = new BaseApiRequestContext();

    super(context);

    this.baseUrl = url;
    this.isTestnet = url.includes('testnet');
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

  getBlockTime (): Promise<number> {
    return this.addRequest<number>(async () => {
      const _rs = await getRequest(this.getUrl('blocks'), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<BlockStreamBlock[]>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getBlockTime', rs.message);
      }

      const blocks = rs.result;
      const length = blocks.length;
      const sortedBlocks = blocks.sort((a, b) => b.timestamp - a.timestamp);
      const time = (sortedBlocks[0].timestamp - sortedBlocks[length - 1].timestamp) * 1000;

      return time / length;
    }, 0);
  }

  async computeBlockTime (): Promise<number> {
    let blockTime = this.timePerBlock;

    if (blockTime > 0) {
      return blockTime;
    }

    try {
      blockTime = await this.getBlockTime();

      this.timePerBlock = blockTime;
    } catch (e) {
      console.error('Failed to compute block time', e);

      blockTime = (this.isTestnet ? 5 * 60 : 10 * 60) * 1000; // Default to 10 minutes if failed
    }

    // Cache block time in 60 seconds
    setTimeout(() => {
      this.timePerBlock = 0;
    }, 60000);

    return blockTime;
  }

  getAddressSummaryInfo (address: string): Promise<BitcoinAddressSummaryInfo> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`address/${address}`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<BitcoinAddressSummaryInfo>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getAddressSummaryInfo', rs.message);
      }

      return rs.result;
    }, 0);
  }

  getAddressTransaction (address: string, limit = 100): Promise<BitcoinTx[]> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`address/${address}/txs`), { limit: `${limit}` }, this.headers);
      const rs = await _rs.json() as OBResponse<BitcoinTx[]>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getAddressTransaction', rs.message);
      }

      return rs.result;
    }, 1);
  }

  getTransactionStatus (txHash: string): Promise<BlockStreamTransactionStatus> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`tx/${txHash}/status`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<BlockStreamTransactionStatus>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getTransactionStatus', rs.message);
      }

      return rs.result;
    }, 1);
  }

  getTransactionDetail (txHash: string): Promise<BlockStreamTransactionDetail> {
    return this.addRequest(async () => {
      const _rs = await getRequest(this.getUrl(`tx/${txHash}`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<BlockStreamTransactionDetail>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getTransactionDetail', rs.message);
      }

      return rs.result;
    }, 1);
  }

  async getFeeRate (): Promise<BitcoinFeeInfo> {
    const timePerBlock = await this.computeBlockTime();

    return await this.addRequest<BitcoinFeeInfo>(async (): Promise<BitcoinFeeInfo> => {
      const _rs = await getRequest(this.getUrl('fee-estimates'), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<BlockStreamFeeEstimates>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getFeeRate', rs.message);
      }

      const result = rs.result;

      const low = 6;
      const average = 3;
      const fast = 1;

      const convertFee = (fee: number) => parseFloat(new BigN(fee).toFixed(2));

      return {
        type: 'bitcoin',
        busyNetwork: false,
        options: {
          slow: { feeRate: convertFee(result[low]), time: timePerBlock * low },
          average: { feeRate: convertFee(result[average]), time: timePerBlock * average },
          fast: { feeRate: convertFee(result[fast]), time: timePerBlock * fast },
          default: 'slow'
        }
      };
    }, 0);
  }

  getRecommendedFeeRate (): Promise<BitcoinFeeInfo> {
    return this.addRequest<BitcoinFeeInfo>(async (): Promise<BitcoinFeeInfo> => {
      const _rs = await getRequest(this.getUrl('fee-estimates/recommended'), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<RecommendedFeeEstimates>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getRecommendedFeeRate', rs.message);
      }

      const result = rs.result;

      const convertTimeMilisec = {
        fastestFee: 10 * 60000,
        halfHourFee: 30 * 60000,
        hourFee: 60 * 60000
      };

      const convertFee = (fee: number) => parseInt(new BigN(fee).toFixed());

      return {
        type: 'bitcoin',
        busyNetwork: false,
        options: {
          slow: { feeRate: convertFee(result.hourFee), time: convertTimeMilisec.hourFee },
          average: { feeRate: convertFee(result.halfHourFee), time: convertTimeMilisec.halfHourFee },
          fast: { feeRate: convertFee(result.fastestFee), time: convertTimeMilisec.fastestFee },
          default: 'slow'
        }
      };
    }, 0);
  }

  getUtxos (address: string): Promise<UtxoResponseItem[]> {
    return this.addRequest<UtxoResponseItem[]>(async (): Promise<UtxoResponseItem[]> => {
      const _rs = await getRequest(this.getUrl(`address/${address}/utxo`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<UpdateOpenBitUtxo>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getUtxos', rs.message);
      }

      return rs.result.utxoItems;
    }, 0);
  }

  sendRawTransaction (rawTransaction: string) {
    const eventEmitter = new EventEmitter<BitcoinTransactionEventMap>();

    this.addRequest<string>(async (): Promise<string> => {
      const _rs = await postRequest(this.getUrl('tx'), rawTransaction, this.headers, false);
      const rs = await _rs.json() as OBResponse<string>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.sendRawTransaction', rs.message);
      }

      return rs.result;
    }, 0)
      .then((extrinsicHash) => {
        eventEmitter.emit('extrinsicHash', extrinsicHash);

        // Check transaction status
        const interval = setInterval(() => {
          this.getTransactionStatus(extrinsicHash)
            .then((transactionStatus) => {
              if (transactionStatus.confirmed && transactionStatus.block_time > 0) {
                clearInterval(interval);
                eventEmitter.emit('success', transactionStatus);
              }
            })
            .catch(console.error);
        }, 30000);
      })
      .catch((error: Error) => {
        eventEmitter.emit('error', error.message);
      })
    ;

    return eventEmitter;
  }

  simpleSendRawTransaction (rawTransaction: string) {
    return this.addRequest<string>(async (): Promise<string> => {
      const _rs = await postRequest(this.getUrl('tx'), rawTransaction, this.headers, false);
      const rs = await _rs.json() as OBResponse<string>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.simpleSendRawTransaction', rs.message);
      }

      return rs.result;
    }, 0);
  }

  async getRunes (address: string) {
    const runesFullList: RunesInfoByAddress[] = [];
    const pageSize = 60;
    let offset = 0;

    const runeService = RunesService.getInstance(this.isTestnet);

    try {
      while (true) {
        const response = await runeService.getAddressRunesInfo(address, {
          limit: String(pageSize),
          offset: String(offset)
        }) as unknown as RunesInfoByAddressFetchedData;

        const runes = response.runes;

        if (runes.length !== 0) {
          runesFullList.push(...runes);
          offset += pageSize;
        } else {
          break;
        }
      }

      return runesFullList;
    } catch (error) {
      console.error(`Failed to get ${address} balances`, error);
      throw error;
    }
  }

  async getRuneUtxos (address: string) {
    const runeService = RunesService.getInstance(this.isTestnet);

    try {
      const responseRuneUtxos = await runeService.getAddressRuneUtxos(address);

      return responseRuneUtxos.results;
    } catch (error) {
      console.error(`Failed to get ${address} rune utxos`, error);
      throw error;
    }
  }

  async getAddressInscriptions (address: string) {
    const inscriptionsFullList: Inscription[] = [];
    const pageSize = 60;
    let offset = 0;

    const hiroService = HiroService.getInstance(this.isTestnet);

    try {
      while (true) {
        const response = await hiroService.getAddressInscriptionsInfo({
          limit: String(pageSize),
          offset: String(offset),
          address: String(address)
        }) as unknown as InscriptionFetchedData;

        const inscriptions = response.results;

        if (inscriptions.length !== 0) {
          inscriptionsFullList.push(...inscriptions);
          offset += pageSize;
        } else {
          break;
        }
      }

      return inscriptionsFullList;
    } catch (error) {
      console.error(`Failed to get ${address} inscriptions`, error);
      throw error;
    }
  }

  getTxHex (txHash: string): Promise<string> {
    return this.addRequest<string>(async (): Promise<string> => {
      const _rs = await getRequest(this.getUrl(`tx/${txHash}/hex`), undefined, this.headers);
      const rs = await _rs.json() as OBResponse<string>;

      if (rs.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getTxHex', rs.message);
      }

      return rs.result;
    }, 0);
  }
}
