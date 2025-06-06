// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { UtxoResponseItem } from '@subwallet/extension-base/types';
import { filteredOutTxsUtxos, getInscriptionUtxos, getRuneUtxos } from '@subwallet/extension-base/utils';
import { BitcoinAddressType } from '@subwallet/keyring/types';
import { BtcSizeFeeEstimator, getBitcoinAddressInfo, validateBitcoinAddress } from '@subwallet/keyring/utils';
import BigN from 'bignumber.js';

// Source: https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/utils.ts
export function getSizeInfo (payload: {
  inputLength: number;
  recipients: string[];
  sender: string;
}) {
  const { inputLength, recipients, sender } = payload;
  const senderInfo = validateBitcoinAddress(sender) ? getBitcoinAddressInfo(sender) : null;
  const inputAddressTypeWithFallback = senderInfo ? senderInfo.type : BitcoinAddressType.p2wpkh;
  const outputMap: Record<string, number> = {};

  for (const recipient of recipients) {
    const recipientInfo = validateBitcoinAddress(recipient) ? getBitcoinAddressInfo(recipient) : null;
    const outputAddressTypeWithFallback = recipientInfo ? recipientInfo.type : BitcoinAddressType.p2wpkh;
    const outputKey = outputAddressTypeWithFallback + '_output_count';

    if (outputMap[outputKey]) {
      outputMap[outputKey]++;
    } else {
      outputMap[outputKey] = 1;
    }
  }

  const txSizer = new BtcSizeFeeEstimator();

  return txSizer.calcTxSize({
    input_script: inputAddressTypeWithFallback,
    input_count: inputLength,
    ...outputMap
  });
}

// https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/utils.ts
export function getSpendableAmount ({ feeRate,
  recipients,
  sender,
  utxos }: {
  utxos: UtxoResponseItem[];
  feeRate: number;
  recipients: string[];
  sender: string;
}) {
  const balance = utxos.map((utxo) => utxo.value).reduce((prevVal, curVal) => prevVal + curVal, 0);

  const size = getSizeInfo({
    inputLength: utxos.length,
    recipients,
    sender
  });
  const fee = Math.ceil(size.txVBytes * feeRate);
  const bigNumberBalance = new BigN(balance);

  return {
    spendableAmount: BigN.max(0, bigNumberBalance.minus(fee)),
    fee
  };
}

export const getTransferableBitcoinUtxos = async (bitcoinApi: _BitcoinApi, address: string) => {
  try {
    const [utxos, runeTxsUtxos, inscriptionUtxos] = await Promise.all([
      bitcoinApi.api.getUtxos(address).catch((error) => {
        console.log('Error fetching UTXOs:', error);

        return [];
      }),
      getRuneUtxos(bitcoinApi, address).catch((error) => {
        console.log('Error fetching Rune UTXOs:', error);

        return [];
      }),
      getInscriptionUtxos(bitcoinApi, address).catch((error) => {
        console.log('Error fetching Inscription UTXOs:', error);

        return [];
      })
    ]);

    let filteredUtxos: UtxoResponseItem[];

    if (!utxos || !utxos.length) {
      return [];
    }

    // filter out pending utxos
    // filteredUtxos = filterOutPendingTxsUtxos(utxos);

    // filter out rune utxos
    filteredUtxos = filteredOutTxsUtxos(utxos, runeTxsUtxos);

    // filter out dust utxos
    // filter out inscription utxos
    filteredUtxos = filteredOutTxsUtxos(utxos, inscriptionUtxos);

    return filteredUtxos;
  } catch (error) {
    console.log('Error while fetching Bitcoin balances', error);

    return [];
  }
};
