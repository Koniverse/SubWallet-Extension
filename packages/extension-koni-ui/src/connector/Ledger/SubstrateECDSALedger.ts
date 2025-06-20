// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { POLKADOT_LEDGER_SCHEME } from '@subwallet/extension-base/background/KoniTypes';
import { LedgerTypes } from '@subwallet/extension-koni-ui/types';

import { SubstrateGenericLedger } from './SubstrateGenericLedger';

export class SubstrateECDSALedger extends SubstrateGenericLedger {
  constructor (transport: LedgerTypes, slip44: number) {
    super(transport, slip44);

    this.scheme = POLKADOT_LEDGER_SCHEME.ECDSA;
  }
}
