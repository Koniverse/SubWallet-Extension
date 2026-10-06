// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@subwallet/keyring/types';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { RequestSign } from './types';

import { TypeRegistry } from '@polkadot/types';
import { assert } from '@polkadot/util';

export default class RequestExtrinsicSign implements RequestSign {
  public readonly payload: SignerPayloadJSON;
  public readonly isRawDataInExtrinsic: boolean;

  constructor (payload: SignerPayloadJSON) {
    this.payload = payload;
    this.isRawDataInExtrinsic = 'data' in (payload as unknown as SignerPayloadRaw);
  }

  sign (registry: TypeRegistry, pair: KeyringPair): { signature: HexString } {
    assert(!this.isRawDataInExtrinsic, 'Unexpected raw data in an extrinsic signing payload');

    return registry
      .createType('ExtrinsicPayload', this.payload, { version: this.payload.version })
      .sign(pair);
  }
}
