// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types';
import { AnyJson, AnyTuple } from '@polkadot/types/types';
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

    if (nullable(extrinsic)) {
      return undefined;
    }

    const innerCall = findInnerExtrinsicCall(extrinsic);

    if (nullable(innerCall)) {
      return undefined;
    }

    const callData = innerCall?.toHex();

    if (!callData || !validateCallData(callData, callHash)) {
      return undefined;
    }

    return callData;
  } catch (e) {
    console.warn('Error getCallData()', e);

    return undefined;
  }
}

function nonNullable<T> (val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

function nullable<T> (val: T | null | undefined): val is null | undefined {
  return val === null || val === undefined;
}

function validateCallData (callData: string, callHash: string): boolean {
  const hash = blake2AsHex(callData);

  return hash === callHash;
}

function findInnerExtrinsicCall (extrinsic: GenericExtrinsic<AnyTuple>) {
  const findAsMulti = (method: any): any => {
    if (!method) {
      return null;
    }

    if (method.toHuman().method === 'asMulti' && method.toHuman().section === 'multisig') {
      return method.args[MULTISIG_EXTRINSIC_CALL_INDEX];
    }

    if (method.toHuman().method === 'batchAll') {
      for (const arg of method.args[0]) {
        const result = findAsMulti(arg);

        if (nonNullable(result)) {
          return result;
        }
      }
    }

    if (method.args) {
      return findAsMulti(method.args[WRAP_EXTRINSIC_CALL_INDEX]);
    }

    return null;
  };

  return findAsMulti(extrinsic.method);
}

export function decodeCallData ({ api, callData }: DecodeCallDataRequest): DecodeCallDataResponse | undefined {
  if (callData) {
    return api.createType('Call', callData).toHuman() as unknown as DecodeCallDataResponse;
  }

  return undefined;
}
