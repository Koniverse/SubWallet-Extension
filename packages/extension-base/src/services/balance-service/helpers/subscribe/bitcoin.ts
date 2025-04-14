// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { APIItemState, BitcoinBalanceMetadata } from '@subwallet/extension-base/background/KoniTypes';
import { BITCOIN_REFRESH_BALANCE_INTERVAL } from '@subwallet/extension-base/constants';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { BalanceItem, UtxoResponseItem } from '@subwallet/extension-base/types';
import { filteredOutTxsUtxos, getInscriptionUtxos, getRuneUtxos } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

export const getTransferableBitcoinUtxos = async (bitcoinApi: _BitcoinApi, address: string) => {
  try {
    const [utxos, runeTxsUtxos, inscriptionUtxos] = await Promise.all([
      await bitcoinApi.api.getUtxos(address),
      await getRuneUtxos(bitcoinApi, address),
      await getInscriptionUtxos(bitcoinApi, address)
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

async function getBitcoinBalance (bitcoinApi: _BitcoinApi, addresses: string[]) {
  return await Promise.all(addresses.map(async (address) => {
    try {
      const [filteredUtxos, addressSummaryInfo] = await Promise.all([
        getTransferableBitcoinUtxos(bitcoinApi, address),
        bitcoinApi.api.getAddressSummaryInfo(address)
      ]);

      console.log('addressSummaryInfo', addressSummaryInfo);
      const bitcoinBalanceMetadata = {
        inscriptionCount: addressSummaryInfo.total_inscription,
        runeBalance: addressSummaryInfo.balance_rune,
        inscriptionBalance: addressSummaryInfo.balance_inscription
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

export function subscribeBitcoinBalance (addresses: string[], bitcoinApi: _BitcoinApi, callback: (rs: BalanceItem[]) => void): () => void {
  const getBalance = () => {
    getBitcoinBalance(bitcoinApi, addresses)
      .then((balances) => {
        return balances.map(({ balance, bitcoinBalanceMetadata }, index): BalanceItem => {
          return {
            address: addresses[index],
            tokenSlug: 'bitcoin',
            state: APIItemState.READY,
            free: balance,
            locked: '0',
            metadata: bitcoinBalanceMetadata
          };
        });
      })
      .catch((e) => {
        console.error('Error on get Bitcoin balance with token bitcoin', e);

        return addresses.map((address): BalanceItem => {
          return {
            address: address,
            tokenSlug: 'bitcoin',
            state: APIItemState.READY,
            free: '0',
            locked: '0'
          };
        });
      })
      .then((items) => {
        callback(items);
      })
      .catch(console.error);
  };

  const interval = setInterval(getBalance, BITCOIN_REFRESH_BALANCE_INTERVAL);

  getBalance();

  return () => {
    clearInterval(interval);
  };
}
