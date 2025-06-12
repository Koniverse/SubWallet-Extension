// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { _BITCOIN_CHAIN_SLUG, _BITCOIN_NAME, _BITCOIN_TESTNET_NAME } from '@subwallet/extension-base/services/chain-service/constants';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { BitcoinFeeInfo, BitcoinFeeRate, FeeInfo, TransactionFee } from '@subwallet/extension-base/types';
import { combineBitcoinFee, determineUtxosForSpend, determineUtxosForSpendAll, getTransferableBitcoinUtxos } from '@subwallet/extension-base/utils';
import { BitcoinAddressType } from '@subwallet/keyring/types';
import { getBitcoinAddressInfo } from '@subwallet/keyring/utils';
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

export async function createBitcoinTransaction (params: TransferBitcoinProps): Promise<[Psbt, string, string]> {
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

    const { fee, inputs, outputs, size } = transferAll
      ? determineUtxosForSpendAll(determineUtxosArgs)
      : determineUtxosForSpend(determineUtxosArgs);

    const pair = keyring.getPair(from);
    const tx = new Psbt({ network });
    let transferAmount = new BigN(0);

    for (const input of inputs) {
      const addressInfo = getBitcoinAddressInfo(pair.address);

      if (addressInfo.type === BitcoinAddressType.p2pkh || addressInfo.type === BitcoinAddressType.p2sh) {
        // BIP-44 (Legacy)
        const hex = await bitcoinApi.api.getTxHex(input.txid);

        tx.addInput({
          hash: input.txid,
          index: input.vout,
          nonWitnessUtxo: Buffer.from(hex, 'hex')
        });
      } else if (addressInfo.type === BitcoinAddressType.p2wpkh) {
        // BIP-84 (Native SegWit)
        tx.addInput({
          hash: input.txid,
          index: input.vout,
          witnessUtxo: {
            script: pair.bitcoin.output,
            value: input.value
          }
        });
      } else if (addressInfo.type === BitcoinAddressType.p2tr) {
        // BIP-86 (Taproot)
        tx.addInput({
          hash: input.txid,
          index: input.vout,
          witnessUtxo: {
            script: pair.bitcoin.output,
            value: input.value // UTXO value in satoshis
          },
          tapInternalKey: pair.bitcoin.internalPubkey // X-only public key (32 bytes)
        });
      } else {
        throw new Error(`Unsupported address type: ${addressInfo.type}`);
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

    const customFeeRate = fee / size;

    return [tx, customFeeRate.toString(), transferAmount.toString()];
  } catch (e) {
    if (e instanceof TransactionError) {
      throw e;
    }

    console.warn('Failed to create Bitcoin transaction:', e);
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
