// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';
import { ITransactionHistoryItem } from '@subwallet/extension-base/services/storage-service/databases';

export default class MigrateTransactionHistoryBySymbol extends BaseMigrationJob {
  public override async run (): Promise<void> {
    const state = this.state;

    try {
      const changeSlugsMap: Record<string, string> = {
        'ethereum-ERC20-WFTM-0x4E15361FD6b4BB609Fa63C81A2be19d873717870': 'ethereum-ERC20-FTM-0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
        'moonbeam-ERC20-CSG-0x2Dfc76901bB2ac2A5fA5fc479590A490BBB10a5F': 'moonbeam-ERC20-CGS-0x2Dfc76901bB2ac2A5fA5fc479590A490BBB10a5F',
        'astar-LOCAL-aUSD': 'astar-LOCAL-aSEED',
        'astarEvm-ERC20-aUSD-0xfFFFFfFF00000000000000010000000000000001': 'astarEvm-ERC20-aSEED-0xfFFFFfFF00000000000000010000000000000001',
        'moonriver-LOCAL-xcaUSD': 'moonriver-LOCAL-xcaSeed',
        'moonriver-LOCAL-xckBTC': 'moonriver-LOCAL-xcKBTC',
        'bifrost-LOCAL-aUSD': 'bifrost-LOCAL-KUSD',
        'calamari-LOCAL-aUSD': 'calamari-LOCAL-AUSD',
        'shiden-LOCAL-aUSD': 'shiden-LOCAL-aSEED',
        'shidenEvm-ERC20-aUSD-0xfFFfFFfF00000000000000010000000000000000': 'shidenEvm-ERC20-aSEED-0xfFFfFFfF00000000000000010000000000000000',
        'ethereum_goerli-NATIVE-GoerliETH': 'ethereum_goerli-NATIVE-ETH',
        'binance_test-NATIVE-BNB': 'binance_test-NATIVE-tBNB',
        'pangolin-LOCAL-CKTON': 'pangolin-LOCAL-PKTON',
        'zeta_test-NATIVE-aZETA': 'zeta_test-NATIVE-ZETA',
        'origintrail-NATIVE-OTP': 'origintrail-NATIVE-NEURO',
        'moonbeam-LOCAL-xciBTC': 'moonbeam-LOCAL-xcIBTC',
        'tomochain-NATIVE-TOMO': 'tomochain-NATIVE-VIC'
      };

      const allTxs: ITransactionHistoryItem[] = [];

      await Promise.all(Object.entries(changeSlugsMap).map(async ([oldSlug, newSlug], i) => {
        const oldSlugSplit = oldSlug.split('-');
        const oldChainSlug = oldSlugSplit[0];
        const oldSymbolSlug = oldSlugSplit[2];

        const newSlugSplit = newSlug.split('-');
        const newSymbolSlug = newSlugSplit[2];

        const filterTransactions = await state.dbService.stores.transaction.table.where({ chain: oldChainSlug }).and((tx) => {
          return tx.amount?.symbol === oldSymbolSlug;
        }).toArray();

        if (filterTransactions.length > 0) {
          for (const transaction of filterTransactions) {
            if (transaction.amount && transaction.amount.symbol === oldSymbolSlug) {
              transaction.amount.symbol = newSymbolSlug;
            }

            if (transaction.fee && transaction.fee.symbol === oldSymbolSlug) {
              transaction.fee.symbol = newSymbolSlug;
            }
          }
        }

        allTxs.push(...filterTransactions);
      }));

      await state.dbService.stores.transaction.table.bulkPut(allTxs);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
