// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button } from '@subwallet/react-ui';
import { ReferendumDetail, Tally } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail,
  onClickVote: VoidFunction;
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

export function getMinApprovalThreshold (referendumDetail: ReferendumDetail): number {
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

const calculateTimeLeft = (blockTime: number, currentBlock: number, alarmBlock: number | null, state: string, blockDuration = 6): { timeLeft: string; endTime: number } => {
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

const isGovOngoing = (state: string) => {
  return state === 'Deciding' || state === 'Confirming' || state === 'Preparing';
};

const getTimeLeft = (data: ReferendumDetail): string => {
  return calculateTimeLeft(
    data.state.indexer.blockTime,
    data.state.indexer.blockHeight,
    data.onchainData.info.alarm?.[0] || null,
    data.state.name
  ).timeLeft;
};

const Component = ({ className, onClickVote, referendumDetail }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { ayesPercent, naysPercent } = getTallyVotesBarPercent(referendumDetail.onchainData.tally);

  const thresholdPercent = getMinApprovalThreshold(referendumDetail);

  const timeLeft = getTimeLeft(referendumDetail);

  return (
    <div className={className}>
      <h3>Voting Summary</h3>
      <div>Time left: {timeLeft}</div>
      <div>Aye: {ayesPercent}%</div>
      <div>Nay: {naysPercent}%</div>
      <div>Threshold: {thresholdPercent}%</div>

      <Button
        block={true}
        onClick={onClickVote}
      >
        {t('Vote')}
      </Button>
    </div>
  );
};

export const VoteArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
