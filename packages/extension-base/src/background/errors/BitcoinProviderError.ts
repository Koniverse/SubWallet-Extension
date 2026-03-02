// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { BitcoinProviderErrorType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { t } from 'i18next';

const defaultErrorMap: Record<BitcoinProviderErrorType, { message: string, code?: number }> = {
  USER_REJECTED_REQUEST: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.userRejectedRequest'),
    code: 4001
  },
  UNAUTHORIZED: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.failedToSign'),
    code: 4100
  },
  UNSUPPORTED_METHOD: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.unsupportedMethod'),
    code: 4200
  },
  DISCONNECTED: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.networkIsDisconnected'),
    code: 4900
  },
  CHAIN_DISCONNECTED: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.networkIsDisconnected'),
    code: 4901
  },
  INVALID_PARAMS: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.undefinedErrorContactSupport'),
    code: -32602
  },
  INTERNAL_ERROR: {
    message: detectTranslate('bg.DAPP.background.error.BitcoinProvider.undefinedErrorContactSupport'),
    code: -32603
  }
};

export class BitcoinProviderError extends SWError {
  override errorType: BitcoinProviderErrorType;

  constructor (errorType: BitcoinProviderErrorType, errMessage?: string, data?: unknown, name?: string) {
    const { code, message } = defaultErrorMap[errorType];
    const finalMessage = errMessage || t(message || '') || errorType;

    super(errorType, finalMessage, code, data, name);
    this.errorType = errorType;
  }
}
