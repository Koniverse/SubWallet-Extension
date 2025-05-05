// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';

// Constants for time multipliers
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const TIME_INTERVAL: Record<PriceChartTimeframe, number> = {
  '1D': 5 * MINUTE,
  '1W': HOUR,
  '1M': 4 * HOUR,
  '3M': 12 * HOUR,
  YTD: DAY,
  '1Y': DAY,
  ALL: WEEK
};

export const getTokenPriceHistoryId = (tokenId: string, timeframe: PriceChartTimeframe): string => {
  return `${tokenId}-${timeframe}`.toLowerCase();
};
