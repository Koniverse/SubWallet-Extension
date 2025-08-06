// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BaseFeeDetail, BaseFeeInfo, BaseFeeTime } from './base';
import { FeeDefaultOption } from './option';

export interface BitcoinFeeRate {
  feeRate: number;
}

export type BitcoinFeeRateDetail = BitcoinFeeRate & BaseFeeTime;

export interface BitcoinFeeInfo extends BaseFeeInfo {
  type: 'bitcoin';
  options: {
    slow: BitcoinFeeRateDetail;
    average: BitcoinFeeRateDetail;
    fast: BitcoinFeeRateDetail;
    default: FeeDefaultOption;
  }
}

export interface BitcoinFeeDetail extends BitcoinFeeInfo, BaseFeeDetail {
  vSize: number;
}
