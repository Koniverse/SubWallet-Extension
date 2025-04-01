// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BaseFeeDetail, BaseFeeInfo } from './base';
import { FeeDefaultOption } from './option';

/** @deprecated */
export interface TonTipInfo {
  tip: string;
}

/** @deprecated */
export interface TonFeeInfo extends BaseFeeInfo {
  type: 'ton';
  options: {
    slow: TonTipInfo;
    average: TonTipInfo;
    fast: TonTipInfo;
    default: FeeDefaultOption;
  }
}

/** @deprecated */
export type TonFeeDetail = TonFeeInfo & BaseFeeDetail;
