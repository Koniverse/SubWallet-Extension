// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import MigrateTransactionsV2Store from '@subwallet/extension-base/services/migration-service/scripts/MigrateTransactionsV2Store';

import BaseMigrationJob from '../Base';
import AutoEnableChainsTokens from './AutoEnableChainsTokens';
import MigrateAuthUrls from './MigrateAuthUrls';
import MigrateAutoLock from './MigrateAutoLock';
import MigrateChainPatrol from './MigrateChainPatrol';
import MigrateEthProvider from './MigrateEthProvider';
import MigrateImportedToken from './MigrateImportedToken';
import MigrateLedgerAccount from './MigrateLedgerAccount';
import MigrateNetworkSettings from './MigrateNetworkSettings';
import MigrateSettings from './MigrateSettings';
import MigrateTransactionHistory from './MigrateTransactionHistory';

export const EVERYTIME = '__everytime__';

export default <Record<string, typeof BaseMigrationJob>> {
  '1.0.1-11': MigrateNetworkSettings,
  '1.0.1-20': MigrateImportedToken,
  '1.0.1-30': MigrateTransactionHistory,
  '1.0.1-40': AutoEnableChainsTokens,
  '1.0.1-50': MigrateSettings,
  '1.0.1-60': MigrateAuthUrls,
  '1.0.3-01': MigrateAutoLock,
  '1.0.3-02': MigrateChainPatrol,
  '1.0.9-01': MigrateLedgerAccount,
  '1.0.12-02': MigrateEthProvider,
  '1.1.2': MigrateTransactionsV2Store
  // [`${EVERYTIME}-1`]: AutoEnableChainsTokens
};
