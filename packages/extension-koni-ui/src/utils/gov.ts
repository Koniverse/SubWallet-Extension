// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GOV_ONGOING_STATES, GovStatusKey, Referendum, ReferendumDetail, Tally } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';

// HMM
export const GOV_QUERY_KEYS = {
  referendaList: (chainSlug: string) =>
    ['subsquare', 'referendaList', chainSlug] as const,

  referendumDetail: (chainSlug: string, referendumId: string | number) =>
    ['subsquare', 'referendumDetail', chainSlug, referendumId] as const,

  referendumVotes: (chain: string, referendumId: string | number) =>
    ['subsquare', 'referendumDetail', 'votes', chain, referendumId] as const,

  tracks: (chain: string) =>
    ['subsquare', 'referendumDetail', 'votes', chain] as const
};

export function toPercentage (value = 0, decimals = 0) {
  const length = Math.pow(10, decimals);

  return Math.round(value * 100 * length) / length;
}

export function getTallyVotesBarPercent (tally: Tally) {
  const ayes = tally?.ayes ?? 0;
  const nays = tally?.nays ?? 0;

  let ayesPercent = 50;
  let naysPercent = 50;
  const nTotal = new BigNumber(ayes).plus(nays);

  if (nTotal.gt(0)) {
    ayesPercent = new BigNumber(ayes).div(nTotal).toNumber();
    naysPercent = 1 - ayesPercent;
    ayesPercent = toPercentage(ayesPercent, 1);
    naysPercent = toPercentage(naysPercent, 1);
  }

  return {
    ayesPercent,
    naysPercent
  };
}

export function getMinApprovalThreshold (referendumDetail: Referendum | ReferendumDetail): number {
  const { decisionPeriod, minApproval } = referendumDetail.trackInfo;
  const decidingSince = referendumDetail.onchainData?.info?.deciding?.since;
  const currentBlock = referendumDetail.onchainData?.state?.indexer?.blockHeight;

  if (!minApproval || !decidingSince || !currentBlock) {
    return 0;
  }

  const gone = new BigNumber(currentBlock).minus(decidingSince);
  const percentage = gone.div(decisionPeriod);
  const x = percentage.multipliedBy(1e9);

  // Case 1: reciprocal
  if (minApproval.reciprocal) {
    const { factor, xOffset, yOffset } = minApproval.reciprocal;

    const v = new BigNumber(factor)
      .div(x.plus(xOffset))
      .multipliedBy(1e9);

    const calcValue = v.plus(yOffset).div(1e9);

    return toPercentage(Math.max(calcValue.toNumber(), 0), 1);
  }

  // Case 2: linear
  if (minApproval.linearDecreasing) {
    const { ceil, floor, length } = minApproval.linearDecreasing;

    const xValue = BigNumber.min(x, length);
    const slope = new BigNumber(ceil).minus(floor).div(length);
    const deducted = slope.multipliedBy(xValue);
    const perbill = new BigNumber(ceil).minus(deducted);

    const calcValue = perbill.div(1e9);

    return toPercentage(Math.max(calcValue.toNumber(), 0), 1);
  }

  return 0;
}

const calculateTimeLeft = (
  blockTime: number,
  currentBlock: number,
  alarmBlock: number | null,
  state: GovStatusKey,
  blockDuration = 6
): { timeLeft?: string; endTime: number } => {
  let endTime: BigNumber = new BigNumber(0);

  if (alarmBlock && GOV_ONGOING_STATES.includes(state) && currentBlock < alarmBlock) {
    const blockTimeBN = new BigNumber(blockTime);
    const blocksLeftBN = new BigNumber(alarmBlock).minus(currentBlock);
    const blockDurationBN = new BigNumber(blockDuration);
    const multiplier = new BigNumber(1000);

    endTime = blockTimeBN.plus(
      blocksLeftBN.multipliedBy(blockDurationBN).multipliedBy(multiplier)
    );
  }

  const now = new BigNumber(Date.now());
  const timeLeftMs = endTime.minus(now);

  if (timeLeftMs.lte(0)) {
    return { timeLeft: undefined, endTime: endTime.toNumber() }; // ⬅️ thay vì "Ended"
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
    timeLeft = `${hours.toFixed().padStart(2, '0')}:${minutes
      .toFixed()
      .padStart(2, '0')}:${seconds.toFixed().padStart(2, '0')}`;
  }

  return { timeLeft, endTime: endTime.toNumber() };
};

export const getTimeLeft = (data: Referendum | ReferendumDetail): string | undefined => {
  return calculateTimeLeft(
    data.state.indexer.blockTime,
    data.state.indexer.blockHeight,
    data.onchainData.info.alarm?.[0] || null,
    data.state.name
  ).timeLeft;
};
