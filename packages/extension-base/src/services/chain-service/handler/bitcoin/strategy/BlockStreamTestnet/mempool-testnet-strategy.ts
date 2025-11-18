// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import {SWError} from '@subwallet/extension-base/background/errors/SWError';
import {
  BitcoinAddressSummaryInfo,
  BitcoinApiStrategy,
  BitcoinTransactionEventMap,
  BlockStreamBlock,
  BlockStreamFeeEstimates,
  BlockStreamTransactionDetail,
  BlockStreamTransactionStatus,
  BlockStreamUtxo,
  Inscription,
  InscriptionFetchedData,
  RecommendedFeeEstimates,
  RunesInfoByAddress,
  RunesInfoByAddressFetchedData,
  UpdateOpenBitUtxo
} from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import {HiroService} from '@subwallet/extension-base/services/hiro-service';
import {RunesService} from '@subwallet/extension-base/services/rune-service';
import {BaseApiRequestStrategy} from '@subwallet/extension-base/strategy/api-request-strategy';
import {BaseApiRequestContext} from '@subwallet/extension-base/strategy/api-request-strategy/context/base';
import {getRequest, postRequest} from '@subwallet/extension-base/strategy/api-request-strategy/utils';
import {BitcoinFeeInfo, BitcoinTx, UtxoResponseItem} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import EventEmitter from 'eventemitter3';
import {OBResponse} from "@subwallet/extension-base/services/chain-service/types";

export class MempoolTestnetRequestStrategy extends BaseApiRequestStrategy implements BitcoinApiStrategy {
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
      const response = await getRequest<OBResponse<BlockStreamBlock[]>>(this.getUrl('blocks'), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamTestnetRequestStrategy.getBlockTime', 'Failed to fetch blocks');
        }
      });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getBlockTime', response.message);
      }

      const blocks = response.result;
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
      const response = await getRequest<OBResponse<BitcoinAddressSummaryInfo>>(this.getUrl(`address/${address}`), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamRequestStrategy.getAddressSummaryInfo', 'Failed to fetch address info');
        }
      });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getAddressSummaryInfo', response.message);
      }

      const rsRaw = response.result;
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
      const response = await getRequest<OBResponse<BitcoinTx[]>>(this.getUrl(`address/${address}/txs`), {
      params: {limit: `${limit}`},
        headers: this.headers
    });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getAddressTransaction', 'Failed to fetch transactions');
      }

      return response.result
    }, 1);
  }

  getTransactionStatus (txHash: string): Promise<BlockStreamTransactionStatus> {
    return this.addRequest(async () => {
      const response = await getRequest<OBResponse<BlockStreamTransactionStatus>>(this.getUrl(`tx/${txHash}/status`), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamTestnetRequestStrategy.getTransactionStatus', 'Failed to fetch transaction status');
        }
      });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamTestnetRequestStrategy.getTransactionStatus', 'Failed to fetch transaction status');
      }

      // Blockstream API trả về object thô
      const data = response.result

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
      const response = await getRequest<OBResponse<BlockStreamTransactionDetail>>(this.getUrl(`tx/${txHash}`), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamRequestStrategy.getTransactionDetail', 'Failed to fetch transaction detail');
        }
      });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getTransactionDetail', response.message);
      }

      return response.result;
    }, 1);
  }

  // TODO: NOTE: Currently not in use. Recheck the response if you want to use it.
  async getFeeRate (): Promise<BitcoinFeeInfo> {
    const blockTime = await this.computeBlockTime();

    return await this.addRequest<BitcoinFeeInfo>(async (): Promise<BitcoinFeeInfo> => {
      const response = await getRequest<OBResponse<BlockStreamFeeEstimates>>(this.getUrl('fee-estimates'), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamRequestStrategy.getFeeRate', 'Failed to fetch fee estimates');
        }
      });

      const result = response.result;



      const low = 6;
      const average = 3;
      const fast = 1;

      const convertFee = (fee: number) => parseFloat(new BigN(fee).toFixed(2));

      return {
        type: 'bitcoin',
        busyNetwork: false,
        options: {
          slow: { feeRate: convertFee(result[low] || 10), time: blockTime * low },
          average: { feeRate: convertFee(result[average || 12]), time: blockTime * average },
          fast: { feeRate: convertFee(result[fast] || 15), time: blockTime * fast },
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
        const response = await getRequest<OBResponse<RecommendedFeeEstimates>>(this.getUrl('v1/fees/recommended'), {
          headers: this.headers,
          onError: () => {
            throw new SWError('BlockStreamRequestStrategy.getRecommendedFeeRate', 'Failed to fetch recommended fee estimates');
          }
        });

        if (response.status_code !== 200) {
          console.warn(`Failed to fetch fee estimates`, response.message);
          return defaultFeeInfo;
        }

        const result = response.result;

        const convertFee = (fee: number) => {
          const adjustedFee = parseInt(new BigN(fee).toFixed(), 10);

          return Math.max(adjustedFee, 1.5);
        };

        return {
          type: 'bitcoin',
          busyNetwork: false,
          options: {
            slow: { feeRate: convertFee(result.hourFee || 1), time: convertTimeMilisec.hourFee },
            average: { feeRate: convertFee(result.halfHourFee || 1), time: convertTimeMilisec.halfHourFee },
            fast: { feeRate: convertFee(result.fastestFee || 1), time: convertTimeMilisec.fastestFee },
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
      const response = await getRequest<OBResponse<UpdateOpenBitUtxo>>(this.getUrl(`address/${address}/utxo`), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamRequestStrategy.getUtxos', 'Failed to fetch UTXOs');
        }
      });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getUtxos', response.message);
      }

      const rs = response.result.utxoItems;

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
      const response = await postRequest<OBResponse<string>>(this.getUrl('tx'), {
          body: rawTransaction,
          headers: this.headers,
          isJsonResponse: true,
          isJson: false,
          onError: () => {
            throw new SWError('BlockStreamRequestStrategy.sendRawTransaction', 'Failed to broadcast transaction');
          }
    }
      );

      return response.result;
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
      const response = await postRequest<OBResponse<string>>(this.getUrl('tx'), {
        body: rawTransaction,
        headers: this.headers,
        isJson: false,
        isJsonResponse: true,
        onError: () => {
          throw new SWError('BlockStreamRequestStrategy.simpleSendRawTransaction', 'Failed to broadcast transaction');
        }
      });

      return response.result;
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
      const response = await getRequest<OBResponse<string>>(this.getUrl(`tx/${txHash}/hex`), {
        headers: this.headers,
        onError: () => {
          throw new SWError('BlockStreamRequestStrategy.getTxHex', 'Failed to fetch transaction hex');
        }
      });

      if (response.status_code !== 200) {
        throw new SWError('BlockStreamRequestStrategy.getTxHex', response.message);
      }

      return response.result;
    }, 0);
  }
}
