// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { BitcoinAddressSummaryInfo, BitcoinApiStrategy, BitcoinTransactionEventMap, BlockstreamAddressResponse, BlockStreamBlock, BlockStreamFeeEstimates, BlockStreamTransactionDetail, BlockStreamTransactionStatus, BlockStreamUtxo, Inscription, InscriptionFetchedData } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { UnisatService } from '@subwallet/extension-base/services/unisat-service';
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
    'Content-Type': 'application/json'
  };

  isRateLimited (): boolean {
    return false;
  }

  getUrl (path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  getBlockTime (): Promise<number> {
    return this.addRequest<number>(async () => {
      const response = await getRequest(this.getUrl('blocks'), undefined, this.headers);
      const blocks = await response.json() as BlockStreamBlock[];

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getBlockTime', 'Failed to fetch blocks');
      }

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
      const response = await getRequest(this.getUrl(`address/${address}`), undefined, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getAddressSummaryInfo', 'Failed to fetch address info');
      }

      const rsRaw = await response.json() as BlockstreamAddressResponse;
      const chainBalance = rsRaw.chain_stats.funded_txo_sum - rsRaw.chain_stats.spent_txo_sum;
      const pendingLocked = rsRaw.mempool_stats.spent_txo_sum;
      const mempoolReceived = rsRaw.mempool_stats.funded_txo_sum;
      const availableBalance = Math.max(0, chainBalance - pendingLocked + mempoolReceived);

      return {
        ...rsRaw,
        balance: availableBalance,
        total_inscription: 0,
        balance_rune: '0',
        balance_inscription: '0'
      };
    }, 0);
  }

  getAddressTransaction (address: string, limit = 100): Promise<BitcoinTx[]> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`address/${address}/txs`), { limit: `${limit}` }, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getAddressTransaction', 'Failed to fetch transactions');
      }

      return await response.json() as BitcoinTx[];
    }, 1);
  }

  getTransactionStatus (txHash: string): Promise<BlockStreamTransactionStatus> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`tx/${txHash}/status`), undefined, this.headers);

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamRequestStrategy.getTransactionStatus', `Failed to fetch transaction status: ${errorText}`);
      }

      return await response.json() as BlockStreamTransactionStatus;
    }, 1);
  }

  getTransactionDetail (txHash: string): Promise<BlockStreamTransactionDetail> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`tx/${txHash}`), undefined, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getTransactionDetail', 'Failed to fetch transaction detail');
      }

      return await response.json() as BlockStreamTransactionDetail;
    }, 1);
  }

  async getFeeRate (): Promise<BitcoinFeeInfo> {
    const timePerBlock = await this.computeBlockTime();

    return await this.addRequest<BitcoinFeeInfo>(async (): Promise<BitcoinFeeInfo> => {
      const response = await getRequest(this.getUrl('fee-estimates'), undefined, this.headers);
      const result = await response.json() as BlockStreamFeeEstimates;

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getFeeRate', 'Failed to fetch fee estimates');
      }

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
      const convertTimeMilisec = {
        fastestFee: 10 * 60000,
        halfHourFee: 30 * 60000,
        hourFee: 60 * 60000
      };

      const defaultFeeInfo: BitcoinFeeInfo = {
        type: 'bitcoin',
        busyNetwork: false,
        options: {
          slow: { feeRate: 1.5, time: convertTimeMilisec.hourFee },
          average: { feeRate: 1.5, time: convertTimeMilisec.halfHourFee },
          fast: { feeRate: 1.5, time: convertTimeMilisec.fastestFee },
          default: 'slow'
        }
      };

      try {
        const response = await getRequest(this.getUrl('fee-estimates'), undefined, this.headers);

        if (!response.ok) {
          return defaultFeeInfo;
        }

        const estimates = await response.json() as BlockStreamFeeEstimates;
        const convertFee = (fee: number) => Math.max(parseInt(new BigN(fee).toFixed(), 10), 1.5);

        return {
          type: 'bitcoin',
          busyNetwork: false,
          options: {
            slow: { feeRate: convertFee(estimates['6'] || 1), time: convertTimeMilisec.hourFee },
            average: { feeRate: convertFee(estimates['3'] || 1), time: convertTimeMilisec.halfHourFee },
            fast: { feeRate: convertFee(estimates['1'] || 1), time: convertTimeMilisec.fastestFee },
            default: 'slow'
          }
        };
      } catch {
        return defaultFeeInfo;
      }
    }, 0);
  }

  getUtxos (address: string): Promise<UtxoResponseItem[]> {
    return this.addRequest<UtxoResponseItem[]>(async (): Promise<UtxoResponseItem[]> => {
      const response = await getRequest(this.getUrl(`address/${address}/utxo`), undefined, this.headers);
      const rs = await response.json() as BlockStreamUtxo[];

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getUtxos', 'Failed to fetch UTXOs');
      }

      return rs.map((item: BlockStreamUtxo) => ({
        txid: item.txid,
        vout: item.vout,
        value: item.value,
        status: item.status
      }));
    }, 0);
  }

  sendRawTransaction (rawTransaction: string) {
    const eventEmitter = new EventEmitter<BitcoinTransactionEventMap>();

    this.addRequest<string>(async (): Promise<string> => {
      const response = await postRequest(this.getUrl('tx'), rawTransaction, { 'Content-Type': 'text/plain' }, false);

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamRequestStrategy.sendRawTransaction', `Failed to broadcast transaction: ${errorText}`);
      }

      return await response.text();
    }, 0)
      .then((extrinsicHash) => {
        eventEmitter.emit('extrinsicHash', extrinsicHash);

        // Check transaction status
        const interval = setInterval(() => {
          this.getTransactionStatus(extrinsicHash)
            .then((transactionStatus) => {
              if (transactionStatus.confirmed) {
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
      const response = await postRequest(this.getUrl('tx'), rawTransaction, { 'Content-Type': 'text/plain' }, false);

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamRequestStrategy.simpleSendRawTransaction', `Failed to broadcast transaction: ${errorText}`);
      }

      return await response.text();
    }, 0);
  }

  async getRuneUtxos (address: string) {
    const unisatService = UnisatService.getInstance(this.isTestnet);

    try {
      const responseRuneUtxos = await unisatService.getAddressRuneUtxos(address);

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

    const unisatService = UnisatService.getInstance(this.isTestnet);

    try {
      while (true) {
        const response = await unisatService.getAddressInscriptionsInfo({
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
      const response = await getRequest(this.getUrl(`tx/${txHash}/hex`), undefined, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamRequestStrategy.getTxHex', 'Failed to fetch tx hex');
      }

      return await response.text();
    }, 0);
  }
}
