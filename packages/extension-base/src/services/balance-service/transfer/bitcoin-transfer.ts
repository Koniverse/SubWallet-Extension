// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { getTransferableBitcoinUtxos } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/bitcoin';
import { _BITCOIN_CHAIN_SLUG, _BITCOIN_NAME, _BITCOIN_TESTNET_NAME } from '@subwallet/extension-base/services/chain-service/constants';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { BitcoinFeeInfo, BitcoinFeeRate, FeeInfo, TransactionFee } from '@subwallet/extension-base/types';
import { combineBitcoinFee, determineUtxosForSpend, determineUtxosForSpendAll } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
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
  const id = getId();
  const feeCustom = _feeCustom as BitcoinFeeRate;

  console.log('_feeInfo', _feeInfo);

  const feeInfo = _feeInfo as BitcoinFeeInfo;
  const bitcoinFee = combineBitcoinFee(feeInfo, feeOption, feeCustom);
  const utxos = await getTransferableBitcoinUtxos(bitcoinApi, from);

  console.log('create.btc.bitcoinFee', bitcoinFee);
  console.log('create.btc.utxos', utxos);

  try {
    const amountValue = parseFloat(value);

    const determineUtxosArgs = {
      amount: amountValue,
      feeRate: 0,
      recipient: to,
      sender: from,
      utxos
    };

    const { fee, inputs, outputs } = transferAll
      ? determineUtxosForSpendAll(determineUtxosArgs)
      : determineUtxosForSpend(determineUtxosArgs);

    console.log('create.btc.inputs', inputs);
    console.log('create.btc.outputs', outputs);
    console.log('create.btc.fee', fee);
    // console.log(inputs, inputs.reduce((v, i) => v + i.value, 0));
    // console.log(outputs, (outputs as Array<{value: number}>).reduce((v, i) => v + i.value, 0));
    console.log('create.btc.bitcoinFee', bitcoinFee);

    const pair = keyring.getPair('bc1qd3grc7qla07ml665t09s58le85ztc32f2xx5cs');
    const tx = new Psbt({ network });
    let transferAmount = new BigN(0);

    console.log('create.btc.from', from);
    console.log('create.btc.pair', pair);
    console.log('create.btc.network', network);
    console.log('create.btc.pair.bitcoin', pair.bitcoin);
    console.log('create.btc.pair.bitcoin.output', pair.bitcoin.output);

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
        address: output.address || from,
        value: output.value
      });

      if (output.address === to) {
        transferAmount = transferAmount.plus(output.value);
      }
    }

    console.log(inputs, inputs.reduce((v, i) => v + i.value, 0));
    console.log(outputs, (outputs as Array<{value: number}>).reduce((v, i) => v + i.value, 0));
    console.log(fee, bitcoinFee);

    console.log('Transfer Amount:', transferAmount.toString());

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
