// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BaseRequestSign } from '@subwallet/extension-base/types';

export interface ApprovePendingTxRequest extends BaseRequestSign {
  address: string; // Multisig address
  chain: string; // Chain slug
  threshold: number; // Number of required signatures
  otherSignatories: string[]; // List of other signers (excluding the caller)
  timepoint?: {
    height: number;
    index: number;
  }; // Optional timepoint for existing call
  callHash: string; // Hash of the call to approve
  maxWeight?: string | number; // Optional max weight for the call
}

export interface ExecutePendingTxRequest extends BaseRequestSign {
  address: string; // Multisig address
  chain: string; // Chain slug
  threshold: number; // Number of required signatures
  otherSignatories: string[]; // List of other signers
  timepoint: {
    height: number;
    index: number;
  }; // Timepoint of the approved call
  call: any; // Call data to execute
  maxWeight?: string | number; // Optional max weight for the call
}

export interface CancelPendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  threshold: number;
  otherSignatories: string[];
  timepoint?: {
    height: number;
    index: number;
  };
  callHash: string;
}
