// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, BlockHeader, TransactionData } from '@subwallet/extension-base/types';
import { formatNumber } from '@subwallet/extension-base/utils/number';
import BigN from 'bignumber.js';
import { combineLatest, merge, mergeMap } from 'rxjs';

import { _EXPECTED_BLOCK_TIME } from '../chain-service/constants';
import { _SubstrateApi } from '../chain-service/types';
import { _getAssetDecimals } from '../chain-service/utils';
import { Conviction, convictionToDays, GovDelegationDetail, GovTrackVoting, GovVoteDetail, GovVoteRequest, GovVoteType, GovVotingInfo, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, SplitVoteRequest, StandardVoteRequest, UnlockingReferendaData, UnlockVoteRequest, Vote, VotingFor } from './interface';

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

    const earlyError = await this.validateSplitAbstainAmount(request.address, request.ayeAmount, request.nayAmount);

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

    const earlyError = await this.validateSplitAbstainAmount(request.address, request.ayeAmount, request.nayAmount, request.abstainAmount);

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
    const totalBalance = await this.state.balanceService.getTotalBalance(address, this.chain);

    if (!balance) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, ('Amount is required'));
    }

    const bnBalance = new BigN(balance);

    if (bnBalance.gt(totalBalance.value)) {
      const chainAsset = this.state.chainService.getNativeTokenInfo(this.chain);
      const maxString = formatNumber(totalBalance.value, _getAssetDecimals(chainAsset));

      const msg = maxString !== '0'
        ? `Amount must be equal or less than ${maxString}`
        : 'You need balance greater than 0 to continue';

      return new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, msg);
    }

    if (conviction < 0 || conviction > 6) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Invalid conviction');
    }

    return null;
  }

  private async validateSplitAbstainAmount (
    address: string,
    aye: string,
    nay: string,
    abstain?: string
  ): Promise<TransactionError | null> {
    if (!nay || !aye) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount is required');
    }

    const values = [new BigN(aye), new BigN(nay), new BigN(abstain ?? '0')];

    if (values.some((v) => v.lt(0))) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'All values must be greater than 0');
    }

    const total = values.reduce((acc, val) => acc.plus(val), new BigN(0));

    const transferableBalance = await this.state.balanceService.getTransferableBalance(address, this.chain);

    if (total.gt(transferableBalance.value)) {
      const chainAsset = this.state.chainService.getNativeTokenInfo(this.chain);
      const maxString = formatNumber(transferableBalance.value, _getAssetDecimals(chainAsset));

      return new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, `Amount must be equal or less than ${maxString}`);
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

          const classLocksArray = classLocks.toPrimitive() as [number, string][];

          for (const [trackId, balance] of classLocksArray) {
            const bnBalance = new BigN(balance);

            trackBalances.set(trackId, bnBalance);
            totalLocked = BigN.max(totalLocked, bnBalance);
          }

          const currentBlockInfo = await substrateApi.api.rpc.chain.getHeader();
          const currentBlockNumber = (currentBlockInfo.toPrimitive() as unknown as BlockHeader).number;

          for (const [key, voting] of votingEntries) {
            const trackId = key.args[1].toPrimitive() as number;
            const v = voting.toPrimitive() as VotingFor;

            if (v.delegating) {
              trackStates.set(trackId, 'delegating');
              const delegation: GovDelegationDetail = {
                balance: v.delegating.balance.toString(),
                target: v.delegating.target,
                conviction: v.delegating.conviction
              };

              tracks.push({ trackId, delegation });
            } else if (v.casting) {
              trackStates.set(trackId, 'casting');
              const { unlockingReferenda: trackUnlocking, votes } = await this.parseVotesAndCheckFinished(
                v.casting.votes || [],
                unlockableReferenda,
                currentBlockNumber,
                substrateApi
              );

              unlockingReferenda.push(...trackUnlocking);
              trackVotes.set(trackId, votes);

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

          const { totalUnlockable, unlockableTrackIds } = this.calculateUnlockAmounts(
            trackBalances,
            trackStates,
            unlockableReferenda,
            trackVotes,
            trackPriorBlocks,
            new BigN(currentBlockNumber)
          );

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

        if (!referendum.isOngoing) {
          const referendumInfo = referendum.toJSON() as Record<string, unknown>;

          // 0x can unlock immediately
          if (voteDetail.conviction === Conviction.None) {
            unlockableReferenda.add(refIndex.toString());

            return;
          }

          const statusKey = Object.keys(referendumInfo)[0];
          const statusVal = referendumInfo[statusKey] as unknown[];
          const endBlock = statusVal[0] as string | number;

          if (endBlock) {
            const lockBlocks = this.lockPeriod(convictionToDays[voteDetail.conviction]);
            const unlockBlock = new BigN(endBlock).plus(lockBlocks);
            const canUnlock = new BigN(currentBlockNumber).gte(unlockBlock);

            const shouldUnlock = referendum.isApproved
              ? (voteDetail.type === GovVoteType.NAY || canUnlock)
              : (voteDetail.type === GovVoteType.AYE || canUnlock);

            if (shouldUnlock) {
              unlockableReferenda.add(refIndex.toString());
            } else {
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
