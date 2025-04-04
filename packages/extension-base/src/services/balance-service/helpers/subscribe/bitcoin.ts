// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { APIItemState, BitcoinBalanceMetadata } from '@subwallet/extension-base/background/KoniTypes';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
// import { BalanceItem, UtxoResponseItem } from '@subwallet/extension-base/types';
// import { filteredOutTxsUtxos } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

export const getTransferableBitcoinUtxos = async (bitcoinApi: _BitcoinApi, address: string) => {
  try {
    // const [utxos, runeTxsUtxos, inscriptionUtxos] = await Promise.all([
    const [utxos] = await Promise.all([
      await bitcoinApi.api.getUtxos(address),
    ]);

    // let filteredUtxos: UtxoResponseItem[];

    if (!utxos || !utxos.length) {
      return [];
    }

    // filter out pending utxos
    // filteredUtxos = filterOutPendingTxsUtxos(utxos);

    // filter out rune utxos
    // filteredUtxos = filteredOutTxsUtxos(utxos, runeTxsUtxos);

    // filter out inscription utxos
    // filteredUtxos = filteredOutTxsUtxos(filteredUtxos, inscriptionUtxos);

    return utxos;
  } catch (error) {
    console.log('Error while fetching Bitcoin balances', error);

    return [];
  }
};

async function getBitcoinBalance(bitcoinApi: _BitcoinApi, addresses: string[]) {
  return await Promise.all(addresses.map(async (address) => {
    try {
      const [filteredUtxos, addressSummaryInfo] = await Promise.all([
        getTransferableBitcoinUtxos(bitcoinApi, address),
        bitcoinApi.api.getAddressSummaryInfo(address)
      ]);

      const bitcoinBalanceMetadata = {
        inscriptionCount: addressSummaryInfo.total_inscription
      } as BitcoinBalanceMetadata;

      let balanceValue = new BigN(0);

      filteredUtxos.forEach((utxo) => {
        balanceValue = balanceValue.plus(utxo.value);
      });

      return {
        balance: balanceValue.toString(),
        bitcoinBalanceMetadata: bitcoinBalanceMetadata
      };
    } catch (error) {
      console.log('Error while fetching Bitcoin balances', error);

      return {
        balance: '0',
        bitcoinBalanceMetadata: {
          inscriptionCount: 0
        }
      };
    }
  }));
}

export const subscribeBitcoinBalance = async (addresses: string[], bitcoinApi: _BitcoinApi) => {

  const getBalance = async () => {
    try {
      const balances = await getBitcoinBalance(bitcoinApi, addresses);
      return balances[0].balance;
    } catch (e) {
      console.error(`Error on get Bitcoin balance with token`, e);
      return '0';
    };
  }
  const balanceBTC = await getBalance();
  console.log('btc balance: ', balanceBTC);

  return () => {
    console.log('unsub');
  };
};