// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, BlockHeader, TransactionData } from '@subwallet/extension-base/types';
import { formatNumber } from '@subwallet/extension-base/utils/number';
import BigN from 'bignumber.js';
import { combineLatest, merge, mergeMap } from 'rxjs';

import { _EXPECTED_BLOCK_TIME } from '../chain-service/constants';
import { _SubstrateApi } from '../chain-service/types';
import { _getAssetDecimals } from '../chain-service/utils';
import { Conviction, GovDelegationDetail, GovTrackVoting, GovVoteDetail, GovVoteRequest, GovVoteType, GovVotingInfo, RemoveVoteRequest, SplitAbstainVoteRequest, SplitVoteRequest, StandardVoteRequest, UnlockingReferendaData, UnlockVoteRequest, Vote, VotingFor } from './interface';
import { getConvictionDays, MIGRATED_CHAINS, numberToConviction } from './utils';

export default abstract class BaseOpenGovHandler {
  protected readonly state: KoniState;
  public readonly chain: string;

  constructor (state: KoniState, chain: string) {
    this.state = state;
    this.chain = chain;
  }

  protected get substrateApi (): _SubstrateApi {
    return this.state.getSubstrateApi(this.chain);
  }

  public get chainInfo (): _ChainInfo {
    return this.state.getChainInfo(this.chain);
  }

  protected get nativeToken (): _ChainAsset {
    return this.state.getNativeTokenInfo(this.chain);
  }

  private lockPeriod (days: number): number {
    const blockTime = _EXPECTED_BLOCK_TIME[this.chain] ?? 6;
    const baseLockedPeriod = 24 * 60 * 60 * days;

    return baseLockedPeriod / blockTime;
  }

  /* Referendum related actions */

  public async handleVote (request: GovVoteRequest): Promise<TransactionData> {
    const delegateError = await this.validateNotDelegating(request.address, request.trackId);

    if (delegateError) {
      return Promise.reject(delegateError);
    }

    switch (request.type) {
      case GovVoteType.AYE:
      case GovVoteType.NAY:
        return this.handleStandardVote(request);

      case GovVoteType.SPLIT:
        return this.handleSplitVote(request);

      case GovVoteType.ABSTAIN:
        return this.handleSplitAbstainVote(request);

      default:
        throw new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Unsupported vote type');
    }
  }

  private async handleStandardVote (request: StandardVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const earlyError = await this.validateConvictionAndBalance(
      request.address,
      request.amount,
      request.conviction
    );

    if (earlyError) {
      return Promise.reject(earlyError);
    }

    const extrinsic = substrateApi.api.tx.convictionVoting.vote(
      request.referendumIndex,
      {
        Standard: {
          vote: {
            aye: request.type === GovVoteType.AYE,
            conviction: numberToConviction[request.conviction]
          },
          balance: request.amount
        }
      }
    );

    return extrinsic;
  }

  private async handleSplitVote (request: SplitVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const earlyError = await this.validateSplitAbstainAmount(request.address, false, request.ayeAmount, request.nayAmount);

    if (earlyError) {
      return Promise.reject(earlyError);
    }

    const extrinsic = substrateApi.api.tx.convictionVoting.vote(
      request.referendumIndex,
      {
        Split: {
          aye: request.ayeAmount,
          nay: request.nayAmount
        }
      }
    );

    return extrinsic;
  }

  private async handleSplitAbstainVote (request: SplitAbstainVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const earlyError = await this.validateSplitAbstainAmount(request.address, true, request.ayeAmount, request.nayAmount, request.abstainAmount);

    if (earlyError) {
      return Promise.reject(earlyError);
    }

    const extrinsic = substrateApi.api.tx.convictionVoting.vote(
      request.referendumIndex,
      {
        SplitAbstain: {
          aye: request.ayeAmount,
          nay: request.nayAmount,
          abstain: request.abstainAmount
        }
      }
    );

    return extrinsic;
  }

  public async handleRemoveVote (request: RemoveVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const extrinsic = substrateApi.api.tx.convictionVoting.removeVote(
      request.trackId,
      request.referendumIndex
    );

    return extrinsic;
  }

  public async handleUnlockVote (request: UnlockVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    if (request.referendumIds && request.referendumIds.length > 0) {
      const extrinsics = request.trackIds.flatMap((trackId, index) => {
        const referendumIndex = request.referendumIds?.[index];

        return referendumIndex !== undefined
          ? [
            substrateApi.api.tx.convictionVoting.removeVote(trackId, referendumIndex),
            substrateApi.api.tx.convictionVoting.unlock(trackId, request.address)
          ]
          : substrateApi.api.tx.convictionVoting.unlock(trackId, request.address);
      });

      return substrateApi.api.tx.utility.batchAll(extrinsics);
    }

    if (request.trackIds.length > 1) {
      const extrinsics = request.trackIds.map((id) =>
        substrateApi.api.tx.convictionVoting.unlock(id, request.address)
      );

      return substrateApi.api.tx.utility.batchAll(extrinsics);
    }

    return substrateApi.api.tx.convictionVoting.unlock(request.trackIds[0], request.address);
  }

  /* Validate OpengGov Action */

  private async validateNotDelegating (
    address: string,
    trackId: number
  ): Promise<TransactionError | null> {
    const substrateApi = await this.substrateApi.isReady;

    const locked = (await substrateApi.api.query.convictionVoting.votingFor(address, trackId)).toPrimitive() as VotingFor;

    if (!locked) {
      return null;
    }

    if (locked?.delegating?.balance && new BigN(locked.delegating.balance).gt(0)) {
      return new TransactionError(
        BasicTxErrorType.INVALID_PARAMS,
        `Already delegating on track ${trackId}`
      );
    }

    return null;
  }

  private async validateConvictionAndBalance (address: string, balance: string, conviction: number): Promise<TransactionError | null> {
    if (!balance) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, ('Amount is required'));
    }

    if (conviction < 0 || conviction > 6) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Invalid conviction');
    }

    const totalBalance = await this.state.balanceService.getTotalBalance(address, this.chain);

    const bnBalance = new BigN(balance);
    const substrateApi = await this.substrateApi.isReady;

    let estimatedFee = new BigN(0);

    try {
      const dummyTx = substrateApi.api.tx.convictionVoting.vote(0, {
        Standard: {
          vote: { aye: true, conviction },
          balance: bnBalance.toString()
        }
      });
      const paymentInfo = await dummyTx.paymentInfo(address);

      estimatedFee = new BigN(paymentInfo.partialFee.toString());
    } catch (e) {
      console.warn('Cannot estimate fee, fallback to default', e);
      const decimals = Number(_getAssetDecimals(this.nativeToken));

      estimatedFee = new BigN(0.001).multipliedBy(new BigN(10).pow(decimals)); // fallback 0.001
    }

    const availableBalance = new BigN(totalBalance.value).minus(estimatedFee);

    if (availableBalance.lte(0)) {
      return new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, "You don't have enough tokens to proceed");
    }

    if (bnBalance.gt(availableBalance)) {
      return new TransactionError(
        BasicTxErrorType.NOT_ENOUGH_BALANCE,
        `Amount must be equal or less than ${formatNumber(availableBalance, _getAssetDecimals(this.nativeToken))}`
      );
    }

    return null;
  }

  private async validateSplitAbstainAmount (
    address: string,
    isSplitAbstain = true,
    aye: string,
    nay: string,
    abstain?: string
  ): Promise<TransactionError | null> {
    if (!nay || !aye) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount is required');
    }

    const values = [new BigN(aye), new BigN(nay), new BigN(abstain ?? '0')];

    const total = values.reduce((acc, val) => acc.plus(val), new BigN(0));

    const totalBalance = await this.state.balanceService.getTotalBalance(address, this.chain);

    const substrateApi = await this.substrateApi.isReady;

    let dummyTx;

    try {
      dummyTx = substrateApi.api.tx.convictionVoting.vote(
        1, // dummy referendum id
        isSplitAbstain
          ? {
            SplitAbstain: {
              aye: 1,
              nay: 1,
              abstain: 1
            }
          }
          : {
            Split: {
              aye: 1,
              nay: 1
            }
          }
      );
    } catch (e) {
      console.warn('Cannot build dummy tx for fee estimation', e);
    }

    let estimatedFee = new BigN(0);

    if (dummyTx) {
      try {
        const paymentInfo = await dummyTx.paymentInfo(address);

        estimatedFee = new BigN(paymentInfo.partialFee.toString());
      } catch (e) {
        console.warn('Cannot get payment info, fallback to default fee', e);
        estimatedFee = new BigN(0.001 * (10 ** _getAssetDecimals(this.nativeToken))); // fallback 0.001
      }
    }

    const availableBalance = new BigN(totalBalance.value).minus(estimatedFee);

    if (availableBalance.lte(0)) {
      return new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, "You don't have enough tokens to proceed");
    }

    if (total.gt(availableBalance)) {
      return new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, `Amount must be equal or less than ${formatNumber(availableBalance, _getAssetDecimals(this.nativeToken))}`);
    }

    return null;
  }

  /* Lock info */
  public async subscribeGovLockedInfo (addresses: string[], cb: (info: GovVotingInfo) => void) {
    const substrateApi = await this.substrateApi.isReady;

    const streams = addresses.map((addr) => {
      return combineLatest([
        substrateApi.api.query.convictionVoting.votingFor.entries(addr),
        substrateApi.api.query.convictionVoting.classLocksFor(addr)
      ]).pipe(
        mergeMap(async ([votingEntries, classLocks]) => {
          let totalDelegated = new BigN(0);
          let totalVoted = new BigN(0);
          const tracks: GovTrackVoting[] = [];
          const trackBalances = new Map<number, BigN>();
          const trackStates = new Map<number, 'delegating' | 'casting' | 'empty'>();
          const trackVotedAmounts = new Map<number, BigN>();
          const unlockingReferenda: UnlockingReferendaData[] = [];
          const unlockableReferenda = new Set<string>();
          const trackVotes = new Map<number, GovVoteDetail[]>();
          const trackPriorBlocks = new Map<number, BigN>();
          let totalLocked = new BigN(0);

          // --- Collect locked balances per track ---
          const classLocksArray = classLocks.toPrimitive() as [number, string][];

          for (const [trackId, balance] of classLocksArray) {
            const bnBalance = new BigN(balance);

            trackBalances.set(trackId, bnBalance);
            totalLocked = BigN.max(totalLocked, bnBalance);
          }

          let currentBlock: BigN;

          if (MIGRATED_CHAINS.includes(this.chain) && substrateApi.api.query.remoteProxyRelayChain && substrateApi.api.query.remoteProxyRelayChain.blockToRoot) {
            const blockRootsRaw = await substrateApi.api.query.remoteProxyRelayChain.blockToRoot();
            const blockRoots = blockRootsRaw?.toPrimitive() as Array<[number, string]> | undefined;

            if (blockRoots && blockRoots.length > 0) {
              currentBlock = new BigN(blockRoots[blockRoots.length - 1][0]);
            } else {
              const currentBlockInfo = await substrateApi.api.rpc.chain.getHeader();

              currentBlock = new BigN((currentBlockInfo.toPrimitive() as unknown as BlockHeader).number);
            }
          } else {
            // fallback
            const currentBlockInfo = await substrateApi.api.rpc.chain.getHeader();

            currentBlock = new BigN((currentBlockInfo.toPrimitive() as unknown as BlockHeader).number);
          }

          // --- Handle each voting entry per track ---
          for (const [key, voting] of votingEntries) {
            const trackId = key.args[1].toPrimitive() as number;
            const v = voting.toPrimitive() as VotingFor;

            if (v.delegating) {
              // Track is delegating → store delegation info
              trackStates.set(trackId, 'delegating');
              const { balance, conviction, target } = v.delegating;

              const delegation: GovDelegationDetail = {
                balance: balance.toString(),
                target,
                conviction
              };

              tracks.push({ trackId, delegation });
            } else if (v.casting) {
              trackStates.set(trackId, 'casting');
              const priorBlock = new BigN(v.casting.prior[0]);
              const priorBalance = new BigN(v.casting.prior[1]);

              if (!currentBlock.gte(priorBlock)) {
                // --- Still locked → estimate unlock timestamp ---
                const blockTimeSec = _EXPECTED_BLOCK_TIME[this.chain] ?? 6;
                const remainingBlocks = priorBlock.minus(currentBlock);
                const timestamp = Date.now() + remainingBlocks.multipliedBy(blockTimeSec * 1000).toNumber();

                unlockingReferenda.push({
                  id: `track_prior_${trackId}`,
                  balance: priorBalance.toFixed(),
                  timestamp
                });
              }

              // --- Parse votes and check if referenda are finished ---
              const { unlockingReferenda: trackUnlocking, votes } = await this.parseVotesAndCheckFinished(
                v.casting.votes || [],
                unlockableReferenda,
                currentBlock.toNumber(),
                substrateApi
              );

              unlockingReferenda.push(...trackUnlocking);
              trackVotes.set(trackId, votes);

              // --- Calculate total voted amount per track ---
              const totalCast = votes.reduce((sum, vote) => {
                return sum
                  .plus(new BigN(vote.ayeAmount || '0'))
                  .plus(new BigN(vote.nayAmount || '0'))
                  .plus(new BigN(vote.abstainAmount || '0'));
              }, new BigN(0));

              trackVotedAmounts.set(trackId, totalCast);

              if (v.casting.prior && new BigN(v.casting.prior[0]).gt(0)) {
                trackPriorBlocks.set(trackId, new BigN(v.casting.prior[0]));
              }

              tracks.push({ trackId, votes: votes.length > 0 ? votes : undefined });
            }
          }

          // --- Compute unlockable amounts across all tracks ---
          const { totalUnlockable, unlockableTrackIds } = this.calculateUnlockAmounts(
            trackBalances,
            trackStates,
            unlockableReferenda,
            trackVotes,
            trackPriorBlocks,
            currentBlock
          );

          // --- Determine total delegated and voted locked balances ---
          for (const [trackId, lockedBalance] of trackBalances) {
            const state = trackStates.get(trackId) || 'empty';

            if (state === 'delegating') {
              totalDelegated = BigN.max(totalDelegated, lockedBalance);
            } else if (state === 'casting') {
              const votedAmount = trackVotedAmounts.get(trackId) || new BigN(0);

              if (votedAmount.gt(0)) {
                totalVoted = BigN.max(totalVoted, lockedBalance);
              }
            }
          }

          const result = {
            chain: this.chain,
            address: addr,
            summary: {
              delegated: totalDelegated.toString(),
              voted: totalVoted.toString(),
              totalLocked: totalLocked.toString(),
              unlocking: { unlockingReferenda },
              unlockable: {
                balance: totalUnlockable.toFixed(),
                trackIds: unlockableTrackIds,
                unlockableReferenda: Array.from(unlockableReferenda).sort((a, b) => Number(a) - Number(b))
              }
            },
            tracks
          };

          console.log('result', result);

          return result;
        })
      );
    });

    const sub = merge(...streams).subscribe(cb);

    return () => sub.unsubscribe();
  }

  private async parseVotesAndCheckFinished (votesData: [string, Vote][], unlockableReferenda: Set<string>, currentBlockNumber: number, substrateApi: _SubstrateApi): Promise<{votes: GovVoteDetail[], unlockingReferenda: UnlockingReferendaData[]}> {
    if (!votesData || votesData.length === 0) {
      return { votes: [], unlockingReferenda: [] };
    }

    const votes: GovVoteDetail[] = [];
    const unlockingReferenda: UnlockingReferendaData[] = [];

    // --- Parse all vote types: standard / split / splitAbstain and normalize data
    for (const [refIndex, vote] of votesData) {
      if ('standard' in vote) {
        const isAye = vote.standard.vote.aye === true;

        votes.push({
          referendumIndex: refIndex,
          type: isAye ? GovVoteType.AYE : GovVoteType.NAY,
          conviction: vote.standard.vote.conviction,
          ayeAmount: isAye ? vote.standard.balance : '0',
          nayAmount: !isAye ? vote.standard.balance : '0'
        });
      } else if ('split' in vote) {
        votes.push({
          referendumIndex: refIndex,
          type: GovVoteType.SPLIT,
          conviction: Conviction.None,
          ayeAmount: vote.split.aye,
          nayAmount: vote.split.nay
        });
      } else if ('splitAbstain' in vote) {
        votes.push({
          referendumIndex: refIndex,
          type: GovVoteType.ABSTAIN,
          conviction: Conviction.None,
          ayeAmount: vote.splitAbstain.aye,
          nayAmount: vote.splitAbstain.nay,
          abstainAmount: vote.splitAbstain.abstain
        });
      }
    }

    const refIndexes = votes.map((v) => v.referendumIndex);
    const referendumInfos = await substrateApi.api.query.referenda.referendumInfoFor.multi(refIndexes);

    referendumInfos.forEach((info, i: number) => {
      if (info.isSome) {
        const referendum = info.unwrap();
        const refIndex = refIndexes[i];
        const voteDetail = votes[i];

        if (referendum.isKilled || referendum.isTimedOut || referendum.isCancelled) {
          unlockableReferenda.add(refIndex.toString());

          return;
        }

        if (!referendum.isOngoing) {
          const referendumInfo = referendum.toJSON() as Record<string, unknown>;

          // 0x conviction (no lock) → unlock immediately
          if (voteDetail.conviction === Conviction.None) {
            unlockableReferenda.add(refIndex.toString());

            return;
          }

          // --- Determine unlock block based on conviction ---
          const statusKey = Object.keys(referendumInfo)[0];
          const statusVal = referendumInfo[statusKey] as unknown[];
          const endBlock = statusVal[0] as string | number;

          if (endBlock) {
            const days = getConvictionDays(this.chain, voteDetail.conviction);
            const lockBlocks = this.lockPeriod(days);
            const unlockBlock = new BigN(endBlock).plus(lockBlocks);
            const canUnlock = new BigN(currentBlockNumber).gte(unlockBlock);

            // Referendum ended → check if vote side allows unlock
            const shouldUnlock = referendum.isApproved
              ? (voteDetail.type === GovVoteType.NAY || canUnlock)
              : (voteDetail.type === GovVoteType.AYE || canUnlock);

            if (shouldUnlock) {
              unlockableReferenda.add(refIndex.toString());
            } else {
              // Can't unlock → calculate remaining lock time
              const balance =
              new BigN(voteDetail.ayeAmount || '0')
                .plus(new BigN(voteDetail.nayAmount || '0'))
                .plus(new BigN(voteDetail.abstainAmount || '0'));
              const blockTimeSec = _EXPECTED_BLOCK_TIME[this.chain] ?? 6;
              const remainingBlocks = unlockBlock.minus(currentBlockNumber);

              const timestamp = Date.now() + remainingBlocks.multipliedBy(blockTimeSec * 1000).toNumber();

              unlockingReferenda.push({
                id: refIndex.toString(),
                balance: balance.toFixed(),
                timestamp: timestamp
              });
            }
          }
        }
      }
    });

    return { votes, unlockingReferenda };
  }

  private calculateUnlockAmounts (
    trackBalances: Map<number, BigN>,
    trackStates: Map<number, 'delegating' | 'casting' | 'empty'>,
    unlockableReferenda: Set<string>,
    trackVotes: Map<number, GovVoteDetail[]>,
    trackPriorBlocks: Map<number, BigN>,
    currentBlockNumber: BigN
  ) {
    const unlockableTrackIds: number[] = [];

    // Determine which tracks are unlockable:
    // - all votes finished
    // - prior block passed
    // - state is empty
    // Calculate total unlockable amount = max(unlockable balance) - highest still locked balance
    for (const [trackId, balance] of trackBalances) {
      const state = trackStates.get(trackId) || 'empty';
      const votes = trackVotes.get(trackId) || [];
      const priorBlock = trackPriorBlocks.get(trackId) || new BigN(0);

      if (state === 'casting') {
        const allVotesUnlockable = votes.length === 0 || votes.every((vote) =>
          unlockableReferenda.has(vote.referendumIndex.toString())
        );

        const activeVoteAmount = votes
          .filter((vote) => !unlockableReferenda.has(vote.referendumIndex))
          .reduce((sum, vote) => {
            return sum
              .plus(new BigN(vote.amount || '0'))
              .plus(new BigN(vote.ayeAmount || '0'))
              .plus(new BigN(vote.nayAmount || '0'))
              .plus(new BigN(vote.abstainAmount || '0'));
          }, new BigN(0));

        if (allVotesUnlockable) {
          if (priorBlock.eq(0) || currentBlockNumber.gte(priorBlock)) {
            unlockableTrackIds.push(trackId);
          }
        } else if (activeVoteAmount.lt(balance)) {
          if (priorBlock.eq(0) || currentBlockNumber.gte(priorBlock)) {
            unlockableTrackIds.push(trackId);
          }
        }
      } else if (state === 'empty') {
        unlockableTrackIds.push(trackId);
      }
    }

    const actualTrackBalances = new Map<number, BigN>();

    for (const [trackId, balance] of trackBalances) {
      const state = trackStates.get(trackId) || 'empty';
      const votes = trackVotes.get(trackId) || [];

      if (state === 'casting') {
        const activeVoteAmount = votes
          .filter((vote) => !unlockableReferenda.has(vote.referendumIndex))
          .reduce((sum, vote) => {
            return sum
              .plus(new BigN(vote.amount || '0'))
              .plus(new BigN(vote.ayeAmount || '0'))
              .plus(new BigN(vote.nayAmount || '0'))
              .plus(new BigN(vote.abstainAmount || '0'));
          }, new BigN(0));

        if (activeVoteAmount.lt(balance)) {
          actualTrackBalances.set(trackId, balance.minus(activeVoteAmount));
        } else {
          actualTrackBalances.set(trackId, balance);
        }
      } else {
        actualTrackBalances.set(trackId, balance);
      }
    }

    // Sort by actual unlockable balances
    const sortedBalances = Array.from(actualTrackBalances.entries())
      .sort((a, b) => b[1].comparedTo(a[1]));

    let totalUnlockable = new BigN(0);

    if (unlockableTrackIds.length > 0) {
      const unlockableBalances = unlockableTrackIds
        .map((trackId) => trackBalances.get(trackId) || new BigN(0))
        .sort((a, b) => b.comparedTo(a));

      const maxUnlockableBalance = unlockableBalances[0];

      const lockedTracks = sortedBalances.filter(([trackId]) => !unlockableTrackIds.includes(trackId));

      const worstLockedBalance = lockedTracks.length > 0 ? lockedTracks[0][1] : new BigN(0);

      totalUnlockable = maxUnlockableBalance.minus(worstLockedBalance);

      if (totalUnlockable.lt(0)) {
        totalUnlockable = new BigN(0);
      }
    }

    return { unlockableTrackIds, totalUnlockable };
  }
}
