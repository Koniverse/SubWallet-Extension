// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApprovePendingTxRequest, CancelPendingTxRequest, ExecutePendingTxRequest, RequestGetSignableProxies } from '@subwallet/extension-base/types/multisig';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function approvePendingTx (request: ApprovePendingTxRequest) {
  return sendMessage('pri(multisig.approvePendingTx)', request);
}

export async function executePendingTx (request: ExecutePendingTxRequest) {
  return sendMessage('pri(multisig.executePendingTx)', request);
}

export async function cancelPendingTx (request: CancelPendingTxRequest) {
  return sendMessage('pri(multisig.cancelPendingTx)', request);
}

export async function getSignableProxies (request: RequestGetSignableProxies) {
  return sendMessage('pri(multisig.getSignableProxies)', request);
}
