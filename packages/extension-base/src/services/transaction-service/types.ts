// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  BitcoinTransactionConfig,
  ChainType,
  ExtrinsicDataTypeMap,
  ExtrinsicStatus,
  ExtrinsicType,
  FeeData,
  ValidateTransactionResponse
} from '@subwallet/extension-base/background/KoniTypes';
import { SignTypedDataMessageV3V4 } from '@subwallet/extension-base/core/logic-validation';
import { TonTransactionConfig } from '@subwallet/extension-base/services/balance-service/transfer/ton-transfer';
import { UniswapOrderInfo } from '@subwallet/extension-base/services/swap-service/handler/uniswap-handler';
import { BaseRequestSign, BriefProcessStep, ProcessTransactionData, TransactionFee } from '@subwallet/extension-base/types';
import { Psbt } from 'bitcoinjs-lib';
import EventEmitter from 'eventemitter3';
import { TransactionConfig } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { EventRecord } from '@polkadot/types/interfaces';

export interface SWTransactionBase extends ValidateTransactionResponse, Partial<Pick<BaseRequestSign, 'ignoreWarnings'>>, TransactionFee, SWTransactionEmitter {
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
  transaction: any;
  additionalValidator?: (inputTransaction: SWTransactionResponse) => Promise<void>;
  eventsHandler?: (eventEmitter: TransactionEmitter) => void;
  isPassConfirmation?: boolean;
  errorOnTimeOut?: boolean;
  signAfterCreate?: (id: string) => void;
  step?: BriefProcessStep;
}

export interface SWTransaction extends SWTransactionBase {
  transaction: SubmittableExtrinsic | TransactionConfig | TonTransactionConfig | Psbt | BitcoinTransactionConfig;
}

export interface SWPermitTransaction extends SWTransactionBase {
  transaction: SignTypedDataMessageV3V4;
}

export interface SWDutchTransaction extends SWTransactionBase {
  transaction: {
    submitSwapOrder: () => Promise<boolean>,
    cronCheckTxSuccess: () => Promise<UniswapOrderInfo | undefined>,
  }
}

export interface SWTransactionResult extends Omit<SWTransactionBase, 'transaction' | 'additionalValidator' | 'eventsHandler' | 'process'> {
  process?: ProcessTransactionData;
}

export interface SWTransactionEmitter {
  emitterTransaction?: TransactionEmitter
}

type SwInputBase = Pick<SWTransactionBase, 'address' | 'url' | 'data' | 'extrinsicType' | 'chain' | 'chainType' | 'ignoreWarnings' | 'transferNativeAmount'>
& Partial<Pick<SWTransactionBase, 'additionalValidator' | 'eventsHandler'>>;

export interface SWTransactionInput extends SwInputBase, Partial<Pick<SWTransactionBase, 'estimateFee' | 'signAfterCreate' | 'isPassConfirmation' | 'step' | 'errorOnTimeOut' | 'xcmFeeDryRun'>>, TransactionFee {
  id?: string;
  transaction?: SWTransactionBase['transaction'] | null;
  warnings?: SWTransactionBase['warnings'];
  errors?: SWTransactionBase['errors'];
  edAsWarning?: boolean;
  isTransferAll?: boolean;
  isTransferLocalTokenAndPayThatTokenAsFee?: boolean;
  resolveOnDone?: boolean;
  skipFeeValidation?: boolean;
}

export interface SWPermitTransactionInput extends Omit<SWTransactionInput, 'transaction'> {
  transaction?: SWPermitTransaction['transaction'] | null;
}

export interface SWDutchTransactionInput extends Omit<SWTransactionInput, 'transaction'> {
  transaction?: SWDutchTransaction['transaction'] | null;
}

export type SWTransactionResponse = SwInputBase & Pick<SWTransactionBase, 'warnings' | 'errors'> & Partial<Pick<SWTransactionBase, 'id' | 'extrinsicHash' | 'status' | 'estimateFee' | 'xcmFeeDryRun'>> & TransactionFee & {
  processId?: string;
}

export type BitcoinTransactionData = {
  data: Psbt,
  dataBase64: string,
  dataToHex: string,
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
  blockTime?: number,
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
