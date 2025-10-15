// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetProxyAccounts } from '@subwallet/extension-base/types/proxy';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function getProxyAccounts (request: RequestGetProxyAccounts) {
  return sendMessage('pri(proxy.getProxyAccounts)', request);
}
