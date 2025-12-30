// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '@subwallet/extension-base/utils/logger';

const promiseUtilsLogger = createLogger('PromiseUtils');

export function createPromiseHandler<T> () {
  let _resolve: (value: T) => void = () => {
    promiseUtilsLogger.warn('This promise handler is not implemented');
  };

  let _reject: (reason?: unknown) => void = () => {
    promiseUtilsLogger.warn('This promise handler is not implemented');
  };

  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  return {
    resolve: _resolve,
    reject: _reject,
    promise
  };
}

export type PromiseHandler<T> = ReturnType<typeof createPromiseHandler<T>>;
