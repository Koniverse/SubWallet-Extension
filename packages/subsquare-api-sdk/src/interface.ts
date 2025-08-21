// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Referendum {
  referendumIndex: number;
  proposer: string;
  title: string;
  content: string;

  decisionDeposit: {
    who: string;
  };

  trackInfo: {
    id: number;
    name: string;
    decisionPeriod: string; // block -> need convert to day
    confirmPeriod: string; // block -> need convert to day
  }

  enactment: {
    after: string; // block
  }

  proposalHash: string;
  proposalCall: {
    section: string;
    method: string;
  };

  state: {
    name: string;
    indexer: {
      blockTime: number;
      blockHeight: number;
    }
  };

  onchainData: {
    info: {
      alarm: number[]
    }
  };
}

export interface ReferendumDetail {
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

export interface SpendItem {
  isSpendLocal: boolean;
  symbol?: string;
  assetKind?: {
    chain: string;
    type: string;
    symbol: string;
  };
  amount: string;
  beneficiary: {
    chain: string;
    address: string;
    pubKey: string;
  };
  beneficiaryLocation: {
    name: string;
    type: string;
    value: {
      v3: Record<string, unknown>;
    };
  };
  validFrom: number | null;
  after: unknown;
}

export interface TimelineItem {
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
  args: Record<string, unknown>;
}

export interface Tally {
  ayes: string;
  nays: string;
  electorate: string;
  support: string;
}

interface Proposal {
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
  confirmPeriod: number;
  decisionPeriod: number;
  name: string;
  minApproval?: MinApproval;
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
  alarm: number[]
}

interface Indexer {
  blockHeight: number;
  blockHash: string;
  index: number;
  blockTime: number;
}
interface OnchainState {
  indexer: Indexer;
  name: string;
}

interface OnchainData {
  proposalHash: string;
  timeline: TimelineItem[];
  tally: Tally;
  proposal: Proposal;
  info: OnchainInfo;
  state?: OnchainState;
}

export interface ReferendaResponse {
  items: Referendum[];
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

/* ReferendumVote */

export interface ReferendumVote {
  referendumIndex: number;
  account: string;
  isDelegating: boolean;
  isStandard: boolean;
  isSplit: boolean;
  isSplitAbstain: boolean;
  balance: string;
  aye: boolean;
  conviction: number;
  votes: string;
  delegations: {
    votes: string;
    capital: string;
  };
  queryAt: number;
}

/* ReferendumVote */
