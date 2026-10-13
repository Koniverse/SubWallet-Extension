// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateAdapterSubscriptionArgs, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { InappNotificationService } from '@subwallet/extension-base/services/inapp-notification-service';
import { NotificationDescriptionMap, NotificationTitleMap } from '@subwallet/extension-base/services/inapp-notification-service/consts';
import { _BaseNotificationInfo, _NotificationInfo, MultisigApprovalNotificationMetadata, MultisigApprovalNotificationStatus, NotificationActionType, NotificationTab } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import { decodeCallData, DecodeCallDataResponse, DEFAULT_BLOCK_HASH, genPendingMultisigTxKey, getCallData, getMultisigTxType } from '@subwallet/extension-base/services/multisig-service/utils';
import { SWTransactionBase } from '@subwallet/extension-base/services/transaction-service/types';
import { _reformatAddressWithChain, addLazy, createPromiseHandler, isSameAddress, PromiseHandler, reformatAddress } from '@subwallet/extension-base/utils';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { BehaviorSubject } from 'rxjs';

import { Compact } from '@polkadot/types';
import { BlockHash, Moment, SignedBlock } from '@polkadot/types/interfaces';

import { EventItem, EventType } from '../event-service/types';

/**
 * Query key for multisig multisigs subscription
 */
const MULTISIG_QUERY_KEY = 'query_multisig_multisigs';

/**
 * Delays used to retry a multisig subscription that cannot be set up or was broken by an RPC error
 */
const MULTISIG_RETRY_DELAY_MIN = 2000;
const MULTISIG_RETRY_DELAY_MAX = 60000;

/**
 * Block data needed to resolve the extrinsic of a pending multisig tx
 */
interface MultisigBlockInfo {
  blockHash: BlockHash;
  signedBlock: SignedBlock;
  timestamp: number;
}

/**
 * On-chain state of a pending multisig tx whose block could not be read (e.g. pruned by the RPC node)
 */
type UnresolvedPendingMultisigTx = Pick<RawPendingMultisigTx, 'callHash' | 'blockHeight' | 'extrinsicIndex' | 'approvals' | 'depositAmount'>;

/**
 * Identifies a pending multisig tx on chain, the same call can be proposed again in another block after it is executed
 */
function genOnChainTxKey (callHash: string, blockHeight: number, extrinsicIndex: number) {
  return `${callHash}___${blockHeight}___${extrinsicIndex}`;
}

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
  /** Optional chain identifier to filter by specific chain */
  chain?: string
}

export enum MultisigTxType {
  /** Transfer extrinsic */
  TRANSFER = 'Transfer',
  /** Transfer NFT extrinsic */
  TRANSFER_NFT = 'TransferNFT',
  /** Staking-related extrinsic */
  STAKING = 'Staking',
  /** Redeem extrinsic */
  REDEEM = 'Redeem',
  /** Unstake extrinsic */
  UNSTAKE = 'Unstake',
  /** Withdraw extrinsic */
  WITHDRAW = 'Withdraw',
  /** Cancel unstake extrinsic */
  CANCEL_UNSTAKE = 'CancelUnstake',
  /** Claim extrinsic */
  CLAIM_REWARD = 'ClaimReward',
  /** Nominate extrinsic */
  NOMINATE = 'Nominate',
  /** Lending extrinsic */
  LENDING = 'Lending',
  /** Swap extrinsic */
  SWAP = 'Swap',
  /** Set token pay fee extrinsic */
  SET_TOKEN_PAY_FEE = 'SetTokenPayFee',
  /** Governance vote extrinsic */
  GOV_VOTE = 'govVote',
  /** Governance remove vote extrinsic */
  GOV_REMOVE_VOTE = 'govRemoveVote',
  /** Governance unlock vote extrinsic */
  GOV_UNLOCK_VOTE = 'govUnlockVote',
  /** Proxy add extrinsic */
  ADD_PROXY = 'AddProxy',
  /** Proxy remove extrinsic */
  REMOVE_PROXY = 'RemoveProxy',
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
  govVote: ['convictionVoting.vote'],
  govRemoveVote: ['convictionVoting.removeVote'],
  govUnlockVote: ['convictionVoting.unlock'],
  addProxy: ['proxy.addProxy'],
  removeProxy: ['proxy.removeProxy', 'proxy.removeProxies']
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
  /** Last queued notification write of each multisig address on each chain, so writes are applied in order */
  private readonly notificationTaskQueue: Record<string, Promise<void>> = {};

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

      this.eventService.emit('multisig-service.ready', true);

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

    if (eventTypes.includes('account.add') || eventTypes.includes('account.remove') || eventTypes.includes('account.updateCurrent')) {
      needReload = true;
    }

    if (eventTypes.includes('chain.updateState') || eventTypes.includes('transaction.done')) {
      for (const event of events) {
        if (event.type === 'chain.updateState') {
          const chainSlug = event.data[0] as string;
          const chainInfo = this.chainService.getChainInfoByKey(chainSlug);

          // Only reload if the updated chain is in the supported chains list
          if (chainInfo.substrateInfo?.supportMultisig) {
            needReload = true;
            break;
          }
        } else if (event.type === 'transaction.done') {
          const txResult = event.data[0] as SWTransactionBase;

          if (txResult.wrappingStatus === 'WRAP_RESULT') {
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
      const activeChainInfoMap = this.chainService.getActiveChainInfoMap();
      const supportedActiveChains = Object.values(activeChainInfoMap).reduce((rs, chainInfo) => {
        if (chainInfo.substrateInfo?.supportMultisig) {
          rs.push(chainInfo.slug);
        }

        return rs;
      }, [] as string[]);

      for (const chain of supportedActiveChains) {
        const chainInfo = this.chainService.getChainInfoByKey(chain);

        for (const account of multisigAccounts) {
          const multisigAddress = account.id;
          const signers = account.accounts[0].signers as string[];
          const reformatMultisigAddress = _reformatAddressWithChain(multisigAddress, chainInfo);
          const reformatSigners = signers.map((s) => _reformatAddressWithChain(s, chainInfo));
          const threshold = account.accounts[0].threshold as number;

          const unsub = this.subscribePendingMultisigTxs(chain, reformatMultisigAddress, reformatSigners, threshold, (rs, unresolvedTxs) => {
            multisigServiceLogger.debug(`pending multisig txs of address ${reformatMultisigAddress}`, rs);

            !cancel && this.updatePendingMultisigTxSubjectByChain(reformatMultisigAddress, chain, rs, unresolvedTxs);
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
   * Reads the block data needed to resolve the extrinsic of a pending multisig tx
   * The timestamp is read from the block's timestamp inherent, so it does not need the state of old blocks, which RPC nodes prune by default
   * @param substrateApi - Substrate API of the chain
   * @param blockHeight - Height of the block that contains the multisig extrinsic
   * @returns Block hash, signed block and timestamp of the block
   */
  private async getMultisigBlockInfo (substrateApi: _SubstrateApi, blockHeight: number): Promise<MultisigBlockInfo> {
    const blockHash = await substrateApi.api.rpc.chain.getBlockHash(blockHeight);
    const signedBlock = await substrateApi.api.rpc.chain.getBlock(blockHash);
    const timestampExtrinsic = signedBlock.block.extrinsics.find(({ method }) => method.section === 'timestamp' && method.method === 'set');

    if (timestampExtrinsic) {
      const timestamp = (timestampExtrinsic.method.args[0] as Compact<Moment>).toNumber();

      return { blockHash, signedBlock, timestamp };
    }

    const apiAt = await substrateApi.api.at(blockHash);
    const timestamp = (await apiAt.query.timestamp.now()).toNumber();

    return { blockHash, signedBlock, timestamp };
  }

  /**
   * Subscribes to pending multisig extrinsics for a specific multisig address on a chain
   * Fetches initial data and sets up a subscription for updates
   * @param chain - Chain identifier
   * @param multisigAddress - Multisig address to monitor
   * @param signers - List of signer addresses for the multisig
   * @param threshold - Number of approval required
   * @param callback - Callback function called with updated pending extrinsics and the txs whose block could not be read
   * @param onError - Called when the subscription is broken and needs to be set up again
   * @returns Function to unsubscribe from the subscription
   */
  private async subscribePendingMultisigTxsPromise (chain: string, multisigAddress: string, signers: string[], threshold: number, callback: (rs: RawPendingMultisigTx[], unresolvedTxs: UnresolvedPendingMultisigTx[]) => void, onError: (error: unknown) => void) {
    const substrateApi = await this.chainService.getSubstrateApi(chain).isReady;

    if (!substrateApi.api.query.multisig.multisigs) {
      multisigServiceLogger.warn('This chain is not has multisig pallet', chain);

      return () => undefined;
    }

    const keyQuery = MULTISIG_QUERY_KEY;
    const rawKeys = await substrateApi.api.query.multisig.multisigs.keys(multisigAddress);
    const rawKeysArgs = rawKeys.map((rawKey) => rawKey.args);

    const params: _SubstrateAdapterSubscriptionArgs[] = [{
      section: 'query',
      module: keyQuery.split('_')[1],
      method: keyQuery.split('_')[2],
      args: rawKeysArgs
    }];

    let closed = false;
    // Updates are processed asynchronously, so an older update can finish after a newer one has been applied
    let latestUpdateId = 0;
    let appliedUpdateId = 0;

    const subscription = substrateApi.subscribeDataWithMulti(params, async (rs) => {
      const updateId = ++latestUpdateId;

      try {
        const items: RawPendingMultisigTx[] = [];
        const unresolvedTxs: UnresolvedPendingMultisigTx[] = [];
        const pendingMultisigEntries = rs[keyQuery];

        // subscribeDataWithMulti turns an RPC error into an empty result and completes the stream,
        // which would look like every pending tx is gone and clear their notifications, so resubscribe instead
        if (!pendingMultisigEntries || pendingMultisigEntries.length !== rawKeysArgs.length) {
          throw new Error(`Incomplete multisig storage result: expected ${rawKeysArgs.length} entries, got ${pendingMultisigEntries?.length ?? 0}`);
        }

        // Cache block-level data to avoid many RPC calls, txs of the same block share the same request
        const blockCache: Record<number, Promise<MultisigBlockInfo>> = {};

        await Promise.all(pendingMultisigEntries.map(async (_pendingMultisigInfo, index) => {
          const pendingMultisigInfo = _pendingMultisigInfo as unknown as PalletMultisigMultisig;

          if (!pendingMultisigInfo) {
            return;
          }

          const blockHeight = pendingMultisigInfo.when.height;
          const extrinsicIndex = pendingMultisigInfo.when.index;
          const callHash = rawKeysArgs[index][1].toHex();

          try {
            blockCache[blockHeight] = blockCache[blockHeight] ?? this.getMultisigBlockInfo(substrateApi, blockHeight);

            const blockInfo = await blockCache[blockHeight];
            const extrinsic = blockInfo.signedBlock.block.extrinsics[extrinsicIndex];

            if (!extrinsic) {
              throw new Error(`Extrinsic ${extrinsicIndex} not found in block ${blockHeight}`);
            }

            const extrinsicHash = extrinsic.hash.toHex();

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
          } catch (error) {
            // The tx is still on chain, pass its storage state down so it is not treated as executed or cancelled
            multisigServiceLogger.warn(`Unable to read block ${blockHeight} of multisig call ${callHash} on ${chain}`, error);

            unresolvedTxs.push({
              callHash,
              blockHeight,
              extrinsicIndex,
              depositAmount: pendingMultisigInfo.deposit,
              approvals: pendingMultisigInfo.approvals
            });
          }
        }));

        if (closed || updateId < appliedUpdateId) {
          return;
        }

        appliedUpdateId = updateId;
        callback(items, unresolvedTxs);
      } catch (error) {
        multisigServiceLogger.error(`Multisig Service subscription error ${chain}/${multisigAddress}`, error);

        !closed && onError(error);
      }
    });

    return () => {
      closed = true;
      subscription.unsubscribe();
    };
  }

  /**
   * Wrapper function to subscribe to pending multisig extrinsics
   * Sets the subscription up again with an increasing delay when it cannot be set up or is broken by an RPC error
   * @param chain - Chain identifier
   * @param multisigAddress - Multisig address to monitor
   * @param signers - List of signer addresses for the multisig
   * @param threshold - Number of approval required
   * @param callback - Callback function called with updated pending extrinsics and the txs whose block could not be read
   * @returns Function to unsubscribe from the subscription
   */
  private subscribePendingMultisigTxs (chain: string, multisigAddress: string, signers: string[], threshold: number, callback: (rs: RawPendingMultisigTx[], unresolvedTxs: UnresolvedPendingMultisigTx[]) => void) {
    let stopped = false;
    // Increased on every retry, so a replaced subscription can no longer update data or schedule a retry
    let attempt = 0;
    let retryCount = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: VoidFunction | undefined;

    const retry = (error: unknown) => {
      if (stopped) {
        return;
      }

      attempt++;
      unsubscribe?.();
      unsubscribe = undefined;

      const delay = Math.min(MULTISIG_RETRY_DELAY_MIN * 2 ** retryCount, MULTISIG_RETRY_DELAY_MAX);

      retryCount++;
      multisigServiceLogger.warn(`Retry multisig subscription ${chain}/${multisigAddress} in ${delay}ms`, error);

      clearTimeout(retryTimeout);
      retryTimeout = setTimeout(subscribe, delay);
    };

    const subscribe = () => {
      const currentAttempt = attempt;
      const isCurrent = () => !stopped && currentAttempt === attempt;

      this.subscribePendingMultisigTxsPromise(chain, multisigAddress, signers, threshold, (rs, unresolvedTxs) => {
        if (isCurrent()) {
          retryCount = 0;
          callback(rs, unresolvedTxs);
        }
      }, (error) => {
        isCurrent() && retry(error);
      })
        .then((unsub) => {
          if (isCurrent()) {
            unsubscribe = unsub;
          } else {
            unsub();
          }
        })
        .catch((error) => {
          isCurrent() && retry(error);
        });
    };

    subscribe();

    return () => {
      stopped = true;
      clearTimeout(retryTimeout);
      unsubscribe?.();
      unsubscribe = undefined;
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
   * @param unresolvedTxs - Txs still on chain whose block could not be read
   */
  private updatePendingMultisigTxSubjectByChain (multisigAddress: string, chain: string, rawPendingTxs: RawPendingMultisigTx[], unresolvedTxs: UnresolvedPendingMultisigTx[]): void {
    const allAddresses = this.keyringService.context.getAllAddresses();
    const currentMap = this.getPendingMultisigTxMap();
    const excludedPrefix = `${chain}___${multisigAddress}___`;
    const filteredMap: PendingMultisigTxMap = {};
    const newTxMap: PendingMultisigTxMap = {};
    const newNotifiedTxs: PendingMultisigTx[] = [];

    const unresolvedTxMap = unresolvedTxs.reduce<Record<string, UnresolvedPendingMultisigTx>>((map, tx) => {
      map[genOnChainTxKey(tx.callHash, tx.blockHeight, tx.extrinsicIndex)] = tx;

      return map;
    }, {});

    // 1. Clean old extrinsics of multisigAddress and chain
    for (const [key, value] of Object.entries(currentMap)) {
      if (!key.startsWith(excludedPrefix)) {
        filteredMap[key] = value;
        continue;
      }

      const unresolvedTx = unresolvedTxMap[genOnChainTxKey(value.callHash, value.blockHeight, value.extrinsicIndex)];

      if (unresolvedTx) {
        // Keep the last known data of a tx that is still pending, only refresh its on-chain state
        newTxMap[key] = { ...value, approvals: unresolvedTx.approvals, depositAmount: unresolvedTx.depositAmount };
      } else {
        this.notifiedTxKeys.delete(key);
      }
    }

    // 2. Create new extrinsics of multisigAddress and chain
    for (const rawTx of rawPendingTxs) {
      const extrinsicHash = rawTx.extrinsicHash;
      const signerAddresses = rawTx.signerAddresses;

      if (!extrinsicHash || !signerAddresses || signerAddresses.length === 0) {
        multisigServiceLogger.warn('Skipping multisig extrinsic due to missing required fields: extrinsicHash or signerAddresses');
        continue;
      }

      for (const signerAddress of signerAddresses) {
        // Do not create pending tx for account not in wallet
        if (!allAddresses.includes(reformatAddress(signerAddress))) {
          continue;
        }

        const reformatSignerAddress = _reformatAddressWithChain(signerAddress, this.chainService.getChainInfoByKey(chain));

        const key = genPendingMultisigTxKey(chain, multisigAddress, reformatSignerAddress, extrinsicHash);
        const pendingTx: PendingMultisigTx = { ...rawTx, currentSigner: reformatSignerAddress, id: key };

        newTxMap[key] = pendingTx;

        // Track new transactions that need notification
        // Only notify if this is a new transaction (not already notified)
        if (!this.notifiedTxKeys.has(key) && !currentMap[key]) {
          // skip notified for account has already approved
          if (pendingTx.approvals.includes(signerAddress)) {
            continue;
          }

          newNotifiedTxs.push(pendingTx);
          this.notifiedTxKeys.add(key);
        }
      }
    }

    const notificationQueueKey = `${chain}___${multisigAddress}`;

    // 3. Replace the extrinsics of multisigAddress and chain
    // Mark notifications of approved or no longer pending transactions
    this.enqueueNotificationTask(
      notificationQueueKey,
      () => this.updateMultisigApprovalNotifications(newTxMap, new Set(Object.keys(unresolvedTxMap)), multisigAddress, chain),
      'Failed to update multisig approval notifications:'
    );

    this.pendingMultisigTxSubject.next({
      ...filteredMap,
      ...newTxMap
    });

    // 4. Create notifications for new pending transactions
    if (newNotifiedTxs.length > 0) {
      this.enqueueNotificationTask(
        notificationQueueKey,
        () => this.createMultisigApprovalNotifications(newNotifiedTxs),
        'Failed to create multisig approval notifications:'
      );
    }
  }

  /**
   * Runs notification writes of the same multisig address one after another,
   * so a write computed from an older update cannot land after a newer one
   * @param key - Key of the multisig address and chain
   * @param task - Notification write to run
   * @param errorMessage - Message logged when the write fails
   */
  private enqueueNotificationTask (key: string, task: () => Promise<void>, errorMessage: string): void {
    const previousTask = this.notificationTaskQueue[key] ?? Promise.resolve();

    this.notificationTaskQueue[key] = previousTask
      .then(task)
      .catch((e) => multisigServiceLogger.error(errorMessage, e));
  }

  /**
   * Updates the status of multisig approval notifications instead of removing them,
   * so the user still sees why a notification needs no more action when clicking it
   * @private
   * @param newTxMap - Map of current pending multisig transactions
   * @param unresolvedTxKeys - On-chain keys (genOnChainTxKey) of txs still on chain whose block could not be read
   * @param multisigAddress - Multisig address
   * @param chain - ChainSlug of the multisig transactions
   */
  private async updateMultisigApprovalNotifications (newTxMap: PendingMultisigTxMap, unresolvedTxKeys: Set<string>, multisigAddress: string, chain: string): Promise<void> {
    const currentNotifications = await this.inappNotificationService.fetchNotificationsByParams({
      notificationTab: NotificationTab.MULTISIG,
      proxyId: ALL_ACCOUNT_KEY,
      metadata: {
        multisigAddress,
        chain
      }
    });

    const updatedNotifications = currentNotifications.reduce<_NotificationInfo[]>((rs, notification) => {
      const metadata = notification.metadata as MultisigApprovalNotificationMetadata;
      const pendingTx = newTxMap[metadata.multisigKey];
      let status: MultisigApprovalNotificationStatus | undefined;

      if (pendingTx) {
        const isApproved = pendingTx.approvals.some((address) => isSameAddress(pendingTx.currentSigner, address));

        status = isApproved ? MultisigApprovalNotificationStatus.APPROVED : undefined;
      } else if (unresolvedTxKeys.has(genOnChainTxKey(metadata.callHash, metadata.blockHeight, metadata.extrinsicIndex))) {
        // The tx is still on chain but has no known data yet, so its approval state cannot be verified
        return rs;
      } else {
        status = MultisigApprovalNotificationStatus.RESOLVED;
      }

      if (metadata.status === status) {
        return rs;
      }

      rs.push({
        ...notification,
        // No more action is needed once approved or resolved, so it should not stay in the unread count
        isRead: status ? true : notification.isRead,
        metadata: { ...metadata, status, approvals: pendingTx?.approvals ?? metadata.approvals }
      });

      return rs;
    }, []);

    if (updatedNotifications.length > 0) {
      await this.inappNotificationService.updateNotifications(updatedNotifications);
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
        address: reformatAddress(tx.currentSigner), // save notification to default address because it's managed by account
        title: NotificationTitleMap[actionType],
        description: NotificationDescriptionMap[actionType](),
        time: timestamp,
        extrinsicType: ExtrinsicType.MULTISIG_APPROVE_TX,
        isRead: false,
        actionType,
        metadata: {
          multisigKey,
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
   * @returns Array of pending multisig extrinsics matching the criteria
   */
  public getPendingTxsForMultisigAddress (request: RequestGetPendingTxs): PendingMultisigTx[] {
    const { chain, multisigAddress } = request;
    const currentMap = this.getPendingMultisigTxMap();

    if (chain) {
      return Object.values(currentMap).filter((tx) => isSameAddress(tx.multisigAddress, multisigAddress) && tx.chain === chain);
    }

    return Object.values(currentMap).filter((tx) => isSameAddress(tx.multisigAddress, multisigAddress));
  }
}
