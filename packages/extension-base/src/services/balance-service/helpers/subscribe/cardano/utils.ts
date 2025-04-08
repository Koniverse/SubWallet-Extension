// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from '@emurgo/cardano-serialization-lib-nodejs';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { CardanoTxOutput } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';

export function getCardanoAssetId (chainAsset: _ChainAsset): string {
  return chainAsset.metadata?.cardanoId as string;
}

export function getCardanoTxFee (payload: string) {
  return BigInt(Transaction.from_hex(payload).body().fee().to_str());
}

export function getAdaBelongUtxo (payload: string, receiverAddress: string) {
  const txOutputsRaw = Transaction.from_hex(payload).body().outputs().to_json();
  const txOutputs = JSON.parse(txOutputsRaw) as CardanoTxOutput[];
  const receiverUtxo = txOutputs.find((utxo) => utxo.address === receiverAddress); // must has utxo to receiver

  // @ts-ignore
  return BigInt(receiverUtxo.amount.coin);
}

export const cborToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 === 0 && /^[0-9A-F]*$/i.test(hex)) {
    return Buffer.from(hex, 'hex');
  }

  return Buffer.from(hex, 'utf-8');
};

export async function retryCardanoTxStatus (fn: () => Promise<boolean>, options: { retries: number, delay: number }): Promise<boolean> {
  let lastError: Error | undefined;

  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Error) {
        lastError = e;
      }

      // todo: improve the timeout tx
      await new Promise((resolve) => setTimeout(resolve, options.delay)); // wait for delay period, then recall the fn()
    }
  }

  console.error('Cardano transaction timeout', lastError); // throw only last error, in case no successful result from fn()

  return false;
}

export interface CardanoAssetMetadata {
  cardanoId: string;
  policyId: string;
  nameHex: string;
}

export function splitCardanoId (id: string): CardanoAssetMetadata {
  if (id === 'lovelace') {
    return {
      cardanoId: id,
      policyId: '',
      nameHex: ''
    };
  }

  if (!id || id.length < 56) {
    throw new Error('The cardano native asset policy id must has 28 bytes in length.');
  } else {
    return {
      cardanoId: id,
      policyId: id.slice(0, 56),
      nameHex: id.slice(56)
    };
  }
}
