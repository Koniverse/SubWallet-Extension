// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '../Base';
import ClearMetadataDatabase from './databases/ClearMetadataDatabase';
import ClearMetadataForMythos from './databases/ClearMetadataForMythos';
import MigrateAssetSetting from './databases/MigrateAssetSetting';
import MigrateEarningVersion from './databases/MigrateEarningVersion';
import ReloadMetadata from './databases/ReloadMetadata';
import MigrateLedgerAccount from './keyring/MigrateLedgerAccount';
import MigrateLedgerAccountV2 from './keyring/MigrateLedgerAccountV2';
import MigratePairData from './keyring/MigratePairData';
import MigrateRemoveGenesisHash from './keyring/MigrateRemoveGenesisHash';
import MigrateEthProvider from './providers/MigrateEthProvider';
import MigratePioneerProvider from './providers/MigratePioneerProvider';
import MigrateProvidersV1M1P24 from './providers/MigrateProvidersV1M1P24';
import MigratePolygonUSDCProvider from './tokens/MigratePolygonUSDCProvider';
import DeleteChain from './DeleteChain';
import DeleteChainStaking from './DeleteChainStaking';
import DeleteEarningData from './DeleteEarningData';
import DisableZeroBalanceTokens from './DisableZeroBalanceTokens';
import EnableVaraChain from './EnableVaraChain';
import MigrateAuthUrls from './MigrateAuthUrls';
import MigrateImportedToken from './MigrateImportedToken';
import MigrateNetworkSettings from './MigrateNetworkSettings';
import MigrateNewUnifiedAccount from './MigrateNewUnifiedAccount';
import MigrateTokenDecimals from './MigrateTokenDecimals';
import MigrateTransactionHistory from './MigrateTransactionHistory';
import MigrateTransactionHistoryBridge from './MigrateTransactionHistoryBridge';
import MigrateTransactionHistoryBySymbol from './MigrateTransactionHistoryBySymbol';
import MigrateWalletReference from './MigrateWalletReference';

export const EVERYTIME = '__everytime__';

export const MYTHOS_MIGRATION_KEY = '1.3.21-01';

export default <Record<string, typeof BaseMigrationJob>>{
  '1.0.1-11': MigrateNetworkSettings,
  '1.0.1-20': MigrateImportedToken,
  '1.0.1-30': MigrateTransactionHistory,
  // '1.0.1-40': AutoEnableChainsTokens,
  // '1.0.1-50': MigrateSettings,
  '1.0.1-60': MigrateAuthUrls,
  // '1.0.3-01': MigrateAutoLock,
  // '1.0.3-02': MigrateChainPatrol,
  '1.0.9-01': MigrateLedgerAccount,
  '1.0.12-02': MigrateEthProvider,
  '1.1.6-01': MigrateWalletReference,
  '1.1.7': DeleteChain,
  '1.1.13-01': MigrateTokenDecimals,
  // '1.1.13-02-2': EnableEarningChains,
  '1.1.13-03': DeleteEarningData,
  '1.1.17-01': MigratePioneerProvider,
  '1.1.17-03': EnableVaraChain,
  '1.1.24-01': MigrateProvidersV1M1P24,
  '1.1.26-01': MigratePolygonUSDCProvider,
  '1.1.28-01': MigrateEarningVersion,
  '1.1.33-01': MigrateLedgerAccountV2,
  '1.1.41-01': DeleteChainStaking,
  // '1.1.46-01': AutoEnableSomeTokens,
  '1.2.28-01': MigrateAssetSetting,
  '1.2.28-02': MigrateTransactionHistoryBySymbol,
  '1.2.69-01': MigrateRemoveGenesisHash,
  '1.2.13-01': ReloadMetadata,
  '1.2.32-01': MigratePairData,
  '1.3.6-01': MigrateTransactionHistoryBridge,
  '1.3.10-01': ClearMetadataDatabase,
  '1.3.26-01': DisableZeroBalanceTokens,
  [MYTHOS_MIGRATION_KEY]: ClearMetadataForMythos,
  // [`${EVERYTIME}-1.1.42-02`]: MigrateTransactionHistoryBySymbol
  // [`${EVERYTIME}-1`]: AutoEnableChainsTokens
  '1.3.42-01': MigrateNewUnifiedAccount
};
