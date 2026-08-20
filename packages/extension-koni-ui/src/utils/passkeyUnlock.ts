// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { hexToU8a, u8aToHex } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';

import { isFirefox } from './common/browser';

export interface PasskeyEnrollment {
  credentialId: string;
  prfInput: string;
  unlockSecret: string;
}

export interface PasskeyAssertionResult {
  unlockSecret: string;
  nextUnlockSecret?: string;
  nextPrfInput?: string;
}

interface PrfResult {
  results?: {
    first?: ArrayBuffer;
    second?: ArrayBuffer;
  };
}

function randomBytes (size = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

function toBufferSource (value: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(value.byteLength);

  new Uint8Array(buffer).set(value);

  return buffer;
}

function prfResult (credential: PublicKeyCredential): Uint8Array | null {
  const output = (credential.getClientExtensionResults() as unknown as { prf?: PrfResult }).prf?.results?.first;

  return output ? new Uint8Array(output) : null;
}

function credentialIdToBase64Url (credentialId: string): string {
  return base64Encode(hexToU8a(credentialId))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function supportsPasskeyUnlock (): Promise<boolean> {
  if (typeof window === 'undefined' || isFirefox() || !window.PublicKeyCredential || typeof chrome === 'undefined' || !chrome.runtime?.id) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isPasskeyPromptCancelled (error: unknown): boolean {
  const name = (error as DOMException)?.name;

  return name === 'AbortError' || name === 'NotAllowedError';
}

export async function registerPasskeyCredential (): Promise<PasskeyEnrollment> {
  const initialInput = randomBytes();
  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { name: 'SubWallet', id: chrome.runtime.id },
      user: {
        id: toBufferSource(randomBytes()),
        name: 'local-wallet',
        displayName: 'SubWallet passkey unlock'
      },
      challenge: toBufferSource(randomBytes()),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'discouraged',
        userVerification: 'required'
      },
      extensions: {
        prf: { eval: { first: toBufferSource(initialInput) } }
      } as AuthenticationExtensionsClientInputs
    }
  }) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey unlock setup was cancelled');
  }

  const credentialId = u8aToHex(new Uint8Array(credential.rawId));
  const output = prfResult(credential);

  try {
    return {
      credentialId,
      prfInput: u8aToHex(initialInput),
      unlockSecret: output
        ? u8aToHex(output)
        : (await evaluatePasskeyCredential(credentialId, u8aToHex(initialInput))).unlockSecret
    };
  } catch (error) {
    await forgetPasskeyCredential(credentialId);
    throw error;
  } finally {
    initialInput.fill(0);
    output?.fill(0);
  }
}

export async function evaluatePasskeyCredential (credentialId: string, encodedInput: string): Promise<PasskeyAssertionResult> {
  const currentInput = hexToU8a(encodedInput);

  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: toBufferSource(randomBytes()),
        rpId: chrome.runtime.id,
        allowCredentials: [{ type: 'public-key', id: toBufferSource(hexToU8a(credentialId)) }],
        userVerification: 'required',
        extensions: {
          prf: { eval: { first: toBufferSource(currentInput) } }
        } as AuthenticationExtensionsClientInputs
      }
    }) as PublicKeyCredential | null;

    const result = credential && (credential.getClientExtensionResults() as unknown as { prf?: PrfResult }).prf;
    const output = result?.results?.first && new Uint8Array(result.results.first);

    if (!output) {
      throw new Error('This passkey cannot provide a secure unlock secret');
    }

    try {
      return {
        unlockSecret: u8aToHex(output)
      };
    } finally {
      output.fill(0);
    }
  } finally {
    currentInput.fill(0);
  }
}

export async function forgetPasskeyCredential (credentialId: string): Promise<void> {
  const credentialApi = globalThis.PublicKeyCredential as unknown as {
    signalUnknownCredential?: (options: { rpId: string; credentialId: string }) => Promise<void>;
  } | undefined;

  if (!credentialApi?.signalUnknownCredential) {
    return;
  }

  try {
    await credentialApi.signalUnknownCredential({
      rpId: chrome.runtime.id,
      credentialId: credentialIdToBase64Url(credentialId)
    });
  } catch (error) {
    console.warn('Unable to remove passkey unlock credential', error);
  }
}
