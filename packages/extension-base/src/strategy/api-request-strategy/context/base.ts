// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ApiRequestContext, ApiRequestContextProps } from '@subwallet/extension-base/strategy/api-request-strategy/types';

export class BaseApiRequestContext implements ApiRequestContext {
  callRate = 2; // limit per interval check
  limitRate = 2; // max rate per interval check
  intervalCheck = 1000; // interval check in ms
  maxRetry = 9; // interval check in ms
  private rollbackRateTime = 30 * 1000; // rollback rate time in ms
  private timeoutRollbackRate: NodeJS.Timeout | undefined = undefined;

  constructor (options?: Partial<ApiRequestContextProps>) {
    this.callRate = options?.limitRate || this.callRate;
    this.limitRate = options?.limitRate || this.limitRate;
    this.intervalCheck = options?.intervalCheck || this.intervalCheck;
    this.maxRetry = options?.maxRetry || this.maxRetry;
  }

  reduceLimitRate () {
    clearTimeout(this.timeoutRollbackRate);

    this.callRate = Math.ceil(this.limitRate / 2);

    this.timeoutRollbackRate = setTimeout(() => {
      this.callRate = this.limitRate;
    }, this.rollbackRateTime);
  }
}
