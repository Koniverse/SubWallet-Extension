// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateAdapterSubscriptionArgs } from '@subwallet/extension-base/services/chain-service/types';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import { decodeCallData, DecodeCallDataResponse, DEFAULT_BLOCK_HASH, genMultisigKey, getCallData } from '@subwallet/extension-base/services/multisig-service/utils';
import { _reformatAddressWithChain, addLazy, createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils';
import { BehaviorSubject } from 'rxjs';

import { BlockHash, SignedBlock } from '@polkadot/types/interfaces';

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

export interface PendingMultisigTx extends ExtendedPendingMultisigTx {
  chain: string;
  multisigAddress: string;
  depositor: string,
  callHash: string,
  blockHeight: number,
  extrinsicIndex: number,
  depositAmount: number,
  approvals: string[]
}

interface ExtendedPendingMultisigTx {
  signers?: string[];
  extrinsicHash?: string;
  callData?: string; // todo: handle case callData and decodedCallData undefined
  decodedCallData?: DecodeCallDataResponse;
  timestamp?: number;
}

export type PendingMultisigTxMap = Record<string, PendingMultisigTx[]>;

export interface RequestGetPendingTxs {
  multisigAddress: string
}

export class MultisigService implements StoppableServiceInterface {
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;
  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();

  private pendingMultisigTxMap: Record<string, PendingMultisigTx[]> = {};
  private readonly pendingMultisigTxSubject: BehaviorSubject<PendingMultisigTxMap> = new BehaviorSubject<PendingMultisigTxMap>({});
  private unsubscriber: VoidFunction | undefined;
  private subscribePromise: Promise<void> | undefined; // to check if the subscription logic is running

  constructor (
    private readonly eventService: EventService,
    private readonly chainService: ChainService,
    private readonly keyringService: KeyringService
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

    await this.runSubscribePendingMultisigTxs();

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

    this.runUnsubscribePendingMultisigTxs();

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

        delete this.pendingMultisigTxMap[address]; // todo: recheck logic account.add and account.remove
        needReload = true;
      }
    });

    if (needReload) {
      addLazy(
        'reloadPendingMultisigTxsByEvents',
        () => {
          if (this.status === ServiceStatus.STARTED) {
            this.runSubscribePendingMultisigTxs().catch(console.error);
          }
        },
        lazyTime,
        undefined,
        true);
    }
  }

  /**
   * Subscribe to multisig changes for all multisig addresses
   */

  private async runSubscribePendingMultisigTxs (): Promise<void> {
    if (this.status === ServiceStatus.STOPPING || this.status === ServiceStatus.STOPPED) {
      return;
    }

    if (this.subscribePromise) {
      return this.subscribePromise;
    }

    this.subscribePromise = (async () => {
      await Promise.all([
        this.eventService.waitKeyringReady,
        this.eventService.waitChainReady
      ]);

      // Clear old subscribers before resubscribe
      this.runUnsubscribePendingMultisigTxs();

      const multisigAccounts = this.keyringService.context.getMultisigAccounts();

      if (!multisigAccounts.length) {
        return;
      }

      let cancel = false;
      const unsubList: Array<() => void> = [];
      const activeChains = this.chainService.getActiveChains();
      const supportedActiveChains = MULTISIG_SUPPORTED_CHAINS.filter((chain) => activeChains.includes(chain));

      for (const chain of supportedActiveChains) {
        const chainInfo = this.chainService.getChainInfoByKey(chain);

        for (const account of multisigAccounts) {
          const multisigAddress = account.id;
          const reformatAddress = _reformatAddressWithChain(multisigAddress, chainInfo);
          const key = genMultisigKey(chain, reformatAddress);
          const signers = account.accounts[0].signers as string[];

          const unsub = this.subscribePendingMultisigTxs(chain, reformatAddress, signers, (rs) => {
            !cancel && this.updatePendingMultisigTxSubject(key, rs);
          });

          unsubList.push(unsub);
        }
      }

      this.unsubscriber = () => {
        cancel = true;
        unsubList.forEach((unsub) => {
          unsub?.();
        });
      };
    })();

    try {
      await this.subscribePromise;
    } finally {
      this.subscribePromise = undefined;
    }
  }

  /**
   * Subscribe to a specific multisig address on a chain
   */

  private async subscribePendingMultisigTxsPromise (chain: string, multisigAddress: string, signers: string[], callback: (rs: PendingMultisigTx[]) => void) {
    const substrateApi = await this.chainService.getSubstrateApi(chain).isReady;

    const keyQuery = 'query_multisig_multisigs';
    const rawKeys = await substrateApi.api.query.multisig.multisigs.keys(multisigAddress);
    const rawKeysArgs = rawKeys.map((rawKey) => rawKey.args);

    const params: _SubstrateAdapterSubscriptionArgs[] = [{
      section: 'query',
      module: keyQuery.split('_')[1],
      method: keyQuery.split('_')[2],
      args: rawKeysArgs
    }];

    const subscription = substrateApi.subscribeDataWithMulti(params, async (rs) => {
      try {
        const items: PendingMultisigTx[] = [];
        const pendingMultisigEntries = rs[keyQuery];
        const blockCache: Record<number, {
          blockHash: BlockHash,
          signedBlock: SignedBlock,
          timestamp: number
        }> = {};

        await Promise.all(pendingMultisigEntries.map(async (_pendingMultisigInfo, index) => {
          const pendingMultisigInfo = _pendingMultisigInfo as unknown as PalletMultisigMultisig;

          if (!pendingMultisigInfo) {
            return;
          }

          const blockHeight = pendingMultisigInfo.when.height;
          const extrinsicIndex = pendingMultisigInfo.when.index;
          const callHash = rawKeysArgs[index][1].toHex();

          // Cache block-level data to avoid many RPC calls
          let blockInfo = blockCache[blockHeight];

          if (!blockInfo) {
            const blockHash = await substrateApi.api.rpc.chain.getBlockHash(blockHeight);
            const signedBlock = await substrateApi.api.rpc.chain.getBlock(blockHash);
            const apiAt = await substrateApi.api.at(blockHash);
            const timestamp = (await apiAt.query.timestamp.now()).toNumber();

            blockInfo = { blockHash, signedBlock, timestamp };
            blockCache[blockHeight] = blockInfo;
          }

          const extrinsicHash = blockInfo.signedBlock.block.extrinsics[extrinsicIndex].hash.toHex();

          const callData = blockInfo.blockHash.toHex() === DEFAULT_BLOCK_HASH
            ? undefined
            : getCallData({ callHash, extrinsicIndex, block: blockInfo.signedBlock.block });

          const decodedCallData = decodeCallData({
            api: substrateApi.api,
            callData
          });

          items.push({
            chain,
            multisigAddress,
            callHash,
            callData, // todo: recheck case undefined
            decodedCallData,
            blockHeight,
            extrinsicIndex,
            extrinsicHash,
            signers,
            depositAmount: pendingMultisigInfo.deposit,
            depositor: pendingMultisigInfo.depositor,
            approvals: pendingMultisigInfo.approvals,
            timestamp: blockInfo.timestamp
          });
        }));

        callback(items);
      } catch (error) {
        console.error(`Multisig Service subscription error ${chain}/${multisigAddress}`, error);

        addLazy(
          `resubscribeMultisig_${chain}_${multisigAddress}`,
          () => {
            if (this.status === ServiceStatus.STARTED) {
              this.runSubscribePendingMultisigTxs().catch(console.error);
            }
          },
          1000,
          4000,
          true
        );
      }
    });

    return () => subscription.unsubscribe();
  }

  private subscribePendingMultisigTxs (chain: string, multisigAddress: string, signers: string[], callback: (rs: PendingMultisigTx[]) => void) {
    const unsubPromise = this.subscribePendingMultisigTxsPromise(chain, multisigAddress, signers, callback);

    return () => {
      unsubPromise.then((unsub) => {
        unsub?.();
      }).catch(console.error);
    };
  }

  private runUnsubscribePendingMultisigTxs (): void {
    this.unsubscriber && this.unsubscriber();
    this.unsubscriber = undefined;
  }

  /**
   * Update multisig map and notify subscribers
   */
  private updatePendingMultisigTxSubject (key: string, pendingTxs: PendingMultisigTx[]): void {
    this.pendingMultisigTxMap[key] = pendingTxs;
    this.pendingMultisigTxSubject.next({ ...this.pendingMultisigTxMap });

    // Store to db
    addLazy(
      'updateMultisigStore',
      () => {
        if (this.status === ServiceStatus.STARTED) {
          this.updateMultisigStore().catch(console.error);
        }
      },
      300,
      1800
    );
  }

  private async updateMultisigStore (): Promise<void> {
    // TODO: implement db store logic
  }

  public subscribePendingMultisigTx (): BehaviorSubject<PendingMultisigTxMap> {
    return this.pendingMultisigTxSubject;
  }

  public getPendingMultisigTx (): PendingMultisigTxMap {
    // todo: wait multisig ready
    return { ...this.pendingMultisigTxMap };
  }

  /**
   * Get pending transactions for a specific multisig address
   */
  public getPendingTxsForMultisigAddress (request: RequestGetPendingTxs, chain?: string): PendingMultisigTx[] {
    // todo: wait multisig ready
    const multisigAddress = request.multisigAddress;
    const pendingMultisigTxs: PendingMultisigTx[] = [];

    if (chain) {
      const key = genMultisigKey(chain, multisigAddress);

      return this.pendingMultisigTxMap[key] || [];
    }

    for (const chain of MULTISIG_SUPPORTED_CHAINS) {
      const key = genMultisigKey(chain, multisigAddress);

      pendingMultisigTxs.push(...(this.pendingMultisigTxMap[key] || []));
    }

    return pendingMultisigTxs;
  }

  /**
   * Reload all multisig data
   */
  public async reloadMultisigs (): Promise<void> {
    this.pendingMultisigTxMap = {};
    this.pendingMultisigTxSubject.next({});
    await this.runSubscribePendingMultisigTxs();
  }
}
