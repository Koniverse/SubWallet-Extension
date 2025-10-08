// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { detectTranslate } from '@subwallet/extension-base/utils';
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
  [GovStatusKey.ALL]: { key: GovStatusKey.ALL, label: detectTranslate('All status') },
  [GovStatusKey.PREPARING]: { key: GovStatusKey.PREPARING, label: detectTranslate('Preparing'), icon: HourglassHigh, colorToken: 'gold-6' },
  [GovStatusKey.DECIDING]: { key: GovStatusKey.DECIDING, label: detectTranslate('Deciding'), icon: Scales, colorToken: 'blue-7' },
  [GovStatusKey.CONFIRMING]: { key: GovStatusKey.CONFIRMING, label: detectTranslate('Confirming'), icon: ClipboardText, colorToken: 'geekblue-7' },
  [GovStatusKey.APPROVED]: { key: GovStatusKey.APPROVED, label: detectTranslate('Approved'), icon: CheckCircle, colorToken: 'lime-7' },
  [GovStatusKey.QUEUEING]: { key: GovStatusKey.QUEUEING, label: detectTranslate('Queueing'), icon: Stack, colorToken: 'green-6' },
  [GovStatusKey.EXECUTED]: { key: GovStatusKey.EXECUTED, label: detectTranslate('Executed'), icon: RocketLaunch, colorToken: 'colorSecondaryText' },
  [GovStatusKey.REJECTED]: { key: GovStatusKey.REJECTED, label: detectTranslate('Rejected'), icon: Prohibit, colorToken: 'magenta-6' },
  [GovStatusKey.TIMEDOUT]: { key: GovStatusKey.TIMEDOUT, label: detectTranslate('TimedOut'), icon: ClockAfternoon, colorToken: 'gray-6' },
  [GovStatusKey.CANCELLED]: { key: GovStatusKey.CANCELLED, label: detectTranslate('Cancelled'), icon: XCircle, colorToken: 'orange-6' },
  [GovStatusKey.KILLED]: { key: GovStatusKey.KILLED, label: detectTranslate('Killed'), icon: Skull, colorToken: 'red-6' },
  [GovStatusKey.STARTED]: { key: GovStatusKey.STARTED, label: detectTranslate('Started'), icon: Scales, colorToken: 'blue-7' },
  [GovStatusKey.PASSED]: { key: GovStatusKey.PASSED, label: detectTranslate('Passed'), icon: CheckCircle, colorToken: 'lime-7' },
  [GovStatusKey.NOTPASSED]: { key: GovStatusKey.NOTPASSED, label: detectTranslate('NotPassed'), icon: XCircle, colorToken: 'magenta-6' }
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

export const democracyGovStatusItems: GovStatusItem[] = [
  govStatusDisplayMap[GovStatusKey.STARTED],
  govStatusDisplayMap[GovStatusKey.PASSED],
  govStatusDisplayMap[GovStatusKey.NOTPASSED],
  govStatusDisplayMap[GovStatusKey.TIMEDOUT],
  govStatusDisplayMap[GovStatusKey.CANCELLED],
  govStatusDisplayMap[GovStatusKey.EXECUTED]
];
