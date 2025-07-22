// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address } from '@emurgo/cardano-serialization-lib-nodejs';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { isCardanoMainnetAddress, isCardanoTestnetAddress } from '@subwallet/keyring';

export const convertCardanoAddressToHex = (bech32Address: string): string => {
  const addr = Address.from_bech32(bech32Address);

  return addr.to_hex();
};

export const convertCardanoHexToBech32 = (hexAddress: string): string => {
  const addr = Address.from_hex(hexAddress);

  return addr.to_bech32();
};

export const validateAddressNetwork = (address: string, chainInfo?: _ChainInfo): boolean => {
  if (!chainInfo?.cardanoInfo || !chainInfo.isTestnet) {
    return isCardanoMainnetAddress(address);
  }

  return isCardanoTestnetAddress(address);
};
