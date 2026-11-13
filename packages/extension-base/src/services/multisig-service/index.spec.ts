// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainService } from '@subwallet/extension-base/services/chain-service';
import type { EventService } from '@subwallet/extension-base/services/event-service';
import type { InappNotificationService } from '@subwallet/extension-base/services/inapp-notification-service';
import type { _BaseNotificationInfo, _NotificationInfo } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import type { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import type { GetNotificationParams } from '@subwallet/extension-base/types/notification';

import { NotificationActionType, MultisigApprovalNotificationMetadata, MultisigApprovalNotificationStatus } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { genPendingMultisigTxKey } from '@subwallet/extension-base/services/multisig-service/utils';

import { MultisigService } from '.';

// The barrels below pull in most of extension-base, whose circular imports cannot be loaded by jest,
// so only the parts MultisigService uses are provided
jest.mock('@subwallet/extension-base/background/KoniTypes', () => ({
  ExtrinsicType: { MULTISIG_APPROVE_TX: 'multisig.approve' }
}));

jest.mock('@subwallet/extension-base/constants', () => ({
  ALL_ACCOUNT_KEY: 'ALL'
}));

jest.mock('@subwallet/extension-base/services/inapp-notification-service/consts', () => ({
  NotificationTitleMap: { MULTISIG_APPROVAL: '[{{accountName}}] APPROVAL REQUIRED' },
  NotificationDescriptionMap: { MULTISIG_APPROVAL: () => 'Multisig approval required' }
}));

jest.mock('@subwallet/extension-base/utils', () => {
  const { decodeAddress, encodeAddress } = jest.requireActual<{
    decodeAddress: (address: string) => Uint8Array,
    encodeAddress: (key: Uint8Array, prefix: number) => string
  }>('@polkadot/util-crypto');
  const reformatAddress = (address: string, prefix = 42) => encodeAddress(decodeAddress(address), prefix);

  return {
    ...jest.requireActual<Record<string, unknown>>('@subwallet/extension-base/utils/lazy'),
    ...jest.requireActual<Record<string, unknown>>('@subwallet/extension-base/utils/promise'),
    _reformatAddressWithChain: (address: string, chainInfo: { substrateInfo: { addressPrefix: number } }) => reformatAddress(address, chainInfo.substrateInfo.addressPrefix),
    isSameAddress: (address: string, comparedAddress: string) => reformatAddress(address) === reformatAddress(comparedAddress),
    reformatAddress
  };
});

// Fake extrinsics have no inner call to extract
jest.mock('@subwallet/extension-base/services/multisig-service/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('@subwallet/extension-base/services/multisig-service/utils'),
  getCallData: () => undefined
}));

const CHAIN = 'westend';
const MULTISIG = '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy';
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
const CALL_A = '0xaaaa';
const CALL_B = '0xbbbb';
const EXTRINSIC_INDEX = 1;

const chainInfo = { slug: CHAIN, substrateInfo: { supportMultisig: true, addressPrefix: 42 } };

const timestampOf = (height: number) => 1700000000000 + height * 6000;
const extrinsicHashOf = (height: number) => `0xextrinsic${height}`;

interface FakeMultisigEntry {
  when: { height: number, index: number };
  deposit: number;
  depositor: string;
  approvals: string[];
}

const entry = (height: number, approvals: string[]): FakeMultisigEntry => ({
  when: { height, index: EXTRINSIC_INDEX },
  deposit: 100,
  depositor: BOB,
  approvals
});

type StorageCallback = (rs: Record<string, Array<FakeMultisigEntry | null>>) => Promise<void> | void;

/**
 * Minimal substrate api of a chain with the multisig pallet; blocks can be pruned or delayed per height
 */
class FakeChain {
  callHashes: string[] = [];
  prunedHeights = new Set<number>();
  blockGates: Record<number, Promise<void>> = {};
  failKeys = 0;
  keysCalls = 0;
  subscribeCount = 0;
  private subscriber: StorageCallback | undefined;

  readonly substrateApi = {
    api: {
      query: {
        multisig: {
          multisigs: {
            keys: async () => {
              this.keysCalls++;

              if (this.failKeys > 0) {
                this.failKeys--;

                throw new Error('RPC unavailable');
              }

              return Promise.resolve(this.callHashes.map((callHash) => ({
                args: [{ toHex: () => MULTISIG }, { toHex: () => callHash }]
              })));
            }
          }
        }
      },
      rpc: {
        chain: {
          getBlockHash: (height: number) => Promise.resolve({ height, toHex: () => `0xblock${height}` }),
          getBlock: async ({ height }: { height: number }) => {
            await this.blockGates[height];

            if (this.prunedHeights.has(height)) {
              throw new Error(`Block ${height} is pruned`);
            }

            return {
              block: {
                extrinsics: [
                  { hash: { toHex: () => `0xtimestamp${height}` }, method: { section: 'timestamp', method: 'set', args: [{ toNumber: () => timestampOf(height) }] } },
                  { hash: { toHex: () => extrinsicHashOf(height) }, method: { section: 'multisig', method: 'asMulti', args: [] } }
                ]
              }
            };
          }
        }
      },
      // Pruned RPC nodes do not keep the state of old blocks
      at: () => Promise.reject(new Error('State already discarded'))
    },
    subscribeDataWithMulti: (_params: unknown, callback: StorageCallback) => {
      this.subscribeCount++;
      this.subscriber = callback;

      return {
        unsubscribe: () => {
          if (this.subscriber === callback) {
            this.subscriber = undefined;
          }
        }
      };
    }
  };

  emit (entries: Array<FakeMultisigEntry | null>) {
    if (!this.subscriber) {
      throw new Error('No active multisig subscription');
    }

    return this.subscriber({ query_multisig_multisigs: entries });
  }
}

/**
 * In-memory notification DB that dedupes multisig notifications like InappNotificationService
 */
class FakeNotificationStore {
  notifications: Record<string, _NotificationInfo> = {};
  fetchGate: Promise<void> | undefined;

  readonly service = {
    fetchNotificationsByParams: async ({ metadata }: GetNotificationParams) => {
      await this.fetchGate;

      return Object.values(this.notifications)
        .filter((notification) => {
          const { chain, multisigAddress } = notification.metadata as MultisigApprovalNotificationMetadata;

          return chain === metadata?.chain && multisigAddress === metadata?.multisigAddress;
        })
        .map((notification) => ({ ...notification }));
    },
    updateNotifications: (notifications: _NotificationInfo[]) => {
      notifications.forEach((notification) => {
        this.notifications[notification.id] = notification;
      });

      return Promise.resolve();
    },
    validateAndWriteNotificationsToDB: (notifications: _BaseNotificationInfo[], address: string) => {
      for (const notification of notifications) {
        const { multisigKey } = notification.metadata as MultisigApprovalNotificationMetadata;
        const existed = Object.values(this.notifications).some((item) => (item.metadata as MultisigApprovalNotificationMetadata).multisigKey === multisigKey);

        if (!existed) {
          this.notifications[notification.id] = { ...notification, proxyId: address };
        }
      }

      return Promise.resolve();
    }
  };

  find (callHash: string, blockHeight: number) {
    return Object.values(this.notifications).find((notification) => {
      const metadata = notification.metadata as MultisigApprovalNotificationMetadata;

      return metadata.callHash === callHash && metadata.blockHeight === blockHeight;
    });
  }

  statusOf (callHash: string, blockHeight: number) {
    const notification = this.find(callHash, blockHeight);

    if (!notification) {
      throw new Error(`Notification of ${callHash} at block ${blockHeight} not found`);
    }

    return (notification.metadata as MultisigApprovalNotificationMetadata).status;
  }
}

const flush = async () => {
  for (let i = 0; i < 100; i++) {
    await Promise.resolve();
  }
};

const deferred = () => {
  let resolve: VoidFunction = () => undefined;
  const promise = new Promise<void>((_resolve) => {
    resolve = _resolve;
  });

  return { promise, resolve };
};

describe('MultisigService pending multisig txs', () => {
  let chain: FakeChain;
  let store: FakeNotificationStore;
  let service: MultisigService;

  const startService = async () => {
    await service.start();
    await flush();
  };

  const pendingTxs = () => Object.values(service.getPendingMultisigTxMap());
  const pendingCallHashes = () => pendingTxs().map((tx) => tx.callHash).sort();

  beforeEach(() => {
    chain = new FakeChain();
    store = new FakeNotificationStore();

    const eventService = {
      waitKeyringReady: Promise.resolve(),
      waitChainReady: Promise.resolve(),
      emit: () => undefined
    } as unknown as EventService;

    const chainService = {
      getActiveChainInfoMap: () => ({ [CHAIN]: chainInfo }),
      getChainInfoByKey: () => chainInfo,
      getSubstrateApi: () => ({ isReady: Promise.resolve(chain.substrateApi) })
    } as unknown as ChainService;

    const keyringService = {
      context: {
        getMultisigAccounts: () => [{ id: MULTISIG, accounts: [{ signers: [ALICE, BOB], threshold: 2 }] }],
        getAllAddresses: () => [ALICE]
      }
    } as unknown as KeyringService;

    service = new MultisigService(eventService, chainService, keyringService, store.service as unknown as InappNotificationService);
  });

  afterEach(async () => {
    await service.stop();
    jest.useRealTimers();
  });

  it('keeps a tx whose block cannot be read while still resolving the others', async () => {
    chain.callHashes = [CALL_A, CALL_B];
    await startService();

    await chain.emit([entry(10, [BOB]), entry(20, [BOB])]);
    await flush();

    expect(pendingCallHashes()).toEqual([CALL_A, CALL_B]);
    // Read from the timestamp inherent, the state of the block is pruned
    expect(pendingTxs().find((tx) => tx.callHash === CALL_A)?.timestamp).toBe(timestampOf(10));
    expect(store.statusOf(CALL_A, 10)).toBeUndefined();
    expect(store.statusOf(CALL_B, 20)).toBeUndefined();

    // A is executed, then the block of B can no longer be read while B gets approved
    chain.prunedHeights.add(20);
    await chain.emit([null, entry(20, [BOB, ALICE])]);
    await flush();

    expect(pendingCallHashes()).toEqual([CALL_B]);
    expect(pendingTxs()[0].approvals).toEqual([BOB, ALICE]);
    expect(store.statusOf(CALL_A, 10)).toBe(MultisigApprovalNotificationStatus.RESOLVED);
    expect(store.statusOf(CALL_B, 20)).toBe(MultisigApprovalNotificationStatus.APPROVED);
  });

  it('does not resolve the notification of a tx whose block cannot be read on first load', async () => {
    const multisigKey = genPendingMultisigTxKey(CHAIN, MULTISIG, ALICE, extrinsicHashOf(20));

    // Notification created in a previous session
    store.notifications.previous = {
      id: 'previous',
      address: ALICE,
      proxyId: ALICE,
      title: '[Alice] APPROVAL REQUIRED',
      description: '',
      time: 0,
      extrinsicType: undefined,
      isRead: false,
      actionType: NotificationActionType.MULTISIG_APPROVAL,
      metadata: {
        multisigKey,
        chain: CHAIN,
        multisigAddress: MULTISIG,
        extrinsicHash: extrinsicHashOf(20),
        callHash: CALL_B,
        blockHeight: 20,
        extrinsicIndex: EXTRINSIC_INDEX,
        currentSigner: ALICE,
        approvals: [BOB]
      }
    } as unknown as _NotificationInfo;

    chain.callHashes = [CALL_B];
    chain.prunedHeights.add(20);
    await startService();

    await chain.emit([entry(20, [BOB])]);
    await flush();

    expect(pendingCallHashes()).toEqual([]);
    expect(store.statusOf(CALL_B, 20)).toBeUndefined();
    expect(store.notifications.previous.isRead).toBe(false);
  });

  it('resolves a tx when the same call is proposed again in a block that cannot be read', async () => {
    chain.callHashes = [CALL_A];
    await startService();

    await chain.emit([entry(10, [BOB])]);
    await flush();

    chain.prunedHeights.add(30);
    await chain.emit([entry(30, [BOB])]);
    await flush();

    expect(pendingCallHashes()).toEqual([]);
    expect(store.statusOf(CALL_A, 10)).toBe(MultisigApprovalNotificationStatus.RESOLVED);
  });

  it('ignores an older update that finishes after a newer one', async () => {
    chain.callHashes = [CALL_A];
    await startService();

    await chain.emit([entry(10, [BOB])]);
    await flush();

    const blockGate = deferred();

    chain.blockGates[10] = blockGate.promise;
    const olderUpdate = chain.emit([entry(10, [BOB])]);

    await chain.emit([null]);
    await flush();

    expect(pendingCallHashes()).toEqual([]);
    expect(store.statusOf(CALL_A, 10)).toBe(MultisigApprovalNotificationStatus.RESOLVED);

    blockGate.resolve();
    await olderUpdate;
    await flush();

    expect(pendingCallHashes()).toEqual([]);
    expect(store.statusOf(CALL_A, 10)).toBe(MultisigApprovalNotificationStatus.RESOLVED);
  });

  it('writes notification updates in the order of the storage updates', async () => {
    chain.callHashes = [CALL_A];
    await startService();

    await chain.emit([entry(10, [BOB])]);
    await flush();

    // The write of the older update is slow, the newer one must wait for it
    const fetchGate = deferred();

    store.fetchGate = fetchGate.promise;
    await chain.emit([entry(10, [BOB])]);
    store.fetchGate = undefined;
    await chain.emit([null]);
    await flush();

    fetchGate.resolve();
    await flush();

    expect(store.statusOf(CALL_A, 10)).toBe(MultisigApprovalNotificationStatus.RESOLVED);
  });

  it('resubscribes instead of resolving notifications when the storage query fails', async () => {
    jest.useFakeTimers();
    chain.callHashes = [CALL_A];
    await startService();

    await chain.emit([entry(10, [BOB])]);
    await flush();

    // subscribeDataWithMulti returns an empty result on RPC error
    await chain.emit([]);
    await flush();

    expect(pendingCallHashes()).toEqual([CALL_A]);
    expect(store.statusOf(CALL_A, 10)).toBeUndefined();
    expect(chain.subscribeCount).toBe(1);

    jest.advanceTimersByTime(2000);
    await flush();

    expect(chain.subscribeCount).toBe(2);
    expect(chain.keysCalls).toBe(2);
  });

  it('retries with an increasing delay when the multisig keys cannot be loaded', async () => {
    jest.useFakeTimers();
    chain.callHashes = [CALL_A];
    chain.failKeys = 2;
    await startService();

    expect(chain.keysCalls).toBe(1);
    expect(chain.subscribeCount).toBe(0);

    jest.advanceTimersByTime(2000);
    await flush();
    expect(chain.keysCalls).toBe(2);

    jest.advanceTimersByTime(3999);
    await flush();
    expect(chain.keysCalls).toBe(2);

    jest.advanceTimersByTime(1);
    await flush();
    expect(chain.keysCalls).toBe(3);
    expect(chain.subscribeCount).toBe(1);

    await chain.emit([entry(10, [BOB])]);
    await flush();

    expect(pendingCallHashes()).toEqual([CALL_A]);
  });

  it('stops retrying once the service is stopped', async () => {
    jest.useFakeTimers();
    chain.callHashes = [CALL_A];
    chain.failKeys = 1;
    await startService();

    await service.stop();
    jest.advanceTimersByTime(60000);
    await flush();

    expect(chain.keysCalls).toBe(1);
    expect(chain.subscribeCount).toBe(0);
  });
});
