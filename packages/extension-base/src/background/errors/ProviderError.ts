// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { ProviderErrorType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';

const defaultErrorMap: Record<ProviderErrorType, { message: string, code?: number }> = {
  CHAIN_DISCONNECTED: {
    message: detectTranslate('bg.error.Provider.networkIsDisconnected'),
    code: undefined
  },
  INVALID_PARAMS: {
    message: detectTranslate('bg.error.Provider.undefinedErrorContactSupport'),
    code: undefined
  },
  INTERNAL_ERROR: {
    message: detectTranslate('bg.error.Provider.undefinedErrorContactSupport'),
    code: undefined
  },
  USER_REJECT: {
    message: detectTranslate('bg.error.Provider.rejectedByUser'),
    code: undefined
  }
};

export class ProviderError extends SWError {
  override errorType: ProviderErrorType;

  constructor (errorType: ProviderErrorType, errMessage?: string, data?: unknown, errorCode?: number) {
    const { code, message } = defaultErrorMap[errorType];

    super(errorType, errMessage || message, errorCode || code, data);

    this.errorType = errorType;
  }
}
