// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@subwallet/keyring/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';

import { wrapBytes } from '@subwallet/extension-dapp/wrapBytes';

import { u8aToHex } from '@polkadot/util';

import RequestBytesSign from './RequestBytesSign';

describe('RequestBytesSign', () => {
  it('requests a standard signature over the wrapped message', () => {
    const payload = {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCO4kY7qf6x9',
      data: '0x68656c6c6f',
      type: 'bytes'
    } as SignerPayloadRaw;
    const signature = new Uint8Array(64).fill(1);
    const pair = {
      sign: jest.fn(() => signature)
    } as unknown as KeyringPair;

    const result = new RequestBytesSign(payload).sign(null as never, pair);

    expect(pair.sign).toHaveBeenCalledWith(wrapBytes(payload.data));
    expect(result.signature).toBe(u8aToHex(signature));
  });
});
