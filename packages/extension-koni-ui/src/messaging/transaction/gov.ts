// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DelegateRequest, RemoveVoteRequest, StandardVoteRequest } from '@subwallet/extension-base/services/open-gov/type';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function fetchReferendums (slug: string) {
  return sendMessage('pri(openGov.fetchReferendums)', slug);
}

export async function handleStandardVote (data: StandardVoteRequest) {
  return sendMessage('pri(openGov.standardVote)', data);
}

export async function handleRemoveVote (data: RemoveVoteRequest) {
  return sendMessage('pri(openGov.removeVote)', data);
}

export async function fetchDelegates (slug: string) {
  return sendMessage('pri(openGov.fetchDelegates)', slug);
}

export async function handleDelegate (data: DelegateRequest) {
  return sendMessage('pri(openGov.delegate)', data);
}
