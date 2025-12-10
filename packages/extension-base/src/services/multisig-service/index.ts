// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { decodeCallData, getCallData } from '@subwallet/extension-base/services/multisig-service/utils';
import { _reformatAddressWithChain, addLazy, createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils';
import { BehaviorSubject } from 'rxjs';

import { EventItem, EventType } from '../event-service/types';

// todo: deploy online
const MULTISIG_SUPPORTED_CHAINS = ['statemint', 'statemine', 'paseo_assethub', 'paseoTest', 'westend_assethub'];

interface PalletMultisigMultisig {
  when: {
    height: number,
    index: number
  },
  deposit: number,
  depositor: string,
  approvals: string[]
}

interface PendingMultisigTx {
  chain: string;
  multisigAddress: string;
  depositor: string,
  callHash: string,
  blockHeight: number,
  extrinsicIndex: number,
  depositAmount: number,
  approvals: string[]
  // missingApprovals: string[]; TODO: Init logic get missing approvals
  callData?: string;
  timestamp?: number;
}

type PendingMultisigTxMap = Record<string, PendingMultisigTx[]>;

export class MultisigService implements StoppableServiceInterface {
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;
  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();

  private pendingMultisigTxMap: Record<string, PendingMultisigTx[]> = {};
  private readonly pendingMultisigTxSubject: BehaviorSubject<PendingMultisigTxMap> = new BehaviorSubject<PendingMultisigTxMap>({});
  private unsubscribers: Map<string, VoidFunction> = new Map();

  get isStarted (): boolean {
    return this.status === ServiceStatus.STARTED;
  }

  constructor (
    private readonly eventService: EventService,
    private readonly chainService: ChainService
  ) {
    this.status = ServiceStatus.NOT_INITIALIZED;
  }

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STOPPING) {
      await this.waitForStopped();
    }

    if (this.status === ServiceStatus.STARTED || this.status === ServiceStatus.STARTING) {
      return await this.waitForStarted();
    }

    this.status = ServiceStatus.STARTING;

    await this.runSubscribeMultisigs();

    this.stopPromiseHandler = createPromiseHandler();
    this.status = ServiceStatus.STARTED;
    this.startPromiseHandler.resolve();
  }

  async stop (): Promise<void> {
    if (this.status === ServiceStatus.STARTING) {
      await this.waitForStarted();
    }

    if (this.status === ServiceStatus.STOPPED || this.status === ServiceStatus.STOPPING) {
      return await this.waitForStopped();
    }

    this.status = ServiceStatus.STOPPING;

    this.runUnsubscribeMultisigs();

    this.startPromiseHandler = createPromiseHandler();
    this.stopPromiseHandler.resolve();
    this.status = ServiceStatus.STOPPED;
  }

  loadData () {
    // TODO: Load pending multisig txs from db if needed

    this.pendingMultisigTxSubject.next(this.pendingMultisigTxMap);
  }

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;

    await this.eventService.waitChainReady;
    await this.eventService.waitAccountReady;
    this.loadData();

    this.status = ServiceStatus.INITIALIZED;

    this.eventService.onLazy(this.handleEvents.bind(this));
  }

  /** Wait service start */
  waitForStarted (): Promise<void> {
    return this.startPromiseHandler.promise;
  }

  /** Wait service stop */
  waitForStopped (): Promise<void> {
    return this.stopPromiseHandler.promise;
  }

  handleEvents (events: EventItem<EventType>[], eventTypes: EventType[]): void {
    let needReload = false;
    let lazyTime = 2000;

    // Account changed or chain changed
    if (eventTypes.includes('account.updateCurrent') || eventTypes.includes('account.add') || eventTypes.includes('chain.updateState')) {
      needReload = true;

      if (eventTypes.includes('account.updateCurrent')) {
        lazyTime = 1000;
      }
    }

    // Handle account removal
    events.forEach((event) => {
      if (event.type === 'account.remove') {
        const address = event.data[0] as string;

        delete this.pendingMultisigTxMap[address]; // todo: fix key
        needReload = true;
      }
    });

    if (needReload) {
      addLazy('reloadMultisigByEvents', () => {
        if (this.isStarted) {
          this.runSubscribeMultisigs().catch(console.error);
        }
      }, lazyTime, undefined, true);
    }
  }

  /**
   * Subscribe to multisig changes for all multisig addresses
   */

  private async runSubscribeMultisigs (): Promise<void> {
    await Promise.all([
      this.eventService.waitKeyringReady,
      this.eventService.waitChainReady
    ]);

    // Clear old subscribers before resubscribe
    this.runUnsubscribeMultisigs();

    const multisigAddresses: string[] = [
      '5DbqdtTkqGExdLKHDC7ea9DoQ3MaiaVpxC7Le1QgnVd5oJbK',
      '1627ti7gKnn5aTp7a7SUVsgnM9wE6BCNw6CgCzKiVeJz5DDA'
    ];

    if (!multisigAddresses.length) {
      return;
    }

    const activeChains = this.chainService.getActiveChains();
    const supportedActiveChains = MULTISIG_SUPPORTED_CHAINS.filter((chain) => activeChains.includes(chain));

    await Promise.all(
      supportedActiveChains
        .flatMap((chain) => {
          const chainInfo = this.chainService.getChainInfoByKey(chain);

          return multisigAddresses.map((address) => {
            const reformatAddress = _reformatAddressWithChain(address, chainInfo);

            return this.subscribeMultisigAddress(chain, reformatAddress);
          });
        })
    );
  }

  /**
   * Subscribe to a specific multisig address on a chain
   */
  private async subscribeMultisigAddress (chain: string, multisigAddress: string): Promise<void> {
    try {
      const substrateApi = await this.chainService.getSubstrateApi(chain).isReady;
      const key = `${chain}-${multisigAddress}`;

      const keys = await substrateApi.api.query.multisig.multisigs.keys(multisigAddress);

      // Subscribe to multi storage
      const unsub = await substrateApi.api.query.multisig.multisigs.multi(keys.map((key) => key.args), (pendingMultisigEntries) => {
        const pendingTxs: PendingMultisigTx[] = [];

        pendingMultisigEntries.forEach((_multisigInfo, index) => {
          const pendingMultisigInfo = _multisigInfo.toPrimitive() as unknown as PalletMultisigMultisig;
          const blockHeight = pendingMultisigInfo.when.height;
          const extrinsicIndex = pendingMultisigInfo.when.index;
          const callHash = keys[index].args[1].toHex();

          const callData = await getCallData({
            api: substrateApi.api,
            callHash,
            blockHeight,
            extrinsicIndex
          });

          const decodedCallData = decodeCallData({
            api: substrateApi.api,
            callData
          });

          console.log('callData', callData);
          console.log('decodedCallData', decodedCallData);

          if (!pendingMultisigInfo) {
            return;
          }

          pendingTxs.push({
            chain,
            multisigAddress,
            callHash,
            callData,
            blockHeight,
            extrinsicIndex,
            depositAmount: pendingMultisigInfo.deposit,
            depositor: pendingMultisigInfo.depositor,
            approvals: pendingMultisigInfo.approvals,
            timestamp: Date.now() // todo
          });
        });

        this.updateMultisigMap(key, pendingTxs);
      });

      this.unsubscribers.set(key, unsub);
    } catch (e) {
      console.error('Failed to subscribe pending multisig transactions', e);
    }
  }

  private runUnsubscribeMultisigs (): void {
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
      }
    });
    this.unsubscribers.clear();
  }

  /**
   * Update multisig map and notify subscribers
   */
  private updateMultisigMap (key: string, pendingTxs: PendingMultisigTx[]): void {
    this.pendingMultisigTxMap[key] = pendingTxs;
    this.pendingMultisigTxSubject.next({ ...this.pendingMultisigTxMap });

    // Store to db
    addLazy(
      'updateMultisigStore',
      () => {
        this.updateMultisigStore().catch(console.error);
      },
      300,
      1800
    );
  }

  private async updateMultisigStore (): Promise<void> {
    // TODO: implement db store logic
  }

  public subscribeMultisigMap (): BehaviorSubject<PendingMultisigTxMap> {
    return this.pendingMultisigTxSubject;
  }

  public getMultisigMap (): PendingMultisigTxMap {
    return { ...this.pendingMultisigTxMap };
  }

  /**
   * Get pending transactions for a specific multisig address
   */
  public getPendingTxsForAddress (multisigAddress: string): PendingMultisigTx[] {
    return this.pendingMultisigTxMap[multisigAddress] || []; // todo: fix this
  }

  /**
   * Reload all multisig data
   */
  public async reloadMultisigs (): Promise<void> {
    this.pendingMultisigTxMap = {};
    this.pendingMultisigTxSubject.next({});
    await this.runSubscribeMultisigs();
  }
}
