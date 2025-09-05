// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';

export interface NestedAccount {
  address: string;
  totalDelegatedAccount: number;
  totalDelegatedAmount: string;
  delegatedAccount: ReferendumVoteDetail[];
}

export interface VoteBucket {
  totalVotedAmount: string;
  totalVotedAccounts: number;

  accounts: {
    nested: NestedAccount[];
    flattened: ReferendumVoteDetail[];
  };
}

export interface ReferendumVoteResult {
  ayes: VoteBucket;
  nays: VoteBucket;
  abstains: VoteBucket;
}

export function formatVoteResult (rawVotes: ReferendumVoteDetail[]): ReferendumVoteResult {
  const initBucket = (): VoteBucket => ({
    totalVotedAmount: '0',
    totalVotedAccounts: 0,
    accounts: {
      nested: [],
      flattened: []
    }
  });

  const result: ReferendumVoteResult = {
    ayes: initBucket(),
    nays: initBucket(),
    abstains: initBucket()
  };

  const nestedMap: Record<string, NestedAccount> = {};

  for (const voter of rawVotes) {
    if (voter.isDelegating && voter.target && BigNumber(voter.votes).gt(0)) {
      const target = voter.target;

      if (!nestedMap[target]) {
        nestedMap[target] = {
          address: target,
          totalDelegatedAccount: 0,
          totalDelegatedAmount: '0',
          delegatedAccount: []
        };
      }

      nestedMap[target].delegatedAccount.push(voter);
      nestedMap[target].totalDelegatedAccount++;
      nestedMap[target].totalDelegatedAmount = new BigNumber(
        nestedMap[target].totalDelegatedAmount
      )
        .plus(voter.votes)
        .toString();

      continue;
    } else if (voter.isSplitAbstain) {
      if (voter.ayeVotes && new BigNumber(voter.ayeVotes).gt(0)) {
        result.ayes.accounts.flattened.push(voter);
        result.ayes.totalVotedAccounts++;
        result.ayes.totalVotedAmount = new BigNumber(result.ayes.totalVotedAmount)
          .plus(voter.ayeVotes)
          .toString();
      }

      if (voter.nayVotes && new BigNumber(voter.nayVotes).gt(0)) {
        result.nays.accounts.flattened.push(voter);
        result.nays.totalVotedAccounts++;
        result.nays.totalVotedAmount = new BigNumber(result.nays.totalVotedAmount)
          .plus(voter.nayVotes)
          .toString();
      }

      if (voter.abstainVotes && new BigNumber(voter.abstainVotes).gt(0)) {
        result.abstains.accounts.flattened.push(voter);
        result.abstains.totalVotedAccounts++;
        result.abstains.totalVotedAmount = new BigNumber(result.abstains.totalVotedAmount)
          .plus(voter.abstainVotes)
          .toString();
      }
    } else if (voter.isSplit) {
      if (voter.ayeVotes && new BigNumber(voter.ayeVotes).gt(0)) {
        result.ayes.accounts.flattened.push(voter);
        result.ayes.totalVotedAccounts++;
        result.ayes.totalVotedAmount = new BigNumber(result.ayes.totalVotedAmount)
          .plus(voter.ayeVotes)
          .toString();
      }

      if (voter.nayVotes && new BigNumber(voter.nayVotes).gt(0)) {
        result.nays.accounts.flattened.push(voter);
        result.nays.totalVotedAccounts++;
        result.nays.totalVotedAmount = new BigNumber(result.nays.totalVotedAmount)
          .plus(voter.nayVotes)
          .toString();
      }
    } else if (voter.isStandard) {
      const selfVotes = new BigNumber(voter.votes);
      const delegatedVotes = new BigNumber(voter.delegations?.votes || 0);
      const totalVotes = selfVotes.plus(delegatedVotes);

      if (totalVotes.gt(0)) {
        if (voter.aye) {
          result.ayes.accounts.flattened.push(voter);
          result.ayes.totalVotedAccounts++;
          result.ayes.totalVotedAmount = new BigNumber(result.ayes.totalVotedAmount)
            .plus(totalVotes)
            .toString();
        } else {
          result.nays.accounts.flattened.push(voter);
          result.nays.totalVotedAccounts++;
          result.nays.totalVotedAmount = new BigNumber(result.nays.totalVotedAmount)
            .plus(totalVotes)
            .toString();
        }
      }
    }
  }

  Object.values(nestedMap).forEach((nested) => {
    const side = nested.delegatedAccount[0]?.aye === true ? 'ayes' : 'nays';

    result[side].accounts.nested.push(nested);
    result[side].totalVotedAccounts += nested.totalDelegatedAccount;
    result[side].totalVotedAmount = new BigNumber(
      result[side].totalVotedAmount
    )
      .plus(nested.totalDelegatedAmount)
      .toString();
  });

  return result;
}
