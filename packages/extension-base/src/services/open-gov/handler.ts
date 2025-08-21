// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import { formatNumber } from '@subwallet/extension-base/utils/number';
import BigN from 'bignumber.js';

import { _SubstrateApi } from '../chain-service/types';
import { _getAssetDecimals } from '../chain-service/utils';
import { GovVoteRequest, GovVoteType, numberToConviction, RemoveVoteRequest, SplitAbstainVoteRequest, SplitVoteRequest, StandardVoteRequest, VotingFor } from './interface';

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
}
