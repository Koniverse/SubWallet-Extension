// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _Address, ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

import { BaseProcessRequestSign, BaseRequestSign, InternalRequestSign, TransactionData } from '../../../transaction';
import { NominationPoolInfo, ValidatorInfo, YieldPoolType, YieldPositionInfo } from '../../info';
import { OptimalYieldPath } from './step';

// Result after create extrinsic
export interface HandleYieldStepData {
  txChain: string;
  extrinsicType: ExtrinsicType;
  extrinsic: TransactionData;
  chainType: ChainType;
  txData: any;
  transferNativeAmount: string;
}

export interface AbstractSubmitYieldJoinData {
  slug: string;
  amount: string;
  address: string;
}

export interface SubmitJoinNativeStaking extends AbstractSubmitYieldJoinData {
  selectedPool?: {
    mindBond: string
  }
  selectedValidators: ValidatorInfo[];
  subnetData?: {
    netuid: number,
    slippage: number
  }
}

export interface SubmitJoinNominationPool extends AbstractSubmitYieldJoinData {
  selectedPool: NominationPoolInfo;
}

export interface SubmitYieldStepData extends AbstractSubmitYieldJoinData { // TODO
  exchangeRate: number, // reward token amount = input token amount * exchange rate
  inputTokenSlug: string,
  derivativeTokenSlug?: string,
  rewardTokenSlug: string,
  feeTokenSlug: string
}

export type SubmitYieldJoinData = SubmitYieldStepData | SubmitJoinNativeStaking | SubmitJoinNominationPool;

export enum EarningProcessType {
  NOMINATION_POOL = 'NOMINATION_POOL',
  NATIVE_STAKING = 'NATIVE_STAKING',
  YIELD = 'YIELD'
}

export interface SummaryEarningProcessData {
  data: SubmitYieldJoinData;
  type: EarningProcessType;
  brief: {
    token: string;
    amount: string;
    chain: string;
    method: YieldPoolType;
  }
}

export interface HandleYieldStepParams extends BaseRequestSign, BaseProcessRequestSign {
  path: OptimalYieldPath;
  data: SubmitYieldJoinData;
  currentStep: number;
}

export interface TokenSpendingApprovalParams {
  chain: string;
  contractAddress: _Address;
  spenderAddress: _Address;
  owner: _Address;
  amount?: string;
}

export type RequestYieldStepSubmit = InternalRequestSign<HandleYieldStepParams>;

export interface StakePoolingBondingParams extends BaseRequestSign {
  poolPosition?: YieldPositionInfo,
  slug: string,
  selectedPool: NominationPoolInfo,
  amount: string,
  address: string
}

export type RequestStakePoolingBonding = InternalRequestSign<StakePoolingBondingParams>;

export interface BondingSubmitParams extends BaseRequestSign {
  slug: string,
  poolPosition?: YieldPositionInfo, // undefined if user has no stake
  amount: string,
  address: string,
  selectedValidators: ValidatorInfo[],
  lockPeriod?: number // in month
}

export type RequestBondingSubmit = InternalRequestSign<BondingSubmitParams>;

export interface SubmitChangeValidatorStaking extends SubmitJoinNativeStaking {
  fromValidator?: ValidatorInfo[];
}
