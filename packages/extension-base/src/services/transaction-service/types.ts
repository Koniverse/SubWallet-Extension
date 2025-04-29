// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainType, ExtrinsicDataTypeMap, ExtrinsicStatus, ExtrinsicType, FeeData, ValidateTransactionResponse } from '@subwallet/extension-base/background/KoniTypes';
import { SignTypedDataMessageV3V4 } from '@subwallet/extension-base/core/logic-validation';
import { TonTransactionConfig } from '@subwallet/extension-base/services/balance-service/transfer/ton-transfer';
import { BaseRequestSign, BriefProcessStep, ProcessTransactionData, TransactionFee } from '@subwallet/extension-base/types';
import EventEmitter from 'eventemitter3';
import { TransactionConfig } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { EventRecord } from '@polkadot/types/interfaces';

export interface SWTransaction extends ValidateTransactionResponse, Partial<Pick<BaseRequestSign, 'ignoreWarnings'>>, TransactionFee {
  id: string;
  url?: string;
  isInternal: boolean,
  chain: string;
  chainType: ChainType;
  address: string;
  data: ExtrinsicDataTypeMap[ExtrinsicType];
  status: ExtrinsicStatus;
  extrinsicHash: string;
  extrinsicType: ExtrinsicType;
  createdAt: number;
  updatedAt: number;
  estimateFee?: FeeData,
  xcmFeeDryRun?: string;
  transaction: SubmittableExtrinsic | TransactionConfig | TonTransactionConfig;
  additionalValidator?: (inputTransaction: SWTransactionResponse) => Promise<void>;
  eventsHandler?: (eventEmitter: TransactionEmitter) => void;
  isPassConfirmation?: boolean;
  errorOnTimeOut?: boolean;
  signAfterCreate?: (id: string) => void;
  step?: BriefProcessStep;
}

export interface SWPermitTransaction extends Omit<SWTransaction, 'transaction'> {
  transaction: SignTypedDataMessageV3V4;
}

export interface SWTransactionResult extends Omit<SWTransaction, 'transaction' | 'additionalValidator' | 'eventsHandler' | 'process'> {
  process?: ProcessTransactionData;
}

type SwInputBase = Pick<SWTransaction, 'address' | 'url' | 'data' | 'extrinsicType' | 'chain' | 'chainType' | 'ignoreWarnings' | 'transferNativeAmount'>
& Partial<Pick<SWTransaction, 'additionalValidator' | 'eventsHandler'>>;

export interface SWTransactionInput extends SwInputBase, Partial<Pick<SWTransaction, 'estimateFee' | 'signAfterCreate' | 'isPassConfirmation' | 'step' | 'errorOnTimeOut' | 'xcmFeeDryRun'>>, TransactionFee {
  id?: string;
  transaction?: SWTransaction['transaction'] | null;
  warnings?: SWTransaction['warnings'];
  errors?: SWTransaction['errors'];
  edAsWarning?: boolean;
  isTransferAll?: boolean;
  isTransferLocalTokenAndPayThatTokenAsFee?: boolean;
  resolveOnDone?: boolean;
  skipFeeValidation?: boolean;
}

export interface SWPermitTransactionInput extends Omit<SWTransactionInput, 'transaction'> {
  transaction?: SWPermitTransaction['transaction'] | null;
}

export type SWTransactionResponse = SwInputBase & Pick<SWTransaction, 'warnings' | 'errors'> & Partial<Pick<SWTransaction, 'id' | 'extrinsicHash' | 'status' | 'estimateFee' | 'xcmFeeDryRun'>> & TransactionFee & {
  processId?: string;
}

export type ValidateTransactionResponseInput = SWTransactionInput;

export type TransactionEmitter = EventEmitter<TransactionEventMap>;

export interface TransactionEventResponse extends ValidateTransactionResponse {
  id: string,
  processId?: string,
  extrinsicHash?: string,
  blockHash?: string
  blockNumber?: number,
  eventLogs?: EventRecord[],
  nonce?: number,
  startBlock?: number,
}
export interface TransactionEventMap {
  send: (response: TransactionEventResponse) => void;
  signed: (response: TransactionEventResponse) => void;
  extrinsicHash: (response: TransactionEventResponse) => void;
  error: (response: TransactionEventResponse) => void;
  success: (response: TransactionEventResponse) => void;
  timeout: (response: TransactionEventResponse) => void;
}

export type OptionalSWTransaction = SWTransaction['transaction'] | null | undefined;
