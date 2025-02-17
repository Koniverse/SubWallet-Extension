// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { TransactionEventResponse } from '@subwallet/extension-base/services/transaction-service/types';

import { CommonStepDetail, CommonStepFeeInfo } from '../service-base';
import { SwapPair, SwapProvider, SwapRate, SwapRoute, SwapSubmitParams } from '../swap';
import { RequestYieldStepSubmit } from '../yield';

export interface BaseProcessRequestSign {
  isPassConfirmation?: boolean;
  onSend?: (rs: TransactionEventResponse) => void;
  processId?: string;
}

export enum ProcessType {
  SWAP = 'swap',
  EARNING = 'earning'
}

export interface RequestSubmitProcessTransaction {
  address: string;
  type: ProcessType;
  request: SwapSubmitParams | RequestYieldStepSubmit;
  id: string;
}

export enum StepStatus {
  QUEUED = 'QUEUED',
  PREPARE = 'PREPARE',
  SUBMITTING = 'SUBMITTING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT'
}

export const PROCESSING_STEP_STATUS: StepStatus[] = [StepStatus.PREPARE, StepStatus.SUBMITTING, StepStatus.PROCESSING];

export interface ProcessStep extends CommonStepDetail {
  fee: CommonStepFeeInfo;
  status: StepStatus;
  chain?: string;
  transactionId?: string;
  extrinsicHash?: string;
}

export interface ProcessTransactionData {
  id: string;
  type: ProcessType;
  address: string;
  status: StepStatus;
  steps: ProcessStep[];
  combineInfo: unknown;
  currentStepId: number;
  lastTransactionId?: string;
  lastTransactionChain?: string;
}

export interface BriefProcessStep {
  processId: string;
  stepId: number;
}

export interface BriefXCMStep {
  sendingValue: string;
  originTokenInfo: _ChainAsset;
  destinationTokenInfo: _ChainAsset;
}

export interface BriefSwapStep {
  pair: SwapPair;
  fromAmount: string;
  toAmount: string;
  rate: SwapRate; // rate = fromToken / toToken
  provider: SwapProvider;
  aliveUntil: number; // timestamp
  route: SwapRoute;
}

export interface ApproveStepMetadata {
  tokenApprove: string;
  contractAddress: string;
  spenderAddress: string;
  amount?: string;
}

export interface RequestSubscribeProcessById {
  processId: string;
}

export interface ResponseSubscribeProcessById {
  process: ProcessTransactionData | undefined;
  id: string;
}

export interface ResponseSubscribeProcessAlive {
  processes: Record<string, ProcessTransactionData>;
}
