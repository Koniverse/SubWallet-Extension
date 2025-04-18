// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';

export interface TimeRange {
  from: number;
  to: number;
  granularity: number;
}

// Constants for time multipliers
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const TYPE_INTERVAL: Record<PriceChartTimeframe, number> = {
  '1D': 5 * MINUTE,
  '1W': HOUR,
  '1M': 4 * HOUR,
  '3M': 12 * HOUR,
  YTD: DAY,
  ALL: WEEK
};

export const getTokenPriceHistoryId = (tokenId: string, timeframe: PriceChartTimeframe): string => {
  return `${tokenId}-${timeframe}`.toLowerCase();
};

// Round the given date to the nearest time based on granularity (in minutes)
const roundToNearestTime = (date: Date, granularity: number, isToDate = false): number => {
  const roundedDate = new Date(date.getTime());
  const granularityMinute = granularity / MINUTE;
  const roundedMinutes = Math.floor(date.getMinutes() / granularityMinute) * granularityMinute;

  roundedDate.setMinutes(roundedMinutes + (+isToDate * granularityMinute), 0, 0); // Reset seconds and milliseconds

  return roundedDate.getTime();
};

// Calculate the time range based on the given chart type
export const getTimeRange = (timeframe: PriceChartTimeframe): TimeRange => {
  const now = Date.now(); // Cache current time
  const granularity = TYPE_INTERVAL[timeframe];
  let dateFrom: Date;

  const to = roundToNearestTime(new Date(now), granularity, true); // Align 'to' with the granularity based on type

  switch (timeframe) {
    case '1D':
      dateFrom = new Date(to - DAY);
      break;
    case '1W':
      dateFrom = new Date(to - WEEK);
      break;
    case '1M':
      dateFrom = new Date(to - 30 * DAY);
      break;
    case '3M':
      dateFrom = new Date(to - 90 * DAY);
      break;
    case 'YTD':
      dateFrom = new Date(new Date(to).getFullYear(), 0, 1);

      break;
    case 'ALL':
      dateFrom = new Date(0);
      break;
    default:
      throw new Error('Unknown time type');
  }

  const from = roundToNearestTime(dateFrom, granularity); // Align 'from' with the granularity based on type

  return {
    from: Math.floor(from / 1000), // Convert to UNIX timestamp (seconds)
    to: Math.floor(to / 1000), // Convert to UNIX timestamp (seconds)
    granularity // Convert granularity to seconds
  };
};

export function resampleChartData (raw: PriceChartPoint[], timeframe: PriceChartTimeframe): PriceChartPoint[] {
  const interval = TYPE_INTERVAL[timeframe];

  // Sắp xếp mảng theo thời gian giảm dần
  const sorted = raw.slice().sort((a, b) => b.time - a.time);

  const resampled: PriceChartPoint[] = [];

  // Mốc gần nhất về hiện tại chia hết cho interval
  let currentTarget = Math.floor(sorted[0].time / interval) * interval;

  for (const point of sorted) {
    if (point.time <= currentTarget) {
      resampled.unshift(point); // push về đầu để đảm bảo kết quả tăng dần
      currentTarget -= interval;
    }
  }

  return resampled;
}
