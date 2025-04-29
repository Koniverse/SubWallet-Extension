// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

import { _DelegateInfo, _ReferendumInfo, DelegateRequest, GetAbstainTotalRequest, GetLockedBalanceRequest, Gov2Vote, LockedDetail, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest, UndelegateRequest, UnlockBalanceRequest, UnlockVoteRequest, VotingFor } from './type';

interface Referendums {
  items: _ReferendumInfo[];
}

interface Delegates{
  items: _DelegateInfo[];
}
export default class OpenGovService {
  protected readonly state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  public async fetchReferendums (chain: string): Promise<_ReferendumInfo[]> {
    const url = `https://${chain}.subsquare.io/api/gov2/referendums?page=1&page_size=100`;

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
    const substrateApi = this.state.getSubstrateApi(request.chain); // Todo: refactor to get this one time

    const api = await substrateApi.isReady;

    const extrinsic = api.api.tx.convictionVoting.vote(
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
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const extrinsic = api.api.tx.convictionVoting.vote(
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
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const extrinsic = api.api.tx.convictionVoting.removeVote(
      request.trackId,
      request.referendumIndex
    );

    return extrinsic;
  }

  public async handleUnlockVote (request: UnlockVoteRequest): Promise<TransactionData> {
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const extrinsic = api.api.tx.convictionVoting.unlock(
      request.trackId,
      request.target
    );

    return extrinsic;
  }

  public async fetchDelegates (chain: string): Promise<_DelegateInfo[]> {
    const url = `https://${chain}.subsquare.io/api/delegation/referenda/delegates?sort=&page=1&page_size=100`;

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
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const tx = request.trackIds.map((trackId) => {
      return api.api.tx.convictionVoting.delegate(
        trackId,
        request.delegateAddress,
        numberToConviction[request.conviction],
        request.balance
      );
    }).filter((tx) => tx !== null);

    const batchTx = api.api.tx.utility.batch([...tx]);

    return batchTx;
  }

  public async handleUndelegate (request: UndelegateRequest): Promise<TransactionData> {
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const tx = request.trackIds.map((trackId) => {
      return api.api.tx.convictionVoting.undelegate(
        trackId
      );
    }).filter((tx) => tx !== null);

    const batchTx = api.api.tx.utility.batch([...tx]);

    return batchTx;
  }

  public async getLockedBalance (request: GetLockedBalanceRequest): Promise<LockedDetail[]> {
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const currentBlock = (await api.api.query.system.number()).toNumber();

    const classLockedRaw = await api.api.query.convictionVoting.classLocksFor(request.address);
    const classLocked = classLockedRaw.toPrimitive() as [number, string][];

    const lockedDetails = [];

    for (const [trackId, _] of classLocked) {
      const locked = (await api.api.query.convictionVoting.votingFor(request.address, trackId)).toPrimitive() as VotingFor;

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
    const substrateApi = this.state.getSubstrateApi(request.chain);
    const api = await substrateApi.isReady;

    const tx = request.trackIds.map((trackId) => {
      return api.api.tx.convictionVoting.unlock(
        trackId,
        request.address
      );
    }).filter((tx) => tx !== null);

    const batchTx = api.api.tx.utility.batch([...tx]);

    return batchTx;
  }
}
