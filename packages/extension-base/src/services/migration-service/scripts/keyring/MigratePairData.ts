// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class MigratePairData extends BaseMigrationJob {
  public override async run (): Promise<void> {
    try {
      return new Promise((resolve) => {
        try {
          this.state.keyringService.context.updateMetadataForPair();
        } catch (e) {
          this.logger.error(e);
        }

        resolve();
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
