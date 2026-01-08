// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { DecodeCallDataResponse } from '@subwallet/extension-base/services/multisig-service/utils';
import { BaseRequestSign } from '@subwallet/extension-base/types';

import { SubmittableExtrinsic } from '@polkadot/api/types';

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

export interface RequestGetSignableAccountInfos {
  multisigProxyId: string;
  chain: string;
  extrinsicType: ExtrinsicType;
}

export interface SignableAccountInfo {
  proxyId: string;
  address: string;
}

export interface ResponseGetSignableAccountInfos {
  signableProxies: SignableAccountInfo[];
}
