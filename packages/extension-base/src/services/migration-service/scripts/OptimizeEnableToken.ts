// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class OptimizeEnableToken extends BaseMigrationJob {
  public override async run (): Promise<void> {
    // Reset the hasOptimizedTokens flag to allow re-optimize tokens
    this.state.balanceService.resetOptimizeTokensFlag();
  }
}
