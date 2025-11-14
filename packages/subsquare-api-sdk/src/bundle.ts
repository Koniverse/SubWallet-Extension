// Copyright 2019-2022 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubsquareApiSdk } from './subsquare-sdk';

export { packageInfo } from './packageInfo';

export const getSubsquareApi = (chain: string) => SubsquareApiSdk.getInstance(chain);

export { SubsquareApiSdk } from './subsquare-sdk';
