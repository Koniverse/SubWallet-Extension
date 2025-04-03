// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export type FeeChainType = 'evm' | 'substrate' | 'ton' | 'cardano' | 'bitcoin';

export interface BaseFeeInfo {
  busyNetwork: boolean;
  type: FeeChainType;
}

export interface BaseFeeDetail {
  estimatedFee: string;
}

export interface BaseFeeTime {
  time: number; // in milliseconds
}
