// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerConfig {
  name: string;
  level?: LogLevel;
  enableStructuredLogging?: boolean;
  enableContextCapture?: boolean;
}

export interface LogContext {
  file?: string;
  function?: string;
  line?: number;
  column?: number;
  timestamp: string;
  level: LogLevel;
  loggerName: string;
}

export interface StructuredLogData {
  message: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
  tags?: string[];
  extra?: Record<string, unknown>;
}

// export interface SentryAdapter {
//   captureException(error: Error, context?: Record<string, unknown>): void;
//   addBreadcrumb(message: string, level: LogLevel, data?: Record<string, unknown>): void;
//   setContext(key: string, context: Record<string, unknown>): void;
// }
