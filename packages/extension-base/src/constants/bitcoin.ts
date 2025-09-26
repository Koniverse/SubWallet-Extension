// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

// https://bitcoin.stackexchange.com/a/41082/139277
import { BitcoinAddressType } from '@subwallet/keyring/types';

export const BTC_DUST_AMOUNT: Record<BitcoinAddressType, number> = {
  [BitcoinAddressType.p2pkh]: 546,
  [BitcoinAddressType.p2sh]: 540,
  [BitcoinAddressType.p2tr]: 330,
  [BitcoinAddressType.p2wpkh]: 294,
  [BitcoinAddressType.p2wsh]: 330
};

export const BITCOIN_DECIMAL = 8;
