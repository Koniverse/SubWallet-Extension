// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { _reformatAddressWithChain, addLazy, createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils';
import { BehaviorSubject } from 'rxjs';

import { EventItem, EventType } from '../event-service/types';

// todo: deploy online
const MULTISIG_SUPPORTED_CHAINS = ['statemint', 'statemine', 'paseo_assethub', 'paseoTest', 'westend_assethub'];

interface PendingMultisigTx {
  chain: string;
  multisigAddress: string;
  callHash: string;
  when: { height: number; index: number };
  deposit: string;
  depositor: string;
  approvals: string[];
  // missingApprovals: string[]; TODO: Init logic get missing approvals
  timestamp?: number;
}

type MultisigMap = Record<string, PendingMultisigTx[]>;

export class MultisigService implements StoppableServiceInterface {
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;
  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();

  private multisigMap: Record<string, PendingMultisigTx[]> = {};
  private readonly multisigSubject: BehaviorSubject<MultisigMap> = new BehaviorSubject<MultisigMap>({});
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

    this.multisigSubject.next(this.multisigMap);
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
    if (
      eventTypes.includes('account.updateCurrent') ||
      eventTypes.includes('account.add') ||
      eventTypes.includes('chain.updateState')
    ) {
      needReload = true;

      if (eventTypes.includes('account.updateCurrent')) {
        lazyTime = 1000;
      }
    }

    // Handle account removal
    events.forEach((event) => {
      if (event.type === 'account.remove') {
        const address = event.data[0] as string;

        delete this.multisigMap[address];
        needReload = true;
      }
    });

    if (needReload) {
      addLazy(
        'reloadMultisigByEvents',
        () => {
          if (this.isStarted) {
            this.runSubscribeMultisigs().catch(console.error);
          }
        },
        lazyTime,
        undefined,
        true
      );
    }
  }

  /**
   * Subscribe to multisig changes for all multisig addresses
   */
  public get activeNetworks () {
    return this.chainService.getActiveChainInfos();
  }

  public get activeChainSlugs () {
    return Object.values(this.activeNetworks).map((chainInfo) => {
      return chainInfo.slug;
    });
  }

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

    const activeChains = this.activeChainSlugs;

    await Promise.all(
      MULTISIG_SUPPORTED_CHAINS
        .filter((chain) => activeChains.includes(chain))
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
  private async subscribeMultisigAddress (
    chain: string,
    multisigAddress: string
  ): Promise<void> {
    try {
      const substrateApi = await this.chainService.getSubstrateApi(chain).isReady;
      const key = `${chain}-${multisigAddress}`;

      const keys = await substrateApi.api.query.multisig.multisigs.keys(multisigAddress);

      // Subscribe to multi storage
      const unsub = await substrateApi.api.query.multisig.multisigs.multi(keys.map((key) => key.args), (multisigEntries) => {
        const pendingTxs: PendingMultisigTx[] = [];

        multisigEntries.forEach((_multisigInfo, index) => {
          const multisigInfo = _multisigInfo.toPrimitive() as PendingMultisigTx | null;

          const callHash = keys[index].args[1].toHex();

          if (!multisigInfo) {
            return;
          }

          pendingTxs.push({
            chain,
            multisigAddress,
            callHash,
            when: multisigInfo.when,
            deposit: multisigInfo.deposit,
            depositor: multisigInfo.depositor,
            approvals: multisigInfo.approvals,
            timestamp: Date.now()
          });
        });

        this.updateMultisigMap(multisigAddress, pendingTxs);
      }
      );

      console.log('multisigMap', this.multisigMap);
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
  private updateMultisigMap (multisigAddress: string, pendingTxs: PendingMultisigTx[]): void {
    this.multisigMap[multisigAddress] = pendingTxs;
    this.multisigSubject.next({ ...this.multisigMap });

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

  public subscribeMultisigMap (): BehaviorSubject<MultisigMap> {
    return this.multisigSubject;
  }

  public getMultisigMap (): MultisigMap {
    return { ...this.multisigMap };
  }

  /**
   * Get pending transactions for a specific multisig address
   */
  public getPendingTxsForAddress (multisigAddress: string): PendingMultisigTx[] {
    return this.multisigMap[multisigAddress] || [];
  }

  /**
   * Reload all multisig data
   */
  public async reloadMultisigs (): Promise<void> {
    this.multisigMap = {};
    this.multisigSubject.next({});
    await this.runSubscribeMultisigs();
  }
}
