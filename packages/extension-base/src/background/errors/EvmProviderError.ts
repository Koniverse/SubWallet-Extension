// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { EvmProviderErrorType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { t } from 'i18next';

const defaultErrorMap: Record<EvmProviderErrorType, { message: string, code?: number }> = {
  USER_REJECTED_REQUEST: {
    message: detectTranslate('bg.error.EvmProvider.userRejectedRequest'),
    code: 4001
  },
  UNAUTHORIZED: {
    message: detectTranslate('bg.error.EvmProvider.failedToSign'),
    code: 4100
  },
  UNSUPPORTED_METHOD: {
    message: detectTranslate('bg.error.EvmProvider.unsupportedMethod'),
    code: 4200
  },
  DISCONNECTED: {
    message: detectTranslate('bg.error.EvmProvider.networkIsDisconnected'),
    code: 4900
  },
  CHAIN_DISCONNECTED: {
    message: detectTranslate('bg.error.EvmProvider.networkIsDisconnected'),
    code: 4901
  },
  NETWORK_NOT_SUPPORTED: {
    message: detectTranslate('bg.error.EvmProvider.networkCurrentlyNotSupported'),
    code: 4902
  },
  INVALID_PARAMS: {
    message: detectTranslate('bg.error.EvmProvider.undefinedErrorContactSupport'),
    code: -32602
  },
  INTERNAL_ERROR: {
    message: detectTranslate('bg.error.EvmProvider.undefinedErrorContactSupport'),
    code: -32603
  }
};

export class EvmProviderError extends SWError {
  override errorType: EvmProviderErrorType;

  constructor (errorType: EvmProviderErrorType, errMessage?: string, data?: unknown, name?: string) {
    const { code, message } = defaultErrorMap[errorType];
    const finalMessage = errMessage || t(message || '') || errorType;

    super(errorType, finalMessage, code, data, name);
    this.errorType = errorType;
  }
}
