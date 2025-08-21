// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteRequest, RemoveVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export function handleVote (data: GovVoteRequest) {
  return sendMessage('pri(openGov.vote)', data);
}

export function handleRemoveVote (data: RemoveVoteRequest) {
  return sendMessage('pri(openGov.unvote)', data);
}
