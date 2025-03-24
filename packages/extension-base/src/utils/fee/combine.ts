// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { EvmEIP1559FeeOption, EvmFeeInfo, FeeOption, SubstrateFeeInfo, SubstrateTipInfo } from '@subwallet/extension-base/types';

interface EvmFeeCombine {
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export const combineEthFee = (feeInfo: EvmFeeInfo, feeOptions?: FeeOption, feeCustom?: EvmEIP1559FeeOption): EvmFeeCombine => {
  let maxFeePerGas: string | undefined;
  let maxPriorityFeePerGas: string | undefined;

  if (feeOptions && feeOptions !== 'custom') {
    maxFeePerGas = feeInfo.options?.[feeOptions].maxFeePerGas;
    maxPriorityFeePerGas = feeInfo.options?.[feeOptions].maxPriorityFeePerGas;
  } else if (feeOptions === 'custom' && feeCustom) {
    maxFeePerGas = feeCustom.maxFeePerGas;
    maxPriorityFeePerGas = feeCustom.maxPriorityFeePerGas;
  } else {
    maxFeePerGas = feeInfo.options?.[feeInfo.options.default].maxFeePerGas;
    maxPriorityFeePerGas = feeInfo.options?.[feeInfo.options.default].maxPriorityFeePerGas;
  }

  if (feeInfo.gasPrice) {
    return {
      gasPrice: feeInfo.gasPrice
    };
  } else {
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
};

interface SubstrateFeeCombine {
  tip: string;
}

export const combineSubstrateFee = (_fee: SubstrateFeeInfo, _feeOptions?: FeeOption, feeCustom?: SubstrateTipInfo): SubstrateFeeCombine => {
  let tip: string;

  if (_feeOptions && _feeOptions !== 'custom') {
    tip = _fee.options[_feeOptions].tip;
  } else if (_feeOptions === 'custom' && feeCustom && 'tip' in feeCustom) {
    tip = feeCustom.tip;
  } else {
    tip = _fee.options[_fee.options.default].tip;
  }

  return {
    tip
  };
};
