// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class DeleteInvalidEarningSlug extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      console.log('run to DeleteInvalidEarningSlug');
      await this.state.dbService.stores.yieldPosition.table.where({ chain: 'paseo_assethub' }).delete();
      await this.state.dbService.stores.yieldPoolInfo.table.where({ chain: 'paseo_assethub' }).delete();
    } catch (e) {
      console.error(e);
    }
  }
}
