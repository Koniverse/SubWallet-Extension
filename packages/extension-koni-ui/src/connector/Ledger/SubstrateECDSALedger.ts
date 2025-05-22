// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LEDGER_SCHEME } from '@subwallet/extension-base/background/KoniTypes';
import { LedgerTypes } from '@subwallet/extension-koni-ui/types';

import { SubstrateGenericLedger } from './SubstrateGenericLedger';

export class SubstrateECDSALedger extends SubstrateGenericLedger {
  constructor (transport: LedgerTypes, slip44: number, scheme?: LEDGER_SCHEME) {
    super(transport, slip44);

    if (scheme) {
      this.scheme = scheme;
    }
  }
}
