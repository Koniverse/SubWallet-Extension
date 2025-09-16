// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';
import { _isCustomAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { ChainInfoMap } from '@subwallet/chain-list';
import { _ChainStatus } from '@subwallet/chain-list/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { keyring } from '@subwallet/ui-keyring';

const ignoredList = [
  'bevm',
  'bevmTest',
  'bevm_testnet',
  'layerEdge_testnet',
  'merlinEvm',
  'botanixEvmTest',
  'syscoin_evm',
  'syscoin_evm_testnet',
  'rollux_evm',
  'rollux_testnet',
  'boolAlpha',
  'boolBeta_testnet',
  'core',
  'satoshivm',
  'satoshivm_testnet',
  'storyPartner_testnet'
];

export default class OptimizeEnableToken extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      const [
        blockscoutData,
        storedAssetRegistry,
        tokensList,
        accounts
      ] = await Promise.all([
        subwalletApiSdk.balanceDetectionApi.getBlockscoutChainData(),
        this.state.dbService.getAllAssetStore(),
        this.state.chainService.getAssetSettings(),
        Promise.resolve(keyring.getAccounts())
      ]);

      const disableChains: string[] = [];

      const customTokens = storedAssetRegistry
        .filter(asset => _isCustomAsset(asset.slug))
        .map(asset => asset.slug);

      Object.values(ChainInfoMap)
        .filter((info) => info.chainStatus === _ChainStatus.ACTIVE && !ignoredList.includes(info.slug) && (!!info.evmInfo || !!info.substrateInfo))
        .forEach((info) => {
          const evmId = info.evmInfo?.evmChainId as number;
          const chainBalanceSlug = info.extraInfo?.chainBalanceSlug;

          // evm chain able to detect balance
          if (evmId && blockscoutData[evmId]) {
            disableChains.push(info.slug);
          }

          // substrate chain able to detect balance
          if (chainBalanceSlug && !!info.substrateInfo) {
            disableChains.push(info.slug);
          }
        });

      const filteredEnabledTokens: Record<string, AssetSetting> = Object.entries(tokensList).reduce((acc, [key, value]) => {
        if (value.visible && !customTokens.includes(key)) {
          acc[key] = value;
        }

        return acc;
      }, {} as Record<string, AssetSetting>);

      const updatedSettings = structuredClone(tokensList);

      // disable all tokens
      Object.keys(filteredEnabledTokens).forEach((slug) => {
        updatedSettings[slug] = {
          visible: false
        };
      });

      this.state.chainService.setAssetSettings(updatedSettings);

      // disable all substrate & evm chains
      disableChains.forEach((tokenSlug) => {
        this.state.chainService.disableChain(tokenSlug, true);
      });

      // re-enable chains with balances
      await this.state.balanceService.autoEnableChains(accounts.map(({ address }) => address));
    } catch (e) {
      console.error(e);
    }
  }
}
