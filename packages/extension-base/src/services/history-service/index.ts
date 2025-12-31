// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ChainType, ExtrinsicStatus, ExtrinsicType, TransactionHistoryItem, XCMTransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import { CRON_RECOVER_HISTORY_INTERVAL } from '@subwallet/extension-base/constants';
import { PersistDataServiceInterface, ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _isChainBitcoinCompatible, _isChainEvmCompatible, _isChainSubstrateCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { parseBitcoinTransferData } from '@subwallet/extension-base/services/history-service/bitcoin-history';
import { historyRecover, HistoryRecoverStatus } from '@subwallet/extension-base/services/history-service/helpers/recoverHistoryStatus';
import { getExtrinsicParserKey } from '@subwallet/extension-base/services/history-service/helpers/subscan-extrinsic-parser-helper';
import { parseSubscanExtrinsicData, parseSubscanTransferData } from '@subwallet/extension-base/services/history-service/subscan-history';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import { SubscanService } from '@subwallet/extension-base/services/subscan-service';
import { getAddressesByChainType } from '@subwallet/extension-base/utils';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { createPromiseHandler } from '@subwallet/extension-base/utils/promise';
import { keyring } from '@subwallet/ui-keyring';
import { BehaviorSubject } from 'rxjs';

const historyServiceLogger = createLogger('HistoryService');

function filterHistoryItemByAddressAndChain (chain: string, addresses: string[]) {
  return (item: TransactionHistoryItem) => {
    return item.chain === chain && addresses.includes(item.address);
  };
}

export class HistoryService implements StoppableServiceInterface, PersistDataServiceInterface {
  private historySubject: BehaviorSubject<TransactionHistoryItem[]> = new BehaviorSubject([] as TransactionHistoryItem[]);
  #needRecoveryHistories: Record<string, TransactionHistoryItem> = {};

  constructor (
    private dbService: DatabaseService,
    private chainService: ChainService,
    private eventService: EventService,
    private keyringService: KeyringService,
    private subscanService: SubscanService
  ) {
    this.init().catch((error) => historyServiceLogger.error('Error initializing history service', error));
  }

  private fetchPromise: Promise<void> | null = null;
  private recoverInterval: NodeJS.Timer | undefined = undefined;

  private async fetchAndLoadHistories (addresses: string[]): Promise<TransactionHistoryItem[]> {
    if (!addresses || addresses.length === 0) {
      return [];
    }

    // Query data from subscan or any indexer
    // const chainMap = this.chainService.getChainInfoMap();
    // const historyRecords = await fetchMultiChainHistories(addresses, chainMap);
    // Pause deprecated until have new update
    const historyRecords = [] as TransactionHistoryItem[];

    // Fill additional info
    const accountMap = Object.entries(this.keyringService.context.pairs).reduce((map, [address, account]) => {
      map[address.toLowerCase()] = account.json.meta.name || address;

      return map;
    }, {} as Record<string, string>);

    historyRecords.forEach((record) => {
      record.fromName = accountMap[record.from?.toLowerCase()];
      record.toName = accountMap[record.to?.toLowerCase()];
    });

    await this.addHistoryItems(historyRecords);

    return historyRecords;
  }

  public async getHistories () {
    const addressList = keyring.getAccounts().map((a) => a.address);

    if (!this.fetchPromise) {
      this.fetchPromise = (async () => {
        await this.fetchAndLoadHistories(addressList);
        const histories = await this.dbService.getHistories();

        this.historySubject.next(histories);
      })();
    }

    return Promise.resolve(this.historySubject.getValue());
  }

  public async getHistorySubject () {
    await this.getHistories();

    return this.historySubject;
  }

  /**
   * @todo: Must improve performance of this function
   * */
  private fetchSubscanTransactionHistory (chain: string, addresses: string[], groupId: number) {
    if (!this.subscanService.checkSupportedSubscanChain(chain) || !addresses.length) {
      return;
    }

    const chainInfo = this.chainService.getChainInfoByKey(chain);
    // For now, we only use the first address
    const address = addresses[0];

    const excludeExtrinsicParserKeys: string[] = [
      'balances.transfer_all'
    ];

    // Note: fetchAllPossibleExtrinsicItems and fetchAllPossibleTransferItems-receive can run parallelly
    // However, fetchAllPossibleTransferItems-sent must run after fetchAllPossibleExtrinsicItems,
    // to avoid "duplicate Extrinsic Hash between items" problem

    this.subscanService.fetchAllPossibleExtrinsicItems(groupId, chain, address, (extrinsicItems) => {
      const result: TransactionHistoryItem[] = [];

      extrinsicItems.forEach((x) => {
        const item = parseSubscanExtrinsicData(address, x, chainInfo);

        if (item) {
          result.push(item);
        }
      });

      this.addHistoryItems(result).catch((e) => {
        historyServiceLogger.error('addHistoryItems in fetchAllPossibleExtrinsicItems error', e);
      });
    }).then((extrinsicItems) => {
      const excludeTransferExtrinsicHash: string[] = [];

      extrinsicItems.forEach((x) => {
        if (!excludeExtrinsicParserKeys.includes(getExtrinsicParserKey(x))) {
          excludeTransferExtrinsicHash.push(x.extrinsic_hash);
        }
      });

      this.subscanService.fetchAllPossibleTransferItems(groupId, chain, address, 'sent').then((rsMap) => {
        const result: TransactionHistoryItem[] = [];

        Object.keys(rsMap).forEach((hash) => {
          // only push item that does not have same hash with another item
          if (!excludeTransferExtrinsicHash.includes(hash) && rsMap[hash].length === 1) {
            const item = parseSubscanTransferData(address, rsMap[hash][0], chainInfo);

            if (item) {
              result.push(item);
            }
          }
        });

        this.addHistoryItems(result).catch((e) => {
          historyServiceLogger.error('addHistoryItems in fetchAllPossibleTransferItems-sent error', e);
        });
      }).catch((e) => {
        historyServiceLogger.error('fetchAllPossibleTransferItems-sent error', e);
      });
    }).catch((e) => {
      historyServiceLogger.error('fetchAllPossibleExtrinsicItems error', e);
    });

    this.subscanService.fetchAllPossibleTransferItems(groupId, chain, address, 'received').then((rsMap) => {
      const result: TransactionHistoryItem[] = [];

      Object.keys(rsMap).forEach((hash) => {
        // only push item that does not have same hash with another item
        if (rsMap[hash].length === 1) {
          const item = parseSubscanTransferData(address, rsMap[hash][0], chainInfo);

          if (item) {
            result.push(item);
          }
        }
      });

      this.addHistoryItems(result).catch((e) => {
        historyServiceLogger.error('addHistoryItems in fetchAllPossibleTransferItems-receive error', e);
      });
    }).catch((e) => {
      historyServiceLogger.error('fetchAllPossibleTransferItems-receive error', e);
    });
  }

  // Only 1 address is passed in
  private async fetchBitcoinTransactionHistory (chain: string, addresses: string[]) {
    const chainInfo = this.chainService.getChainInfoByKey(chain);
    const chainState = this.chainService.getChainStateByKey(chain);

    if (!chainState.active) {
      return;
    }

    const bitcoinApi = this.chainService.getBitcoinApi(chain);
    const allParsedItems: TransactionHistoryItem[] = [];

    for (const address of addresses) {
      const transferItems = await bitcoinApi.api.getAddressTransaction(address);

      const parsedItems = transferItems.map((item, index) => {
        const parsedItem = parseBitcoinTransferData(address, item, chainInfo);

        return { ...parsedItem, apiTxIndex: index };
      });

      allParsedItems.push(...parsedItems);
    }

    await this.addHistoryItems(allParsedItems);
  }

  subscribeHistories (chain: string, proxyId: string, cb: (items: TransactionHistoryItem[]) => void) {
    const addresses = this.keyringService.context.getDecodedAddresses(proxyId, false);
    const chainInfo = this.chainService.getChainInfoByKey(chain);
    const evmAddresses = getAddressesByChainType(addresses, [ChainType.EVM]);
    const substrateAddresses = getAddressesByChainType(addresses, [ChainType.SUBSTRATE]);
    const bitcoinAddresses = getAddressesByChainType(addresses, [ChainType.BITCOIN], chainInfo);
    const groupId = this.subscanService.getGroupId();

    const subscription = this.historySubject.subscribe((items) => {
      cb(items.filter(filterHistoryItemByAddressAndChain(chain, addresses)));
    });

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.subscanService.cancelGroupRequest(groupId);
    };

    if (_isChainSubstrateCompatible(chainInfo)) {
      if (_isChainEvmCompatible(chainInfo)) {
        this.fetchSubscanTransactionHistory(chain, evmAddresses, groupId);
      } else {
        this.fetchSubscanTransactionHistory(chain, substrateAddresses, groupId);
      }
    } else if (_isChainBitcoinCompatible(chainInfo)) {
      this.fetchBitcoinTransactionHistory(chain, bitcoinAddresses).catch((e) => {
        historyServiceLogger.error('fetchBitcoinTransactionHistory Error', e);
      });
    }

    return {
      unsubscribe,
      value: this.historySubject.getValue().filter(filterHistoryItemByAddressAndChain(chain, addresses))
    };
  }

  async updateHistories (chain: string, extrinsicHash: string, updateData: Partial<TransactionHistoryItem>) {
    const existedRecords = await this.dbService.getHistories({ chain, extrinsicHash });
    const updatedRecords = existedRecords.map((r) => {
      return { ...r, ...updateData };
    });

    await this.addHistoryItems(updatedRecords);
  }

  async updateHistoryByExtrinsicHash (extrinsicHash: string, updateData: Partial<TransactionHistoryItem>, isRecover = false) {
    await this.dbService.updateHistoryByExtrinsicHash(extrinsicHash, updateData, isRecover);
    this.historySubject.next(await this.dbService.getHistories());
  }

  // Insert history without check override origin 'app'
  async insertHistories (historyItems: TransactionHistoryItem[]) {
    await this.dbService.upsertHistory(historyItems);
    this.historySubject.next(await this.dbService.getHistories());
  }

  // Insert history with check override origin 'app'
  async addHistoryItems (historyItems: TransactionHistoryItem[]) {
    const updateRecords: TransactionHistoryItem[] = [];

    const appItems = this.historySubject.value.filter((i) => i.origin === 'app');

    historyItems.forEach((item) => {
      const needUpdateItem = appItems.find(
        (item_) => item_.extrinsicHash === item.extrinsicHash && item.chain === item_.chain && item.address === item_.address);

      if (needUpdateItem) {
        updateRecords.push({ ...needUpdateItem, status: item.status, apiTxIndex: item.apiTxIndex });

        return;
      }

      updateRecords.push(item);
    });

    await this.dbService.upsertHistory(updateRecords);
    this.historySubject.next(await this.dbService.getHistories());
  }

  async removeHistoryByAddress (address: string) {
    await this.dbService.stores.transaction.removeAllByAddress(address);
    this.historySubject.next(await this.dbService.getHistories());
  }

  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;

  async loadData (): Promise<void> {
    const histories = await this.dbService.getHistories();

    this.historySubject.next(histories);
  }

  async persistData (): Promise<void> {
    await this.dbService.upsertHistory(this.historySubject.value);
  }

  async startRecoverHistories (): Promise<void> {
    await this.recoverHistories();

    this.recoverInterval = setInterval(() => {
      this.recoverHistories().catch((error) => historyServiceLogger.error('Error recovering histories', error));
    }, CRON_RECOVER_HISTORY_INTERVAL);
  }

  stopRecoverHistories (): Promise<void> {
    clearInterval(this.recoverInterval);

    return Promise.resolve();
  }

  async recoverHistories (): Promise<void> {
    const list: TransactionHistoryItem[] = [];

    for (const processingHistory of Object.values(this.#needRecoveryHistories)) {
      const chainState = this.chainService.getChainStateByKey(processingHistory.chain);

      if (chainState.active) {
        list.push(processingHistory);
      }

      if (list.length >= 10) {
        break;
      }
    }

    const promises = list.map((history) => historyRecover(history, this.chainService));

    const results = await Promise.all(promises);

    results.forEach((recoverResult, index) => {
      const currentExtrinsicHash = list[index].extrinsicHash;

      const updateData: Partial<TransactionHistoryItem> = {
        ...recoverResult,
        status: ExtrinsicStatus.UNKNOWN
      };

      switch (recoverResult.status) {
        case HistoryRecoverStatus.API_INACTIVE:
          break;
        case HistoryRecoverStatus.TX_PENDING:
          delete this.#needRecoveryHistories[currentExtrinsicHash];
          break;
        case HistoryRecoverStatus.FAILED:
        case HistoryRecoverStatus.SUCCESS:
          updateData.status = recoverResult.status === HistoryRecoverStatus.SUCCESS ? ExtrinsicStatus.SUCCESS : ExtrinsicStatus.FAIL;
          this.updateHistoryByExtrinsicHash(currentExtrinsicHash, updateData, true).catch((error) => historyServiceLogger.error('Error updating history by extrinsic hash', error));
          delete this.#needRecoveryHistories[currentExtrinsicHash];
          break;
        default:
          this.updateHistoryByExtrinsicHash(currentExtrinsicHash, updateData, true).catch((error) => historyServiceLogger.error('Error updating history by extrinsic hash', error));
          delete this.#needRecoveryHistories[currentExtrinsicHash];
      }
    });

    if (!Object.keys(this.#needRecoveryHistories).length) {
      await this.stopRecoverHistories();
    }
  }

  startPromiseHandler = createPromiseHandler<void>();

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;
    await this.eventService.waitCryptoReady;
    this.restoreProcessTransaction().catch((error) => historyServiceLogger.error('Error restoring process transaction', error));
    await this.loadData();
    Promise.all([this.eventService.waitKeyringReady, this.eventService.waitChainReady]).then(() => {
      this.getHistories().catch((error) => historyServiceLogger.error('Error getting histories', error));
      this.recoverProcessingHistory().catch((error) => historyServiceLogger.error('Error recovering processing history', error));

      this.eventService.on('account.remove', (address) => {
        this.removeHistoryByAddress(address).catch((error) => historyServiceLogger.error('Error removing history by address', error));
      });
    }).catch((error) => historyServiceLogger.error('Error in history service operation', error));
    this.status = ServiceStatus.INITIALIZED;
  }

  async restoreProcessTransaction () {
    await this.dbService.restoreProcessTransaction();
  }

  async recoverProcessingHistory () {
    const histories = await this.dbService.getHistories();

    this.#needRecoveryHistories = {};

    histories
      .filter((history) => {
        if ([ExtrinsicStatus.PROCESSING, ExtrinsicStatus.SUBMITTING].includes(history.status)) {
          return true;
        } else if (history.status === ExtrinsicStatus.SUCCESS && history.chainType === 'bitcoin') {
          return !history.blockTime;
        }

        return false;
      })
      .filter((history) => {
        if (history.type === ExtrinsicType.TRANSFER_XCM) {
          const data = history.additionalInfo as XCMTransactionAdditionalInfo;

          return data.originalChain === history.chain;
        } else {
          return true;
        }
      })
      .forEach((history) => {
        this.#needRecoveryHistories[history.extrinsicHash] = history;
      });

    const recoverNumber = Object.keys(this.#needRecoveryHistories).length;

    if (recoverNumber > 0) {
      historyServiceLogger.info(`Recover ${recoverNumber} processing history`);
    }

    this.startRecoverHistories().catch((error) => historyServiceLogger.error('Error starting recover histories', error));
  }

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STARTED) {
      return;
    }

    try {
      await Promise.all([this.eventService.waitKeyringReady, this.eventService.waitChainReady]);
      this.startPromiseHandler = createPromiseHandler<void>();
      this.status = ServiceStatus.STARTING;
      this.status = ServiceStatus.STARTED;
      this.startPromiseHandler.resolve();
    } catch (e) {
      this.startPromiseHandler.reject(e);
    }
  }

  waitForStarted () {
    return this.startPromiseHandler.promise;
  }

  stopPromiseHandler = createPromiseHandler<void>();

  async stop (): Promise<void> {
    try {
      this.stopPromiseHandler = createPromiseHandler<void>();
      this.status = ServiceStatus.STOPPING;
      await this.persistData();
      await this.stopRecoverHistories();
      this.stopPromiseHandler.resolve();
      this.status = ServiceStatus.STOPPED;
    } catch (e) {
      this.stopPromiseHandler.reject(e);
    }
  }

  waitForStopped () {
    return this.stopPromiseHandler.promise;
  }
}
