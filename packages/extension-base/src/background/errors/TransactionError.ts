// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicTxErrorType, StakingTxErrorType, SwapErrorType, TransactionErrorType, TransferTxErrorType, YieldValidationStatus } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { t } from 'i18next';

import { SWError } from './SWError';

// Todo: finish this map in the future
const defaultErrorMap = {
  NOT_ENOUGH_BALANCE: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.insufficientBalance'),
    code: undefined
  },
  CHAIN_DISCONNECTED: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.networkIsDisconnected'),
    code: undefined
  },
  INVALID_PARAMS: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.undefinedErrorContactSupport'),
    code: undefined
  },
  INTERNAL_ERROR: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.undefinedErrorContactSupport'),
    code: undefined
  },
  DUPLICATE_TRANSACTION: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.transactionInQueue'),
    code: undefined
  },
  UNABLE_TO_SIGN: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.unableToSign'),
    code: undefined
  },
  USER_REJECT_REQUEST: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.rejectedByUser'),
    code: undefined
  },
  UNABLE_TO_SEND: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.unableToSend'),
    code: undefined
  },
  SEND_TRANSACTION_FAILED: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.sendTransactionFailed'),
    code: undefined
  },
  NOT_ENOUGH_EXISTENTIAL_DEPOSIT: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.insufficientBalanceForExistentialDeposit'),
    code: undefined
  },
  [BasicTxErrorType.UNSUPPORTED]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.featureNotAvailableForToken'),
    code: undefined
  },
  [BasicTxErrorType.TIMEOUT]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.transactionTimeout'),
    code: undefined
  },
  [StakingTxErrorType.NOT_ENOUGH_MIN_STAKE]: {
    message: 'Not enough min stake', // Message specific to each case
    code: undefined
  },
  [StakingTxErrorType.EXCEED_MAX_NOMINATIONS]: {
    message: 'Exceed max nominations', // Message specific to each case
    code: undefined
  },
  [StakingTxErrorType.EXIST_UNSTAKING_REQUEST]: {
    message: 'Exist unstaking request', // Message specific to each case
    code: undefined
  },
  [StakingTxErrorType.INVALID_ACTIVE_STAKE]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.invalidUnstakeBelowMinimum'),
    code: undefined
  },
  [StakingTxErrorType.EXCEED_MAX_UNSTAKING]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.maxUnstakeRequestsReached'),
    code: undefined
  },
  [StakingTxErrorType.INACTIVE_NOMINATION_POOL]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.invalidInactiveNominationPool'),
    code: undefined
  },
  [StakingTxErrorType.CAN_NOT_GET_METADATA]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.unableToFetchStakingData'),
    code: undefined
  },
  [StakingTxErrorType.REMAINING_AMOUNT_TOO_LOW]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.remainingAmountTooLow'),
    code: undefined
  },
  [TransferTxErrorType.RECEIVER_NOT_ENOUGH_EXISTENTIAL_DEPOSIT]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.receiverNotEnoughExistentialDeposit'),
    code: undefined
  },
  [YieldValidationStatus.NOT_ENOUGH_FEE]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.insufficientBalance'),
    code: undefined
  },
  [YieldValidationStatus.NOT_ENOUGH_MIN_JOIN_POOL]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.notEnoughMinEarningAmount'),
    code: undefined
  },
  [SwapErrorType.QUOTE_TIMEOUT]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.quoteTimeout'),
    code: undefined
  },
  [SwapErrorType.INVALID_RECIPIENT]: {
    message: detectTranslate('bg.TRANSACTION.background.error.Transaction.invalidRecipient'),
    code: undefined
  }
} as Record<TransactionErrorType, { message: string, code?: number }>;

export class TransactionError extends SWError {
  override errorType: TransactionErrorType;

  constructor (errorType: TransactionErrorType, errMessage?: string, data?: unknown, name?: string) {
    const defaultErr = defaultErrorMap[errorType];
    const message = errMessage || t(defaultErr?.message || '') || errorType;

    super(errorType, message, defaultErr?.code, data, name);
    this.errorType = errorType;
  }
}
