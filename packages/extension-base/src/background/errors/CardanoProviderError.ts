// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { CardanoProviderErrorType } from '@subwallet/extension-base/background/KoniTypes';
import { t } from 'i18next';

// doc: https://github.com/cardano-foundation/CIPs/blob/master/CIP-0030/README.md#error-types

const defaultErrorMap: Record<CardanoProviderErrorType, { message: string, code?: number }> = {
  INVALID_REQUEST: {
    message: 'Invalid request',
    code: -1
  },
  REFUSED_REQUEST: {
    message: 'Request refused',
    code: -3
  },
  ACCOUNT_CHANGED: {
    message: 'Account changed',
    code: -4
  },
  INTERNAL_ERROR: {
    message: 'Internal error',
    code: -2
  },
  PROOF_GENERATION_FAILED: {
    message: 'Proof generation failed',
    code: 1
  },
  ADDRESS_SIGN_NOT_PK: {
    message: 'Address sign not PK',
    code: 2
  },
  SIGN_DATA_DECLINED: {
    message: 'User signing declined',
    code: 3
  },
  SUBMIT_TRANSACTION_REFUSED: {
    message: 'Transaction refused',
    code: 1
  },
  SUBMIT_TRANSACTION_FAILURE: {
    message: 'Transaction failure',
    code: 2
  },
  SIGN_TRANSACTION_DECLINED: {
    message: 'Sign transaction declined',
    code: 2
  }
};

export class CardanoProviderError extends SWError {
  override errorType: CardanoProviderErrorType;

  constructor (errorType: CardanoProviderErrorType, errMessage?: string, data?: unknown, name?: string) {
    const { code, message } = defaultErrorMap[errorType];
    const finalMessage = errMessage || t(message || '') || errorType;

    super(errorType, finalMessage, code, data, name);
    this.errorType = errorType;
  }
}
