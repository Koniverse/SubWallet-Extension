// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';

import { _DelegateInfo, _ReferendumInfo, DelegateRequest, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest, UnlockVoteRequest } from './type';

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
      return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    const referendums = await res.json() as Referendums;

    if (!referendums || !Array.isArray(referendums.items)) {
      return [];
    }

    return referendums.items;
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

    const delegateExtrinsics = request.trackIds.map((trackId) => {
      return api.api.tx.convictionVoting.delegate(
        trackId,
        request.delegateAddress,
        numberToConviction[request.conviction],
        request.balance
      );
    }).filter((tx) => tx !== null);

    const batchTx = api.api.tx.utility.batch([...delegateExtrinsics]);

    return batchTx;
  }
}
