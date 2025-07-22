// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { detectTranslate } from '@subwallet/extension-base/utils';

export enum DeriveErrorType {
  INVALID_DERIVATION_PATH = 'INVALID_DERIVATION_PATH',
  INVALID_DERIVATION_TYPE = 'INVALID_DERIVATION_TYPE',
  ROOT_ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  INVALID_ACCOUNT_TYPE = 'INVALID_ACCOUNT_TYPE',
  MAX_DERIVATION_DEPTH = 'MAX_DERIVATION_DEPTH',
  MIN_DERIVATION_DEPTH = 'MIN_DERIVATION_DEPTH',
}

const DEFAULT_DATA: Record<DeriveErrorType, { message: string, code: number | undefined }> = {
  [DeriveErrorType.INVALID_DERIVATION_PATH]: { message: detectTranslate('bg.ACCOUNT.types.error.account.derive.invalidDerivationPath'), code: 1001 },
  [DeriveErrorType.INVALID_DERIVATION_TYPE]: { message: detectTranslate('bg.ACCOUNT.types.error.account.derive.derivationPathNotSupported'), code: 1002 },
  [DeriveErrorType.ROOT_ACCOUNT_NOT_FOUND]: { message: detectTranslate('bg.ACCOUNT.types.error.account.derive.accountNotFound'), code: 1003 },
  [DeriveErrorType.INVALID_ACCOUNT_TYPE]: { message: detectTranslate('bg.ACCOUNT.types.error.account.derive.invalidAccountType'), code: 1004 },
  [DeriveErrorType.MAX_DERIVATION_DEPTH]: { message: detectTranslate('bg.ACCOUNT.types.error.account.derive.derivationPathNotSupported'), code: 1005 },
  [DeriveErrorType.MIN_DERIVATION_DEPTH]: { message: detectTranslate('bg.ACCOUNT.types.error.account.derive.derivationPathNotSupported'), code: 1006 }
};

export class SWDeriveError extends SWError {
  override errorClass = 'Derive';
  constructor (errorType: DeriveErrorType, _message?: string) {
    const defaultData = DEFAULT_DATA[errorType];
    const message = _message || defaultData.message;

    super(errorType, message, defaultData.code);
  }
}
