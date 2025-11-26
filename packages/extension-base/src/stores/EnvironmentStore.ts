// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { EXTENSION_PREFIX } from '@subwallet/extension-base/defaults';
import SubscribableStore from '@subwallet/extension-base/stores/SubscribableStore';
import { EnvConfig } from '@subwallet-monorepos/subwallet-services-sdk/services';

export default class EnvironmentStore extends SubscribableStore<EnvConfig> {
  constructor () {
    super(EXTENSION_PREFIX ? `${EXTENSION_PREFIX}environment` : null);
  }
}
