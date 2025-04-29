// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export interface GetAbstainTotalRequest {
  chain: string;
  referendumIndex: number;
}

export interface StandardVoteRequest {
  address: string,
  chain: string,
  referendumIndex: number;
  aye: boolean;
  conviction: number;
  balance: string;
}

export interface SplitAbstainRequest{
  address: string,
  chain: string,
  aye: string,
  nay: string,
  abstain: string
}

export enum Conviction {
  None = 'None',
  Locked1x = 'Locked1x',
  Locked2x = 'Locked2x',
  Locked3x = 'Locked3x',
  Locked4x = 'Locked4x',
  Locked5x = 'Locked5x',
  Locked6x = 'Locked6x'
}

export const numberToConviction: Record<number, Conviction> = {
  0: Conviction.None,
  1: Conviction.Locked1x,
  2: Conviction.Locked2x,
  3: Conviction.Locked3x,
  4: Conviction.Locked4x,
  5: Conviction.Locked5x,
  6: Conviction.Locked6x
};

export interface SplitAbstainVoteRequest {
  address: string;
  chain: string;
  referendumIndex: number;
  aye: string;
  nay: string;
  abstain: string;
}

export interface RemoveVoteRequest {
  address: string;
  chain: string;
  trackId: number;
  referendumIndex: number;
}

export interface UnlockVoteRequest {
  address: string;
  chain: string;
  trackId: number;
  target: string;
}

export interface _ReferendumInfo {
  _id: string;
  referendumIndex: number;
  title: string;
  content: string;
  polkassemblyContentHtml: string;
  track: number;
  createdAt: string;
  updatedAt: string;
  state: {
    name: string;
    indexer: {
      blockTime: number;
      blockHeight: number;
    }
  };
  trackInfo: {
    confirmPeriod: number;
    decisionPeriod: number;
    name: string;
    confirming: number;
  };
  lastConfirmStartedAt?: {
    blockTime: number;
    blockHeight: number;
    alarm: number[]
  };
  onchainData: {
    info: {
      alarm: number[]
    }
  };

}

export interface Gov2Vote {
  referendumIndex: number;
  account: string;
  isDelegating: boolean;
  isStandard: boolean;
  isSplit: boolean;
  isSplitAbstain: boolean;
  conviction: number;

  // isStandard = true
  balance?: string;
  aye?: boolean;
  votes?: string;

  // isSplitAbstain = true
  abstainBalance?: string;
  abstainVotes?: string;
  ayeBalance?: string;
  ayeVotes?: string;
  nayBalance?: string;
  nayVotes?: string;

  // isDelegating = true
  delegations: {
    votes: string;
    capital: string;
  };

  queryAt: number;
}

export interface _EnhancedReferendumInfo extends _ReferendumInfo {
  endTime: number;
}

// Delegate
export interface _DelegateInfo {
  address: string
  delegatorsCount: number,
  votes: string,
  manifesto?: {
    source: string;
    name: string;
    image: string;
    shortDescription: string;
    longDescription: string;
    isOrganization: boolean
  }
}

export interface DelegateRequest {
  address: string,
  chain: string,
  trackIds: number[];
  conviction: number;
  balance: string;
  delegateAddress: string
  removeOtherTracks: boolean
}

export interface UndelegateRequest {
  address: string,
  chain: string,
  trackIds: number[];
}

export interface GetLockedBalanceRequest {
  chain: string,
  address: string
}

export interface UnlockBalanceRequest {
  address: string,
  chain: string,
  trackIds: number[];
}

export interface VotingFor {
  casting?: {
    prior: [string, string];
    votes?: [string, unknown][];
  };
  delegating?: {
    prior: [string, string];
    target: string;
  };
}

export interface LockedDetail {
  trackId: number;
  locked: VotingFor;
  expireIn: string;
}
