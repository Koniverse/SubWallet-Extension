// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class MigrateAssetSetting extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      const changeSlugsMap: Record<string, string> = {
        'bifrost_testnet-NATIVE-BNC': 'bifrost_testnet-NATIVE-BFC',
        'energy_web_x_rococo-NATIVE-VT': 'energy_web_x_rococo-NATIVE-EWT',
        'chainflip_dot-NATIVE-DOT': 'chainflip_dot-NATIVE-Unit',
        'autonomys_taurus-NATIVE-AI3': 'autonomys_taurus-NATIVE-tAI3',
        'fraxtal-NATIVE-frxETH': 'fraxtal-ERC20-frxETH-0xFC00000000000000000000000000000000000006',
        'arbitrum_one-ERC20-USDT-0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 'arbitrum_one-ERC20-USD₮0-0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
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
