// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateAdapterSubscriptionArgs } from '@subwallet/extension-base/services/chain-service/types';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { InappNotificationService } from '@subwallet/extension-base/services/inapp-notification-service';
import { NotificationDescriptionMap, NotificationTitleMap } from '@subwallet/extension-base/services/inapp-notification-service/consts';
import { _BaseNotificationInfo, NotificationActionType } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import { decodeCallData, DecodeCallDataResponse, DEFAULT_BLOCK_HASH, genPendingMultisigTxKey, getCallData, getMultisigTxType } from '@subwallet/extension-base/services/multisig-service/utils';
import { _reformatAddressWithChain, addLazy, createPromiseHandler, PromiseHandler, reformatAddress } from '@subwallet/extension-base/utils';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { BehaviorSubject } from 'rxjs';

import { BlockHash, SignedBlock } from '@polkadot/types/interfaces';

import { EventItem, EventType } from '../event-service/types';

/**
 * List of chains that support multisig functionality
 * @todo deploy online
 */
const MULTISIG_SUPPORTED_CHAINS: readonly string[] = ['statemint', 'statemine', 'paseo_assethub', 'paseoTest', 'westend_assethub'];

/**
 * Query key for multisig multisigs subscription
 */
const MULTISIG_QUERY_KEY = 'query_multisig_multisigs';

/**
 * Interface representing multisig extrinsic data from the Substrate pallet
 */
interface PalletMultisigMultisig {
  /** Block height and extrinsic index when the multisig extrinsic was created */
  when: {
    height: number,
    index: number
  },
  /** Deposit amount required for the multisig extrinsic */
  deposit: number,
  /** Address of initiator account */
  depositor: string,
  /** List of addresses that have approved the extrinsic */
  approvals: string[]
}

const multisigServiceLogger = createLogger('MultisigService');

/**
 * Interface representing a pending multisig extrinsic with the current signer context
 */
export interface PendingMultisigTx extends RawPendingMultisigTx {
  /** ID of the pending multisig extrinsic */
  id: string;
  /** Address of the current signer viewing this extrinsic */
  currentSigner: string;
}

/**
 * Interface representing raw pending multisig extrinsic data from the chain
 */
export interface RawPendingMultisigTx {
  /** Chain identifier where the extrinsic exists */
  chain: string;
  /** Multisig address */
  multisigAddress: string;
  /** Address of the account that deposited funds */
  depositor: string,
  /** Hash of the call data */
  callHash: string,
  /** Block height where the extrinsic was created */
  blockHeight: number,
  /** Extrinsic index in the block */
  extrinsicIndex: number,
  /** Amount deposited for the multisig */
  depositAmount: number,
  /** List of addresses that have approved the extrinsic */
  approvals: string[],
  /** Number of approval required */
  threshold: number;
  /** List of signer addresses for the multisig */
  signerAddresses: string[];
  /** Hash of the extrinsic */
  extrinsicHash: string;
  /** Timestamp when the extrinsic was created */
  timestamp: number;
  /** Type of multisig extrinsic */
  multisigTxType: MultisigTxType
  /** Encoded call data */
  callData?: string;
  /** Decoded call data with method and arguments */
  decodedCallData?: DecodeCallDataResponse;
}

/**
 * Map of pending multisig extrinsics
 * Key is created using genPendingMultisigTxKey function
 */
export type PendingMultisigTxMap = Record<string, PendingMultisigTx>;

/**
 * Request interface for getting pending extrinsics
 */
export interface RequestGetPendingTxs {
  /** Multisig address to query */
  multisigAddress: string
}

/**
 * Enum representing different types of multisig extrinsics
 */
export enum MultisigTxType {
  /** Transfer extrinsic */
  TRANSFER = 'Transfer',
  /** Staking-related extrinsic */
  STAKING = 'Staking',
  /** Lending extrinsic */
  LENDING = 'Lending',
  /** Set token pay fee extrinsic */
  SET_TOKEM_PAY_FEE = 'SetTokenPayFee',
  /** Governance extrinsic */
  GOV = 'Governance',
  /** Swap extrinsic */
  SWAP = 'Swap',
  /** Unknown extrinsic type */
  UNKNOWN = 'Unknown'
}

/**
 * Mapping of extrinsic categories to their corresponding pallet methods
 * Used to categorize multisig extrinsics by their call method
 */
export const MULTISIG_TX_TYPE_MAP: Record<string, string[]> = {
  transfer: ['balances.transferAll', 'balances.transferKeepAlive', 'balances.transfer', 'foreignAssets.transfer', 'foreignAssets.transferKeepAlive', 'currencies.transfer', 'tokens.transferAll', 'tokens.transfer', 'assets.transfer', 'assetManager.transfer', 'subtensorModule.transferStake'],
  transfer_nft: ['nft.transfer', 'nfts.transfer', 'unique.transfer', 'uniques.transfer'],
  staking: ['homa.mint', 'vtokenMinting.mint', 'liquidStaking.stake', 'parachainStaking.joinDelegators', 'parachainStaking.delegatorStakeMore', 'dappsStaking.bondAndStake', 'parachainStaking.nominate', 'parachainStaking.bondExtra', 'collatorStaking.lock', 'collatorStaking.stake', 'parachainStaking.delegate', 'parachainStaking.delegateWithAutoCompound', 'parachainStaking.delegatorBondMore', 'staking.bond', 'pooledStaking.requestDelegate', 'subtensorModule.addStakeLimit', 'nominationPools.bondExtra', 'nominationPools.join'],
  redeem: ['aggregatedDex.swapWithExactSupply', 'stablePool.swap', 'ammRoute.swapExactTokensForTokens'],
  unstake: ['homa.requestRedeem', 'vtokenMinting.redeem', 'liquidStaking.unstake', 'parachainStaking.delegatorStakeLess', 'parachainStaking.leaveDelegators', 'dappsStaking.unbondAndUnstake', 'parachainStaking.scheduleNominatorUnbond', 'parachainStaking.scheduleRevokeNomination', 'collatorStaking.unstakeFrom && collatorStaking.unlock', 'parachainStaking.scheduleDelegatorBondLess', 'parachainStaking.scheduleRevokeDelegation', 'staking.unbond', 'pooledStaking.requestUndelegate', 'subtensorModule.removeStakeLimit', 'nominationPools.unbond'],
  withdraw: ['homa.claimRedemption', 'parachainStaking.unlockUnstaked', 'dappsStaking.withdrawUnbonded', 'parachainStaking.executeNominationRequest', 'collatorStaking.release', 'parachainStaking.executeDelegationRequest', 'staking.withdrawUnbonded', 'nominationPools.withdrawUnbonded'],
  cancelUnstake: ['parachainStaking.cancelLeaveCandidates', 'parachainStaking.cancelNominationRequest', 'parachainStaking.cancelDelegationRequest', 'staking.rebond'],
  claim: ['parachainStaking.incrementDelegatorRewards', 'parachainStaking.claimRewards', 'dappsStaking.claimStaker', 'collatorStaking.claimRewards', 'pooledStaking.claimManualRewards', 'nominationPools.claimPayout'],
  nominate: ['staking.nominate', 'subtensorModule.moveStake'],
  lending: ['loans.mint', 'loans.redeem', 'loans.redeemAll'], // consider remove
  swap: ['assetConversion.swapExactTokensForTokens'],
  setTokenPayFee: ['multiTransactionPayment.setCurrency'],
  gov: ['convictionVoting.vote', 'convictionVoting.removeVote', 'convictionVoting.unlock']
};

/**
 * Service for managing multisig extrinsics
 * Handles subscription to pending multisig extrinsics across supported chains
 * and provides methods to query and monitor multisig extrinsic status
 */
export class MultisigService implements StoppableServiceInterface {
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;
  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();

  /** BehaviorSubject that holds the current map of pending multisig extrinsics */
  private readonly pendingMultisigTxSubject: BehaviorSubject<PendingMultisigTxMap> = new BehaviorSubject<PendingMultisigTxMap>({});
  /** Function to unsubscribe from all active subscriptions */
  private unsubscribes: VoidFunction | undefined;
  /** Promise to check if the subscription logic is currently running */
  private subscribePromise: Promise<void> | undefined;
  /** Set to track notified transaction keys to avoid duplicate notifications */
  private readonly notifiedTxKeys: Set<string> = new Set();

  /**
   * Creates an instance of MultisigService
   * @param eventService - Service for handling application events
   * @param chainService - Service for managing chain connections
   * @param keyringService - Service for managing accounts and keyring
   * @param inappNotificationService - Service for creating in-app notifications (optional)
   */
  constructor (
    private readonly eventService: EventService,
    private readonly chainService: ChainService,
    private readonly keyringService: KeyringService,
    private readonly inappNotificationService: InappNotificationService
  ) {
    this.status = ServiceStatus.NOT_INITIALIZED;
  }

  /**
   * Starts the multisig service
   * Subscribes to pending multisig extrinsics for all multisig accounts
   * @returns Promise that resolves when the service has started, or rejects on error
   */
  async start (): Promise<void> {
    try {
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
    } catch (error) {
      this.status = ServiceStatus.NOT_INITIALIZED;
      this.startPromiseHandler.reject(error);
      throw error;
    }
  }

  /**
   * Stops the multisig service
   * Unsubscribes from all active subscriptions
   * @returns Promise that resolves when the service has stopped, or rejects on error
   */
  async stop (): Promise<void> {
    try {
      if (this.status === ServiceStatus.STARTING) {
        await this.waitForStarted();
      }

      if (this.status === ServiceStatus.STOPPED || this.status === ServiceStatus.STOPPING) {
        return await this.waitForStopped();
      }

      this.status = ServiceStatus.STOPPING;

      this.runUnsubscribePendingMultisigTxs();

      this.startPromiseHandler = createPromiseHandler();
      this.status = ServiceStatus.STOPPED;
      this.stopPromiseHandler.resolve();
    } catch (error) {
      this.stopPromiseHandler.reject(error);
      throw error;
    }
  }

  /**
   * Initializes the multisig service
   * Waits for chain and account services to be ready, then sets up event listeners
   * @returns Promise that resolves when initialization is complete
   */
  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;

    await this.eventService.waitChainReady;
    await this.eventService.waitAccountReady;

    this.status = ServiceStatus.INITIALIZED;
    this.eventService.onLazy(this.handleEvents.bind(this));
  }

  /**
   * Waits for the service to start
   * @returns Promise that resolves when the service has started
   */
  waitForStarted (): Promise<void> {
    return this.startPromiseHandler.promise;
  }

  /**
   * Waits for the service to stop
   * @returns Promise that resolves when the service has stopped
   */
  waitForStopped (): Promise<void> {
    return this.stopPromiseHandler.promise;
  }

  /**
   * Handles application events and reloads multisig extrinsics when needed
   * Reloads when accounts are added/removed or when supported chain state is updated
   * @param events - Array of event items
   * @param eventTypes - Array of event types that occurred
   */
  handleEvents (events: EventItem<EventType>[], eventTypes: EventType[]): void {
    let needReload = false;

    if (eventTypes.includes('account.add') || eventTypes.includes('account.remove')) {
      needReload = true;
    }

    if (eventTypes.includes('chain.updateState')) {
      for (const event of events) {
        if (event.type === 'chain.updateState') {
          const chainSlug = event.data[0] as string;

          // Only reload if the updated chain is in the supported chains list
          if (MULTISIG_SUPPORTED_CHAINS.includes(chainSlug)) {
            needReload = true;
            break;
          }
        }
      }
    }

    if (needReload) {
      addLazy(
        'reloadPendingMultisigTxsByEvents',
        () => {
          if (this.status === ServiceStatus.STARTED) {
            this.runSubscribePendingMultisigTxs().catch((e) => multisigServiceLogger.error('Error in handleEvents reload', e));
          }
        },
        2000,
        undefined,
        true);
    }
  }

  /**
   * Subscribes to multisig changes for all multisig addresses across supported chains
   * Clears old subscriptions before creating new ones to avoid duplicates
   * @returns Promise that resolves when subscription setup is complete
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
          const signers = account.accounts[0].signers as string[];
          const reformatMultisigAddress = _reformatAddressWithChain(multisigAddress, chainInfo);
          const reformatSigners = signers.map((s) => _reformatAddressWithChain(s, chainInfo));
          const threshold = account.accounts[0].threshold as number;

          const unsub = this.subscribePendingMultisigTxs(chain, reformatMultisigAddress, reformatSigners, threshold, (rs) => {
            !cancel && this.updatePendingMultisigTxSubjectByChain(reformatMultisigAddress, chain, rs);
          });

          unsubList.push(unsub);
        }
      }

      this.unsubscribes = () => {
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
   * Subscribes to pending multisig extrinsics for a specific multisig address on a chain
   * Fetches initial data and sets up a subscription for updates
   * @param chain - Chain identifier
   * @param multisigAddress - Multisig address to monitor
   * @param signers - List of signer addresses for the multisig
   * @param threshold - Number of approval required
   * @param callback - Callback function called with updated pending extrinsics
   * @returns Function to unsubscribe from the subscription
   */
  private async subscribePendingMultisigTxsPromise (chain: string, multisigAddress: string, signers: string[], threshold: number, callback: (rs: RawPendingMultisigTx[]) => void) {
    const substrateApi = await this.chainService.getSubstrateApi(chain).isReady;

    // todo: validate substrateApi has multisig.multisigs

    const keyQuery = MULTISIG_QUERY_KEY;
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
        const items: RawPendingMultisigTx[] = [];
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
            callData,
            decodedCallData,
            blockHeight,
            extrinsicIndex,
            extrinsicHash,
            threshold,
            signerAddresses: signers,
            depositAmount: pendingMultisigInfo.deposit,
            depositor: pendingMultisigInfo.depositor,
            approvals: pendingMultisigInfo.approvals,
            timestamp: blockInfo.timestamp,
            multisigTxType: getMultisigTxType(decodedCallData)
          });
        }));

        callback(items);
      } catch (error) {
        multisigServiceLogger.error(`Multisig Service subscription error ${chain}/${multisigAddress}`, error);

        addLazy(
          `resubscribeMultisig_${chain}_${multisigAddress}`,
          () => {
            if (this.status === ServiceStatus.STARTED) {
              this.runSubscribePendingMultisigTxs().catch((e) => multisigServiceLogger.error('Error during resubscribeMultisig', e));
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

  /**
   * Wrapper function to subscribe to pending multisig extrinsics
   * Returns an unsubscribe function that handles promise resolution
   * @param chain - Chain identifier
   * @param multisigAddress - Multisig address to monitor
   * @param signers - List of signer addresses for the multisig
   * @param threshold - Number of approval required
   * @param callback - Callback function called with updated pending extrinsics
   * @returns Function to unsubscribe from the subscription
   */
  private subscribePendingMultisigTxs (chain: string, multisigAddress: string, signers: string[], threshold: number, callback: (rs: RawPendingMultisigTx[]) => void) {
    const unsubPromise = this.subscribePendingMultisigTxsPromise(chain, multisigAddress, signers, threshold, callback);

    return () => {
      unsubPromise.then((unsub) => {
        unsub?.();
      }).catch((e) => multisigServiceLogger.error('Error during unsubscribe in subscribePendingMultisigTxs', e));
    };
  }

  /**
   * Unsubscribes from all active multisig extrinsic subscriptions
   */
  private runUnsubscribePendingMultisigTxs (): void {
    this.unsubscribes && this.unsubscribes();
    this.unsubscribes = undefined;
  }

  /**
   * Updates the multisig extrinsic map for a specific chain and multisig address
   * Removes old extrinsics and adds new ones, then notifies all subscribers
   * Creates notifications for new pending transactions that require approval
   * @param multisigAddress - Multisig address
   * @param chain - Chain identifier
   * @param rawPendingTxs - Array of raw pending multisig extrinsics to update
   */
  private updatePendingMultisigTxSubjectByChain (multisigAddress: string, chain: string, rawPendingTxs: RawPendingMultisigTx[]): void {
    const allAddresses = this.keyringService.context.getAllAddresses();
    const currentMap = this.getPendingMultisigTxMap();
    const excludedPrefix = `${chain}___${multisigAddress}___`;
    const filteredMap: PendingMultisigTxMap = {};

    // 1. Clean old extrinsics of multisigAddress and chain
    for (const [key, value] of Object.entries(currentMap)) {
      if (key.startsWith(excludedPrefix)) {
        this.notifiedTxKeys.delete(key);
      } else {
        filteredMap[key] = value;
      }
    }

    const newTxMap: PendingMultisigTxMap = {};
    const newNotifiedTxs: PendingMultisigTx[] = [];

    // 2. Create new extrinsics of multisigAddress and chain
    for (const rawTx of rawPendingTxs) {
      const extrinsicHash = rawTx.extrinsicHash;
      const signerAddresses = rawTx.signerAddresses;

      if (!extrinsicHash || !signerAddresses || signerAddresses.length === 0) {
        multisigServiceLogger.warn('Skipping multisig extrinsic due to missing required fields: extrinsicHash or signerAddresses');
        continue;
      }

      for (const signerAddress of signerAddresses) {
        if (!allAddresses.includes(reformatAddress(signerAddress))) {
          // Skip if signerAddress is not an account in keyring
          continue;
        }

        const key = genPendingMultisigTxKey(chain, multisigAddress, signerAddress, extrinsicHash);
        const pendingTx: PendingMultisigTx = { ...rawTx, currentSigner: signerAddress, id: key };

        newTxMap[key] = pendingTx;

        // Track new transactions that need notification
        // Only notify if this is a new transaction (not already notified)
        if (!this.notifiedTxKeys.has(key) && !currentMap[key]) {
          newNotifiedTxs.push(pendingTx);
          this.notifiedTxKeys.add(key);
        }
      }
    }

    // 3. Replace the extrinsics of multisigAddress and chain
    this.pendingMultisigTxSubject.next({
      ...filteredMap,
      ...newTxMap
    });

    // 4. Create notifications for new pending transactions
    if (newNotifiedTxs.length > 0) {
      this.createMultisigApprovalNotifications(newNotifiedTxs).catch((error) => {
        multisigServiceLogger.error('Failed to create multisig approval notifications:', error);
      });
    }
  }

  /**
   * Creates notifications for pending multisig transactions that require approval
   * @param pendingTxs - Array of pending multisig transactions that need approval
   */
  private async createMultisigApprovalNotifications (pendingTxs: PendingMultisigTx[]): Promise<void> {
    const notifications: _BaseNotificationInfo[] = pendingTxs.map((tx) => {
      const actionType = NotificationActionType.MULTISIG_APPROVAL;
      const timestamp = Date.now();
      const multisigKey = genPendingMultisigTxKey(tx.chain, tx.multisigAddress, tx.currentSigner, tx.extrinsicHash);
      const notificationId = `${actionType}___${multisigKey}___${timestamp}`;

      return {
        id: notificationId,
        address: tx.currentSigner, // todo: reformat?
        title: NotificationTitleMap[actionType],
        description: NotificationDescriptionMap[actionType](),
        time: timestamp,
        extrinsicType: ExtrinsicType.MULTISIG_APPROVE_TX,
        isRead: false,
        actionType,
        metadata: {
          chain: tx.chain,
          multisigAddress: tx.multisigAddress,
          extrinsicHash: tx.extrinsicHash,
          callHash: tx.callHash,
          blockHeight: tx.blockHeight,
          extrinsicIndex: tx.extrinsicIndex,
          currentSigner: tx.currentSigner,
          approvals: tx.approvals,
          multisigTxType: tx.multisigTxType
        }
      };
    });

    multisigServiceLogger.debug('pendingTxs', pendingTxs);
    multisigServiceLogger.debug('notifications', notifications);

    // Group notifications by address to batch write
    const notificationsByAddress: Record<string, _BaseNotificationInfo[]> = {};

    for (const notification of notifications) {
      const address = notification.address;

      if (!notificationsByAddress[address]) {
        notificationsByAddress[address] = [];
      }

      notificationsByAddress[address] = [...notificationsByAddress[address], notification];
    }

    // Write notifications for each address
    for (const [address, addressNotifications] of Object.entries(notificationsByAddress)) {
      if (!address || !addressNotifications || !addressNotifications.length) {
        continue;
      }

      await this.inappNotificationService.validateAndWriteNotificationsToDB(addressNotifications, address);
    }
  }

  /**
   * Subscribes to changes in the pending multisig extrinsic map
   * @returns BehaviorSubject that emits updates when the extrinsic map changes
   */
  public subscribePendingMultisigTxMap (): BehaviorSubject<PendingMultisigTxMap> {
    return this.pendingMultisigTxSubject;
  }

  /**
   * Gets a snapshot of the current pending multisig extrinsic map
   * @returns Copy of the current pending multisig extrinsic map
   */
  public getPendingMultisigTxMap (): PendingMultisigTxMap {
    return { ...this.pendingMultisigTxSubject.getValue() };
  }

  /**
   * Gets pending extrinsics for a specific multisig address
   * @param request - Request object containing the multisig address
   * @param chain - Optional chain identifier to filter by specific chain
   * @returns Array of pending multisig extrinsics matching the criteria
   */
  public getPendingTxsForMultisigAddress (request: RequestGetPendingTxs, chain?: string): PendingMultisigTx[] {
    const multisigAddress = request.multisigAddress;
    const currentMap = this.getPendingMultisigTxMap();

    if (chain) {
      return Object.values(currentMap).filter((tx) => tx.multisigAddress === multisigAddress && tx.chain === chain);
    }

    return Object.values(currentMap).filter((tx) => tx.multisigAddress === multisigAddress);
  }
}
