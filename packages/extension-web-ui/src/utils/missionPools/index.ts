// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { defaultLogger } from '@subwallet/extension-base/utils/logger';
import { MissionCategoryType } from '@subwallet/extension-web-ui/Popup/MissionPool/predefined';
import { MissionInfo } from '@subwallet/extension-web-ui/types';

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
    defaultLogger.error(error);
  }

  try {
    if (item.end_time) {
      const endTime = new Date(item.end_time).getTime();

      if (now > endTime) {
        return MissionCategoryType.ARCHIVED;
      }
    }
  } catch (error) {
    defaultLogger.error(error);
  }

  return MissionCategoryType.LIVE;
}
