// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from '@subwallet/extension-base/utils/logger';
import { MissionCategoryType } from '@subwallet/extension-koni-ui/Popup/Settings/MissionPool/predefined';
import { MissionInfo } from '@subwallet/extension-koni-ui/types';

const logger = createLogger('MissionPools');

export function computeStatus (item: MissionInfo): MissionCategoryType {
  const now = Date.now();

  try {
    if (item.start_time) {
      const startTime = new Date(item.start_time).getTime();

      if (now < startTime) {
        return MissionCategoryType.UPCOMING;
      }
    }
  } catch (error) {
    logger.error('Failed to parse start_time', error);
  }

  try {
    if (item.end_time) {
      const endTime = new Date(item.end_time).getTime();

      if (now > endTime) {
        return MissionCategoryType.ARCHIVED;
      }
    }
  } catch (error) {
    logger.error('Failed to parse start_time', error);
  }

  return MissionCategoryType.LIVE;
}
