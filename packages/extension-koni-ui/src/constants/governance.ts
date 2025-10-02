// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { GovStatusKey } from '@subwallet/subsquare-api-sdk';
import { ArrowsOutLineHorizontal, CheckCircle, CircleHalf, ClipboardText, ClockAfternoon, HourglassHigh, Prohibit, RocketLaunch, Scales, Skull, Stack, ThumbsDown, ThumbsUp, XCircle } from 'phosphor-react';

import { GovStatusItem } from '../types';

export const governanceVoteIconMap = {
  [GovVoteType.AYE]: ThumbsUp,
  [GovVoteType.NAY]: ThumbsDown,
  [GovVoteType.ABSTAIN]: CircleHalf,
  [GovVoteType.SPLIT]: ArrowsOutLineHorizontal
};

export const govStatusDisplayMap: Record<GovStatusKey, GovStatusItem> = {
  [GovStatusKey.ALL]: { key: GovStatusKey.ALL, label: 'All status' },
  [GovStatusKey.PREPARING]: { key: GovStatusKey.PREPARING, label: 'Preparing', icon: HourglassHigh, colorToken: 'gold-6' },
  [GovStatusKey.DECIDING]: { key: GovStatusKey.DECIDING, label: 'Deciding', icon: Scales, colorToken: 'blue-7' },
  [GovStatusKey.CONFIRMING]: { key: GovStatusKey.CONFIRMING, label: 'Confirming', icon: ClipboardText, colorToken: 'geekblue-7' },
  [GovStatusKey.APPROVED]: { key: GovStatusKey.APPROVED, label: 'Approved', icon: CheckCircle, colorToken: 'lime-7' },
  [GovStatusKey.QUEUEING]: { key: GovStatusKey.QUEUEING, label: 'Queueing', icon: Stack, colorToken: 'green-6' },
  [GovStatusKey.EXECUTED]: { key: GovStatusKey.EXECUTED, label: 'Executed', icon: RocketLaunch, colorToken: 'colorSecondaryText' },
  [GovStatusKey.REJECTED]: { key: GovStatusKey.REJECTED, label: 'Rejected', icon: Prohibit, colorToken: 'magenta-6' },
  [GovStatusKey.TIMEDOUT]: { key: GovStatusKey.TIMEDOUT, label: 'TimedOut', icon: ClockAfternoon, colorToken: 'gray-6' },
  [GovStatusKey.CANCELLED]: { key: GovStatusKey.CANCELLED, label: 'Cancelled', icon: XCircle, colorToken: 'orange-6' },
  [GovStatusKey.KILLED]: { key: GovStatusKey.KILLED, label: 'Killed', icon: Skull, colorToken: 'red-6' }
};

export const govStatusItems: GovStatusItem[] = [
  govStatusDisplayMap[GovStatusKey.ALL],
  govStatusDisplayMap[GovStatusKey.PREPARING],
  govStatusDisplayMap[GovStatusKey.DECIDING],
  govStatusDisplayMap[GovStatusKey.CONFIRMING],
  govStatusDisplayMap[GovStatusKey.APPROVED],
  govStatusDisplayMap[GovStatusKey.QUEUEING],
  govStatusDisplayMap[GovStatusKey.EXECUTED],
  govStatusDisplayMap[GovStatusKey.REJECTED],
  govStatusDisplayMap[GovStatusKey.TIMEDOUT],
  govStatusDisplayMap[GovStatusKey.CANCELLED],
  govStatusDisplayMap[GovStatusKey.KILLED]
];
