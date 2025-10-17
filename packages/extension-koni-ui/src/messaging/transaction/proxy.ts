// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestAddProxy, RequestGetProxyAccounts, RequestRemoveProxy } from '@subwallet/extension-base/types/proxy';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function getProxyAccounts (request: RequestGetProxyAccounts) {
  return sendMessage('pri(proxy.getProxyAccounts)', request);
}

export async function handleAddProxy (request: RequestAddProxy) {
  return sendMessage('pri(proxy.addProxy)', request);
}

export async function handleRemoveProxy (request: RequestRemoveProxy) {
  return sendMessage('pri(proxy.removeProxy)', request);
}
