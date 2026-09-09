// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadVrf } from '@subwallet/extension-inject/types';
import type { KeyringPair } from '@subwallet/keyring/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { RequestSign } from './types';

import { TypeRegistry } from '@polkadot/types';
import { assert, bnToU8a, hexToU8a, isHex, stringToU8a, u8aConcat, u8aToHex } from '@polkadot/util';

const VRF_NAMESPACE = stringToU8a('substrate-vrf');

/** Guard rails on dapp-supplied input: the wallet must never hash unbounded bytes on its behalf. */
const MAX_DATA_BYTES = 64 * 1024;
const MAX_CONTEXT_BYTES = 1024;

function lengthToU8a (value: Uint8Array): Uint8Array {
  return bnToU8a(value.length, { bitLength: 32, isLe: true });
}

/**
 * Effective VRF signing context: `"substrate-vrf" || u32_le(origin.len) || utf8(origin) ||
 * u32_le(context.len) || context`.
 *
 * The constant namespace confines everything signed for dapps to one transcript space, so a
 * caller-chosen `context` can never reproduce another schnorrkel protocol's transcript. `origin`
 * is the requesting site's web origin (`scheme://host`) — taken from the tab, never from the
 * payload — so one site can never obtain another's outputs, not even across schemes on the same
 * host. The length prefix on `origin` is what makes the pair injective: without it a caller could
 * craft a `context` that reconstructs another origin's frame.
 *
 * This layout is frozen. Outputs are deterministic per effective context, so any change rotates
 * every identity already derived through it; a revision must be a new namespace, never an edit.
 */
export function substrateVrfContext (url: string, context = new Uint8Array()): Uint8Array {
  const parsedUrl = new URL(url);

  assert(parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:', 'VRF signing requires an HTTP(S) origin');

  const origin = stringToU8a(parsedUrl.origin);

  return u8aConcat(VRF_NAMESPACE, lengthToU8a(origin), origin, lengthToU8a(context), context);
}

export default class RequestVrfSign implements RequestSign {
  public readonly isVrf = true;
  public readonly payload: SignerPayloadRaw;
  /** the caller's own separator, surfaced so the confirmation screen can show what is being derived */
  public readonly vrfContext?: HexString;

  readonly #context: Uint8Array;

  constructor ({ address, context, data }: SignerPayloadVrf, url: string) {
    assert(isHex(data), 'VRF data must be a 0x-prefixed hex string');
    assert(context === undefined || isHex(context), 'VRF context must be a 0x-prefixed hex string');

    const dataBytes = hexToU8a(data);
    const contextBytes = context ? hexToU8a(context) : undefined;

    assert(dataBytes.length <= MAX_DATA_BYTES, `VRF data must be at most ${MAX_DATA_BYTES} bytes`);
    assert(!contextBytes || contextBytes.length <= MAX_CONTEXT_BYTES, `VRF context must be at most ${MAX_CONTEXT_BYTES} bytes`);

    this.payload = { address, data, type: 'bytes' };
    this.vrfContext = context;
    this.#context = substrateVrfContext(url, contextBytes);
  }

  sign (_registry: TypeRegistry, pair: KeyringPair): { signature: HexString } {
    // never fall through to the non-sr25519 branch of `vrfSign`: it fakes a VRF by hashing a plain
    // signature, which is the very "signature as key material" pattern the VRF exists to avoid
    assert(pair.type === 'sr25519', 'VRF signing requires an sr25519 account');

    return {
      signature: u8aToHex(pair.vrfSign(hexToU8a(this.payload.data), this.#context))
    };
  }
}
