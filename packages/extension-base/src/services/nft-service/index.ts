// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {_ChainInfo} from '@subwallet/chain-list/types';
import {
  NftCollection,
  NftDetailRequest,
  NftFullListRequest,
  NftItem,
  NftJson
} from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import {ServiceStatus, StoppableServiceInterface} from '@subwallet/extension-base/services/base/types';
import {
  _isChainSupportEvmNft,
  _isChainSupportNativeNft,
  _isChainSupportWasmNft
} from '@subwallet/extension-base/services/chain-service/utils';
import {EventItem, EventType} from '@subwallet/extension-base/services/event-service/types';
import {addLazy, createPromiseHandler, PromiseHandler, waitTimeout} from '@subwallet/extension-base/utils';
import keyring from '@subwallet/ui-keyring';
import {BehaviorSubject} from 'rxjs';

import {MultiChainNftFetcher} from './multi-chain-nft-fetcher';

export interface NftState {
  nftData: NftJson;
  nftCollections: NftCollection[];
}

const INITIAL_NFT_STATE: NftState = {
  nftData: { total: 0, nftList: [] },
  nftCollections: []
};

// HIGH PRIORITY – no lazy
const IMMEDIATE_EVENTS: EventType[] = [
  'account.updateCurrent',
  'account.add',
  'account.remove'
];

// LOW PRIORITY – lazy
const LAZY_EVENTS: EventType[] = [
  'asset.updateState',
  'chain.add'
];

export class NftService implements StoppableServiceInterface {
  private readonly state: KoniState;
  private readonly multiChainFetcher: MultiChainNftFetcher;
  private _intervalFetchNft: NodeJS.Timer | undefined;
  private readonly NFT_INTERVAL_TIME = 2 * 60 * 60 * 1000; // 2 hours

  private readonly nftStateSubject = new BehaviorSubject<NftState>(INITIAL_NFT_STATE);
  public readonly nftState$ = this.nftStateSubject.asObservable();
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
      nftCollections: collections || []
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

  private checkIfNftUpdateNeeded (events: EventItem<EventType>[], eventTypes: EventType[]): boolean {
    if (!eventTypes.includes('chain.updateState')) {
      return false;
    }

    const updatedChains = this.extractUpdatedChains(events);

    return this.hasNftSupportedChainUpdate(updatedChains);
  }

  private extractUpdatedChains (events: EventItem<EventType>[]): string[] {
    return events
      .filter((event) => event.type === 'chain.updateState')
      .map((event) => (event.data as [string])[0]);
  }

  private hasNftSupportedChainUpdate (updatedChains: string[]): boolean {
    if (updatedChains.length === 0) {
      return false;
    }

    const chainInfoMap = this.state.getServiceInfo().chainInfoMap;

    return updatedChains.some((chainSlug) => {
      const chainInfo = chainInfoMap[chainSlug];

      return this.isChainNftSupported(chainInfo);
    });
  }

  private isChainNftSupported (chainInfo: _ChainInfo): boolean {
    return _isChainSupportNativeNft(chainInfo) ||
      _isChainSupportEvmNft(chainInfo) ||
      _isChainSupportWasmNft(chainInfo);
  }

  private handleImmediateRefresh (address: string): void {
    this.state.resetNft(address);
    this.refreshNftData().catch(console.error);
  }

  private scheduleLazyRefresh (delay: number): void {
    addLazy('nft.refresh', () => {
      if (!this.isReloading && this.isStarted) {
        this.refreshNftData().catch(console.error);
      }
    }, delay, undefined, true);
  }

  private handleEvents (events: EventItem<EventType>[], eventTypes: EventType[]) {
    const LAZY_REFRESH_DELAY = 1800;
    const address = this.state.keyringService.context.currentAccount.proxyId;

    const hasImmediateEvent = IMMEDIATE_EVENTS.some((event) => eventTypes.includes(event));

    const hasLazyEvent = LAZY_EVENTS.some((event) => eventTypes.includes(event));
    const needsNftUpdate = this.checkIfNftUpdateNeeded(events, eventTypes);

    if (hasImmediateEvent || needsNftUpdate) {
      this.handleImmediateRefresh(address);

      return;
    }

    if (hasLazyEvent) {
      this.scheduleLazyRefresh(LAZY_REFRESH_DELAY);
    }
  }

  public async fetchFullListNftOfACollection (request: NftFullListRequest): Promise<boolean> {
    if (this.isReloading) {
      return false;
    }

    try {
      const result = await this.multiChainFetcher.fetchFullListNftOfACollection(request);

      // Persist DB
      this.persistNftData({
        items: result.items,
        collections: result.collections
      });

      return true;
    } catch (e) {
      console.error('[NftServiceV2] fetchFullListNftOfaCollection failed', e);

      return false;
    }
  }

  public async fetchNftDetail (request: NftDetailRequest): Promise<NftItem | null> {
    if (this.isReloading) {
      return null;
    }

    try {
      const result = await this.multiChainFetcher.fetchNftDetail(request);
      return result.items[0]
    } catch (e) {
      console.error('[NftServiceV2] fetchNftDetail failed', e);

      return null;
    }
  }

  private startScanNft () {
    this.stopScanNft();

    const scanNft = () => {
      if (!this.isStarted || this.isReloading) {
        return;
      }

      this.refreshNftData().catch(console.error);
    };

    this._intervalFetchNft = setInterval(scanNft, this.NFT_INTERVAL_TIME);
  }

  private stopScanNft () {
    this._intervalFetchNft && clearInterval(this._intervalFetchNft);
    this._intervalFetchNft = undefined;
  }

  private persistNftData (result: { items: NftItem[]; collections: NftCollection[] }) {
    try {
      for (const item of result.items) {
        const sender = keyring.getPair(item.owner);

        this.state.updateNftData(item.chain, item, sender.address || item.owner);
      }

      for (const col of result.collections) {
        this.state.setNftCollection(col.chain, col);
      }
    } catch (error) {
      console.error('[NftServiceV2] Persist failed:', error);
    }
  }

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

      const result = await this.multiChainFetcher.fetch(addresses, activeChains);

      this.persistNftData(result);

      this.nftStateSubject.next({
        nftData: {
          total: result.items.length,
          nftList: result.items
        },
        nftCollections: result.collections
      });
    } catch (error) {
      console.error('[NftService] Refresh failed:', error);
      this.nftStateSubject.next({ ...this.nftStateSubject.getValue() });
    } finally {
      this.isReloading = false;
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

  // TODO: Move NFT reset logic to this function after migration is complete
  public async forceReload () {
    this.isReloading = true;
    await waitTimeout(1800);
    this.isReloading = false;
    await this.refreshNftData().catch(console.error);
  }
}
