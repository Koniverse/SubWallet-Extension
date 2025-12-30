// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateAdapterSubscriptionArgs } from '@subwallet/extension-base/services/chain-service/types';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import { decodeCallData, DecodeCallDataResponse, DEFAULT_BLOCK_HASH, genPendingMultisigTxKey, getCallData, getMultisigTxType } from '@subwallet/extension-base/services/multisig-service/utils';
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

export interface PendingMultisigTx extends RawPendingMultisigTx {
  currentSigner: string;
}

export interface RawPendingMultisigTx extends ExtendedPendingMultisigTx {
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
  signerAddresses?: string[];
  extrinsicHash?: string;
  callData?: string; // todo: handle case callData and decodedCallData undefined, maybe required user input calldata to execute?
  decodedCallData?: DecodeCallDataResponse;
  timestamp?: number;
  multisigTxType?: MultisigTxType
}

/**
 * Key is created using genPendingMultisigTxKey function
 */
export type PendingMultisigTxMap = Record<string, PendingMultisigTx>;

export interface RequestGetPendingTxs {
  multisigAddress: string
}

export enum MultisigTxType {
  TRANSFER = 'Transfer',
  STAKING = 'Staking',
  LENDING = 'Lending',
  SET_TOKEM_PAY_FEE = 'SetTokenPayFee',
  GOV = 'Governance',
  SWAP = 'Swap',
  UNKNOWN = 'Unknown'
}

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

export class MultisigService implements StoppableServiceInterface {
  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;
  startPromiseHandler: PromiseHandler<void> = createPromiseHandler();
  stopPromiseHandler: PromiseHandler<void> = createPromiseHandler();

  private readonly pendingMultisigTxSubject: BehaviorSubject<PendingMultisigTxMap> = new BehaviorSubject<PendingMultisigTxMap>({});
  private unsubscribes: VoidFunction | undefined;
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
    // todo: Load pending multisig txs from db if needed
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
    // todo: improve by reload only when related chains update
    if (eventTypes.includes('account.add') || eventTypes.includes('account.remove') || eventTypes.includes('chain.updateState')) {
      addLazy(
        'reloadPendingMultisigTxsByEvents',
        () => {
          if (this.status === ServiceStatus.STARTED) {
            this.runSubscribePendingMultisigTxs().catch(console.error);
          }
        },
        2000,
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
          const signers = account.accounts[0].signers as string[];

          const unsub = this.subscribePendingMultisigTxs(chain, reformatAddress, signers, (rs) => {
            !cancel && this.updatePendingMultisigTxSubjectByChain(reformatAddress, chain, rs);
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
   * Subscribe to a specific multisig address on a chain
   */

  private async subscribePendingMultisigTxsPromise (chain: string, multisigAddress: string, signers: string[], callback: (rs: RawPendingMultisigTx[]) => void) {
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

  private subscribePendingMultisigTxs (chain: string, multisigAddress: string, signers: string[], callback: (rs: RawPendingMultisigTx[]) => void) {
    const unsubPromise = this.subscribePendingMultisigTxsPromise(chain, multisigAddress, signers, callback);

    return () => {
      unsubPromise.then((unsub) => {
        unsub?.();
      }).catch(console.error);
    };
  }

  private runUnsubscribePendingMultisigTxs (): void {
    this.unsubscribes && this.unsubscribes();
    this.unsubscribes = undefined;
  }

  /**
   * Update multisig map and notify subscribers
   */
  private updatePendingMultisigTxSubjectByChain (multisigAddress: string, chain: string, rawPendingTxs: RawPendingMultisigTx[]): void {
    const currentMap = this.getPendingMultisigTxMap();
    const prefixToMatch = `${chain}___${multisigAddress}___`;
    const filteredMap: PendingMultisigTxMap = {};

    // 1. Clean old txs of multisigAddress and chain
    for (const [key, value] of Object.entries(currentMap)) {
      if (!key.startsWith(prefixToMatch)) {
        filteredMap[key] = value;
      }
    }

    const newTxMap: PendingMultisigTxMap = {};

    // 2. Create new txs of multisigAddress and chain
    for (const rawTx of rawPendingTxs) {
      const extrinsicHash = rawTx.extrinsicHash;
      const signerAddresses = rawTx.signerAddresses;

      // Skip transaction if required fields are missing
      if (!extrinsicHash || !signerAddresses || signerAddresses.length === 0) {
        console.warn('Skipping multisig transaction due to missing required fields');
        continue;
      }

      for (const signerAddress of signerAddresses) {
        const key = genPendingMultisigTxKey(chain, multisigAddress, signerAddress, extrinsicHash);

        newTxMap[key] = { ...rawTx, currentSigner: signerAddress };
      }
    }

    // 3. Replace the txs of multisigAddress and chain
    this.pendingMultisigTxSubject.next({
      ...filteredMap,
      ...newTxMap
    });

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

  public subscribePendingMultisigTxMap (): BehaviorSubject<PendingMultisigTxMap> {
    return this.pendingMultisigTxSubject;
  }

  public getPendingMultisigTxMap (): PendingMultisigTxMap {
    // todo: wait multisig ready
    return { ...this.pendingMultisigTxSubject.getValue() };
  }

  /**
   * Get pending transactions for a specific multisig address
   */
  public getPendingTxsForMultisigAddress (request: RequestGetPendingTxs, chain?: string): PendingMultisigTx[] {
    // todo: wait multisig ready
    const multisigAddress = request.multisigAddress;
    const currentMap = this.getPendingMultisigTxMap();

    if (chain) {
      return Object.values(currentMap).filter((tx) => tx.multisigAddress === multisigAddress && tx.chain === chain);
    }

    return Object.values(currentMap).filter((tx) => tx.multisigAddress === multisigAddress);
  }

  /**
   * Reload all multisig data
   */
  public async reloadMultisigs (): Promise<void> {
    this.pendingMultisigTxSubject.next({});
    await this.runSubscribePendingMultisigTxs();
  }
}
