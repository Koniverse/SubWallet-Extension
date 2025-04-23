// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { Conviction } from '@polkadot/types/interfaces';

export interface StandardVoteRequest {
  aye: boolean;
  conviction: Conviction;
  balance: string;
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
  }
}
