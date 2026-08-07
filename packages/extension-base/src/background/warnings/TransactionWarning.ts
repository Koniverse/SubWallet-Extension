// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWWarning } from '@subwallet/extension-base/background/warnings/SWWarning';
import { BasicTxErrorType, BasicTxWarningCode, TransactionErrorType, TransactionWarningType } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { t } from 'i18next';

import { TransactionError } from '../errors/TransactionError';

const defaultWarningMap: Record<TransactionWarningType, { message: string, code?: number }> = {
  [BasicTxWarningCode.NOT_ENOUGH_EXISTENTIAL_DEPOSIT]: {
    message: detectTranslate('bg.TRANSACTION.background.warning.Transaction.insufficientBalanceForExistentialDeposit'),
    code: undefined
  },
  [BasicTxWarningCode.IS_BOUNCEABLE_ADDRESS]: {
    message: detectTranslate('bg.TRANSACTION.background.warning.Transaction.bounceableAddressNotSupported'),
    code: undefined
  }
};

export class TransactionWarning extends SWWarning {
  override warningType: TransactionWarningType;

  constructor (warningType: TransactionWarningType, message?: string, code?: number, data?: unknown) {
    const warningMessage = message || t(defaultWarningMap[warningType]?.message || '') || warningType;

    super(warningType, warningMessage, defaultWarningMap[warningType]?.code, data);
    this.warningType = warningType;
  }

  public toError (): TransactionError | null {
    const type = ((): TransactionErrorType | null => {
      switch (this.warningType) {
        case BasicTxWarningCode.IS_BOUNCEABLE_ADDRESS:
          return null;
        case BasicTxWarningCode.NOT_ENOUGH_EXISTENTIAL_DEPOSIT:
          return BasicTxErrorType.NOT_ENOUGH_EXISTENTIAL_DEPOSIT;
      }
    })();

    if (!type) {
      return null;
    }

    return new TransactionError(type, this.message, this.data);
  }
}
