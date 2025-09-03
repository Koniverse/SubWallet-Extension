// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@subwallet/extension-koni-ui/types/index';
import { GovStatusKey } from '@subwallet/subsquare-api-sdk';
import { IconProps } from 'phosphor-react';
import React from 'react';

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

export interface GovStatusItem {
  key: GovStatusKey;
  label: string;
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  colorToken?: keyof Theme['token'];
}
