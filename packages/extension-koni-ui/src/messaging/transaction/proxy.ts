// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestAddSubstrateProxy, RequestGetSubstrateProxyAccounts, RequestRemoveSubstrateProxy } from '@subwallet/extension-base/types';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function getSubstrateProxyAccounts (request: RequestGetSubstrateProxyAccounts) {
  return sendMessage('pri(proxy.getSubstrateProxyAccounts)', request);
}

export async function handleAddSubstrateProxy (request: RequestAddSubstrateProxy) {
  return sendMessage('pri(proxy.addSubstrateProxy)', request);
}

export async function handleRemoveSubstrateProxy (request: RequestRemoveSubstrateProxy) {
  return sendMessage('pri(proxy.removeSubstrateProxy)', request);
}
