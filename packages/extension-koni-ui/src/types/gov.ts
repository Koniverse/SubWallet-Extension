// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';

import { AccountAddressItemType } from './account';

export enum GovVoteStatus {
  DELEGATED = 'delegated',
  NOT_VOTED = 'not_voted',
  VOTED = 'voted'
}

export type GovAccountAddressItemType = AccountAddressItemType & {
  govVoteStatus: GovVoteStatus;
};

export type GovVoteSide = GovVoteType.AYE | GovVoteType.NAY | GovVoteType.ABSTAIN;
