// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

// todo
export interface ApprovePendingTxRequest {
  multisigAddress: string;
  chain: string;
  threshold: number;
  signers: string[];
  maybeTimepoint?: {
    height: number;
    index: number;
  };
  callHash: string;
  maxWeight: {
    refTime: number,
    proofSize: number
  }
}

export interface ExecutePendingTxRequest {
  multisigAddress: string;
  chain: string;
  threshold: number;
  signers: string[];
  maybeTimepoint: {
    height: number;
    index: number;
  }
  callData: string;
  maxWeight: {
    refTime: number,
    proofSize: number
  }
}
