import type { KeyringPair } from '@subwallet/keyring/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { TypeRegistry } from '@polkadot/types';

import RequestExtrinsicSign from './RequestExtrinsicSign';

describe('RequestExtrinsicSign', () => {
  it('queues a raw payload for the UI but never signs it', () => {
    const request = new RequestExtrinsicSign({ data: '0x5369676e20696e20746f204576696c44617070' } as unknown as SignerPayloadJSON);

    expect(request.isRawDataInExtrinsic).toBe(true);
    expect(() => request.sign({} as TypeRegistry, {} as KeyringPair)).toThrow('Unexpected raw data in an extrinsic signing payload');
  });
});
