// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { BitcoinAddressSummaryInfo, BitcoinApiStrategy, BitcoinTransactionEventMap, BlockstreamAddressResponse, BlockStreamBlock, BlockStreamFeeEstimates, BlockStreamTransactionDetail, BlockStreamTransactionStatus, BlockStreamUtxo, Inscription, InscriptionFetchedData, RecommendedFeeEstimates, RunesInfoByAddress, RunesInfoByAddressFetchedData } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { HiroService } from '@subwallet/extension-base/services/hiro-service';
import { RunesService } from '@subwallet/extension-base/services/rune-service';
import { BaseApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy';
import { BaseApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import { getRequest, postRequest } from '@subwallet/extension-base/strategy/api-request-strategy/utils';
import { BitcoinFeeInfo, BitcoinTx, UtxoResponseItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import EventEmitter from 'eventemitter3';

export class BlockStreamTestnetRequestStrategy extends BaseApiRequestStrategy implements BitcoinApiStrategy {
  private readonly baseUrl: string;
  private readonly isTestnet: boolean;
  private timePerBlock = 0; // in milliseconds

  constructor (url: string) {
    const context = new BaseApiRequestContext();

    super(context);

    this.baseUrl = url;
    this.isTestnet = url.includes('testnet');

    this.getBlockTime()
      .then((rs) => {
        this.timePerBlock = rs;
      })
      .catch(() => {
        this.timePerBlock = (this.isTestnet ? 5 * 60 : 10 * 60) * 1000;
      });
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
        throw new SWError('BlockStreamTestnetRequestStrategy.getBlockTime', 'Failed to fetch blocks');
      }

      const length = blocks.length;
      const sortedBlocks = blocks.sort((a, b) => b.timestamp - a.timestamp);
      const time = (sortedBlocks[0].timestamp - sortedBlocks[length - 1].timestamp) * 1000;

      return time / length;
    }, 0);
  }

  getAddressSummaryInfo (address: string): Promise<BitcoinAddressSummaryInfo> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`address/${address}`), undefined, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getAddressSummaryInfo', 'Failed to fetch address info');
      }

      const rsRaw = await response.json() as BlockstreamAddressResponse;
      const chainBalance = rsRaw.chain_stats.funded_txo_sum - rsRaw.chain_stats.spent_txo_sum;
      const pendingLocked = rsRaw.mempool_stats.spent_txo_sum; // Only consider spent UTXOs in mempool
      const mempoolReceived = rsRaw.mempool_stats.funded_txo_sum; // Funds received in mempool (e.g., change)
      const availableBalance = Math.max(0, chainBalance - pendingLocked + mempoolReceived); // Ensure balance is non-negative

      const rs: BitcoinAddressSummaryInfo = {
        address: rsRaw.address,
        chain_stats: {
          funded_txo_count: rsRaw.chain_stats.funded_txo_count,
          funded_txo_sum: rsRaw.chain_stats.funded_txo_sum,
          spent_txo_count: rsRaw.chain_stats.spent_txo_count,
          spent_txo_sum: rsRaw.chain_stats.spent_txo_sum,
          tx_count: rsRaw.chain_stats.tx_count
        },
        mempool_stats: {
          funded_txo_count: rsRaw.mempool_stats.funded_txo_count,
          funded_txo_sum: rsRaw.mempool_stats.funded_txo_sum,
          spent_txo_count: rsRaw.mempool_stats.spent_txo_count,
          spent_txo_sum: rsRaw.mempool_stats.spent_txo_sum,
          tx_count: rsRaw.mempool_stats.tx_count
        },
        balance: availableBalance,
        total_inscription: 0,
        balance_rune: '0',
        balance_inscription: '0'
      };

      return rs;
    }, 0);
  }

  getAddressTransaction (address: string, limit = 100): Promise<BitcoinTx[]> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`address/${address}/txs`), { limit: `${limit}` }, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getAddressTransaction', 'Failed to fetch transactions');
      }

      return await response.json() as BitcoinTx[];
    }, 1);
  }

  getTransactionStatus (txHash: string): Promise<BlockStreamTransactionStatus> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`tx/${txHash}/status`), undefined, {});

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamTestnetRequestStrategy.getTransactionStatus', `Failed to fetch transaction status: ${errorText}`);
      }

      // Blockstream API trả về object thô
      const data = await response.json() as BlockStreamTransactionStatus;

      return {
        confirmed: data.confirmed || false,
        block_time: data.block_time || 0,
        block_height: data.block_height,
        block_hash: data.block_hash
      };
    }, 1);
  }

  getTransactionDetail (txHash: string): Promise<BlockStreamTransactionDetail> {
    return this.addRequest(async () => {
      const response = await getRequest(this.getUrl(`tx/${txHash}`), undefined, this.headers);

      if (!response.ok) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getTransactionDetail', 'Failed to fetch transaction detail');
      }

      return await response.json() as BlockStreamTransactionDetail;
    }, 1);
  }

  getFeeRate (): Promise<BitcoinFeeInfo> {
    return this.addRequest<BitcoinFeeInfo>(async (): Promise<BitcoinFeeInfo> => {
      const response = await getRequest(this.getUrl('fee-estimates'), undefined, this.headers);
      const estimates = await response.json() as BlockStreamFeeEstimates;

      console.log('getRecommendedFeeRate: rs', estimates);

      if (!response.ok) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getFeeRate', 'Failed to fetch fee estimates');
      }

      const low = 6;
      const average = 3;
      const fast = 1;

      const convertFee = (fee: number) => parseFloat(new BigN(fee).toFixed(2));

      return {
        type: 'bitcoin',
        busyNetwork: false,
        options: {
          slow: { feeRate: convertFee(estimates[low] || 10), time: this.timePerBlock * low },
          average: { feeRate: convertFee(estimates[average || 12]), time: this.timePerBlock * average },
          fast: { feeRate: convertFee(estimates[fast] || 15), time: this.timePerBlock * fast },
          default: 'slow'
        }
      };
    }, 0);
  }

  // TODO: Handle fallback for this route as it is not stable.
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
          slow: { feeRate: 1, time: convertTimeMilisec.hourFee },
          average: { feeRate: 1, time: convertTimeMilisec.halfHourFee },
          fast: { feeRate: 1, time: convertTimeMilisec.fastestFee },
          default: 'slow'
        }
      };

      try {
        const response = await getRequest(this.getUrl('v1/fees/recommended'), undefined, this.headers);

        if (!response.ok) {
          console.warn(`Failed to fetch fee estimates: ${response.statusText}`);

          return defaultFeeInfo;
        }

        const estimates = await response.json() as RecommendedFeeEstimates;

        const convertFee = (fee: number) => parseInt(new BigN(fee).toFixed(), 10);

        return {
          type: 'bitcoin',
          busyNetwork: false,
          options: {
            slow: { feeRate: convertFee(estimates.hourFee || 1), time: convertTimeMilisec.hourFee },
            average: { feeRate: convertFee(estimates.halfHourFee || 1), time: convertTimeMilisec.halfHourFee },
            fast: { feeRate: convertFee(estimates.fastestFee || 1), time: convertTimeMilisec.fastestFee },
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
      const response = await getRequest(this.getUrl(`address/${address}/utxo`), undefined, {});
      const rs = await response.json() as BlockStreamUtxo[];

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamTestnetRequestStrategy.getUtxos', `Failed to fetch UTXOs: ${errorText}`);
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
      const response = await postRequest(
        this.getUrl('tx'),
        rawTransaction,
        { 'Content-Type': 'text/plain' },
        false
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamTestnetRequestStrategy.sendRawTransaction', `Failed to broadcast transaction: ${errorText}`);
      }

      return await response.text();
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
      const response = await postRequest(this.getUrl('tx'), rawTransaction, { 'Content-Type': 'text/plain' }, false);

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamTestnetRequestStrategy.simpleSendRawTransaction', `Failed to broadcast transaction: ${errorText}`);
      }

      return await response.text();
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      throw new SWError('BlockStreamTestnetRequestStrategy.getRuneUtxos', `Failed to get ${address} rune utxos: ${errorMessage}`);
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      throw new SWError('BlockStreamTestnetRequestStrategy.getAddressInscriptions', `Failed to get ${address} inscriptions: ${errorMessage}`);
    }
  }

  getTxHex (txHash: string): Promise<string> {
    return this.addRequest<string>(async (): Promise<string> => {
      const response = await getRequest(this.getUrl(`tx/${txHash}/hex`), undefined, this.headers);

      if (!response.ok) {
        const errorText = await response.text();

        throw new SWError('BlockStreamTestnetRequestStrategy.getTxHex', `Failed to fetch transaction hex: ${errorText}`);
      }

      return await response.text();
    }, 0);
  }
}
