// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BaseRequestSign } from '@subwallet/extension-base/types';

export interface ApprovePendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  threshold: number;
  otherSignatories: string[];
  timepoint?: {
    height: number;
    index: number;
  };
  callHash: string;
  maxWeight: {
    refTime: number, // todo
    proofSize: number // todo
  };
}

export interface ExecutePendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  threshold: number;
  otherSignatories: string[];
  timepoint?: {
    height: number;
    index: number;
  };
  call: string;
  maxWeight: {
    refTime: number, // todo
    proofSize: number // todo
  };
}

export interface CancelPendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  threshold: number;
  otherSignatories: string[];
  timepoint: {
    height: number;
    index: number;
  };
  callHash: string;
}

export interface RequestGetSignableProxyIds {
  multisigProxyId: string;
  extrinsicType: ExtrinsicType
}

export interface ResponseGetSignableProxyIds {
  signableProxyIds: string[];
}
