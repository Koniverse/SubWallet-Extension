// Copyright 2019-2022 @polkadot/extension-dapp authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Simple logger for extension-dapp to avoid circular dependency with extension-base
 */
class SimpleLogger {
  private name: string;

  constructor (name: string) {
    this.name = name;
  }

  error (message: string, ...args: unknown[]): void {
    console.error(`[${this.name}] [ERROR] ${message}`, ...args);
  }

  warn (message: string, ...args: unknown[]): void {
    console.warn(`[${this.name}] [WARN] ${message}`, ...args);
  }

  info (message: string, ...args: unknown[]): void {
    console.info(`[${this.name}] [INFO] ${message}`, ...args);
  }

  debug (message: string, ...args: unknown[]): void {
    console.debug(`[${this.name}] [DEBUG] ${message}`, ...args);
  }
}

export function createLogger (name: string): SimpleLogger {
  return new SimpleLogger(name);
}
