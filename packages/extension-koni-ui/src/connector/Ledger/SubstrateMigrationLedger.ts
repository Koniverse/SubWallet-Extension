// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LEDGER_SCHEME } from '@subwallet/extension-base/background/KoniTypes';
import { LedgerTypes } from '@subwallet/extension-koni-ui/types';

import { SubstrateGenericLedger } from './SubstrateGenericLedger';

export class SubstrateMigrationLedger extends SubstrateGenericLedger {
  constructor (transport: LedgerTypes, slip44: number, ss58AddrType?: number, scheme?: LEDGER_SCHEME) {
    super(transport, slip44);

    if (ss58AddrType) {
      this.ss58_addr_type = ss58AddrType;
    }

    if (scheme) {
      this.scheme = scheme;
    }
  }
}
