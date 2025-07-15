// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import { formatNumber } from '@subwallet/extension-base/utils/number';
import BigN from 'bignumber.js';

import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ISubmittableResult } from '@polkadot/types/types';

import { _SubstrateApi } from '../chain-service/types';
import { _getAssetDecimals } from '../chain-service/utils';
import { _DelegateInfo, _ReferendumInfo, DelegateRequest, GetAbstainTotalRequest, GetLockedBalanceRequest, Gov2Vote, LockedDetail, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest, Tracks, UndelegateRequest, UnlockBalanceRequest, VotingFor } from './interface';

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

  /* Referendum related actions */

  public async fetchReferendums (): Promise<_ReferendumInfo[]> {
    const chain = this.chain === 'paseoTest' ? 'paseo' : this.chain;
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
    const chain = this.chain === 'paseoTest' ? 'paseo' : this.chain;
    const url = `https://${chain}.subsquare.io/api/gov2/referenda/${request.referendumIndex}/votes`;

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

  /* Delegate related actions */

  public async fetchDelegates (): Promise<_DelegateInfo[]> {
    const chain = this.chain === 'paseoTest' ? 'paseo' : this.chain;
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

  /* Locked balance related actions */

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

    if (request.trackIds.length === 1) {
      const tx = substrateApi.api.tx.convictionVoting.unlock(
        request.trackIds[0],
        request.address
      );

      return tx;
    }

    const tx = request.trackIds.map((trackId) => {
      return substrateApi.api.tx.convictionVoting.unlock(
        trackId,
        request.address
      );
    }).filter((tx) => tx !== null);

    const batchTx = substrateApi.api.tx.utility.batch([...tx]);

    return batchTx;
  }

  /* Validate open-gov */

  public async validateReferendumDelegate (address: string, trackIds: number[]): Promise<TransactionError | null> {
    const substrateApi = await this.substrateApi.isReady;

    for (const trackId of trackIds) {
      const locked = (await substrateApi.api.query.convictionVoting.votingFor(address, trackId)).toPrimitive() as VotingFor;

      if (
        (locked?.delegating?.balance && new BigN(locked.delegating.balance).gt(0)) ||
        (locked?.casting?.votes && locked.casting.votes.length > 0)
      ) {
        return new TransactionError(
          BasicTxErrorType.INVALID_PARAMS,
          `Already delegating or voting on track ${trackId}`
        );
      }
    }

    return null;
  }

  public async validateConvictionAndBalance (address: string, balance: string, conviction: number): Promise<TransactionError | null> {
    const transferableBalance = await this.state.balanceService.getTransferableBalance(address, this.chain);

    if (!balance) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, ('Amount is required'));
    }

    const bnBalance = new BigN(balance);

    if (bnBalance.lte(0)) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0');
    }

    if (bnBalance.gt(transferableBalance.value)) {
      const chainAsset = this.state.chainService.getNativeTokenInfo(this.chain);
      const maxString = formatNumber(transferableBalance.value, _getAssetDecimals(chainAsset));

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

  public async validateSplitAbstainAmount (address: string, aye: string, nay: string, abstain: string): Promise<TransactionError | null> {
    if (!nay || !aye || !abstain) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, ('Amount is required'));
    }

    const values = [new BigN(aye), new BigN(nay), new BigN(abstain)];

    if (values.some((v) => v.lt(0))) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'All values must begreater than 0');
    }

    const total = values.reduce((acc, val) => acc.plus(val), new BigN(0));

    if (total.lte(0)) {
      return new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Total amount must be greater than 0');
    }

    const transferableBalance = await this.state.balanceService.getTransferableBalance(address, this.chain);

    if (total.gt(transferableBalance.value)) {
      const chainAsset = this.state.chainService.getNativeTokenInfo(this.chain);
      const maxString = formatNumber(transferableBalance.value, _getAssetDecimals(chainAsset));

      return new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, `Amount must be equal or less than ${maxString}`);
    }

    return null;
  }

  // get Tracks

  public async getTracks (): Promise<Tracks[]> {
    const substrateApi = await this.substrateApi.isReady;

    const rawTracks = substrateApi.api.consts.referenda.tracks.toJSON() as [number, { name: string }][];

    const tracks: Tracks[] = rawTracks.map(([id, info]) => ({
      id,
      name: info.name
    }));

    console.log('tracks', tracks);

    return tracks;
  }
}
