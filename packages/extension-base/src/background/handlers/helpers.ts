// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '@subwallet/extension-base/utils/logger';

const backgroundHelpersLogger = createLogger('BackgroundHelpers');

export function withErrorLog (fn: () => unknown): void {
  try {
    const p = fn();

    if (p && typeof p === 'object' && typeof (p as Promise<unknown>).catch === 'function') {
      (p as Promise<unknown>).catch((e) => backgroundHelpersLogger.error('Error in withErrorLog promise', e));
    }
  } catch (e) {
    backgroundHelpersLogger.error('Error in withErrorLog', e);
  }
}
