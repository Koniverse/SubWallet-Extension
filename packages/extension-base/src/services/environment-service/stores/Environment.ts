// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { StoreSubject } from '@subwallet/extension-base/services/keyring-service/context/stores/Base';
import { EnvironmentStore } from '@subwallet/extension-base/stores';
import { EnvConfig } from '@subwallet-monorepos/subwallet-services-sdk/services';
import { BehaviorSubject } from 'rxjs';

export class EnvironmentStoreSubject extends StoreSubject<EnvConfig> {
  store = new EnvironmentStore();
  subject = new BehaviorSubject<EnvConfig>({});
  key = 'Environment';
  defaultValue = {};
}
