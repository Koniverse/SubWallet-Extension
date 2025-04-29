// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _BITCOIN_CHAIN_SLUG, _BITCOIN_NAME, _BITCOIN_TESTNET_NAME } from '@subwallet/extension-base/services/chain-service/constants';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { BitcoinFeeInfo, BitcoinFeeRate, FeeInfo, TransactionFee } from '@subwallet/extension-base/types';
import { combineBitcoinFee, determineUtxosForSpend, determineUtxosForSpendAll, getTransferableBitcoinUtxos } from '@subwallet/extension-base/utils';
import { keyring } from '@subwallet/ui-keyring';
import BigN from 'bignumber.js';
import { Network, Psbt } from 'bitcoinjs-lib';

export interface TransferBitcoinProps extends TransactionFee {
  bitcoinApi: _BitcoinApi;
  chain: string;
  from: string;
  feeInfo: FeeInfo;
  to: string;
  transferAll: boolean;
  value: string;
  network: Network
}

export async function createBitcoinTransaction (params: TransferBitcoinProps): Promise<[Psbt, string]> {
  const { bitcoinApi, chain, feeCustom: _feeCustom, feeInfo: _feeInfo, feeOption, from, network, to, transferAll, value } = params;
  const feeCustom = _feeCustom as BitcoinFeeRate;

  const feeInfo = _feeInfo as BitcoinFeeInfo;
  const bitcoinFee = combineBitcoinFee(feeInfo, feeOption, feeCustom);
  const utxos = await getTransferableBitcoinUtxos(bitcoinApi, from);

  try {
    const amountValue = parseFloat(value);

    const determineUtxosArgs = {
      amount: amountValue,
      feeRate: bitcoinFee.feeRate,
      recipient: to,
      sender: from,
      utxos
    };

    const { fee, inputs, outputs } = transferAll
      ? determineUtxosForSpendAll(determineUtxosArgs)
      : determineUtxosForSpend(determineUtxosArgs);

    const pair = keyring.getPair('bc1qqn6ggclhsk2h5rmzy8v8akkh0mawcjesvcy6c9');
    const tx = new Psbt({ network });
    let transferAmount = new BigN(0);

    for (const input of inputs) {
      if (pair.type === 'bitcoin-44' || pair.type === 'bittest-44') {
        const hex = await bitcoinApi.api.getTxHex(input.txid);

        tx.addInput({
          hash: input.txid,
          index: input.vout,
          nonWitnessUtxo: Buffer.from(hex, 'hex')
        });
      } else {
        tx.addInput({
          hash: input.txid,
          index: input.vout,
          witnessUtxo: {
            script: pair.bitcoin.output,
            value: input.value
          }
        });
      }
    }

    for (const output of outputs) {
      tx.addOutput({
        address: 'bc1qqn6ggclhsk2h5rmzy8v8akkh0mawcjesvcy6c9',
        value: output.value
      });

      if (output.address === to) {
        transferAmount = transferAmount.plus(output.value);
      }
    }

    console.log(inputs, inputs.reduce((v, i) => v + i.value, 0));
    console.log(outputs, (outputs as Array<{value: number}>).reduce((v, i) => v + i.value, 0));
    console.log(fee, bitcoinFee);

    return [tx, transferAmount.toString()];
  } catch (e) {
    // const error = e as Error;

    throw new Error(`You don’t have enough BTC (${convertChainToSymbol(chain)}) for the transaction. Lower your BTC amount and try again`);
  }
}

function convertChainToSymbol (chain: string) {
  if (chain === _BITCOIN_CHAIN_SLUG) {
    return _BITCOIN_NAME;
  } else {
    return _BITCOIN_TESTNET_NAME;
  }
}
