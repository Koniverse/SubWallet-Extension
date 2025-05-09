// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetSetting, TokenPriorityDetails } from '@subwallet/extension-base/background/KoniTypes';
import { _isAssetAutoEnable } from '@subwallet/extension-base/services/chain-service/utils';
import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';
import { fetchStaticData } from '@subwallet/extension-base/utils';
// Usage:
// 1. Disable tokens with a balance of 0
// 2. Exclude tokens that belong to the popular list
// 3. Exclude tokens with the "auto enable" attribute

export default class DisableZeroBalanceTokens extends BaseMigrationJob {
  public override async run (): Promise<void> {
    const state = this.state;

    try {
      const rawBalanceMap = await state.dbService.getStoredBalance();
      const tokensList = await state.chainService.getAssetSettings();
      const filteredEnabledTokens: Record<string, AssetSetting> = Object.entries(tokensList).reduce((acc, [key, value]) => {
        if (value.visible) {
          acc[key] = value;
        }

        return acc;
      }, {} as Record<string, AssetSetting>);

      const balanceNonZero = rawBalanceMap.filter((item) => {
        return (BigInt(item.free) + BigInt(item.locked) > 0);
      });

      const priorityTokensMap = await fetchStaticData<TokenPriorityDetails>('chain-assets/priority-tokens') || {
        tokenGroup: {},
        token: {}
      };

      const priorityTokensList = priorityTokensMap.token && typeof priorityTokensMap.token === 'object'
        ? Object.keys(priorityTokensMap.token)
        : [];

      const autoEnableTokenSlugs = Object.values(this.state.chainService.getAssetRegistry())
        .filter((asset) => _isAssetAutoEnable(asset))
        .map((asset) => asset.slug);
      // Extract the slugs of tokens with balance > 0
      const nonZeroBalanceSlugs = new Set(balanceNonZero.map((item) => item.tokenSlug));

      const updatedSettings = structuredClone(tokensList);

      Object.keys(filteredEnabledTokens).forEach((slug) => {
        const hasBalance = nonZeroBalanceSlugs.has(slug);
        const isPopularToken = priorityTokensList.includes(slug);
        const isAutoEnableToken = autoEnableTokenSlugs.includes(slug);

        if (!hasBalance && !isPopularToken && !isAutoEnableToken) {
          updatedSettings[slug] = {
            visible: false
          };
        }
      });

      state.chainService.setAssetSettings(updatedSettings);
    } catch (error) {
      console.error(error);
    }
  }
}
