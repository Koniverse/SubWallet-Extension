// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class DeleteEarningData20251010 extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      await this.state.dbService.deleteYieldPoolInfo(['KSM___native_staking___kusama', 'KSM___nomination_pool___kusama']);
    } catch (e) {
      console.error(e);
    }
  }
}
