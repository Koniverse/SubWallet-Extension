// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, SentryAdapter } from './types';

/**
 * Placeholder Sentry adapter for future integration
 * Currently implements no-op methods
 * When Sentry SDK is integrated, replace these with actual Sentry calls
 */
class SentryAdapterImpl implements SentryAdapter {
  captureException (error: Error, context?: Record<string, unknown>): void {
    // TODO: Integrate Sentry SDK
    // Example: Sentry.captureException(error, { extra: context });
  }

  addBreadcrumb (message: string, level: LogLevel, data?: Record<string, unknown>): void {
    // TODO: Integrate Sentry SDK
    // Example: Sentry.addBreadcrumb({ message, level, data });
  }

  setContext (key: string, context: Record<string, unknown>): void {
    // TODO: Integrate Sentry SDK
    // Example: Sentry.setContext(key, context);
  }
}

export const sentryAdapter = new SentryAdapterImpl();
