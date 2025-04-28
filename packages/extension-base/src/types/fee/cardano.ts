// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BaseFeeDetail, BaseFeeInfo } from './base';
import { FeeDefaultOption } from './option';

/** @deprecated */
export interface CardanoTipInfo {
  tip: string;
}

/** @deprecated */
export interface CardanoFeeInfo extends BaseFeeInfo {
  type: 'ton';
  options: {
    slow: CardanoTipInfo;
    average: CardanoTipInfo;
    fast: CardanoTipInfo;
    default: FeeDefaultOption;
  }
}

/** @deprecated */
export type CardanoFeeDetail = CardanoFeeInfo & BaseFeeDetail;
