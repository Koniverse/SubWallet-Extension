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

export interface ReferendaResponse {
  items: Referendum[];
  total: number;
}

export interface ReferendaQueryParams {
  page?: number;
  pageSize?: number;
  is_treasury?: boolean;
  ongoing?: boolean;
  status?: string;
  simple?: boolean;
}
