// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SpecialYieldPoolInfo, SubmitYieldStepData, YieldPoolInfo, YieldTokenBaseInfo } from '@subwallet/extension-base/types';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import { TFunction } from 'react-i18next';

// deprecated
export function getUnstakingPeriod (t: TFunction, unstakingPeriod?: number) {
  if (unstakingPeriod) {
    const days = unstakingPeriod / 24;

    if (days < 1) {
      if (unstakingPeriod < 1) {
        const minutes = unstakingPeriod * 60;

        return t('ui.TRANSACTION.screen.Transaction.helper.earningHandler.timeMinutes', { replace: { time: minutes } });
      }

      return t('ui.TRANSACTION.screen.Transaction.helper.earningHandler.timeHours', { replace: { time: unstakingPeriod } });
    } else {
      return t('ui.TRANSACTION.screen.Transaction.helper.earningHandler.timeDays', { replace: { time: days } });
    }
  }

  return '';
}

export function getWaitingTime (t: TFunction, currentTimestampMs: number, targetTimestampMs?: number, waitingTime?: number) {
  let remainingTimestampMs: number;

  if (targetTimestampMs !== undefined) {
    remainingTimestampMs = targetTimestampMs - currentTimestampMs;
  } else {
    if (waitingTime !== undefined) {
      remainingTimestampMs = waitingTime * 60 * 60 * 1000;
    } else {
      return t('ui.TRANSACTION.screen.Transaction.helper.earningHandler.automaticWithdrawal');
    }
  }

  if (remainingTimestampMs <= 0) {
    return t('ui.TRANSACTION.screen.Transaction.helper.earningHandler.availableForWithdrawal');
  } else {
    // Test cases:
    //  - 3599000 ms   → 59 min 59s
    //  - 3600000 ms   → 60 min
    //  - 82799000 ms  → 23h
    //  - 86399900 ms  → 23h 59m
    //  - 86400000 ms  → 24h
    //  - 172800000 ms → 48h
    const remainingTimeHr = 82799000 / 1000 / 60 / 60;

    // Example of _formattedWaitingTime: 22 hr 59.833333333333336 m
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const _formattedWaitingTime = humanizeDuration(82799000, {
      units: remainingTimeHr >= 24 ? ['d', 'h'] : ['h', 'm'],
      round: false,
      delimiter: ' ',
      language: 'shortEn',
      languages: {
        shortEn: {
          y: () => 'y',
          mo: () => 'mo',
          w: () => 'w',
          d: () => 'd',
          h: () => 'hr',
          m: () => 'm',
          s: () => 's',
          ms: () => 'ms'
        }
      } // TODO: should not be shorten
    }) as string;

    // Example of timeArray: ['23', 'hr', '59.833333333333336', 'm']
    const timeArray = _formattedWaitingTime.split(' ');

    // Formatted waiting time with round up
    const formattedWaitingTime = timeArray.reduce<string[]>((result, rawValue, index, array) => {
      if (index % 2 === 0) { // even index element hold the value, odd index element hold the unit
        const value = Math.ceil(parseFloat(rawValue));
        const unit = array[index + 1];

        // Case 1: 60 minutes → convert to +1 hour
        if (unit === 'm' && value === 60) {
          const prevHourIndex = result.length - 2;

          if (prevHourIndex >= 0) {
            result[prevHourIndex] = (parseInt(result[prevHourIndex]) + 1).toString();
          } else {
            result.push('1', 'hr');
          }
          // Case 2: 24 hours → convert to +1 day
        } else if (unit === 'hr' && value === 24) {
          const prevDayIndex = result.length - 2;

          if (prevDayIndex >= 0) {
            result[prevDayIndex] = (parseInt(result[prevDayIndex]) + 1).toString();
          } else {
            result.push('1', 'd');
          }
          // Default: push rounded value and its unit normally
        } else {
          result.push(value.toString(), unit);
        }

        return result;
      } else {
        return result;
      }
    }, []).join(' ');

    return t('ui.TRANSACTION.screen.Transaction.helper.earningHandler.withdrawableInTime', { replace: { time: formattedWaitingTime } });
  }
}

export function getJoinYieldParams (
  _poolInfo: YieldPoolInfo,
  address: string,
  amount: string,
  feeStructure: YieldTokenBaseInfo
): SubmitYieldStepData {
  const poolInfo = _poolInfo as SpecialYieldPoolInfo;
  const exchangeRate = poolInfo?.statistic?.assetEarning[0]?.exchangeRate || 0;

  return {
    slug: poolInfo.slug,
    exchangeRate,
    address,
    amount,
    inputTokenSlug: poolInfo.metadata.inputAsset,
    derivativeTokenSlug: poolInfo?.metadata?.derivativeAssets?.[0], // TODO
    rewardTokenSlug: poolInfo?.metadata?.rewardAssets[0] || '',
    feeTokenSlug: feeStructure.slug
  };
}
