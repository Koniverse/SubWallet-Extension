// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InitSubstrateProxyTxRequest, RequestAddSubstrateProxyAccount, RequestGetSubstrateProxyAccountGroup, RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function getSubstrateProxyAccountGroup (request: RequestGetSubstrateProxyAccountGroup) {
  return sendMessage('pri(substrateProxyAccount.getGroupInfo)', request);
}

export async function handleAddSubstrateProxyAccount (request: RequestAddSubstrateProxyAccount) {
  return sendMessage('pri(substrateProxyAccount.add)', request);
}

export async function handleRemoveSubstrateProxyAccount (request: RequestRemoveSubstrateProxyAccount) {
  return sendMessage('pri(substrateProxyAccount.remove)', request);
}

export async function initSubstrateProxyTx (request: InitSubstrateProxyTxRequest) {
  return sendMessage('pri(substrateProxyAccount.initProxyTx)', request);
}
