// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SwIconProps } from '@subwallet/react-ui/es/icon';
import { t } from 'i18next';
import { Coin, Cube, DiceSix, SelectionBackground, User } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';

type GovCategory = {
  name: string;
  slug: string;
}

export interface voteData{
  value: string,
  conviction: number
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

export const convictionOptions = [
  { label: t('0.1x (No lockup)'), value: 0, lockPeriod: 0 },
  { label: t('1x (7 days)'), value: 1, lockPeriod: 7 },
  { label: t('2x (14 days)'), value: 2, lockPeriod: 14 },
  { label: t('3x (21 days)'), value: 3, lockPeriod: 21 },
  { label: t('4x (28 days)'), value: 4, lockPeriod: 28 },
  { label: t('5x (35 days)'), value: 5, lockPeriod: 35 },
  { label: t('6x (42 days)'), value: 6, lockPeriod: 42 }
];
