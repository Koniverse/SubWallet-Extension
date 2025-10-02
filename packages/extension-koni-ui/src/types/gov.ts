// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovDelegationDetail, GovVoteDetail, GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { Referendum } from '@subwallet/subsquare-api-sdk';

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

export interface UserVoting {
  address: string;
  trackId: number;
  votes?: GovVoteDetail;
  delegation?: GovDelegationDetail;
}

export interface ReferendumWithVoting extends Referendum {
  userVoting?: UserVoting[];
}

export type VoteAmountDetailProps = {
  abstainAmount?: string;
  ayeAmount?: string;
  nayAmount?: string;
}

export type PreviousVoteAmountDetail = VoteAmountDetailProps & { type: GovVoteType }
