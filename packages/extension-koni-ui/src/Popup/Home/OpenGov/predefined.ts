// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwIconProps } from '@subwallet/react-ui/es/icon';
import { Coin, Cube, DiceSix, SelectionBackground, User } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';

type GovCategory = {
  name: string;
  slug: string;
}

export enum GovCategoryType {
  ALL='all',
  NOTVOTED='notvoted',
  VOTED='voted',
}

export const govCategoryMap: Record<string, GovCategory> = {
  [GovCategoryType.NOTVOTED]: {
    slug: GovCategoryType.NOTVOTED,
    name: 'Not voted'
  },
  [GovCategoryType.VOTED]: {
    slug: GovCategoryType.VOTED,
    name: 'Voted'
  }
};

export const govCategories: GovCategory[] = [
  govCategoryMap[GovCategoryType.NOTVOTED],
  govCategoryMap[GovCategoryType.VOTED]
];

enum TagType {
  FCFS='fcfs',
  POINTS='points',
  LUCKY_DRAW='lucky_draw',
  MANUAL_SELECTION='manual_selection'
}

type TagInfo = {
  theme: string,
  name: string,
  slug: string,
  icon: SwIconProps['phosphorIcon'],
  iconWeight?: IconWeight
}

export const tagMap: Record<string, TagInfo> = {
  [TagType.FCFS]: {
    theme: 'yellow',
    name: 'FCFS',
    slug: TagType.FCFS,
    icon: User
  },
  [TagType.POINTS]: {
    theme: 'success',
    name: 'Points',
    slug: TagType.POINTS,
    icon: Coin,
    iconWeight: 'fill'
  },
  [TagType.LUCKY_DRAW]: {
    theme: 'gold',
    name: 'Lucky draw',
    slug: TagType.LUCKY_DRAW,
    icon: DiceSix,
    iconWeight: 'fill'
  },
  [TagType.MANUAL_SELECTION]: {
    theme: 'blue',
    name: 'Manual selection',
    slug: TagType.MANUAL_SELECTION,
    icon: SelectionBackground
  },
  [GovCategoryType.NOTVOTED]: {
    theme: 'blue',
    name: 'Not voted',
    slug: GovCategoryType.NOTVOTED,
    icon: Cube,
    iconWeight: 'fill'
  },
  [GovCategoryType.VOTED]: {
    theme: 'blue',
    name: 'Voted',
    slug: GovCategoryType.VOTED,
    icon: Cube,
    iconWeight: 'fill'
  }
};
