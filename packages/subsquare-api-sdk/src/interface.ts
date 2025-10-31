// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Referendum {
  _id: string;
  referendumIndex: number;
  proposer: string;
  title: string;
  content: string;
  version: number;

  decisionDeposit: {
    who: string;
  };

  trackInfo: TrackInfo;

  enactment: {
    after: string; // block
  }

  proposalHash: string;
  proposalCall: {
    section: string;
    method: string;
  };

  state: OnchainState;
  allSpends?: SpendItem[];
  onchainData: OnchainData;
}

export interface DemocracyReferendum {
  _id: string;
  referendumIndex: number;
  indexer: Indexer;
  contentType: string;
  track: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  edited: boolean;
  stateSort: number;
  polkassemblyCommentsCount: number;
  polkassemblyId: number;
  polkassemblyPostType: string;
  contentHash: string;
  dataSource: string;
  polkassemblyContentHtml: string;
  contentSummary: Record<string, unknown>;
  isBoundDiscussion: boolean;
  isFinal: boolean;
  refToPost: Record<string, unknown>;
  rootPost: Record<string, unknown>;
  author: Record<string, unknown>;
  commentsCount: number;
  authors: string[];
  reactions: unknown[];
  proposer: string;
  title: string;
  content: string;
  version: 1;
  state: GovStatusKey;
  onchainData: DemocracyOnchainData;
}

interface DemocracyMetadata {
  end: number; // block number
  threshold: string;
  delay: number; // block number
}

export interface DemocracyOnChainInfo {
  ongoing?: DemocracyReferendumOngoing ;
  finished?: DemocracyReferendumFinished
}

export interface DemocracyReferendumOngoing {
  end: number;
  proposal: {
    lookup: {
      hash: string;
      len: number;
    };
  };
  threshold: 'SuperMajorityApprove' | 'SuperMajorityAgainst' | 'SimpleMajority';
  delay: number;
  tally: Tally;
}

export interface DemocracyReferendumFinished {
  approved: boolean;
  end: number;
}

interface DemocracyOnchainData {
  timeline: RefTimelineItem[];
  proposer: string;
  hash: string;
  call: {
    args: ProposalArg[];
    callIndex: string;
    method: string;
    section: string;
  };
  info: DemocracyOnChainInfo;
  meta: DemocracyMetadata;
  tally: Tally;
  state: OnchainState;
  preImage: Proposal
}

export interface ReferendumDetail {
  version: number;
  _id: string;
  referendumIndex: number;
  indexer: Indexer;
  proposer: string;
  title: string;
  content: string;
  contentType: string;
  track: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  edited: boolean;
  state: OnchainState;
  stateSort: number;
  polkassemblyCommentsCount: number;
  polkassemblyId: number;
  polkassemblyPostType: string;
  contentHash: string;
  dataSource: string;
  polkassemblyContentHtml: string;
  contentSummary: Record<string, unknown>;
  allSpends?: SpendItem[];
  isBoundDiscussion: boolean;
  isFinal: boolean;
  isTreasuryProposal: boolean;
  isTreasuryV1: boolean;
  onchainData: OnchainData;
  refToPost: Record<string, unknown>;
  rootPost: Record<string, unknown>;
  trackInfo: TrackInfo;
  author: Record<string, unknown>;
  commentsCount: number;
  authors: string[];
  reactions: unknown[];
}

interface BaseSpendItem {
  isSpendLocal: boolean;
  amount: string;

  beneficiary: {
    chain: string;
    address: string;
    pubKey: string;
  };

  beneficiaryLocation?: {
    name: string;
    type: string;
    value: {
      v3?: {
        parents: number;
        interior: Record<string, unknown>;
      };
      v4?: {
        parents: number;
        interior: Record<string, unknown>;
      };
    };
  };

  validFrom?: number | null;
  after?: unknown;
}

interface LocalSpendItem extends BaseSpendItem {
  isSpendLocal: true;
  type: string;
  symbol: string;
}

interface RemoteSpendItem extends BaseSpendItem {
  isSpendLocal: false;
  assetKind: {
    chain: string;
    type: string;
    symbol: string;
  };
}

export type SpendItem = LocalSpendItem | RemoteSpendItem;
export interface RefTimelineItem {
  _id: string;
  referendumIndex: number;
  indexer: {
    blockHeight: number;
    blockHash: string;
    blockTime: number;
    extrinsicIndex?: number;
    eventIndex: number;
  };
  name: string; // "Submitted", "DecisionDepositPlaced", "DecisionStarted"

  // for legacy democracy referenda
  method: string;
  args: Record<string, unknown>;
}

export interface Tally {
  ayes: string;
  nays: string;
  electorate: string;
  support: string;
  turnout: string;
}

export interface Proposal {
  call: {
    args: ProposalArg[];
    callIndex: string;
    method: string;
    section: string;
  };
  indexer: {
    blockHeight: number;
    blockHash: string;
    blockTime: number; // timestamp ms
    extrinsicIndex?: number;
    eventIndex: number;
  };
  shorten: boolean;
}

interface ProposalArg {
  name: string;
  type: string;
  value: any;
}

interface Reciprocal {
  factor: number;
  xOffset: number;
  yOffset: number;
}

interface LinearDecreasing {
  ceil: number;
  floor: number;
  length: number;
}

interface MinApproval {
  reciprocal?: Reciprocal;
  linearDecreasing?: LinearDecreasing;
}
export interface TrackInfo {
  decisionPeriod: number; // block -> need convert to day
  confirmPeriod: number; // block -> need convert to day
  name: string;
  minApproval?: MinApproval;
  id: string;
}

interface OnchainInfo {
  decisionDeposit: {
    amount: string;
    who: string;
  };
  submissionDeposit: {
    amount: string;
    who: string;
  };
  enactment: {
    after: string;
  };
  deciding?: {
    since: number;
  };
  state?: {
    indexer?: {
      blockHeight?: number;
    };
  };
  alarm: number[];

  democracy?: DemocracyOnChainInfo
}

interface Indexer {
  blockHeight: number;
  blockHash: string;
  index: number;
  blockTime: number;
}

export interface OnchainState {
  indexer: Indexer;
  name: GovStatusKey;
}

export interface OnchainData {
  proposalHash: string;
  timeline: RefTimelineItem[];
  tally: Tally;
  proposal: Proposal;
  info: OnchainInfo;
  state?: OnchainState;
  meta?: DemocracyMetadata;
}

export interface ReferendaResponse {
  items: Referendum[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DemocracyReferendaResponse {
  items: DemocracyReferendum[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReferendaQueryParams {
  page?: number;
  page_size?: number;
  is_treasury?: boolean;
  ongoing?: boolean;
  status?: string;
  simple?: boolean;
}

export interface ReferendaQueryParamsWithTrack {
  page?: number;
  page_size?: number;
  ongoing?: boolean;
  status?: string;
  simple?: boolean;
}

export interface UserVotesParams {
  page?: number;
  page_size?: number;
  includes_title?: number;
}

/* ReferendumVote */

export interface ReferendumVoteDetail {
  referendumIndex: number;
  account: string;
  target?: string;
  isDelegating: boolean;
  isStandard: boolean;
  isSplit: boolean;
  isSplitAbstain: boolean;
  balance?: string;
  aye?: boolean;
  conviction: number;
  votes?: string;
  abstainBalance?: string,
  abstainVotes?: string,
  ayeBalance?: string,
  ayeVotes?: string,
  nayBalance?: string,
  nayVotes?: string,
  delegations?: {
    votes: string;
    capital: string;
  };
  queryAt: number;
}

/* ReferendumVote */

/* Gov Status */

export enum GovStatusKey {
  ALL = 'All',
  PREPARING = 'Preparing',
  DECIDING = 'Deciding',
  CONFIRMING = 'Confirming',
  QUEUEING = 'Queueing',
  APPROVED = 'Approved',
  EXECUTED = 'Executed', // gov-1, 2
  REJECTED = 'Rejected',
  TIMEDOUT = 'TimedOut', // gov-1, 2
  CANCELLED = 'Cancelled', // gov-1, 2
  KILLED = 'Killed',

  // gov-1
  STARTED = 'Started',
  PASSED = 'Passed',
  NOTPASSED = 'NotPassed'
}

export const GOV_PREPARING_STATES: GovStatusKey[] = [
  GovStatusKey.PREPARING,
  GovStatusKey.QUEUEING
];

export const GOV_ONGOING_STATES: GovStatusKey[] = [
  GovStatusKey.PREPARING,
  GovStatusKey.DECIDING,
  GovStatusKey.CONFIRMING,
  GovStatusKey.QUEUEING,
  GovStatusKey.STARTED
];

export const GOV_COMPLETED_STATES: GovStatusKey[] = [
  GovStatusKey.APPROVED,
  GovStatusKey.EXECUTED,
  GovStatusKey.REJECTED,
  GovStatusKey.TIMEDOUT,
  GovStatusKey.CANCELLED,
  GovStatusKey.KILLED,
  GovStatusKey.PASSED,
  GovStatusKey.NOTPASSED
];

export const GOV_COMPLETED_SUCCESS_STATES: GovStatusKey[] = [
  GovStatusKey.APPROVED,
  GovStatusKey.EXECUTED,
  GovStatusKey.PASSED
];

export const GOV_COMPLETED_FAILED_STATES: GovStatusKey[] = [
  GovStatusKey.REJECTED,
  GovStatusKey.TIMEDOUT,
  GovStatusKey.CANCELLED,
  GovStatusKey.KILLED,
  GovStatusKey.NOTPASSED
];

/* Gov Status */
