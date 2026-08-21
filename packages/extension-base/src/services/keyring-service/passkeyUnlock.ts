// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PasskeyUnlockContext, RequestPasskeyUnlockEnroll } from '../../background/KoniTypes';

import { hexToU8a, u8aToHex } from '@polkadot/util';

const RECORD_KEY = 'subwallet:passkey-unlock:v1';
const AUTHENTICATED_CONTEXT = new TextEncoder().encode('SubWallet passkey unlock v1');
const PRF_SIZE = 32;

interface PasskeyUnlockRecord {
  schemaVersion: 2;
  credential: string;
  input: string;
  ciphertext: string;
  nonce: string;
}

function readRecord (): Promise<PasskeyUnlockRecord | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(RECORD_KEY, (values: Record<string, unknown>) => {
      const error = chrome.runtime.lastError;

      error
        ? reject(new Error(error.message))
        : resolve((values[RECORD_KEY] as PasskeyUnlockRecord | undefined) || null);
    });
  });
}

function writeRecord (record: PasskeyUnlockRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [RECORD_KEY]: record }, () => {
      const error = chrome.runtime.lastError;

      error ? reject(new Error(error.message)) : resolve();
    });
  });
}

export function removePasskeyUnlock (): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(RECORD_KEY, () => {
      const error = chrome.runtime.lastError;

      error ? reject(new Error(error.message)) : resolve();
    });
  });
}

function decodePrfSecret (encoded: string): Uint8Array {
  const bytes = hexToU8a(encoded);

  if (bytes.length !== PRF_SIZE) {
    bytes.fill(0);
    throw new Error('Invalid passkey unlock secret');
  }

  return bytes;
}

export function isValidUnlockSecret (encoded: string): boolean {
  try {
    const bytes = decodePrfSecret(encoded);

    bytes.fill(0);

    return true;
  } catch {
    return false;
  }
}

async function importWrappingKey (encodedSecret: string): Promise<CryptoKey> {
  const secret = decodePrfSecret(encodedSecret);

  try {
    return await crypto.subtle.importKey('raw', secret, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  } finally {
    secret.fill(0);
  }
}

export async function wrapWalletPassword (password: string, encodedSecret: string): Promise<Pick<PasskeyUnlockRecord, 'ciphertext' | 'nonce'>> {
  const key = await importWrappingKey(encodedSecret);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(password);

  try {
    const ciphertext = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: nonce,
      additionalData: AUTHENTICATED_CONTEXT
    }, key, plaintext);

    return {
      ciphertext: u8aToHex(new Uint8Array(ciphertext)),
      nonce: u8aToHex(nonce)
    };
  } finally {
    plaintext.fill(0);
  }
}

export async function unwrapWalletPassword (record: PasskeyUnlockRecord, encodedSecret: string): Promise<string> {
  const key = await importWrappingKey(encodedSecret);
  const plaintext = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: hexToU8a(record.nonce),
    additionalData: AUTHENTICATED_CONTEXT
  }, key, hexToU8a(record.ciphertext));
  const bytes = new Uint8Array(plaintext);

  try {
    return new TextDecoder().decode(bytes);
  } finally {
    bytes.fill(0);
  }
}

function isCompleteRecord (record: PasskeyUnlockRecord | null): record is PasskeyUnlockRecord {
  return !!record &&
    record.schemaVersion === 2 &&
    !!record.credential &&
    !!record.input &&
    !!record.ciphertext &&
    !!record.nonce;
}

export async function enrollPasskeyUnlock ({ credentialId, password, prfInput, unlockSecret }: RequestPasskeyUnlockEnroll): Promise<void> {
  const wrapped = await wrapWalletPassword(password, unlockSecret);

  await writeRecord({
    schemaVersion: 2,
    credential: credentialId,
    input: prfInput,
    ...wrapped
  });
}

export async function getPasskeyUnlockContext (): Promise<PasskeyUnlockContext | null> {
  const record = await readRecord();

  return isCompleteRecord(record)
    ? { credentialId: record.credential, prfInput: record.input }
    : null;
}

export async function recoverPasskeyUnlockPassword (unlockSecret: string): Promise<string | null> {
  const record = await readRecord();

  return isCompleteRecord(record) ? unwrapWalletPassword(record, unlockSecret) : null;
}

export async function rotatePasskeyUnlockSecret (password: string, unlockSecret: string, prfInput: string): Promise<void> {
  const record = await readRecord();

  if (!isCompleteRecord(record) || !isValidUnlockSecret(unlockSecret) || !isValidUnlockSecret(prfInput)) {
    return;
  }

  const wrapped = await wrapWalletPassword(password, unlockSecret);

  await writeRecord({
    ...record,
    input: prfInput,
    ...wrapped
  });
}
