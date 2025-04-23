// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StandardVoteRequest } from '@subwallet/extension-base/services/open-gov/type';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function fetchReferendums (slug: string) {
  return sendMessage('pri(openGov.fetchReferendums)', slug);
}

export async function handleStandardVote (data: StandardVoteRequest) {
  return sendMessage('pri(openGov.standardVote)', data);
}
