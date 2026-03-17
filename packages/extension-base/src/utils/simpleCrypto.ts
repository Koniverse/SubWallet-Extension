// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { blake2AsHex } from '@polkadot/util-crypto';
import { randomAsU8a } from '@polkadot/util-crypto';
import { u8aToHex, hexToU8a, stringToU8a, u8aToString } from '@polkadot/util';

/**
 * Simple XOR encryption helper for Subscan API key storage
 * Note: This is NOT for high-security scenarios, but sufficient for
 * obfuscating API keys in local storage to prevent casual inspection.
 *
 * Uses BLAKE2 hash for key derivation and XOR for encryption.
 */

const SALT_LENGTH = 16;

/**
 * Derive a key from password using blake2 hash
 */
function deriveKey (password: string, salt: Uint8Array): Uint8Array {
  const combined = new Uint8Array([...stringToU8a(password), ...salt]);
  const hash = blake2AsHex(combined, 64); // 64 bytes = 512 bits

  return hexToU8a(hash);
}

/**
 * XOR encrypt/decrypt data (symmetric operation)
 */
function xorCrypt (data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }

  return result;
}

/**
 * Encrypt data using password
 * @param password - The password to encrypt with
 * @param data - The data to encrypt
 * @returns Encrypted data with salt (as hex strings)
 */
export function encrypt (password: string, data: Record<string, unknown>): {
  salt: string;
  data: string;
} {
  const salt = randomAsU8a(SALT_LENGTH);
  const key = deriveKey(password, salt);

  const text = JSON.stringify(data);
  const textBytes = stringToU8a(text);
  const encrypted = xorCrypt(textBytes, key);

  return {
    salt: u8aToHex(salt),
    data: u8aToHex(encrypted)
  };
}

/**
 * Decrypt data using password
 * @param password - The password to decrypt with
 * @param encryptedData - The encrypted data with salt
 * @returns Decrypted data
 */
export function decrypt (password: string, encryptedData: {
  salt: string;
  data: string;
}): Record<string, unknown> {
  const salt = hexToU8a(encryptedData.salt);
  const key = deriveKey(password, salt);
  const encryptedBytes = hexToU8a(encryptedData.data);

  const decrypted = xorCrypt(encryptedBytes, key);

  return JSON.parse(u8aToString(decrypted));
}
