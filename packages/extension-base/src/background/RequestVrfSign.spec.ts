// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadVrf } from '@subwallet/extension-inject/types';
import type { KeyringPair } from '@subwallet/keyring/types';

import { TypeRegistry } from '@polkadot/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';

import RequestVrfSign from './RequestVrfSign';

describe('RequestVrfSign', () => {
  it('signs raw data with the origin-bound substrate-vrf context', () => {
    const payload: SignerPayloadVrf = {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCO4kY7qf6x9',
      context: '0x0102',
      data: '0x68656c6c6f'
    };
    const signature = new Uint8Array(96).fill(1);
    const vrfSign = jest.fn(() => signature);
    const pair = { type: 'sr25519', vrfSign } as unknown as KeyringPair;
    const request = new RequestVrfSign(payload, 'https://app.example/private?id=1');

    const result = request.sign({} as TypeRegistry, pair);

    expect(request.isVrf).toBe(true);
    expect(request.payload).toEqual({ address: payload.address, data: payload.data, type: 'bytes' });
    expect(vrfSign).toHaveBeenCalledWith(
      hexToU8a(payload.data),
      hexToU8a('0x7375627374726174652d7672661300000068747470733a2f2f6170702e6578616d706c65020000000102')
    );
    expect(result.signature).toBe(u8aToHex(signature));
  });

  it('exposes the dapp context for the confirmation screen', () => {
    const request = new RequestVrfSign({ address: '0x00', context: '0x0102', data: '0x00' }, 'https://app.example');

    expect(request.vrfContext).toBe('0x0102');
    expect(new RequestVrfSign({ address: '0x00', data: '0x00' }, 'https://app.example').vrfContext).toBeUndefined();
  });

  it('binds to the scheme, not just the host', () => {
    let capturedContext = new Uint8Array();

    const sign = (url: string) => {
      const vrfSign = jest.fn((_message: Uint8Array, context: Uint8Array) => {
        capturedContext = context;

        return new Uint8Array(96);
      });
      const pair = { type: 'sr25519', vrfSign } as unknown as KeyringPair;

      new RequestVrfSign({ address: '0x00', data: '0x00' }, url).sign({} as TypeRegistry, pair);

      return u8aToHex(capturedContext);
    };

    expect(sign('https://app.example')).not.toBe(sign('http://app.example'));
  });

  it('rejects a non-HTTP(S) origin', () => {
    expect(() => new RequestVrfSign({ address: '0x00', data: '0x00' }, 'chrome-extension://abcdef/index.html'))
      .toThrow('VRF signing requires an HTTP(S) origin');
  });

  it('rejects oversized data and context', () => {
    const hex = (bytes: number) => `0x${'00'.repeat(bytes)}` as `0x${string}`;

    expect(() => new RequestVrfSign({ address: '0x00', data: hex(64 * 1024 + 1) }, 'https://app.example'))
      .toThrow('VRF data must be at most 65536 bytes');
    expect(() => new RequestVrfSign({ address: '0x00', context: hex(1025), data: '0x00' }, 'https://app.example'))
      .toThrow('VRF context must be at most 1024 bytes');
  });

  it('rejects non-hex input', () => {
    expect(() => new RequestVrfSign({ address: '0x00', data: 'hello' as `0x${string}` }, 'https://app.example'))
      .toThrow('VRF data must be a 0x-prefixed hex string');
  });

  it('rejects non-sr25519 accounts', () => {
    const request = new RequestVrfSign({
      address: '0x0000000000000000000000000000000000000000',
      data: '0x00'
    }, 'https://app.example');

    expect(() => request.sign({} as TypeRegistry, { type: 'ecdsa' } as KeyringPair)).toThrow('VRF signing requires an sr25519 account');
  });
});
