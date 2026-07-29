// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DecodeCallDataResponse } from '@subwallet/extension-base/services/multisig-service/utils';

export const DECODABLE_BALANCE_TRANSFER_METHODS = [
  'transfer',
  'transferKeepAlive'
];

/**
 * Decode recipient address from decoded call arguments.
 *
 * Supports balances.transfer and balances.transferKeepAlive only.
 * Returns null if destination cannot be resolved safely.
 */
export function decodeTransferRecipient (
  calData?: DecodeCallDataResponse
): string | null {
  if (!calData) {
    return null;
  }

  const { args, method } = calData;

  if (!method || !DECODABLE_BALANCE_TRANSFER_METHODS.includes(method)) {
    return null;
  }

  // Args must be a decoded object (not array)
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return null;
  }

  const dest = (args as Record<string, Record<string, any>>).dest;

  if (!dest) {
    return null;
  }

  // MultiAddress decoded as object (Id / Index)
  if (typeof dest === 'object') {
    if ('Id' in dest && dest.Id) {
      return String(dest.Id);
    }

    if ('Index' in dest && dest.Index) {
      return String(dest.Index);
    }

    return null;
  }

  // Already a string (SS58)
  if (typeof dest === 'string') {
    return dest;
  }

  return null;
}

/**
 * Decode transfer amount from decoded call arguments.
 *
 * Supports balances.transfer and balances.transferKeepAlive only.
 * Returns null if amount cannot be resolved safely.
 */
export function decodeTransferAmount (
  calData?: DecodeCallDataResponse
): string | null {
  if (!calData) {
    return null;
  }

  const { args, method } = calData;

  if (!method || !DECODABLE_BALANCE_TRANSFER_METHODS.includes(method)) {
    return null;
  }

  // Args must be a decoded object (not array)
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return null;
  }

  const value = (args as Record<string, Record<string, any>>).value;

  if (value === undefined || value === null) {
    return null;
  }

  // Primitive decoded value
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).replace(/,/g, '');
  }

  // BN / Codec fallback
  if (typeof value === 'object' && 'toString' in value) {
    return value.toString();
  }

  return null;
}
