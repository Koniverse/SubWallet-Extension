// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PsbtTransactionArg } from '@subwallet/extension-base/background/KoniTypes';
import { BaseRequestSign } from '@subwallet/extension-base/types';
import { Psbt } from 'bitcoinjs-lib';

import { FeeChainType, FeeDetail, TransactionFee } from '../fee';

export interface RequestSubscribeTransfer extends TransactionFee {
  address: string;
  chain: string;
  value: string;
  token: string;
  destChain: string;
}

export interface ResponseSubscribeTransfer {
  id: string;
  maxTransferable: string;
  feeOptions: FeeDetail;
  feeType: FeeChainType;
  feePercentageSpecialCase?: number;
  error?: string;
}

export interface RequestSubmitTransferWithId extends RequestSubmitTransfer{
  id?: string;
}

export interface RequestSubmitTransfer extends BaseRequestSign, TransactionFee {
  chain: string;
  from: string;
  to: string;
  tokenSlug: string;
  transferAll: boolean;
  value: string;
  transferBounceable?: boolean;
}

export interface RequestSubmitSignPsbtTransfer extends BaseRequestSign {
  id: string;
  chain: string;
  from: string;
  to: string;
  value: string;
  txInput: PsbtTransactionArg[];
  txOutput: PsbtTransactionArg[];
  tokenSlug: string;
  psbt: Psbt;
}
