// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import { MissionCategory } from '@subwallet/extension-koni-ui/types';

export enum MissionCategoryType {
  ALL='all',
  UPCOMING='upcoming',
  LIVE='live',
  ARCHIVED='archived',
}

export const missionCategoryMap: Record<string, MissionCategory> = {
  [MissionCategoryType.UPCOMING]: {
    slug: MissionCategoryType.UPCOMING,
    name: detectTranslate('settings.missionPools.Term.upcoming')
  },
  [MissionCategoryType.LIVE]: {
    slug: MissionCategoryType.LIVE,
    name: detectTranslate('settings.missionPools.Term.live')
  },
  [MissionCategoryType.ARCHIVED]: {
    slug: MissionCategoryType.ARCHIVED,
    name: detectTranslate('settings.missionPools.Term.archived')
  }
};

export const missionCategories: MissionCategory[] = [
  missionCategoryMap[MissionCategoryType.UPCOMING],
  missionCategoryMap[MissionCategoryType.LIVE],
  missionCategoryMap[MissionCategoryType.ARCHIVED]
];
