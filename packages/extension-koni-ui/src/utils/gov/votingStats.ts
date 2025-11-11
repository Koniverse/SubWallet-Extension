// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { GovVoteSide, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';

export interface NestedAccount {
  accountInfo: ReferendumVoteDetail;
  totalDelegatedAccount: number;
  totalDelegatedVote: string;
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
  [GovVoteType.AYE]: VoteBucket;
  [GovVoteType.NAY]: VoteBucket;
  [GovVoteType.ABSTAIN]: VoteBucket;
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
    [GovVoteType.AYE]: initBucket(),
    [GovVoteType.NAY]: initBucket(),
    [GovVoteType.ABSTAIN]: initBucket()
  };

  // Build a map for quick lookup: account -> voter detail
  const votersByAccount = new Map<string, ReferendumVoteDetail>();

  for (const v of rawVotes) {
    votersByAccount.set(v.account, v);
  }

  const nestedMap: Record<string, NestedAccount> = {};

  // Helper to construct a vote entry for a side (AYE/NAY/ABSTAIN)
  const buildSideEntry = (
    voter: ReferendumVoteDetail,
    side: GovVoteType,
    votesBn: BigNumber,
    balanceBn?: BigNumber
  ): ReferendumVoteDetail => {
    const entry = {
      account: voter.account,
      votes: votesBn.toString(),
      balance: balanceBn?.toString() ?? voter.balance ?? '0',
      conviction: voter.conviction,
      aye: side === GovVoteType.AYE ? true : side === GovVoteType.NAY ? false : undefined
    };

    entry.votes = votesBn.toString();

    if (balanceBn !== undefined) {
      entry.balance = balanceBn.toString();
    } else {
      entry.balance = (entry.balance ?? '0');
    }

    if (side === GovVoteType.AYE) {
      entry.aye = true;
    } else if (side === GovVoteType.NAY) {
      entry.aye = false;
    } else {
      delete entry.aye;
    }

    return entry as ReferendumVoteDetail;
  };

  // Add a voter to flattened list and update totals
  const addFlattened = (side: GovVoteSide, sideEntry: ReferendumVoteDetail, amountBn: BigNumber) => {
    if (amountBn.lt(0)) {
      return;
    }

    result[side].accounts.flattened.push(sideEntry);
    result[side].totalVotedAccounts++;

    result[side].totalVotedAmount = new BigNumber(result[side].totalVotedAmount)
      .plus(amountBn)
      .toString();
  };

  for (const voter of rawVotes) {
    if (voter.isDelegating && voter.target) {
      const delegatorVotesBn = new BigNumber(voter.votes || 0);

      // Update nested map for the target account
      if (delegatorVotesBn.gt(0)) {
        const target = voter.target;

        if (!nestedMap[target]) {
          nestedMap[target] = {
            accountInfo: votersByAccount.get(target) ?? ({ account: target } as ReferendumVoteDetail),
            totalDelegatedAccount: 0,
            totalDelegatedVote: '0',
            delegatedAccount: []
          };
        }

        nestedMap[target].delegatedAccount.push(voter);
        nestedMap[target].totalDelegatedAccount++;
        nestedMap[target].totalDelegatedVote = new BigNumber(nestedMap[target].totalDelegatedVote)
          .plus(delegatorVotesBn)
          .toString();
      }

      // If not split, also add delegator to flattened (self-vote for display)
      if (!voter.isSplit && !voter.isSplitAbstain) {
        const side = voter.aye === true ? GovVoteType.AYE : voter.aye === false ? GovVoteType.NAY : GovVoteType.AYE;
        const sideEntry = buildSideEntry(voter, side, delegatorVotesBn, new BigNumber(voter.balance || 0));

        addFlattened(side, sideEntry, delegatorVotesBn);
      }
    }
  }

  // Handle non-delegating voters
  for (const voter of rawVotes) {
    if (voter.isDelegating && voter.target) {
      continue;
    }

    // Split-abstain voters: distribute votes to AYE/NAY/ABSTAIN
    if (voter.isSplitAbstain) {
      const ayeVotesBn = new BigNumber(voter.ayeVotes || 0);
      const nayVotesBn = new BigNumber(voter.nayVotes || 0);
      const abstainVotesBn = new BigNumber(voter.abstainVotes || 0);

      const ayeBalanceBn = new BigNumber(voter.ayeBalance || 0);
      const nayBalanceBn = new BigNumber(voter.nayBalance || 0);
      const abstainBalanceBn = new BigNumber(voter.abstainBalance || 0);

      if (ayeVotesBn.gt(0)) {
        const sideEntry = buildSideEntry(voter, GovVoteType.AYE, ayeVotesBn, ayeBalanceBn);

        addFlattened(GovVoteType.AYE, sideEntry, ayeVotesBn);
      }

      if (nayVotesBn.gt(0)) {
        const sideEntry = buildSideEntry(voter, GovVoteType.NAY, nayVotesBn, nayBalanceBn);

        addFlattened(GovVoteType.NAY, sideEntry, nayVotesBn);
      }

      if (abstainVotesBn.gt(0)) {
        const sideEntry = buildSideEntry(voter, GovVoteType.ABSTAIN, abstainVotesBn, abstainBalanceBn);

        addFlattened(GovVoteType.ABSTAIN, sideEntry, abstainVotesBn);
      }

      continue;
    }

    // Split voters: distribute votes between AYE/NAY
    if (voter.isSplit) {
      const ayeVotesBn = new BigNumber(voter.ayeVotes || 0);
      const nayVotesBn = new BigNumber(voter.nayVotes || 0);

      const ayeBalanceBn = new BigNumber(voter.ayeBalance || 0);
      const nayBalanceBn = new BigNumber(voter.nayBalance || 0);

      if (ayeVotesBn.gt(0)) {
        const sideEntry = buildSideEntry(voter, GovVoteType.AYE, ayeVotesBn, ayeBalanceBn);

        addFlattened(GovVoteType.AYE, sideEntry, ayeVotesBn);
      }

      if (nayVotesBn.gt(0)) {
        const sideEntry = buildSideEntry(voter, GovVoteType.NAY, nayVotesBn, nayBalanceBn);

        addFlattened(GovVoteType.NAY, sideEntry, nayVotesBn);
      }

      continue;
    }

    // Standard voters (single choice)
    if (voter.isStandard) {
      const selfVotesBn = new BigNumber(voter.votes || 0);
      const delegatedVotesBn = new BigNumber(voter.delegations?.votes || 0);

      const selfBalanceBn = new BigNumber(voter.balance || 0);

      // Only add self votes to flattened list
      if (selfVotesBn.gt(0) || delegatedVotesBn.gt(0)) {
        const side = voter.aye === true
          ? GovVoteType.AYE
          : voter.aye === false
            ? GovVoteType.NAY
            : GovVoteType.AYE;

        const sideEntry = buildSideEntry(voter, side, selfVotesBn, selfBalanceBn);

        addFlattened(side, sideEntry, selfVotesBn);
      }
    }
  }

  // Aggregate nested votes for all accounts
  Object.values(nestedMap).forEach((nested) => {
    const targetEntry = nested.accountInfo;
    const selfVotesBn = new BigNumber(targetEntry?.votes || 0);

    // Add self votes to totalDelegatedVote
    if (selfVotesBn.gt(0)) {
      nested.totalDelegatedVote = new BigNumber(nested.totalDelegatedVote).plus(selfVotesBn).toString();
    }

    // Determine side for nested entry based on target or first delegator
    let side = GovVoteType.AYE;

    if (targetEntry.aye !== undefined) {
      side = targetEntry.aye === true ? GovVoteType.AYE : targetEntry.aye === false ? GovVoteType.NAY : GovVoteType.ABSTAIN;
    } else {
      const firstDelegatorWithSide = nested.delegatedAccount.find((d) => d.aye !== undefined);

      if (firstDelegatorWithSide) {
        side = firstDelegatorWithSide.aye === true ? GovVoteType.AYE : firstDelegatorWithSide.aye === false ? GovVoteType.NAY : GovVoteType.ABSTAIN;
      }
    }

    result[side].accounts.nested.push(nested);
  });

  return result;
}

// Get voting status for a given account
export const getAccountVoteStatus = (address: string, voteMap: Map<string, ReferendumVoteDetail>): GovVoteStatus => {
  const voteDetail = voteMap.get(address.toLowerCase());

  if (!voteDetail) {
    return GovVoteStatus.NOT_VOTED;
  }

  return voteDetail.isDelegating ? GovVoteStatus.DELEGATED : GovVoteStatus.VOTED;
};
