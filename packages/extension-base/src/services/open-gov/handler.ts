// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';

import { _SubstrateApi } from '../chain-service/types';
import { _DelegateInfo, _ReferendumInfo, DelegateRequest, GetAbstainTotalRequest, GetLockedBalanceRequest, Gov2Vote, LockedDetail, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest, UndelegateRequest, UnlockBalanceRequest, UnlockVoteRequest, VotingFor } from './type';

interface Referendums {
  items: _ReferendumInfo[];
}

interface Delegates{
  items: _DelegateInfo[];
}
export default abstract class BaseOpenGovHandler {
  protected readonly state: KoniState;
  protected readonly chain: string;

  constructor (state: KoniState, chain: string) {
    this.state = state;
    this.chain = chain;
  }

  protected get substrateApi (): _SubstrateApi {
    return this.state.getSubstrateApi(this.chain);
  }

  public async fetchReferendums (): Promise<_ReferendumInfo[]> {
    const url = `https://${this.chain}.subsquare.io/api/gov2/referendums?page=1&page_size=100`;

    const res = await fetch(url);

    if (!res.ok) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const referendums = await res.json() as Referendums;

    if (!referendums || !Array.isArray(referendums.items)) {
      return [];
    }

    return referendums.items;
  }

  public async getAbstainTotal (request: GetAbstainTotalRequest): Promise<string> {
    const url = `https://${request.chain}.subsquare.io/api/gov2/referenda/${request.referendumIndex}/votes`;

    const res = await fetch(url);

    if (!res.ok) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const votes = await res.json() as Gov2Vote[];

    let totalAbstain = new BigN(0);

    for (const vote of votes) {
      console.log('vote', [request.referendumIndex, vote]);

      if (vote.isSplitAbstain && vote.abstainVotes) {
        totalAbstain = totalAbstain.plus(vote.abstainVotes);
      }
    }

    return totalAbstain.toString();
  }

  public async handleStandardVote (request: StandardVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const extrinsic = substrateApi.api.tx.convictionVoting.vote(
      request.referendumIndex,
      {
        Standard: {
          vote: {
            aye: request.aye,
            conviction: numberToConviction[request.conviction]
          },
          balance: request.balance
        }
      }
    );

    return extrinsic;
  }

  public async handleSplitAbstainVote (request: SplitAbstainVoteRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const extrinsic = substrateApi.api.tx.convictionVoting.vote(
      request.referendumIndex,
      {
        SplitAbstain: {
          aye: request.aye,
          nay: request.nay,
          abstain: request.abstain
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

    const extrinsic = substrateApi.api.tx.convictionVoting.unlock(
      request.trackId,
      request.target
    );

    return extrinsic;
  }

  public async fetchDelegates (): Promise<_DelegateInfo[]> {
    const url = `https://${this.chain}.subsquare.io/api/delegation/referenda/delegates?sort=&page=1&page_size=100`;

    const res = await fetch(url);

    if (!res.ok) {
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    const delegates = await res.json() as Delegates;

    if (!delegates || !Array.isArray(delegates.items)) {
      return [];
    }

    return delegates.items;
  }

  public async handleDelegate (request: DelegateRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const tx = request.trackIds.map((trackId) => {
      return substrateApi.api.tx.convictionVoting.delegate(
        trackId,
        request.delegateAddress,
        numberToConviction[request.conviction],
        request.balance
      );
    }).filter((tx) => tx !== null);

    const batchTx = substrateApi.api.tx.utility.batch([...tx]);

    return batchTx;
  }

  public async handleUndelegate (request: UndelegateRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const tx = request.trackIds.map((trackId) => {
      return substrateApi.api.tx.convictionVoting.undelegate(
        trackId
      );
    }).filter((tx) => tx !== null);

    const batchTx = substrateApi.api.tx.utility.batch([...tx]);

    return batchTx;
  }

  public async handleEditDelegate (request: DelegateRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;

    const lockedDetails = await this.getLockedBalance({ chain: request.chain, address: request.address });

    const tx: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

    const requestConviction = numberToConviction[request.conviction];
    const requestBalance = new BigN(request.balance);

    for (const trackId of request.trackIds) {
      const existed = lockedDetails.find((detail) => detail.trackId === trackId);

      const currentDelegate = existed?.locked?.delegating?.target;
      const currentConviction = existed?.locked?.delegating?.conviction;
      const currentBalance = new BigN(existed?.locked?.delegating?.balance || 0);

      const needUpdate = currentDelegate !== request.delegateAddress ||
        currentConviction !== requestConviction ||
        currentBalance.toString() !== requestBalance.toString();

      if (needUpdate && currentDelegate) {
        tx.push(substrateApi.api.tx.convictionVoting.undelegate(trackId));
      }

      if (needUpdate) {
        tx.push(substrateApi.api.tx.convictionVoting.delegate(
          trackId,
          request.delegateAddress,
          requestConviction,
          request.balance
        ));
      }
    }

    const requestTrackSet = new Set(request.trackIds);
    const tracksToUndelegate = lockedDetails
      .filter((detail) =>
        detail.locked?.delegating?.target === request.delegateAddress &&
        !requestTrackSet.has(detail.trackId)
      )
      .map((detail) => detail.trackId);

    for (const trackId of tracksToUndelegate) {
      tx.push(substrateApi.api.tx.convictionVoting.undelegate(trackId));
    }

    const batchTx = substrateApi.api.tx.utility.batch([...tx]);

    return batchTx;
  }

  public async getLockedBalance (request: GetLockedBalanceRequest): Promise<LockedDetail[]> {
    const substrateApi = await this.substrateApi.isReady;

    const currentBlock = (await substrateApi.api.query.system.number()).toNumber();

    const classLockedRaw = await substrateApi.api.query.convictionVoting.classLocksFor(request.address);
    const classLocked = classLockedRaw.toPrimitive() as [number, string][];

    const lockedDetails = [];

    for (const [trackId, _] of classLocked) {
      const locked = (await substrateApi.api.query.convictionVoting.votingFor(request.address, trackId)).toPrimitive() as VotingFor;

      let priorBlockNumber = new BigN(0);

      if (locked?.casting?.prior?.[0]) {
        priorBlockNumber = new BigN(locked.casting.prior[0]);
      } else if (locked?.delegating?.prior?.[0]) {
        priorBlockNumber = new BigN(locked.delegating.prior[0]);
      }

      const expireIn = priorBlockNumber.gt(0) ? priorBlockNumber.minus(currentBlock) : new BigN(0);

      lockedDetails.push({
        trackId,
        locked,
        expireIn: expireIn.toString()
      });
    }

    return lockedDetails;
  }

  public async handleUnlockBalance (request: UnlockBalanceRequest): Promise<TransactionData> {
    const substrateApi = await this.substrateApi.isReady;
    const tx = request.trackIds.map((trackId) => {
      return substrateApi.api.tx.convictionVoting.unlock(
        trackId,
        request.address
      );
    }).filter((tx) => tx !== null);

    const batchTx = substrateApi.api.tx.utility.batch([...tx]);

    return batchTx;
  }
}
