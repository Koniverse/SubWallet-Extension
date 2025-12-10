// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types';
import { Call } from '@polkadot/types/interfaces';
import { AnyJson, AnyTuple, Codec } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { blake2AsHex } from '@polkadot/util-crypto';

const MULTISIG_EXTRINSIC_CALL_INDEX = 3;
const WRAP_EXTRINSIC_CALL_INDEX = 2;
const DEFAULT_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

export interface GetCallDataRequest {
  api: ApiPromise;
  callHash: HexString;
  blockHeight: number;
  extrinsicIndex: number;
}

export interface DecodeCallDataRequest {
  api: ApiPromise;
  callData?: HexString;
}

export interface DecodeCallDataResponse {
  method: string,
  section: string,
  args: AnyJson
}

export async function getCallData ({ api, blockHeight, callHash, extrinsicIndex }: GetCallDataRequest): Promise<HexString | undefined> {
  try {
    const blockHash = await api.rpc.chain.getBlockHash(blockHeight);

    if (blockHash.toHex() === DEFAULT_BLOCK_HASH) {
      return undefined;
    }

    const { block } = await api.rpc.chain.getBlock(blockHash);
    const extrinsic = block.extrinsics[extrinsicIndex];

    if (!extrinsic) {
      return undefined;
    }

    const innerCall = findInnerExtrinsicCall(extrinsic);

    if (!innerCall) {
      return undefined;
    }

    const callData = innerCall?.toHex();

    if (!callData || !(blake2AsHex(callData) === callHash)) {
      return undefined;
    }

    return callData;
  } catch (e) {
    console.warn('Error getCallData()', e);

    return undefined;
  }
}

function isCall (codec: Codec): codec is Call {
  return 'args' in codec && 'method' in codec && 'section' in codec;
}

function findInnerExtrinsicCall (extrinsic: GenericExtrinsic<AnyTuple>): Call | null {
  const findAsMulti = (method: Call | null | undefined): Call | null => {
    if (!method) {
      return null;
    }

    const { method: callMethod, section } = method.toHuman();

    if (callMethod === 'asMulti' && section === 'multisig') {
      const arg = method.args[MULTISIG_EXTRINSIC_CALL_INDEX];

      return isCall(arg) ? arg : null;
    }

    if (callMethod === 'batchAll' && method.args.length > 0) {
      const firstArg = method.args[0];

      for (const item of firstArg as unknown as Iterable<Codec>) {
        if (isCall(item)) {
          const result = findAsMulti(item);

          if (result) {
            return result;
          }
        }
      }
    }

    if (method.args && method.args.length > WRAP_EXTRINSIC_CALL_INDEX) {
      const wrappedArg = method.args[WRAP_EXTRINSIC_CALL_INDEX];

      if (isCall(wrappedArg)) {
        return findAsMulti(wrappedArg);
      }
    }

    return null;
  };

  return findAsMulti(extrinsic.method as Call);
}

export function decodeCallData ({ api, callData }: DecodeCallDataRequest): DecodeCallDataResponse | undefined {
  if (callData) {
    return api.createType('Call', callData).toHuman() as unknown as DecodeCallDataResponse;
  }

  return undefined;
}

export function genMultisigKey (chainSlug: string, multisigAddress: string) {
  return `${chainSlug}___${multisigAddress}`;
}
