// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { DecodeCallDataResponse } from '@subwallet/extension-base/services/multisig-service/utils';
import { BaseRequestSign } from '@subwallet/extension-base/types';

import { HexString } from '@polkadot/util/types';

export interface ApprovePendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  multisigMetadata: MultisigRawMetadata;
  timepoint: {
    height: number;
    index: number;
  };
  callHash: string;
}

export interface ExecutePendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  multisigMetadata: MultisigRawMetadata;
  timepoint: {
    height: number;
    index: number;
  };
  call: string;
}

export interface CancelPendingTxRequest extends BaseRequestSign {
  address: string;
  chain: string;
  multisigMetadata: MultisigRawMetadata;
  timepoint: {
    height: number;
    index: number;
  };
  callHash: string;
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
}

export interface MultisigAccountInfo {
  multisigAddress: string;
  signers: string[];
  threshold: number;
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
