// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { AddressBalanceResult, APIItemState, BitcoinBalanceMetadata } from '@subwallet/extension-base/background/KoniTypes';
import { BITCOIN_REFRESH_BALANCE_INTERVAL } from '@subwallet/extension-base/constants';
import { _BitcoinApi } from '@subwallet/extension-base/services/chain-service/types';
import { BalanceItem, SusbcribeBitcoinPalletBalance } from '@subwallet/extension-base/types';
import { filterAssetsByChainAndType } from '@subwallet/extension-base/utils';

function getDefaultBalanceResult (): AddressBalanceResult {
  return {
    balance: '0',
    bitcoinBalanceMetadata: {
      inscriptionCount: 0,
      runeBalance: '0',
      inscriptionBalance: '0'
    }
  };
}

async function getBitcoinBalance (bitcoinApi: _BitcoinApi, addresses: string[]) {
  return await Promise.all(addresses.map(async (address) => {
    try {
      const [addressSummaryInfo] = await Promise.all([
        bitcoinApi.api.getAddressSummaryInfo(address)
      ]);

      if (Number(addressSummaryInfo.balance) < 0) {
        return getDefaultBalanceResult();
      }

      const bitcoinBalanceMetadata = {
        inscriptionCount: addressSummaryInfo.total_inscription,
        runeBalance: addressSummaryInfo.balance_rune,
        inscriptionBalance: addressSummaryInfo.balance_inscription
      } as BitcoinBalanceMetadata;

      return {
        balance: addressSummaryInfo.balance.toString(),
        bitcoinBalanceMetadata: bitcoinBalanceMetadata
      };
    } catch (error) {
      console.log('Error while fetching Bitcoin balances', error);

      return getDefaultBalanceResult();
    }
  }));
}

export function subscribeBitcoinBalance (params: SusbcribeBitcoinPalletBalance): () => void {
  const { addresses, assetMap, bitcoinApi, callback, chainInfo } = params;
  const chain = chainInfo.slug;
  const nativeTokenInfo = filterAssetsByChainAndType(assetMap, chain, [_AssetType.NATIVE]);
  const nativeTokenSlug = Object.values(nativeTokenInfo)[0]?.slug || '';

  const getBalance = () => {
    getBitcoinBalance(bitcoinApi, addresses)
      .then((balances) => {
        return balances.map(({ balance, bitcoinBalanceMetadata }, index): BalanceItem => {
          return {
            address: addresses[index],
            tokenSlug: nativeTokenSlug,
            state: APIItemState.READY,
            free: balance,
            locked: (
              parseInt(bitcoinBalanceMetadata.runeBalance.toString()) +
              parseInt(bitcoinBalanceMetadata.inscriptionBalance.toString())
            ).toString(),
            metadata: bitcoinBalanceMetadata
          };
        });
      })
      .catch((e) => {
        console.error('Error on get Bitcoin balance with token bitcoin', e);

        return addresses.map((address): BalanceItem => {
          return {
            address: address,
            tokenSlug: nativeTokenSlug,
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
