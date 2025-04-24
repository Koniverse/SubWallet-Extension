// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { TransactionData } from '@subwallet/extension-base/types';

import { _ReferendumInfo, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest } from './type';

interface Referendums {
  items: _ReferendumInfo[];
}

export default class OpenGovService {
  protected readonly state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  public async fetchReferendums (request: string): Promise<_ReferendumInfo[]> {
    const url = `https://${request}.subsquare.io/api/gov2/referendums?page=1&page_size=100`;

    const res = await fetch(url);
    const json = await res.json() as Referendums;

    return json.items;
  }

  public async handleStandardVote (request: StandardVoteRequest): Promise<TransactionData> {
    const substrateApi = this.state.getSubstrateApi(request.chain);

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
}
