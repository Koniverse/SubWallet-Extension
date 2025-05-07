// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ReferendumInfo } from '@subwallet/extension-base/services/open-gov/type';
import BigNumber from 'bignumber.js';

export const govChainSupportItems = [
  { name: 'Polkadot', slug: 'polkadot' },
  { name: 'Kusama', slug: 'kusama' },
  { name: 'Westend', slug: 'westend' }
];

export const calculateTimeLeft = (blockTime: number, currentBlock: number, alarmBlock: number | null, state: string, blockDuration = 6): { timeLeft: string; endTime: number } => {
  let endTime: BigNumber = new BigNumber(0);

  if (alarmBlock && isGovOngoing(state) && currentBlock < alarmBlock) {
    const blockTimeBN = new BigNumber(blockTime);
    const blocksLeftBN = new BigNumber(alarmBlock).minus(currentBlock);
    const blockDurationBN = new BigNumber(blockDuration);
    const multiplier = new BigNumber(1000);

    endTime = blockTimeBN.plus(blocksLeftBN.multipliedBy(blockDurationBN).multipliedBy(multiplier));
  }

  const now = new BigNumber(Date.now());
  const timeLeftMs = endTime.minus(now);

  if (timeLeftMs.lte(0)) {
    return { timeLeft: 'Ended', endTime: endTime.toNumber() };
  }

  const msInDay = new BigNumber(1000 * 60 * 60 * 24);
  const msInHour = new BigNumber(1000 * 60 * 60);
  const msInMinute = new BigNumber(1000 * 60);
  const msInSecond = new BigNumber(1000);

  const days = timeLeftMs.dividedToIntegerBy(msInDay);
  const hours = timeLeftMs.modulo(msInDay).dividedToIntegerBy(msInHour);
  const minutes = timeLeftMs.modulo(msInHour).dividedToIntegerBy(msInMinute);
  const seconds = timeLeftMs.modulo(msInMinute).dividedToIntegerBy(msInSecond);

  let timeLeft: string;

  if (days.gte(2)) {
    timeLeft = `${days.toFixed()} days ${hours.toFixed()} hour${!hours.eq(1) ? 's' : ''}`;
  } else if (days.eq(1)) {
    timeLeft = `1 day ${hours.toFixed()} hour${!hours.eq(1) ? 's' : ''}`;
  } else {
    timeLeft = `${hours.toFixed().padStart(2, '0')}:${minutes.toFixed().padStart(2, '0')}:${seconds.toFixed().padStart(2, '0')}`;
  }

  return { timeLeft, endTime: endTime.toNumber() };
};

export const isGovOngoing = (state: string) => {
  return state === 'Deciding' || state === 'Confirming' || state === 'Preparing';
};

export const getTimeLeft = (data: _ReferendumInfo): string => {
  return calculateTimeLeft(
    data.state.indexer.blockTime,
    data.state.indexer.blockHeight,
    data.onchainData.info.alarm?.[0] || null,
    data.state.name
  ).timeLeft;
};
