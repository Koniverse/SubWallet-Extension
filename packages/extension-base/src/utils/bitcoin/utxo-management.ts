// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BTC_DUST_AMOUNT } from '@subwallet/extension-base/constants';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { DetermineUtxosForSpendArgs, InsufficientFundsError, UtxoResponseItem } from '@subwallet/extension-base/types';
import { BitcoinAddressType } from '@subwallet/keyring/types';
import { getBitcoinAddressInfo, validateBitcoinAddress } from '@subwallet/keyring/utils';
import BigN from 'bignumber.js';

import { getSizeInfo, getSpendableAmount } from './common';

// https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/utils.ts
// Check if the spendable amount drops when adding a utxo. If it drops, don't use that utxo.
// Method might be not particularly efficient as it would
// go through the utxo array multiple times, but it's reliable.
export function filterUneconomicalUtxos ({ feeRate,
  recipients,
  sender,
  utxos }: {
  utxos: UtxoResponseItem[];
  feeRate: number;
  sender: string;
  recipients: string[];
}) {
  const addressInfo = validateBitcoinAddress(sender) ? getBitcoinAddressInfo(sender) : null;
  const inputAddressTypeWithFallback = addressInfo ? addressInfo.type : BitcoinAddressType.p2wpkh;

  const filteredAndSortUtxos = utxos
    .filter((utxo) => utxo.value >= BTC_DUST_AMOUNT[inputAddressTypeWithFallback])
    .sort((a, b) => a.value - b.value); // ascending order

  return filteredAndSortUtxos.reduce((utxos, utxo, currentIndex) => {
    const utxosWithout = utxos.filter((u) => u.txid !== utxo.txid);

    const { fee: feeWithout, spendableAmount: spendableAmountWithout } = getSpendableAmount({
      utxos: utxosWithout,
      feeRate,
      recipients,
      sender
    });

    const { fee, spendableAmount } = getSpendableAmount({
      utxos,
      feeRate,
      recipients,
      sender
    });

    console.log(utxosWithout, feeWithout, spendableAmountWithout.toString());
    console.log(utxos, fee, spendableAmount.toString());

    if (spendableAmount.lte(0)) {
      return utxosWithout;
    } else {
      // if spendable amount becomes bigger, do not use that utxo
      return spendableAmountWithout.gt(spendableAmount) ? utxosWithout : utxos;
    }
  }, [...filteredAndSortUtxos]).reverse();
}

// https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/coinselect/local-coin-selection.ts
export function determineUtxosForSpendAll ({ feeRate,
  recipient,
  sender,
  utxos }: DetermineUtxosForSpendArgs) {
  if (!validateBitcoinAddress(recipient)) {
    throw new Error('Cannot calculate spend of invalid address type');
  }
  // TODO: Prevent dust limit when transferring all

  const recipients = [recipient];

  const filteredUtxos = filterUneconomicalUtxos({ utxos, feeRate, recipients, sender });

  const sizeInfo = getSizeInfo({
    sender,
    inputLength: filteredUtxos.length,
    recipients
  });

  const amount = filteredUtxos.reduce((acc, utxo) => acc + utxo.value, 0) - Math.ceil(sizeInfo.txVBytes * feeRate);

  if (amount <= 0) {
    throw new InsufficientFundsError();
  }

  // Fee has already been deducted from the amount with send all
  const outputs = [{ value: amount, address: recipient }];

  const fee = Math.ceil(sizeInfo.txVBytes * feeRate);

  return {
    inputs: filteredUtxos,
    outputs,
    size: sizeInfo.txVBytes,
    fee
  };
}

// https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/coinselect/local-coin-selection.ts
export function determineUtxosForSpend ({ amount,
  feeRate,
  recipient,
  sender,
  utxos }: DetermineUtxosForSpendArgs) {
  if (!validateBitcoinAddress(recipient)) {
    throw new Error('Cannot calculate spend of invalid address type');
  }

  const recipientAddressInfo = getBitcoinAddressInfo(recipient);
  const recipientDustLimit = BTC_DUST_AMOUNT[recipientAddressInfo.type] || 546;

  if (amount < recipientDustLimit) {
    throw new Error(
      `Transfer amount ${amount} satoshis is below dust limit (${recipientDustLimit} satoshis for ${recipientAddressInfo.type})`
    );
  }

  const orderedUtxos = utxos.sort((a, b) => b.value - a.value);
  const recipients = [recipient, sender];
  const filteredUtxos = filterUneconomicalUtxos({
    utxos: orderedUtxos,
    feeRate,
    recipients,
    sender
  });

  const neededUtxos = [];
  let sum = new BigN(0);
  let sizeInfo = null;

  for (const utxo of filteredUtxos) {
    sizeInfo = getSizeInfo({
      inputLength: neededUtxos.length,
      sender,
      recipients
    });

    const currentValue = new BigN(amount).plus(Math.ceil(sizeInfo.txVBytes * feeRate));

    if (sum.gte(currentValue)) {
      break;
    }

    sum = sum.plus(utxo.value);
    neededUtxos.push(utxo);

    // re calculate size info, some case array end
    sizeInfo = getSizeInfo({
      inputLength: neededUtxos.length,
      sender,
      recipients
    });
  }

  if (!sizeInfo) {
    throw new InsufficientFundsError();
  }

  const fee = Math.ceil(sizeInfo.txVBytes * feeRate);

  const amountLeft = sum.minus(amount).minus(fee);

  if (amountLeft.lte(0)) {
    throw new InsufficientFundsError();
  }

  const senderAddressInfo = getBitcoinAddressInfo(sender);
  const dustLimit = BTC_DUST_AMOUNT[senderAddressInfo.type] || 546;

  const outputs = [
    // outputs[0] = the desired amount going to recipient
    { value: amount, address: recipient }
  ];

  if (amountLeft.gte(dustLimit)) {
    // outputs[1] = the remainder to be returned to a change address
    outputs.push({ value: amountLeft.toNumber(), address: sender });
  } else {
    console.warn(
      `Change output of ${amountLeft.toString()} satoshis is below dust limit (${dustLimit} satoshis for ${senderAddressInfo.type}). Omitting change output and adding to fee.`
    );
    // Increase the fee to use the remaining balance
    const newFee = sum.minus(amount).toNumber();

    return {
      filteredUtxos,
      inputs: neededUtxos,
      outputs,
      size: sizeInfo.txVBytes,
      fee: newFee
    };
  }

  return {
    filteredUtxos,
    inputs: neededUtxos,
    outputs,
    size: sizeInfo.txVBytes,
    fee
  };
}

export function filterOutPendingTxsUtxos (utxos: UtxoResponseItem[]): UtxoResponseItem[] {
  return utxos.filter((utxo) => utxo.status.confirmed);
}

export function filteredOutTxsUtxos (allTxsUtxos: UtxoResponseItem[], filteredOutTxsUtxos: UtxoResponseItem[]): UtxoResponseItem[] {
  if (!filteredOutTxsUtxos.length) {
    return allTxsUtxos;
  }

  const listFilterOut = filteredOutTxsUtxos.map((utxo) => {
    return `${utxo.txid}:${utxo.vout}`;
  });

  return allTxsUtxos.filter((element) => !listFilterOut.includes(`${element.txid}:${element.vout}`));
}

export async function getRuneUtxos (bitcoinApi: _BitcoinApi, address: string) {
  const responseRuneUtxos = await bitcoinApi.api.getRuneUtxos(address);

  const runeUtxos: UtxoResponseItem[] = [];

  responseRuneUtxos.forEach((responseRuneUtxo) => {
    const txid = responseRuneUtxo.txid;
    const vout = responseRuneUtxo.vout;
    const utxoValue = responseRuneUtxo.satoshi;

    if (txid && vout && utxoValue) {
      const item = {
        txid,
        vout,
        status: {
          confirmed: true // not use in filter out rune utxos
        },
        value: utxoValue
      } as UtxoResponseItem;

      runeUtxos.push(item);
    }
  });

  return runeUtxos;
}

export async function getInscriptionUtxos (bitcoinApi: _BitcoinApi, address: string) {
  try {
    const inscriptions = await bitcoinApi.api.getAddressInscriptions(address);

    return inscriptions.map((inscription) => {
      const [txid, vout] = inscription.output.split(':');

      return {
        txid,
        vout: parseInt(vout),
        status: {
          confirmed: true, // not use in filter out inscription utxos
          block_height: inscription.genesis_block_height,
          block_hash: inscription.genesis_block_hash,
          block_time: inscription.genesis_timestamp
        },
        value: parseInt(inscription.value)
      } as UtxoResponseItem;
    });
  } catch (e) {
    return [];
  }
}
