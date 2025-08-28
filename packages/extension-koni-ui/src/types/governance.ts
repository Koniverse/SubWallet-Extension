// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export enum GovernanceScreenView {
  OVERVIEW= 'overview',
  REFERENDUM_DETAIL= 'referendum-detail',
  UNLOCK_TOKEN= 'unlock-token'
}

export type GovernanceVoteType = 'aye' | 'nay' | 'abstain' | 'split';

export enum GovernanceVoteOptions {
  Aye = 'aye',
  Nay = 'nay',
  Abstain = 'abstain',
  Split = 'split'
}
