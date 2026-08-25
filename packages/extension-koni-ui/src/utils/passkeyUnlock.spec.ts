// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

jest.mock('./common/browser', () => ({ isFirefox: () => false }));

import { evaluatePasskeyCredential, isExpandedPasskeyUnlockRequested } from './passkeyUnlock';

const getCredential = jest.fn();

Object.defineProperty(globalThis, 'chrome', {
  value: {
    runtime: {
      id: 'subwallet'
    },
  }
});

// Before running the ceremony these helpers size the surface the browser will draw its prompt in,
// so they measure the popup document even though nothing here is about the assertion itself.
function mockPopupSurface () {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { innerWidth: 388, location: { pathname: '/index.html' } }
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { body: { classList: { add: jest.fn(), remove: jest.fn() }, clientWidth: 388, style: {} } }
  });
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: (time: number) => void) => setTimeout(() => callback(0), 0)
  });
}

describe('passkey unlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPopupSurface();
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
    expect(options.allowCredentials[0].transports).toBeUndefined();
  });

  it('replays the recorded transports so the browser can skip its passkey chooser', async () => {
    getCredential.mockResolvedValue({
      getClientExtensionResults: () => ({ prf: { results: { first: new Uint8Array([1]).buffer } } })
    });

    await evaluatePasskeyCredential('0x0102', '0x0304', ['internal']);

    expect(getCredential.mock.calls[0][0].publicKey.allowCredentials[0].transports).toEqual(['internal']);
  });

  it('omits transports for enrollments made before they were recorded', async () => {
    getCredential.mockResolvedValue({
      getClientExtensionResults: () => ({ prf: { results: { first: new Uint8Array([1]).buffer } } })
    });

    await evaluatePasskeyCredential('0x0102', '0x0304', []);

    expect('transports' in getCredential.mock.calls[0][0].publicKey.allowCredentials[0]).toBe(false);
  });

  it('keeps the expanded unlock route only while the keyring is locked', () => {
    expect(isExpandedPasskeyUnlockRequested('?passkeyUnlock=true', true)).toBe(true);
    expect(isExpandedPasskeyUnlockRequested('?passkeyUnlock=true', false)).toBe(false);
    expect(isExpandedPasskeyUnlockRequested('?other=true', true)).toBe(false);
  });
});
