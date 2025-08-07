// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { isSameAddress } from '@subwallet/extension-base/utils';

import { Vec } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';
import { isHex } from '@polkadot/util';

export enum HistoryRecoverStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  API_INACTIVE = 'API_INACTIVE',
  LACK_INFO = 'LACK_INFO',
  FAIL_DETECT = 'FAIL_DETECT',
  UNKNOWN = 'UNKNOWN',
  TX_PENDING = 'TX_PENDING',
}

export interface TransactionRecoverResult {
  status: HistoryRecoverStatus;
  extrinsicHash?: string;
  blockHash?: string;
  blockNumber?: number;
  blockTime?: number;
}

const BLOCK_LIMIT = 6;

const substrateRecover = async (history: TransactionHistoryItem, chainService: ChainService): Promise<TransactionRecoverResult> => {
  const { address, blockHash, chain, extrinsicHash, from, nonce, startBlock } = history;
  const result: TransactionRecoverResult = {
    status: HistoryRecoverStatus.UNKNOWN
  };

  try {
    const substrateApi = chainService.getSubstrateApi(chain);

    if (substrateApi) {
      const _api = await substrateApi.isReady;
      const api = _api.api;

      if (!blockHash) {
        if (nonce === undefined || startBlock === undefined) {
          console.log(`Fail to find extrinsic for ${address} on ${chain}: With nonce ${nonce || 'undefined'} from block ${startBlock || 'undefined'}`);

          return { status: HistoryRecoverStatus.LACK_INFO };
        }

        const currentBlock = (await api.query.system.number()).toPrimitive() as number;

        for (let i = 1, found = false; i < BLOCK_LIMIT && !found && startBlock + i <= currentBlock; i++) {
          const blockHash = (await api.rpc.chain.getBlockHash(startBlock + i)).toHex();
          const block = await api.rpc.chain.getBlock(blockHash);

          const extrinsics = block.block.extrinsics.toArray();
          let index: number | undefined;

          for (const [idx, extrinsic] of Object.entries(extrinsics)) {
            if (extrinsic.signer && isSameAddress(from, extrinsic.signer.toString()) && nonce === extrinsic.nonce.toNumber()) {
              index = parseInt(idx);
              found = true;
              result.extrinsicHash = extrinsic.hash.toHex();
              result.blockHash = block.block.hash.toHex();
              result.blockNumber = block.block.header.number.toNumber();
              break;
            }
          }

          if (index !== undefined) {
            const allEvents: Vec<EventRecord> = await api.query.system.events.at(blockHash);

            const events = allEvents
              .filter(({ phase }) =>
                phase.isApplyExtrinsic &&
                phase.asApplyExtrinsic.eq(index)
              );

            for (const { event } of events) {
              if (api.events.system.ExtrinsicSuccess.is(event)) {
                return { ...result, status: HistoryRecoverStatus.SUCCESS };
              } else if (api.events.system.ExtrinsicFailed.is(event)) {
                return { ...result, status: HistoryRecoverStatus.FAILED };
              }
            }
          }
        }
      } else {
        const block = await api.rpc.chain.getBlock(blockHash);
        const allEvents: Vec<EventRecord> = await api.query.system.events.at(blockHash);

        const extrinsics = block.block.extrinsics;
        let index: number | undefined;

        for (const [idx, extrinsic] of Object.entries(extrinsics)) {
          if (extrinsicHash === extrinsic.hash.toHex()) {
            index = parseInt(idx);
            break;
          }
        }

        if (index === undefined) {
          console.log(`Fail to find extrinsic ${extrinsicHash} on ${chain}`);

          return { status: HistoryRecoverStatus.FAIL_DETECT };
        }

        const events = allEvents
          .filter(({ phase }) =>
            phase.isApplyExtrinsic &&
            phase.asApplyExtrinsic.eq(index)
          );

        for (const { event } of events) {
          if (api.events.system.ExtrinsicSuccess.is(event)) {
            return { ...result, status: HistoryRecoverStatus.SUCCESS };
          } else if (api.events.system.ExtrinsicFailed.is(event)) {
            return { ...result, status: HistoryRecoverStatus.FAILED };
          }
        }
      }

      return { status: HistoryRecoverStatus.FAIL_DETECT };
    } else {
      console.error(`Fail to update history ${chain}-${extrinsicHash}: Api not active`);

      return { status: HistoryRecoverStatus.API_INACTIVE };
    }
  } catch (e) {
    console.error(`Fail to update history ${chain}-${extrinsicHash}:`, (e as Error).message);

    return { status: HistoryRecoverStatus.UNKNOWN };
  }
};

const evmRecover = async (history: TransactionHistoryItem, chainService: ChainService): Promise<TransactionRecoverResult> => {
  const { address, chain, extrinsicHash, from, nonce, startBlock } = history;

  const result: TransactionRecoverResult = {
    status: HistoryRecoverStatus.UNKNOWN
  };

  try {
    const evmApi = chainService.getEvmApi(chain);

    if (evmApi) {
      const _api = await Promise.race([
        evmApi.isReady,
        new Promise<_EvmApi>((resolve, reject) => {
          const createTimeout = (callback: () => void) => {
            setTimeout(callback, 10000);
          };

          createTimeout(() => {
            const api = chainService.getEvmApi(chain);

            Promise.race([
              api.isReady,
              new Promise<_EvmApi>((resolve, reject) => createTimeout(() => reject(new Error('Timeout'))))
            ])
              .then(resolve)
              .catch(reject);
          });
        })]
      );
      const api = _api.api;

      if (extrinsicHash && isHex(extrinsicHash)) {
        const transactionReceipt = await api.eth.getTransactionReceipt(extrinsicHash);

        return { ...result, status: transactionReceipt.status ? HistoryRecoverStatus.SUCCESS : HistoryRecoverStatus.FAILED };
      } else {
        if (nonce === undefined || startBlock === undefined) {
          console.log(`Fail to find extrinsic for ${address} on ${chain}: With nonce ${nonce || 'undefined'} from block ${startBlock || 'undefined'}`);

          return { ...result, status: HistoryRecoverStatus.LACK_INFO };
        }

        const currentBlock = await api.eth.getBlockNumber();

        for (let i = 1, found = false; i < BLOCK_LIMIT && !found && startBlock + i <= currentBlock; i++) {
          const block = await api.eth.getBlock(startBlock + i, true);

          for (const transaction of block.transactions) {
            if (isSameAddress(transaction.from, from) && nonce === transaction.nonce) {
              result.extrinsicHash = transaction.hash;
              result.blockHash = block.hash;
              result.blockNumber = block.number;
              found = true;
              break;
            }
          }

          if (result.extrinsicHash) {
            const transactionReceipt = await api.eth.getTransactionReceipt(result.extrinsicHash);

            return { ...result, status: transactionReceipt.status ? HistoryRecoverStatus.SUCCESS : HistoryRecoverStatus.FAILED };
          }
        }
      }

      return { status: HistoryRecoverStatus.FAIL_DETECT };
    } else {
      console.error(`Fail to update history ${chain}-${extrinsicHash}: Api not active`);

      return { status: HistoryRecoverStatus.API_INACTIVE };
    }
  } catch (e) {
    console.error(`Fail to update history ${chain}-${extrinsicHash}:`, (e as Error).message);

    return { status: HistoryRecoverStatus.UNKNOWN };
  }
};

const bitcoinRecover = async (history: TransactionHistoryItem, chainService: ChainService): Promise<TransactionRecoverResult> => {
  const { chain, extrinsicHash } = history;
  const result: TransactionRecoverResult = {
    status: HistoryRecoverStatus.UNKNOWN
  };

  // TODO: 1. Consider rebroadcasting transaction if stuck in mempool

  try {
    const bitcoinApi = chainService.getBitcoinApi(chain);

    if (bitcoinApi) {
      const api = bitcoinApi.api;

      if (extrinsicHash) {
        try {
          const timeout = new Promise<undefined>((resolve) => {
            setTimeout(() => {
              resolve(undefined);
            }, 60000);
          });
          const txStatus = await Promise.race([api.getTransactionStatus(extrinsicHash), timeout]);

          if (!txStatus) {
            return { ...result, status: HistoryRecoverStatus.API_INACTIVE };
          }

          if (txStatus.confirmed) {
            const transactionDetail = await Promise.race([api.getTransactionDetail(extrinsicHash), timeout]);

            if (transactionDetail) {
              result.blockHash = transactionDetail.status.block_hash || undefined;
              result.blockNumber = transactionDetail.status.block_height || undefined;
              result.blockTime = transactionDetail.status.block_time ? (transactionDetail.status.block_time * 1000) : undefined;

              return { ...result, status: HistoryRecoverStatus.SUCCESS };
            }

            return { ...result, status: HistoryRecoverStatus.API_INACTIVE };
          } else {
            return { ...result, status: HistoryRecoverStatus.TX_PENDING };
          }
        } catch (e) {
          // Fail when cannot find transaction
          return { ...result, status: HistoryRecoverStatus.FAILED };
        }
      }

      return { status: HistoryRecoverStatus.FAIL_DETECT };
    } else {
      console.error(`Fail to update history ${chain}-${extrinsicHash}: Api not active`);

      return { status: HistoryRecoverStatus.API_INACTIVE };
    }
  } catch (e) {
    console.error(`Fail to update history ${chain}-${extrinsicHash}:`, (e as Error).message);

    return { status: HistoryRecoverStatus.UNKNOWN };
  }
};

// undefined: Cannot check status
// true: Transaction success
// false: Transaction failed
export const historyRecover = async (history: TransactionHistoryItem, chainService: ChainService): Promise<TransactionRecoverResult> => {
  const { chainType } = history;

  if (!chainType) {
    return { status: HistoryRecoverStatus.LACK_INFO };
  }

  const recoverFunctions: Record<string, (history: TransactionHistoryItem, chainService: ChainService) => Promise<TransactionRecoverResult>> = {
    substrate: substrateRecover,
    evm: evmRecover,
    bitcoin: bitcoinRecover
  };

  const checkFunction = recoverFunctions[chainType];

  if (!checkFunction) {
    console.warn(`Chain type ${chainType} is not supported for recoverHistory`);

    return { status: HistoryRecoverStatus.UNKNOWN };
  }

  try {
    return await checkFunction(history, chainService);
  } catch (error) {
    console.error(`Failed to recover history for chain type ${chainType}:`, error);

    return { status: HistoryRecoverStatus.FAILED };
  }
};
