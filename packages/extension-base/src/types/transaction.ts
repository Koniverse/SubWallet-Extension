// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionConfig } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/types';

export enum BasicTxErrorType {
  NOT_ENOUGH_BALANCE = 'NOT_ENOUGH_BALANCE',
  CHAIN_DISCONNECTED = 'CHAIN_DISCONNECTED',
  INVALID_PARAMS = 'INVALID_PARAMS',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  UNABLE_TO_SIGN = 'UNABLE_TO_SIGN',
  USER_REJECT_REQUEST = 'USER_REJECT_REQUEST',
  UNABLE_TO_SEND = 'UNABLE_TO_SEND',
  SEND_TRANSACTION_FAILED = 'SEND_TRANSACTION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNSUPPORTED = 'UNSUPPORTED',
  TIMEOUT = 'TIMEOUT',
  NOT_ENOUGH_EXISTENTIAL_DEPOSIT = 'NOT_ENOUGH_EXISTENTIAL_DEPOSIT',
}

export type TransactionData = SubmittableExtrinsic<'promise'> | TransactionConfig;
