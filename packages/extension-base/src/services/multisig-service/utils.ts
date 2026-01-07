// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MULTISIG_TX_TYPE_MAP, MultisigTxType } from '@subwallet/extension-base/services/multisig-service/index';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { GenericExtrinsic } from '@polkadot/types';
import { Block, Call } from '@polkadot/types/interfaces';
import { AnyJson, AnyTuple, Codec } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { blake2AsHex } from '@polkadot/util-crypto';

export const DEFAULT_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Request interface for getting call data from a block
 */
interface GetCallDataRequest {
  /** Hash of the call data */
  callHash: HexString;
  /** Index of the extrinsic in the block */
  extrinsicIndex: number;
  /** Block containing the extrinsic */
  block: Block;
}

/**
 * Request interface for decoding call data
 */
interface DecodeCallDataRequest {
  /** Sub API instance */
  api: ApiPromise;
  /** Optional encoded call data to decode */
  callData?: HexString;
}

/**
 * Response interface for decoded call data
 */
export interface DecodeCallDataResponse {
  /** Method name of the call */
  method: string,
  /** Section/pallet name of the call */
  section: string,
  /** Decoded arguments of the call */
  args: AnyJson
}

/**
 * Extracts call data from a block's extrinsic
 * Finds the inner call within multisig extrinsic and verifies it matches the call hash
 * @param block - Block containing the extrinsic
 * @param callHash - Expected hash of the call data
 * @param extrinsicIndex - Index of the extrinsic in the block
 * @returns Hex-encoded call data if found and verified, undefined otherwise
 */
export function getCallData ({ block, callHash, extrinsicIndex }: GetCallDataRequest): HexString | undefined {
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
}

/**
 * Type guard to check if a codec is a Call type
 * @param codec - Codec object to check
 * @returns True if the codec is a Call, false otherwise
 */
function isCall (codec: Codec): codec is Call {
  return 'args' in codec && 'method' in codec && 'section' in codec;
}

/**
 * Finds the inner call within a multisig extrinsic
 * Handles nested calls in multisig.asMulti and batchAll operations
 * @param extrinsic - Extrinsic to search for inner call
 * @returns The inner Call if found, null otherwise
 */
function findInnerExtrinsicCall (extrinsic: GenericExtrinsic<AnyTuple>): Call | null {
  const findAsMulti = (method: Call | null | undefined): Call | null => {
    const MULTISIG_EXTRINSIC_CALL_INDEX = 3;
    const WRAP_EXTRINSIC_CALL_INDEX = 2;

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

/**
 * Decodes call data into a human-readable format
 * @param api - Polkadot API instance
 * @param callData - Hex-encoded call data to decode
 * @returns Decoded call data with method, section, and args, or undefined if callData is not provided
 */
export function decodeCallData ({ api, callData }: DecodeCallDataRequest): DecodeCallDataResponse | undefined {
  if (callData) {
    return api.createType('Call', callData).toHuman() as unknown as DecodeCallDataResponse;
  }

  return undefined;
}

/**
 * Determines the type of multisig extrinsic based on decoded call data
 * Maps pallet methods to extrinsic types (Transfer, Staking, Lending, etc.)
 * @param decodedCallData - Decoded call data containing section and method
 * @returns The type of multisig extrinsic, or UNKNOWN if not recognized
 */
export function getMultisigTxType (decodedCallData: DecodeCallDataResponse | undefined) {
  if (!decodedCallData) {
    return MultisigTxType.UNKNOWN;
  }

  const sectionMethod = `${decodedCallData.section}.${decodedCallData.method}`;

  if (MULTISIG_TX_TYPE_MAP.transfer.includes(sectionMethod)) {
    return MultisigTxType.TRANSFER;
  }

  if (MULTISIG_TX_TYPE_MAP.transfer_nft.includes(sectionMethod)) {
    return MultisigTxType.TRANSFER;
  }

  if (MULTISIG_TX_TYPE_MAP.staking.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.redeem.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.unstake.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.withdraw.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.cancelUnstake.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.claim.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.nominate.includes(sectionMethod)) {
    return MultisigTxType.STAKING;
  }

  if (MULTISIG_TX_TYPE_MAP.lending.includes(sectionMethod)) {
    return MultisigTxType.LENDING;
  }

  if (MULTISIG_TX_TYPE_MAP.gov.includes(sectionMethod)) {
    return MultisigTxType.GOV;
  }

  if (MULTISIG_TX_TYPE_MAP.swap.includes(sectionMethod)) {
    return MultisigTxType.SWAP;
  }

  if (MULTISIG_TX_TYPE_MAP.setTokenPayFee.includes(sectionMethod)) {
    return MultisigTxType.SET_TOKEM_PAY_FEE;
  }

  return MultisigTxType.UNKNOWN;
}

/**
 * Generates a unique key for a pending multisig extrinsic
 * Used as the key in the PendingMultisigTxMap
 * @param chain - Chain identifier
 * @param multisigAddress - Multisig address
 * @param signerAddress - Address of the signer
 * @param extrinsicHash - Hash of the extrinsic
 * @returns Unique key string for the extrinsic
 */
export function genPendingMultisigTxKey (chain: string, multisigAddress: string, signerAddress: string, extrinsicHash: string) {
  return `${chain}___${multisigAddress}___${signerAddress}______${extrinsicHash}`;
}

/**
 * Calculate deposit amount: depositAmount = depositBase + threshold * depositFactor
 * In case threshold equal to 1, return undefined
 */
export function calcDepositAmount (depositBase: string, threshold: number, depositFactor: string): string {
  if (threshold === 1) {
    return '0';
  }

  return (BigInt(depositBase) + BigInt(threshold) * BigInt(depositFactor)).toString();
}

export function createMultisigExtrinsic (api: ApiPromise, threshold: number, signers: string[], signer: string, extrinsic: SubmittableExtrinsic): SubmittableExtrinsic {
  return api.tx.multisig.asMulti(
    threshold,
    signers.filter((s) => s !== signer).sort().reverse(),
    null,
    extrinsic,
    {
      refTime: 0,
      proofSize: 0
    }
  );
}
