// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Logger } from './Logger';
import { LoggerConfig } from './types';

/**
 * Create a named logger instance
 * @param name - Logger name (typically the class or module name)
 * @param config - Optional logger configuration
 * @returns Logger instance
 */
export function createLogger (name: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger({
    name,
    ...config
  });
}

/**
 * Default logger instance
 */
export const defaultLogger = createLogger('SubWallet');

// Export types
export type { LogLevel, LoggerConfig, LogContext, StructuredLogData } from './types';

// Export Logger class for advanced usage
export { Logger } from './Logger';

// Export Sentry adapter for future integration
// export { sentryAdapter } from './sentry-adapter';
