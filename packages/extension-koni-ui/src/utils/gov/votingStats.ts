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

  const votersByAccount = new Map<string, ReferendumVoteDetail>();

  for (const v of rawVotes) {
    votersByAccount.set(v.account, v);
  }

  const nestedMap: Record<string, NestedAccount> = {};

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

  const addFlattened = (side: GovVoteSide, sideEntry: ReferendumVoteDetail, amountBn: BigNumber) => {
    if (amountBn.lt(0)) {
      return;
    }

    result[side].accounts.flattened.push(sideEntry);
    result[side].totalVotedAccounts++;
    result[side].totalVotedAmount = new BigNumber(result[side].totalVotedAmount).plus(amountBn).toString();
  };

  for (const voter of rawVotes) {
    if (voter.isDelegating && voter.target) {
      const delegatorVotesBn = new BigNumber(voter.votes || 0);

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

      if (!voter.isSplit && !voter.isSplitAbstain) {
        const side = voter.aye === true ? GovVoteType.AYE : voter.aye === false ? GovVoteType.NAY : GovVoteType.AYE;
        const sideEntry = buildSideEntry(voter, side, delegatorVotesBn, new BigNumber(voter.balance || 0));

        addFlattened(side, sideEntry, delegatorVotesBn);
      }
    }
  }

  for (const voter of rawVotes) {
    if (voter.isDelegating && voter.target) {
      continue;
    }

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

    if (voter.isStandard) {
      const selfVotesBn = new BigNumber(voter.votes || 0);
      const delegatedVotesBn = new BigNumber(voter.delegations?.votes || 0);
      const delegatedCapitalBn = new BigNumber(voter.delegations?.capital || 0);
      const selfBalanceBn = new BigNumber(voter.balance || 0);

      let finalVotesBn = selfVotesBn;
      let finalBalanceBn = selfBalanceBn;

      if (delegatedVotesBn.gt(0)) {
        finalVotesBn = selfVotesBn.plus(delegatedVotesBn);
        finalBalanceBn = selfBalanceBn.plus(delegatedCapitalBn);

        if (!nestedMap[voter.account]) {
          nestedMap[voter.account] = {
            accountInfo: votersByAccount.get(voter.account) ?? ({ account: voter.account } as ReferendumVoteDetail),
            totalDelegatedAccount: 0,
            totalDelegatedVote: delegatedVotesBn.toString(),
            delegatedAccount: []
          };
        } else {
          nestedMap[voter.account].totalDelegatedVote = new BigNumber(nestedMap[voter.account].totalDelegatedVote)
            .plus(delegatedVotesBn)
            .toString();
        }
      }

      if (finalVotesBn.gt(0)) {
        const side = voter.aye === true ? GovVoteType.AYE : voter.aye === false ? GovVoteType.NAY : GovVoteType.AYE;
        const sideEntry = buildSideEntry(voter, side, finalVotesBn, finalBalanceBn);

        addFlattened(side, sideEntry, finalVotesBn);
      }
    }
  }

  Object.values(nestedMap).forEach((nested) => {
    const targetEntry = nested.accountInfo;
    const selfVotesBn = new BigNumber(targetEntry?.votes || 0);

    if (selfVotesBn.gt(0)) {
      nested.totalDelegatedVote = new BigNumber(nested.totalDelegatedVote).plus(selfVotesBn).toString();
    }

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

export const getAccountVoteStatus = (address: string, voteMap: Map<string, ReferendumVoteDetail>): GovVoteStatus => {
  const voteDetail = voteMap.get(address.toLowerCase());

  if (!voteDetail) {
    return GovVoteStatus.NOT_VOTED;
  }

  return voteDetail.isDelegating ? GovVoteStatus.DELEGATED : GovVoteStatus.VOTED;
};
