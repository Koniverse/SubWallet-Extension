// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class DeleteEarningData20251105 extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      await this.state.dbService.deleteYieldPoolInfo(['DOT___native_staking___polkadot', 'DOT___nomination_pool___polkadot']);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
