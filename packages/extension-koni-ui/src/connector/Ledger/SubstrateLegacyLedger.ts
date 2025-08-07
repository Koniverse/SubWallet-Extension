// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { newSubstrateApp, SubstrateApp } from '@zondax/ledger-substrate';
import { ResponseSign } from '@zondax/ledger-substrate/dist/common';

import { LEDGER_SUCCESS_CODE } from '@polkadot/hw-ledger/constants';
import { ledgerApps } from '@polkadot/hw-ledger/defaults';
import { AccountOptions, LedgerAddress, LedgerSignature, LedgerVersion } from '@polkadot/hw-ledger/types';
import { hexAddPrefix, u8aToBuffer } from '@polkadot/util';

import { BaseLedger } from './BaseLedger';

type Chain = keyof typeof ledgerApps;

export class SubstrateLegacyLedger extends BaseLedger<SubstrateApp> {
  readonly #ledgerName: string;

  constructor (chain: Chain) {
    super(0); // No need to specify slip44 for legacy apps
    const ledgerName = ledgerApps[chain];

    if (!ledgerName) {
      throw new Error(`Unsupported Ledger chain ${chain}`);
    }

    this.#ledgerName = ledgerName;
  }

  async getAddress (confirm?: boolean, accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): Promise<LedgerAddress> {
    return this.withApp(async (app: SubstrateApp): Promise<LedgerAddress> => {
      const { account, addressIndex, change } = this.serializeParameters(accountOffset, addressOffset, accountOptions);
      const { address, pubKey } = await this.wrapError(app.getAddress(account, change, addressIndex, confirm));

      return {
        address,
        publicKey: hexAddPrefix(pubKey)
      };
    });
  }

  async getVersion (): Promise<LedgerVersion> {
    return this.withApp(async (app: SubstrateApp): Promise<LedgerVersion> => {
      const { device_locked: isLocked,
        major,
        minor,
        patch,
        test_mode: isTestMode } = await this.wrapError(app.getVersion());

      return {
        isLocked,
        isTestMode,
        version: [major, minor, patch]
      };
    });
  }

  signTransaction (message: Uint8Array, metadata: Uint8Array, accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): Promise<LedgerSignature> {
    return this.withApp(async (app): Promise<LedgerSignature> => {
      const { account, addressIndex, change } = this.serializeParameters(accountOffset, addressOffset, accountOptions);
      const { signature } = await this.wrapError(app.sign(account, change, addressIndex, u8aToBuffer(message)));

      return {
        signature: hexAddPrefix(signature.toString('hex'))
      };
    });
  }

  async signMessage (message: Uint8Array, accountOffset?: number, addressOffset?: number, accountOptions?: Partial<AccountOptions>): Promise<LedgerSignature> {
    return this.withApp(async (app: SubstrateApp): Promise<LedgerSignature> => {
      const { account, addressIndex, change } = this.serializeParameters(accountOffset, addressOffset, accountOptions);
      const rs = await this.wrapError(app.signRaw(account, change, addressIndex, u8aToBuffer(message)));

      const raw = rs.signature.toString('hex');
      const firstByte = raw.slice(0, 2);
      // Source: https://github.com/polkadot-js/common/blob/a82ebdf6f9d78791bd1f21cd3c534deee37e0840/packages/keyring/src/pair/index.ts#L29-L34
      const isExtraByte = firstByte === '00';
      // Remove first byte (signature_type) from signature
      const signature = isExtraByte ? hexAddPrefix(raw.slice(2)) : hexAddPrefix(raw);

      return {
        signature
      };
    });
  }

  mappingError (_error: Error): string {
    const error = _error.message || (_error as unknown as ResponseSign).error_message;

    if (error.includes('28160') || error.includes('CLA Not Supported')) {
      return 'App does not seem to be open';
    }

    if (error.includes('21781')) {
      return 'Locked device';
    }

    return error;
  }

  getApp = async (): Promise<SubstrateApp> => {
    if (!this.app) {
      const transport = await SubstrateLegacyLedger.transportManager.getTransport();

      this.app = newSubstrateApp(transport, this.#ledgerName);
    }

    return this.app;
  };

  protected override wrapError = async <V>(promise: Promise<V>): Promise<V> => {
    try {
      const result = await promise as ResponseSign;

      if (!result.return_code) {
        return result as V;
      } else if (result.return_code === LEDGER_SUCCESS_CODE) {
        return result as V;
      } else {
        throw new Error(result.error_message);
      }
    } catch (e) {
      const error = e as Error;

      error.message = this.mappingError(error);

      throw error;
    }
  };

  protected serializePath (accountOffset: number | undefined, addressOffset: number | undefined, accountOptions: Partial<AccountOptions> | undefined): string {
    // This method is not used in SubstrateLegacyLedger, but it is required by the BaseLedger class
    // so we provide a dummy implementation
    return '';
  }

  private serializeParameters (accountOffset = 0, addressOffset = 0, accountOptions?: Partial<AccountOptions>) {
    const account = (accountOptions?.account || 0) + (accountOffset || 0);
    const addressIndex = (accountOptions?.addressIndex || 0) + (addressOffset || 0);
    const change = accountOptions?.change || 0;

    return {
      account,
      addressIndex,
      change
    };
  }
}
