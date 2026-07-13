// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import log from 'loglevel';

import { LogContext, LoggerConfig, LogLevel, StructuredLogData } from './types';

const PRODUCTION_BRANCHES = ['master', 'webapp', 'webapp-dev'];
const branchName = process.env.BRANCH_NAME || 'koni-dev';
const isProduction = PRODUCTION_BRANCHES.indexOf(branchName) > -1;

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
};

export class Logger {
  private logInstance: log.Logger;
  private name: string;
  private config: Required<LoggerConfig>;
  private groupStack: string[] = [];

  constructor (config: LoggerConfig) {
    this.name = config.name;
    this.config = {
      name: config.name,
      level: config.level || (isProduction ? 'info' : 'debug'),
      enableStructuredLogging: config.enableStructuredLogging ?? false,
      enableContextCapture: config.enableContextCapture || !isProduction
    };

    // Create a named logger instance
    this.logInstance = log.getLogger(this.name);
    this.logInstance.setLevel(this.getLogLevelNumber(this.config.level) as log.LogLevelDesc);
  }

  private getLogLevelNumber (level: LogLevel): number {
    return LOG_LEVELS[level];
  }

  private shouldLog (level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.getLogLevelNumber(this.config.level);
  }

  private formatMessage (level: LogLevel, message: string, ...args: unknown[]): string {
    const prefix = `[${this.name}] [${level.toUpperCase()}]`;

    return `${prefix} ${message}`;
  }

  // Simple logging methods (drop-in console replacement)
  error (message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) {
      return;
    }

    const formatted = this.formatMessage('error', message);

    this.logInstance.error(formatted, ...args);

    // Add breadcrumb for errors
    if (args.length > 0 && args[0] instanceof Error) {
      // sentryAdapter.captureException(args[0] as Error, {
      //   message,
      //   logger: this.name
      // });
    } else {
      // sentryAdapter.addBreadcrumb(message, 'error', {
      //   logger: this.name,
      //   args: args.length > 0 ? args : undefined
      // });
    }
  }

  warn (message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) {
      return;
    }

    const formatted = this.formatMessage('warn', message);

    this.logInstance.warn(formatted, ...args);
    // sentryAdapter.addBreadcrumb(message, 'warn', {
    //   logger: this.name,
    //   args: args.length > 0 ? args : undefined
    // });
  }

  info (message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) {
      return;
    }

    const formatted = this.formatMessage('info', message);

    this.logInstance.info(formatted, ...args);
    // sentryAdapter.addBreadcrumb(message, 'info', {
    //   logger: this.name,
    //   args: args.length > 0 ? args : undefined
    // });
  }

  log (message: string, ...args: unknown[]): void {
    this.info(message, ...args);
  }

  debug (message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) {
      return;
    }

    const formatted = this.formatMessage('debug', message);

    this.logInstance.debug(formatted, ...args);
    // sentryAdapter.addBreadcrumb(message, 'debug', {
    //   logger: this.name,
    //   args: args.length > 0 ? args : undefined
    // });
  }

  trace (message: string, ...args: unknown[]): void {
    if (!this.shouldLog('trace')) {
      return;
    }

    const formatted = this.formatMessage('trace', message);

    this.logInstance.trace(formatted, ...args);
    // sentryAdapter.addBreadcrumb(message, 'trace', {
    //   logger: this.name,
    //   args: args.length > 0 ? args : undefined
    // });
  }

  // Group methods
  group (label?: string): void {
    const groupLabel = label || `Group ${this.groupStack.length + 1}`;

    this.groupStack.push(groupLabel);

    if (this.shouldLog('debug')) {
      const indent = '  '.repeat(this.groupStack.length - 1);
      const formatted = this.formatMessage('debug', `${indent}▼ ${groupLabel}`);

      this.logInstance.debug(formatted);
    }
  }

  groupEnd (): void {
    if (this.groupStack.length === 0) {
      return;
    }

    const groupLabel = this.groupStack.pop();

    if (!groupLabel) {
      return;
    }

    if (this.shouldLog('debug')) {
      const indent = '  '.repeat(this.groupStack.length);
      const formatted = this.formatMessage('debug', `${indent}▲ ${groupLabel}`);

      this.logInstance.debug(formatted);
    }
  }

  // Utility methods
  setLevel (level: LogLevel): void {
    this.config.level = level;
    this.logInstance.setLevel(this.getLogLevelNumber(level) as log.LogLevelDesc);
  }

  getLevel (): LogLevel {
    return this.config.level;
  }

  getName (): string {
    return this.name;
  }

  // Structured logging methods
  // Noted: Capturing context is expensive due to Error creation and stack parsing; it should only be used when necessary.
  private createLogContext (level: LogLevel): LogContext {
    const baseContext: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      loggerName: this.name
    };

    if (this.config.enableContextCapture) {
      const extracted = extractContext(3);

      if (extracted) {
        return { ...baseContext, ...extracted };
      }
    }

    return baseContext;
  }

  private logStructured (level: LogLevel, data: StructuredLogData): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const context = this.createLogContext(level);
    const logEntry = {
      ...context,
      message: data.message,
      context: data.context,
      error: data.error instanceof Error
        ? {
          name: data.error.name,
          message: data.error.message,
          stack: data.error.stack
        }
        : data.error,
      tags: data.tags,
      extra: data.extra
    };

    // Output structured JSON
    const jsonOutput = JSON.stringify(logEntry, null, 2);

    this.logInstance[level](jsonOutput);

    // Add breadcrumb to Sentry
    if (data.error instanceof Error) {
      // sentryAdapter.captureException(data.error, {
      //   ...data.context,
      //   logger: this.name,
      //   tags: data.tags
      // });
    } else {
      // sentryAdapter.addBreadcrumb(data.message, level, {
      //   ...data.context,
      //   logger: this.name,
      //   tags: data.tags
      // });
    }
  }

  errorStructured (data: StructuredLogData): void {
    this.logStructured('error', data);
  }

  warnStructured (data: StructuredLogData): void {
    this.logStructured('warn', data);
  }

  infoStructured (data: StructuredLogData): void {
    this.logStructured('info', data);
  }

  debugStructured (data: StructuredLogData): void {
    this.logStructured('debug', data);
  }

  traceStructured (data: StructuredLogData): void {
    this.logStructured('trace', data);
  }

  // Public alias for backward compatibility (calls infoStructured)
  logStructuredPublic (data: StructuredLogData): void {
    this.infoStructured(data);
  }

  // Polkadot compatibility - noop method
  noop (...values: unknown[]): void {
    // No operation - required by Polkadot Logger interface
  }
}

/**
 * Extract context from Error stack trace
 * @Todo: Use for structured log, re-test before using
 */
function extractContext (skipFrames = 2): LogContext | null {
  try {
    const stack = new Error().stack;

    if (!stack) {
      return null;
    }

    const lines = stack.split('\n');
    // Skip Error constructor and extractContext call
    const frame = lines[skipFrames + 1];

    if (!frame) {
      return null;
    }

    // Match patterns like: "at functionName (file://path/to/file.ts:123:45)"
    const match = frame.match(/at\s+(?:async\s+)?(.+?)\s+\((.+?):(\d+):(\d+)\)/);

    if (match) {
      const [, functionName, filePath, line, column] = match;
      const fileName = filePath.split('/').pop() || filePath;

      return {
        file: fileName,
        function: functionName,
        line: parseInt(line, 10),
        column: parseInt(column, 10),
        timestamp: new Date().toISOString(),
        level: 'info' as LogLevel,
        loggerName: ''
      };
    }
  } catch {
    // Ignore errors in context extraction
  }

  return null;
}
