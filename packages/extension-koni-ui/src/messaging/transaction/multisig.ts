// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApprovePendingTxRequest, ExecutePendingTxRequest } from '@subwallet/extension-base/types/multisig';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function approvePendingTx (request: ApprovePendingTxRequest) {
  return sendMessage('pri(multisig.approvePendingTx)', request);
}

export async function executePendingTx (request: ExecutePendingTxRequest) {
  return sendMessage('pri(multisig.executePendingTx)', request);
}
