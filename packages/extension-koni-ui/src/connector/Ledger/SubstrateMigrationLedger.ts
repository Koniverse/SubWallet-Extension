// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubstrateGenericLedger } from './SubstrateGenericLedger';

export class SubstrateMigrationLedger extends SubstrateGenericLedger {
  constructor (slip44: number, ss58AddrType?: number) {
    super(slip44);

    if (ss58AddrType) {
      this.ss58_addr_type = ss58AddrType;
    }
  }
}
