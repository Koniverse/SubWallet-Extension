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
}

export interface StandardVoteRequest extends BaseVoteRequest {
  type: GovVoteType.AYE | GovVoteType.NAY;
  amount: string;
  conviction: number;
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

export interface RemoveVoteRequest {
  address: string;
  chain: string;
  trackId: number;
  referendumIndex: string;
}

export interface VotingFor {
  casting?: {
    prior: [string, string];
    votes?: [string, unknown][];
  };
  delegating?: {
    prior: [string, string];
    target: string;
    balance: string;
    conviction: Conviction
  };
}
