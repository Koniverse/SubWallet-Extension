// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address } from '@emurgo/cardano-serialization-lib-browser';

export const convertCardanoAddressToHex = (bech32Address: string): string => {
  const addr = Address.from_bech32(bech32Address);

  return Buffer.from(addr.to_bytes()).toString('hex');
};
