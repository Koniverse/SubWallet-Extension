// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import { addLazy, createPromiseHandler, filterAddressByChainInfo, PromiseHandler } from '@subwallet/extension-base/utils';
import { BehaviorSubject } from 'rxjs';

import { ServiceStatus } from '../base/types';
import { _GOVERNANCE_CHAIN_GROUP } from '../chain-service/constants';
import { _isChainEnabled } from '../chain-service/utils';
import { EventService } from '../event-service';
import DatabaseService from '../storage-service/DatabaseService';
import { SWTransactionBase } from '../transaction-service/types';
import BaseOpenGovHandler from './handler';
import { GovVoteRequest, GovVotingInfo, RemoveVoteRequest, UnlockVoteRequest } from './interface';

class OpenGovChainHandler extends BaseOpenGovHandler {
  public readonly slug: string;

  constructor (state: KoniState, chain: string) {
    super(state, chain);
    this.slug = chain;
  }
}

export default class OpenGovService {
  protected readonly state: KoniState;
  private dbService: DatabaseService;
  private readonly eventService: EventService;
  protected readonly handlers: Record<string, OpenGovChainHandler> = {};

  // subjects
  public readonly govLockedInfoSubject = new BehaviorSubject<Record<string, GovVotingInfo>>({});
  public readonly govLockedInfoListSubject = new BehaviorSubject<GovVotingInfo[]>([]);
  private govLockedInfoPersistQueue: GovVotingInfo[] = [];
  private govLockedInfoUnsub: VoidFunction | undefined;
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;

  private startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  private stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();

  constructor (state: KoniState) {
    this.state = state;
    this.eventService = state.eventService;
    this.dbService = state.dbService;
  }

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;
    this.eventService.emit('open-gov.ready', true);
    await this.initHandlers();
    await this.getGovLockedInfoFromDB();

    this.status = ServiceStatus.INITIALIZED;
    this.govLockedInfoListSubject.next(Object.values(this.govLockedInfoSubject.getValue()));

    this.handleActions();
  }

  private delayReloadTimeout: NodeJS.Timeout | undefined;

  handleActions () {
    this.eventService.onLazy((events, eventTypes) => {
      let delayReload = false;
      const removedAddresses: string[] = [];
      const removeChains: string[] = [];

      (async () => {
        for (const event of events) {
          if (event.type === 'account.remove') {
            removedAddresses.push(event.data[0] as string);
          }

          if (event.type === 'account.add' || event.type === 'account.updateCurrent') {
            delayReload = true;
          }

          if (event.type === 'chain.updateState') {
            const chainKey = event.data[0] as string;
            const chainState = this.state.getChainStateByKey(chainKey);

            if (chainState && !_isChainEnabled(chainState)) {
              removeChains.push(chainKey);
            }

            delayReload = true;
          }

          if (event.type === 'transaction.done') {
            const tx = event.data[0] as SWTransactionBase;
            const govRelatedTypes = [
              ExtrinsicType.GOV_VOTE,
              ExtrinsicType.GOV_UNVOTE,
              ExtrinsicType.GOV_UNLOCK_VOTE
            ];

            if (govRelatedTypes.includes(tx.extrinsicType)) {
              delayReload = true;
            }
          }
        }

        if (removeChains.length || removedAddresses.length) {
          await this.removeGovLockedInfos(removeChains, removedAddresses);
        }

        if (eventTypes.includes('account.updateCurrent') ||
          eventTypes.includes('account.remove') ||
          eventTypes.includes('chain.updateState') ||
          delayReload) {
          if (delayReload) {
            this.delayReloadTimeout = setTimeout(() => {
              this.resetGovLockedInfo()
                .then(() => this.runSubscribeGovLockedInfo())
                .catch(console.error);
            }, 3000);
          } else {
            this.delayReloadTimeout && clearTimeout(this.delayReloadTimeout);
            this.delayReloadTimeout = undefined;
            await this.resetGovLockedInfo();
            await this.runSubscribeGovLockedInfo();
          }
        }
      })().catch(console.error);
    });
  }

  async removeGovLockedInfos (chains?: string[], addresses?: string[]) {
    const current = this.govLockedInfoSubject.getValue();
    const removeKeys: string[] = [];

    if (chains && chains.length > 0) {
      for (const [key, value] of Object.entries(current)) {
        if (chains.includes(value.chain)) {
          removeKeys.push(key);
        }
      }
    }

    if (addresses && addresses.length > 0) {
      for (const [key, value] of Object.entries(current)) {
        if (addresses.includes(value.address)) {
          removeKeys.push(key);
        }
      }
    }

    for (const key of removeKeys) {
      delete current[key];
    }

    this.govLockedInfoSubject.next(current);
    this.govLockedInfoListSubject.next(Object.values(current));

    if (addresses && addresses.length > 0) {
      await this.dbService.removeGovLockedInfosByAddresses(addresses);
    }

    if (chains && chains.length > 0) {
      await this.dbService.removeGovLockedInfosByChains(chains);
    }
  }

  private async initHandlers (): Promise<void> {
    await this.eventService.waitChainReady;
    const chains: string[] = [];

    const supportedSlugs = Object.values(_GOVERNANCE_CHAIN_GROUP).flat();

    for (const chain of Object.values(this.state.getChainInfoMap())) {
      if (chain.chainStatus === 'ACTIVE' && supportedSlugs.includes(chain.slug)) {
        chains.push(chain.slug);
      }
    }

    for (const chain of chains) {
      this.handlers[chain] = new OpenGovChainHandler(this.state, chain);
    }
  }

  public async handleVote (request: GovVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleVote(request);
  }

  public async handleRemoveVote (request: RemoveVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleRemoveVote(request);
  }

  public async handleUnlockVote (request: UnlockVoteRequest): Promise<TransactionData> {
    const handler = this.handlers[request.chain];

    if (!handler) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    return handler.handleUnlockVote(request);
  }

  /* Gov Locked Info */

  public async runSubscribeGovLockedInfo () {
    await this.eventService.waitKeyringReady;
    this.runUnsubscribeGovLockedInfo();

    const addresses = this.state.keyringService.context.getDecodedAddresses();

    this.subscribeGovLockedInfos(addresses, (data) => {
      this.updateGovLockedInfo(data);
    }).then((rs) => {
      this.govLockedInfoUnsub = rs;
    }).catch(console.error);
  }

  private runUnsubscribeGovLockedInfo () {
    this.govLockedInfoUnsub?.();
    this.govLockedInfoUnsub = undefined;
    this.govLockedInfoPersistQueue = [];
  }

  public async subscribeGovLockedInfos (
    addresses: string[],
    cb: (info: GovVotingInfo) => void
  ): Promise<VoidFunction> {
    let cancel = false;

    await this.eventService.waitChainReady;
    const activeChains = this.state.activeChainSlugs;
    const unsubList: Array<VoidFunction> = [];

    for (const handler of Object.values(this.handlers)) {
      if (activeChains.includes(handler.chain)) {
        const [useAddresses] = filterAddressByChainInfo(addresses, handler.chainInfo);

        handler.subscribeGovLockedInfo(useAddresses, cb)
          .then((unsub) => {
            if (cancel) {
              unsub();
            } else {
              unsubList.push(unsub);
            }
          })
          .catch(console.error);
      }
    }

    return () => {
      cancel = true;
      unsubList.forEach((unsub) => unsub?.());
    };
  }

  public updateGovLockedInfo (data: GovVotingInfo) {
    this.govLockedInfoPersistQueue.push(data);

    addLazy('persistGovLockedInfo', () => {
      const govInfo = this.govLockedInfoSubject.getValue();
      const queue = [...this.govLockedInfoPersistQueue];

      this.govLockedInfoPersistQueue = [];

      // Update info in memory
      queue.forEach((item) => {
        const key = `${item.chain}---${item.address}`;

        govInfo[key] = item;
      });
      this.govLockedInfoSubject.next(govInfo);
      this.govLockedInfoListSubject.next(Object.values(govInfo));

      // Persist data
      this.dbService.updateGovLockedInfos(queue).catch(console.warn);
    }, 300, 900);
  }

  public async resetGovLockedInfo () {
    this.govLockedInfoPersistQueue = [];
    await this.dbService.stores.govLockedInfo.clear();
  }

  private async getGovLockedInfoFromDB () {
    await this.eventService.waitChainReady;
    await this.eventService.waitKeyringReady;

    const addresses = this.state.keyringService.context.getDecodedAddresses();
    const existedInfos = await this.dbService.getGovLockedInfos(addresses, this.state.activeChainSlugs);

    const govInfo = this.govLockedInfoSubject.getValue();

    existedInfos.forEach((item) => {
      govInfo[`${item.chain}---${item.address}`] = item;
    });

    this.govLockedInfoSubject.next(govInfo);
    this.govLockedInfoListSubject.next(Object.values(govInfo));
  }

  public subscribeGovLockedInfoSubject () {
    return this.govLockedInfoListSubject;
  }

  public async getGovLockedInfoInfo () {
    await this.eventService.waitEarningReady;

    return Promise.resolve(this.govLockedInfoListSubject.getValue());
  }

  /* --------- Start/Stop ---------- */
  async start (): Promise<void> {
    if (this.status === ServiceStatus.STARTING || this.status === ServiceStatus.STARTED) {
      return this.waitForStarted();
    }

    this.status = ServiceStatus.STARTING;

    this.startPromiseHandler.resolve();
    this.stopPromiseHandler = createPromiseHandler();

    this.status = ServiceStatus.STARTED;
  }

  async stop (): Promise<void> {
    if (this.status === ServiceStatus.STOPPING || this.status === ServiceStatus.STOPPED) {
      return this.waitForStopped();
    }

    this.status = ServiceStatus.STOPPING;

    this.runUnsubscribeGovLockedInfo();

    this.stopPromiseHandler.resolve();
    this.startPromiseHandler = createPromiseHandler();

    this.status = ServiceStatus.STOPPED;
  }

  waitForStarted (): Promise<void> {
    return this.startPromiseHandler.promise;
  }

  waitForStopped (): Promise<void> {
    return this.stopPromiseHandler.promise;
  }

  /* Gov Locked Info */
}
