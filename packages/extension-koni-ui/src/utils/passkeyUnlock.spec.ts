// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

jest.mock('./common/browser', () => ({ isFirefox: () => false }));

import { evaluatePasskeyCredential } from './passkeyUnlock';

const getCredential = jest.fn();

Object.defineProperty(globalThis, 'chrome', {
  value: {
    runtime: {
      id: 'subwallet'
    },
  }
});

describe('passkey unlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { credentials: { get: getCredential } }
    });
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { getRandomValues: (value: Uint8Array) => value.fill(1) }
    });
  });

  it('evaluates the PRF against this extension credential', async () => {
    const prfOutput = new Uint8Array([1, 2, 3]);

    getCredential.mockResolvedValue({
      getClientExtensionResults: () => ({ prf: { results: { first: prfOutput.buffer } } })
    });

    await expect(evaluatePasskeyCredential('0x0102', '0x0304')).resolves.toEqual({ unlockSecret: '0x010203' });

    const options = getCredential.mock.calls[0][0].publicKey;

    expect(options.rpId).toBe('subwallet');
    expect(new Uint8Array(options.extensions.prf.eval.first)).toEqual(new Uint8Array([3, 4]));
    expect(options.extensions.prf.evalByCredential).toBeUndefined();
  });
});
