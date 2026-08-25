// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { hexToU8a, u8aToHex } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';

import { isFirefox } from './common/browser';

export interface PasskeyEnrollment {
  credentialId: string;
  prfInput: string;
  unlockSecret: string;
  transports?: string[];
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

// Chrome draws its passkey prompt inside whichever surface asked for it and clips it at that
// surface's edge, so the prompt has to be given room before the ceremony starts. How that is done
// depends on the surface, and the two are not interchangeable: the toolbar popup is sized from its
// own document, so widening the body is the only lever there is - and there is none at all for
// height, since the popup already sits at the 600px ceiling the browser allows one. The dapp
// confirmation is a real browser window, which has no such ceiling but never resizes itself to fit
// its document, so body width does nothing there and it has to be resized through chrome.windows.
//
// Chrome draws the prompt as one of its own modal dialogs, which is a fixed width and sits against
// the left of the web contents rather than centred in them. Any room past that width is not spread
// around it, it lands as a strip of empty page down the right-hand side - so the surface is sized to
// the dialog rather than generously.
const PROMPT_WIDTH = 448;
const PROMPT_MIN_HEIGHT = 640;
const PROMPT_BODY_CLASS = '-passkey-prompt-mode';
const SETTLE_FRAMES = 20;
// Two is enough for the loop below to land: the first pass measures the frame, the second spends it.
const RESIZE_PASSES = 3;

type PromptSurface = 'side-panel' | 'window' | 'popup';
type RestorePromptRoom = () => void;

function nextFrame (): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function promptSurface (): PromptSurface {
  const path = window.location.pathname;

  if (path.includes('side-panel.html')) {
    return 'side-panel';
  }

  return path.includes('notification.html') ? 'window' : 'popup';
}

// The browser owns the resize, so the document only catches up a frame or more later - and the
// prompt is measured against whatever it finds the moment it opens.
async function settleViewport (previous: number): Promise<void> {
  for (let frame = 0; frame < SETTLE_FRAMES && window.innerWidth === previous; frame++) {
    await nextFrame();
  }
}

// chrome.windows sizes the whole window, frame included, while the dialog is laid out against the
// web contents inside it. How thick that frame is depends on the platform, the window type and the
// display scaling, so rather than assume a figure this resizes, measures what the viewport actually
// became, and spends the difference - which is what closes the last few pixels beside the dialog.
async function sizeViewportTo (id: number, target: number): Promise<void> {
  for (let pass = 0; pass < RESIZE_PASSES; pass++) {
    const drift = window.innerWidth - target;

    if (drift === 0) {
      return;
    }

    const { width = 0 } = await chrome.windows.getCurrent();
    const before = window.innerWidth;

    await chrome.windows.update(id, { width: width - drift });
    await settleViewport(before);
  }
}

async function reserveWindowRoom (): Promise<RestorePromptRoom | null> {
  const { height = 0, id, width = 0 } = await chrome.windows.getCurrent();
  // Only ever grow. A window the user has already sized past the dialog - the full-size confirmation
  // window is one - is left as it is rather than snapped down to the prompt.
  const needsWidth = window.innerWidth < PROMPT_WIDTH;
  const needsHeight = height < PROMPT_MIN_HEIGHT;

  if (id === undefined || (!needsWidth && !needsHeight)) {
    return null;
  }

  const body = document.body;
  const previousWidth = body.style.width;

  // The confirmation document is a fixed width of its own, so the extra room would otherwise show
  // up as bare background down the sides. Stretch it for as long as the window is wider.
  body.style.width = '100%';
  body.classList.add(PROMPT_BODY_CLASS);

  if (needsHeight) {
    await chrome.windows.update(id, { height: PROMPT_MIN_HEIGHT });
  }

  if (needsWidth) {
    await sizeViewportTo(id, PROMPT_WIDTH);
  }

  return () => {
    body.classList.remove(PROMPT_BODY_CLASS);
    body.style.width = previousWidth;
    chrome.windows.update(id, { height, width }).catch(console.error);
  };
}

function reservePopupRoom (): RestorePromptRoom | null {
  const body = document.body;

  if (body.clientWidth >= PROMPT_WIDTH) {
    return null;
  }

  const previousWidth = body.style.width;

  // No frame to account for here - the popup is sized straight from this document.
  body.style.width = `${PROMPT_WIDTH}px`;
  body.classList.add(PROMPT_BODY_CLASS);

  return () => {
    body.classList.remove(PROMPT_BODY_CLASS);
    body.style.width = previousWidth;
  };
}

// Returns a callback that puts the surface back, or null when it already has the room - the side
// panel is sized by the browser and the expanded view is wide enough on its own. Reserving twice is
// harmless: the second call sees a surface that already measures up and takes no action.
function reservePromptRoom (): Promise<RestorePromptRoom | null> {
  switch (promptSurface()) {
    case 'side-panel':
      return Promise.resolve(null);
    case 'window':
      return reserveWindowRoom();
    default:
      return Promise.resolve(reservePopupRoom());
  }
}

// Holds the room for as long as the caller keeps the returned callback unused. The unlock screen
// uses this so the surface is already the size the prompt needs the moment it opens: resizing once
// the prompt is on screen shifts it sideways under the user, since the popup stays anchored to the
// toolbar icon.
export function holdPasskeyPromptRoom (): RestorePromptRoom {
  const pending = reservePromptRoom();
  let released = false;

  pending.catch(console.error);

  return () => {
    if (released) {
      return;
    }

    released = true;
    pending.then((restore) => restore?.()).catch(console.error);
  };
}

async function withPromptRoom<T> (ceremony: () => Promise<T>): Promise<T> {
  const restore = await reservePromptRoom();

  // The surface needs a moment to settle at its new size and the prompt is measured against it as
  // it opens, so wait either way - the room may have been reserved a frame ago by the unlock screen.
  await nextFrame();

  try {
    return await ceremony();
  } finally {
    restore?.();
  }
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

export function isExpandedPasskeyUnlockRequested (search: string, isLocked: boolean): boolean {
  return isLocked && new URLSearchParams(search).get('passkeyUnlock') === 'true';
}

export async function registerPasskeyCredential (): Promise<PasskeyEnrollment> {
  const initialInput = randomBytes();
  const credential = await withPromptRoom(() => navigator.credentials.create({
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
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey unlock setup was cancelled');
  }

  const credentialId = u8aToHex(new Uint8Array(credential.rawId));
  const output = prfResult(credential);
  // Recording this is what keeps later unlocks on the short verification sheet instead of the full
  // chooser - see PasskeyUnlockContext.transports. Absent on older browsers, which is fine: an
  // enrollment without it just behaves the way every enrollment used to.
  const transports = (credential.response as { getTransports?: () => string[] }).getTransports?.() || [];

  try {
    return {
      credentialId,
      prfInput: u8aToHex(initialInput),
      transports: transports.length ? transports : undefined,
      unlockSecret: output
        ? u8aToHex(output)
        : (await evaluatePasskeyCredential(credentialId, u8aToHex(initialInput), transports)).unlockSecret
    };
  } catch (error) {
    await forgetPasskeyCredential(credentialId);
    throw error;
  } finally {
    initialInput.fill(0);
    output?.fill(0);
  }
}

export async function evaluatePasskeyCredential (credentialId: string, encodedInput: string, transports?: string[]): Promise<PasskeyAssertionResult> {
  const currentInput = hexToU8a(encodedInput);

  try {
    const credential = await withPromptRoom(() => navigator.credentials.get({
      publicKey: {
        challenge: toBufferSource(randomBytes()),
        rpId: chrome.runtime.id,
        allowCredentials: [{
          type: 'public-key',
          id: toBufferSource(hexToU8a(credentialId)),
          ...(transports?.length ? { transports: transports as AuthenticatorTransport[] } : {})
        }],
        userVerification: 'required',
        extensions: {
          prf: { eval: { first: toBufferSource(currentInput) } }
        } as AuthenticationExtensionsClientInputs
      }
    })) as PublicKeyCredential | null;

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
