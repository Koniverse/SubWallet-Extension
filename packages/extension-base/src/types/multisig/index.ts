// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { MultisigTxType } from '@subwallet/extension-base/services/multisig-service';
import { DecodeCallDataResponse } from '@subwallet/extension-base/services/multisig-service/utils';
import { BaseRequestSign } from '@subwallet/extension-base/types';

import { HexString } from '@polkadot/util/types';

export interface PendingMultisigTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  multisigMetadata: MultisigRawMetadata;
  callHash: string;
  decodedCallData?: DecodeCallDataResponse;
  type: MultisigTxType;
}

export interface ApprovePendingTxRequest extends PendingMultisigTxRequest {
  timepoint?: {
    height: number;
    index: number;
  };
  maxWeight: {
    refTime: number, // todo
    proofSize: number // todo
  };
}

export interface ExecutePendingTxRequest extends PendingMultisigTxRequest {
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

export interface CancelPendingTxRequest extends PendingMultisigTxRequest {
  timepoint: {
    height: number;
    index: number;
  };
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

export interface MultisigRawMetadata {
  signers: string[];
  threshold: number;
  multisigAddress: string;
}

export interface MultisigAccountInfo {
  multisigAddress: string;
  signers: string[];
  threshold: number;
}

export interface InitMultisigTxRequest {
  transactionId: string; // original tx
  signer: string;
  multisigMetadata: MultisigRawMetadata;
  chain: string;
  previousMultisigTxId?: string; // previous selected signer tx
}

export interface InitMultisigTxResponse {
  submittedCallData: HexString; // callData of the multisig extrinsic
  callData: HexString; // callData of the original extrinsic
  decodedCallData: DecodeCallDataResponse | undefined; // decoded callData of the original extrinsic
  depositAmount: string;
  networkFee: string;
  error?: SelectSignatoryError;
}

export enum SelectSignatoryErrorType {
  // todo: consider to use same error for these two
  NOT_ENOUGH_BALANCE = 'NOT_ENOUGH_BALANCE',
  NOT_ENOUGH_DEPOSIT = 'NOT_ENOUGH_DEPOSIT',
}

export interface SelectSignatoryError {
  errorType: SelectSignatoryErrorType;
  message: string;
}
