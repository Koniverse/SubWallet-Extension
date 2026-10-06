// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { enrollPasskeyUnlock, getPasskeyUnlockContext, recoverPasskeyUnlockPassword, rotatePasskeyUnlockSecret, unwrapWalletPassword, wrapWalletPassword } from './passkeyUnlock';

import { u8aToHex } from '@polkadot/util';
import { webcrypto } from 'crypto';

Object.defineProperty(globalThis, 'crypto', { value: webcrypto });

let extensionStorage: Record<string, unknown> = {};

Object.defineProperty(globalThis, 'chrome', {
  value: {
    runtime: {},
    storage: {
      local: {
        get: (key: string, callback: (values: Record<string, unknown>) => void) => callback({ [key]: extensionStorage[key] }),
        remove: (key: string, callback: () => void) => {
          delete extensionStorage[key];
          callback();
        },
        set: (values: Record<string, unknown>, callback: () => void) => {
          Object.assign(extensionStorage, values);
          callback();
        }
      }
    }
  }
});

describe('passkey unlock password wrapping', () => {
  beforeEach(() => {
    extensionStorage = {};
  });

  it('only opens with the PRF secret used to seal it', async () => {
    const secret = u8aToHex(new Uint8Array(32).fill(11));
    const wrongSecret = u8aToHex(new Uint8Array(32).fill(12));
    const wrapped = await wrapWalletPassword('correct horse battery staple', secret);
    const record = {
      schemaVersion: 2 as const,
      credential: '0x01',
      input: '0x02',
      ...wrapped
    };

    await expect(unwrapWalletPassword(record, secret)).resolves.toBe('correct horse battery staple');
    await expect(unwrapWalletPassword(record, wrongSecret)).rejects.toThrow();
  });

  it('invalidates the previous PRF secret after re-wrapping', async () => {
    const previousSecret = u8aToHex(new Uint8Array(32).fill(21));
    const nextSecret = u8aToHex(new Uint8Array(32).fill(22));
    const nextSalt = u8aToHex(new Uint8Array(32).fill(23));

    await enrollPasskeyUnlock({
      credentialId: '0x01',
      password: 'wallet password',
      unlockSecret: previousSecret,
      prfInput: u8aToHex(new Uint8Array(32).fill(20))
    });
    await rotatePasskeyUnlockSecret('wallet password', nextSecret, nextSalt);

    await expect(recoverPasskeyUnlockPassword(previousSecret)).rejects.toThrow();
    await expect(recoverPasskeyUnlockPassword(nextSecret)).resolves.toBe('wallet password');
    await expect(getPasskeyUnlockContext()).resolves.toEqual({ credentialId: '0x01', prfInput: nextSalt });
  });
});
