// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardanoExtensionCIP } from '@subwallet/extension-inject/types';

export { CIP30Api } from './cip30';

export const ExtensionCIPsSupported: CardanoExtensionCIP[] = [
  {
    cip: 30
  }
];
