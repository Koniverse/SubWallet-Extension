// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { _getTokenMinAmount, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import { BasicTxErrorType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { t } from 'i18next';

export * from './swap';
export * from './request';
export * from './earning';
export * from './transfer';

// apply for all tx: transfer, xcm, swap, earning
export function validateSpendingAndFeePayment (spendingToken: _ChainAsset, feeToken: _ChainAsset, bnSpendingAmount: BigN, bnFromTokenBalance: BigN, bnFeeAmount: BigN, bnFeeTokenBalance: BigN): TransactionError[] {
  if (spendingToken.slug === feeToken.slug) {
    if (bnFromTokenBalance.lte(bnSpendingAmount.plus(bnFeeAmount).plus(_isNativeToken(spendingToken) ? '0' : _getTokenMinAmount(spendingToken)))) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t('bg.validation.insufficientSpendingTokenBalance', { replace: { spendingTokenSymbol: spendingToken.symbol } }))];
    }
  } else {
    if (bnFromTokenBalance.lte(bnSpendingAmount.plus(_isNativeToken(spendingToken) ? '0' : _getTokenMinAmount(spendingToken)))) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t('bg.validation.insufficientSpendingTokenBalance', { replace: { spendingTokenSymbol: spendingToken.symbol } }))];
    }

    if (bnFeeTokenBalance.lte(bnFeeAmount.plus(_isNativeToken(feeToken) ? '0' : _getTokenMinAmount(feeToken)))) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE, t('bg.validation.insufficientFeeTokenBalance', { replace: { feeTokenSymbol: feeToken.symbol } }))];
    }
  }

  return [];
}
