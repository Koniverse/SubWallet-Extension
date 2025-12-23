// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class MigrateAssetSetting20251223 extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      const changeSlugsMap: Record<string, string> = {
        'gnosis-NATIVE-xDAI': 'gnosis-NATIVE-XDAI',
        'stable-ERC20-USD₮0-0x779Ded0c9e1022225f8E0630b35a9b54bE713736': 'stable-ERC20-USDT0-0x779Ded0c9e1022225f8E0630b35a9b54bE713736'
      };

      const assetSetting = await this.state.chainService.getAssetSettings();

      const migratedAssetSetting: Record<string, AssetSetting> = {};

      for (const [oldSlug, newSlug] of Object.entries(changeSlugsMap)) {
        if (Object.keys(assetSetting).includes(oldSlug)) {
          const isVisible = assetSetting[oldSlug].visible;

          migratedAssetSetting[newSlug] = { visible: isVisible };
        }
      }

      this.state.chainService.setAssetSettings({
        ...assetSetting,
        ...migratedAssetSetting
      });
    } catch (e) {
      console.error(e);
    }
  }
}
