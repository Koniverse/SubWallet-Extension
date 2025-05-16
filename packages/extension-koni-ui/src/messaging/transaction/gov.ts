// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DelegateRequest, GetAbstainTotalRequest, GetLockedBalanceRequest, RemoveVoteRequest, SplitAbstainVoteRequest, StandardVoteRequest, UnlockBalanceRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function fetchReferendums (slug: string) {
  return sendMessage('pri(openGov.fetchReferendums)', slug);
}

export async function getAbstainTotal (data: GetAbstainTotalRequest) {
  return sendMessage('pri(openGov.getAbstainTotal)', data);
}

export async function handleStandardVote (data: StandardVoteRequest) {
  return sendMessage('pri(openGov.standardVote)', data);
}

export async function handleSplitAbstainVote (data: SplitAbstainVoteRequest) {
  return sendMessage('pri(openGov.splitAbstainVote)', data);
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

export async function handleUndelegate (data: DelegateRequest) {
  return sendMessage('pri(openGov.undelegate)', data);
}

export async function handleEditDelegate (data: DelegateRequest) {
  return sendMessage('pri(openGov.editDelegate)', data);
}

export async function getLockedBalance (data: GetLockedBalanceRequest) {
  return sendMessage('pri(openGov.getLockedBalance)', data);
}

export async function handleUnlockBalance (data: UnlockBalanceRequest) {
  return sendMessage('pri(openGov.unlockBalance)', data);
}

export async function getTracks (slug: string) {
  return sendMessage('pri(openGov.getTracks)', slug);
}
