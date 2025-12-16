// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem, NftJson } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { EventItem, EventType } from '@subwallet/extension-base/services/event-service/types';
import { addLazy, createPromiseHandler, PromiseHandler, waitTimeout } from '@subwallet/extension-base/utils';
import { BehaviorSubject } from 'rxjs';

import { MultiChainNftFetcher } from './multi-chain-nft-fetcher';

export interface NftState {
  nftData: NftJson;
  nftCollections: NftCollection[];
  isLoading: boolean;
}

const INITIAL_NFT_STATE: NftState = {
  nftData: { total: 0, nftList: [] },
  nftCollections: [],
  isLoading: false
};

export class NftServiceV2 implements StoppableServiceInterface {
  private readonly state: KoniState;
  private readonly multiChainFetcher: MultiChainNftFetcher;
  private _intervalFetchNft: NodeJS.Timer | undefined;
  private readonly NFT_INTERVAL_TIME = 2 * 60 * 60 * 1000; // 2 hours

  private readonly nftStateSubject = new BehaviorSubject<NftState>(INITIAL_NFT_STATE);
  public readonly nftState$ = this.nftStateSubject.asObservable();

  private fetchMode: 'preview' | 'full' = 'preview';
  private isReloading = false;

  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;

  get isStarted (): boolean {
    return this.status === ServiceStatus.STARTED;
  }

  constructor (state: KoniState) {
    this.state = state;
    this.multiChainFetcher = new MultiChainNftFetcher(state);
  }

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;

    await this.state.eventService.waitKeyringReady;
    await this.state.eventService.waitChainReady;

    await this.loadCachedData();

    this.status = ServiceStatus.INITIALIZED;

    this.state.eventService.onLazy(this.handleEvents.bind(this));
  }

  private async loadCachedData () {
    const [nftData, collections] = await Promise.all([
      this.state.getNft(),
      this.state.getNftCollection()
    ]);

    this.nftStateSubject.next({
      nftData: nftData || { total: 0, nftList: [] },
      nftCollections: collections || [],
      isLoading: false
    });
  }

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STOPPING) {
      await this.waitForStopped();
    }

    if (this.isStarted || this.status === ServiceStatus.STARTING) {
      return this.waitForStarted();
    }

    this.status = ServiceStatus.STARTING;

    await this.refreshNftData();

    this.status = ServiceStatus.STARTED;
    this.startPromiseHandler.resolve();
    this.startScanNft();
  }

  async stop (): Promise<void> {
    if (this.status === ServiceStatus.STARTING) {
      await this.waitForStarted();
    }

    if (this.status === ServiceStatus.STOPPED || this.status === ServiceStatus.STOPPING) {
      return this.waitForStopped();
    }

    this.status = ServiceStatus.STOPPING;

    this.stopScanNft();
    this.stopPromiseHandler.resolve();
  }

  waitForStarted (): Promise<void> {
    return this.startPromiseHandler.promise;
  }

  waitForStopped (): Promise<void> {
    return this.stopPromiseHandler.promise;
  }

  private handleEvents (events: EventItem<EventType>[], eventTypes: EventType[]) {
    let needReload = false;
    let lazyTime = 2000;

    if (
      eventTypes.includes('account.updateCurrent') ||
      eventTypes.includes('account.add') ||
      eventTypes.includes('account.remove') ||
      eventTypes.includes('chain.add') ||
      eventTypes.includes('asset.updateState')
    ) {
      needReload = true;
      lazyTime = 1000;
    }

    // if (eventTypes.includes('chain.updateState')) {
    //   needReload = true;
    //   lazyTime = 300;
    // }

    // TODO: Need recheck to improve
    // if (eventTypes.includes('transaction.transferNft')) {
    //   needReload = true;
    //   lazyTime = 300;
    // }

    if (needReload) {
      addLazy('nft.refresh', () => {
        if (!this.isReloading && this.isStarted) {
          this.refreshNftData().catch(console.error);
        }
      }, lazyTime, undefined, true);
    }
  }

  /** Public API – Manual refresh */
  public manualRefresh (): void {
    addLazy('nft.manualRefresh', () => {
      this.refreshNftData().catch(console.error);
    }, 300);
  }

  /** Public API – Load full metadata */
  public loadFullMetadata (): void {
    this.fetchMode = 'full';
    this.manualRefresh();
  }

  private startScanNft () {
    this.stopScanNft();

    const scanNft = () => {
      if (!this.isStarted || this.isReloading) {
        return;
      }

      console.log('[NftServiceV2] periodic nft refresh');
      this.refreshNftData().catch(console.error);
    };

    this._intervalFetchNft = setInterval(scanNft, this.NFT_INTERVAL_TIME);
  }

  private stopScanNft () {
    this._intervalFetchNft && clearInterval(this._intervalFetchNft);
    this._intervalFetchNft = undefined;
  }

  private async persistNftData (result: { items: NftItem[]; collections: NftCollection[] }) {
    const addresses = this.state.keyringService.context.getDecodedAddresses();
    const activeChainSlugs = Object.keys(this.state.getActiveChainInfoMap());

    try {
      // === 1. Persist NFT Items
      const currentItems = await this.state.dbService.getNft(addresses, activeChainSlugs);

      const currentItemIds = new Set(currentItems.map((i) => i.id));
      const newItems = result.items.filter((item) => !currentItemIds.has(item.id));

      console.log('newItems', newItems);
      console.log('currentItems', currentItems);

      for (const item of newItems) {
        this.state.updateNftData(item.chain, item, addresses[0]);
      }

      // === 2. Persist NFT Collections
      const currentCollections = await this.state.getNftCollection();

      const currentCollectionKeys = new Set(
        currentCollections.map((c) => `${c.chain}:${c.collectionId}`)
      );

      const newCollections = result.collections.filter((col) =>
        !currentCollectionKeys.has(`${col.chain}:${col.collectionId}`)
      );

      for (const col of newCollections) {
        this.state.setNftCollection(col.chain, col);
      }
    } catch (error) {
      console.error('[NftServiceV2] Persist failed:', error);
    }
  }

  /** Core refresh logic – chỉ gọi đúng 1 hàm fetch */
  private async refreshNftData (): Promise<void> {
    if (this.isReloading) {
      return;
    }

    this.isReloading = true;

    try {
      const addresses = this.state.keyringService.context.getDecodedAddresses();
      const activeChains = Object.keys(this.state.getActiveChainInfoMap());

      if (addresses.length === 0 || activeChains.length === 0) {
        this.nftStateSubject.next(INITIAL_NFT_STATE);

        return;
      }

      // Bắt đầu loading
      this.nftStateSubject.next({ ...this.nftStateSubject.getValue(), isLoading: true });

      const result = await this.multiChainFetcher.fetch(addresses, activeChains, {
        mode: this.fetchMode
      });

      console.log('result', result);
      console.log('this.fetchMode', this.fetchMode);

      // Persist vào DB – dùng đúng hàm hiện có
      await this.persistNftData(result);

      // Emit state mới – chỉ next 1 lần
      this.nftStateSubject.next({
        nftData: {
          total: result.items.length,
          nftList: result.items
        },
        nftCollections: result.collections,
        isLoading: false
      });
    } catch (error) {
      console.error('[NftService] Refresh failed:', error);
      this.nftStateSubject.next({ ...this.nftStateSubject.getValue(), isLoading: false });
    } finally {
      this.isReloading = false;
      this.fetchMode = 'preview'; // reset mode
    }
  }

  /** Subscribe NFT state */
  public subscribeNftItem () {
    return this.nftState$;
  }

  public subscribeNftCollection () {
    const getChains = () => this.state.activeChainSlugs;

    return this.state.dbService.stores.nftCollection.subscribeNftCollection(getChains);
  }

  /** Reload full (reset + fetch lại) */
  public async forceReload () {
    this.isReloading = true;
    const currentAddress = this.state.keyringService.context.currentAccount.proxyId;

    await this.state.dbService.removeNftsByAddress(currentAddress);

    // Todo: Review function resetNft
    this.state.resetNft(currentAddress);
    await waitTimeout(1800);
    this.isReloading = false;
  }
}
