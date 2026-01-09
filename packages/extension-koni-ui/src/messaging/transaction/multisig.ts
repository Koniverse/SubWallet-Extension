// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApprovePendingTxRequest, CancelPendingTxRequest, ExecutePendingTxRequest, RequestGetSignableAccountInfos, RequestPrepareMultisigTransaction } from '@subwallet/extension-base/types/multisig';
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

export async function getSignableAccountInfos (request: RequestGetSignableAccountInfos) {
  return sendMessage('pri(multisig.getSignableAccountInfos)', request);
}

export async function prepareMultisigTransaction (request: RequestPrepareMultisigTransaction) {
  return sendMessage('pri(multisig.prepareMultisigTransaction)', request);
}
