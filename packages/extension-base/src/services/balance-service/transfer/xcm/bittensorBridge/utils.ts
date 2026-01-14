// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { hexToU8a } from '@polkadot/util';
import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto';

const EVM_PREFIX = new TextEncoder().encode('evm:');

/**
 * Convert an EVM address (0x...) into a Substrate SS58 address
 *
 * @param evmAddress EVM address, with or without the "0x" prefix
 * @param ss58Prefix SS58 network prefix (default is 42 – generic Substrate)
 * @returns SS58-encoded Substrate address
 */
export function evmToSs58 (evmAddress: string, ss58Prefix = 42): string {
  // Normalize input: ensure "0x" prefix and convert to Uint8Array
  const addressBytes = hexToU8a(
    evmAddress.startsWith('0x') ? evmAddress : '0x' + evmAddress
  );

  // Build the input buffer: "evm:" prefix + 20-byte EVM address
  const combined = new Uint8Array(EVM_PREFIX.length + addressBytes.length);

  combined.set(EVM_PREFIX);
  combined.set(addressBytes, EVM_PREFIX.length);

  // Hash using blake2b-256 to derive a Substrate AccountId
  const hash = blake2AsU8a(combined);

  // Encode the hash into an SS58 address with the given prefix
  return encodeAddress(hash, ss58Prefix);
}
