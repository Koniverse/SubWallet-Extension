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
  args: Record<string, any>;
}

export type ReferendumDetail = {
  _id: string;
  referendumIndex: number;
  indexer: Record<string, any>;
  proposer: string;
  title: string;
  content: string;
  contentType: string;
  track: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  edited: boolean;
  state: Record<string, any>;
  stateSort: number;
  polkassemblyCommentsCount: number;
  polkassemblyId: number;
  polkassemblyPostType: string;
  contentHash: string;
  dataSource: string;
  polkassemblyContentHtml: string;
  contentSummary: Record<string, any>;
  allSpends: SpendItem[];
  isBoundDiscussion: boolean;
  isFinal: boolean;
  isTreasuryProposal: boolean;
  isTreasuryV1: boolean;
  onchainData: {
    proposalHash: string;
    timeline: TimelineItem[];
    proposal: Proposal
    info: {
      decisionDeposit: {
        amount: string;
        who: string;
      },
      submissionDeposit: {
        amount: string;
        who: string;
      }
      enactment: {
        after: string;
      }
    }
  };
  refToPost: Record<string, any>;
  rootPost: Record<string, any>;
  trackInfo: {
    confirmPeriod: number;
    decisionPeriod: number;
    name: string;
  };
  author: Record<string, any>;
  commentsCount: number;
  authors: string[];
  reactions: any[];
};

interface ProposalArg {
  name: string;
  type: string;
  value: any;
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

export type SpendItem = {
  isSpendLocal: boolean;
  assetKind: {
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
      v3: Record<string, any>;
    };
  };
  validFrom: number | null;
  after: any;
};

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
