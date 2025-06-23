// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BitcoinFeeInfo, BitcoinFeeRate, FeeOption } from '@subwallet/extension-base/types';

export const combineBitcoinFee = (feeInfo: BitcoinFeeInfo, feeOptions?: FeeOption, feeCustom?: BitcoinFeeRate): BitcoinFeeRate => {
  if (feeOptions && feeOptions !== 'custom') {
    return feeInfo.options?.[feeOptions];
  } else if (feeOptions === 'custom' && feeCustom) {
    return feeCustom;
  } else {
    return feeInfo.options?.[feeInfo.options.default];
  }
};
