// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export enum GovVoteType {
  AYE = 'aye',
  NAY = 'nay',
  SPLIT = 'split',
  ABSTAIN = 'abstain',
}

interface BaseVoteRequest {
  chain: string;
  address: string;
  referendumIndex: string;
  trackId: number;
  conviction: number;
}

export interface StandardVoteRequest extends BaseVoteRequest {
  type: GovVoteType.AYE | GovVoteType.NAY;
  amount: string;
}

export interface SplitVoteRequest extends BaseVoteRequest {
  type: GovVoteType.SPLIT;
  ayeAmount: string;
  nayAmount: string;
}

export interface SplitAbstainVoteRequest extends BaseVoteRequest {
  type: GovVoteType.ABSTAIN;
  abstainAmount: string;
  ayeAmount: string;
  nayAmount: string;
}

export type GovVoteRequest = StandardVoteRequest | SplitVoteRequest | SplitAbstainVoteRequest;

export const govConvictionOptions = [
  { value: 0, label: '0.1x', description: 'No lockup' },
  { value: 1, label: '1x', description: '~7d' },
  { value: 2, label: '2x', description: '~14d' },
  { value: 3, label: '3x', description: '~28d' },
  { value: 4, label: '4x', description: '~56d' },
  { value: 5, label: '5x', description: '~112d' },
  { value: 6, label: '6x', description: '~224d' }
];

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

export const convictionToDays: Record<Conviction, number> = {
  [Conviction.None]: 0,
  [Conviction.Locked1x]: 7,
  [Conviction.Locked2x]: 14,
  [Conviction.Locked3x]: 28,
  [Conviction.Locked4x]: 56,
  [Conviction.Locked5x]: 112,
  [Conviction.Locked6x]: 224
};

export interface RemoveVoteRequest {
  address: string;
  chain: string;
  trackId: number;
  referendumIndex: string;
  amount?: string;
  ayeAmount?: string;
  nayAmount?: string;
  abstainAmount?: string;
  totalAmount: string;
  type?: GovVoteType
}

/* Lock inteface */

export interface StandardVote {
  standard: {
    vote: {
      conviction: Conviction;
      aye: boolean;
    };
    balance: string;
  };
}

export interface SplitVote {
  split: {
    aye: string;
    nay: string;
  };
}

export interface SplitAbstainVote {
  splitAbstain: {
    aye: string;
    nay: string;
    abstain: string;
  };
}

export type Vote = StandardVote | SplitVote | SplitAbstainVote;

// ----- Casting -----
export interface Casting {
  prior: [string, string];
  votes: [string, Vote][];
  delegations: {
    votes: string;
    capital: string;
  };
}

// ----- Delegating -----
export interface Delegating {
  prior: [string, string];
  target: string;
  balance: string;
  conviction: Conviction;
}

// ----- VotingFor -----
export interface VotingFor {
  casting?: Casting;
  delegating?: Delegating;
}

export interface UnlockingReferendaData{
  id?: string;
  balance: string;
  timestamp: number;
}

export interface GovVotingInfo {
  chain: string;
  address: string;
  summary: {
    delegated: string;
    voted: string;
    totalLocked: string;
    unlocking: {
      unlockingReferenda: UnlockingReferendaData[];
    };
    unlockable: {
      balance: string;
      trackIds: number[],
      unlockableReferenda: string[]
    };
  };
  tracks: GovTrackVoting[];
}

export interface GovTrackVoting {
  trackId: number;
  votes?: GovVoteDetail[];
  delegation?: GovDelegationDetail;
}

export interface GovVoteDetail {
  referendumIndex: string;
  type: GovVoteType;
  conviction: Conviction;
  amount?: string;
  ayeAmount?: string;
  nayAmount?: string;
  abstainAmount?: string;
}

export interface GovDelegationDetail {
  balance: string;
  target: string;
  conviction: Conviction;
}

// Unlock Vote
export interface UnlockVoteRequest {
  address: string;
  chain: string;
  trackIds: number[];
  referendumIds?: string[];
  amount: string;
}
