// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Ledger } from '@subwallet/extension-koni-ui/types';

import { AccountOptions } from '@polkadot/hw-ledger/types';

import { LedgerTransportManager } from './LedgerTransportManager';

export abstract class BaseLedger<T> extends Ledger {
  protected app: T | null = null;
  // readonly #chainId: number;
  static readonly transportManager: LedgerTransportManager = LedgerTransportManager.getInstance();
  readonly slip44: number;

  constructor (slip44: number) {
    super();
    this.slip44 = slip44;
  }

  protected abstract serializePath (accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): string
  protected abstract getApp(): Promise<T>

  protected withApp = async<V> (fn: (_app: T) => Promise<V>): Promise<V> => {
    try {
      const app = await this.getApp();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await fn(app);
    } catch (error) {
      this.app = null;
      throw error;
    }
  };

  protected wrapError = async<V> (promise: Promise<V>): Promise<V> => {
    try {
      return await Promise.race([
        promise,
        new Promise<never>((resolve, reject) => {
          BaseLedger.transportManager.onTransportDisconnect(() => {
            reject(new Error('Transport disconnected'));
          });
        })
      ]);
    } catch (e) {
      throw Error(this.mappingError(new Error((e as Error).message)));
    }
  };

  disconnect (): Promise<void> {
    return this.withApp(async (app) => {
      await BaseLedger.transportManager.closeTransport();
    });
  }

  abstract mappingError (error: Error): string;
}
