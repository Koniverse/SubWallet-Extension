// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovStatusKey } from '@subwallet/subsquare-api-sdk';
import { ArrowsOutLineHorizontal, CheckCircle, CircleHalf, ClipboardText, ClockAfternoon, HourglassHigh, IconProps, Prohibit, RocketLaunch, Scales, Skull, Stack, ThumbsDown, ThumbsUp, XCircle } from 'phosphor-react';

import { Theme } from '../types';

export const governanceVoteIconMap = {
  aye: ThumbsUp,
  nay: ThumbsDown,
  abstain: CircleHalf,
  split: ArrowsOutLineHorizontal
};

export interface GovStatusItem {
  key: GovStatusKey;
  label: string;
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  colorToken?: keyof Theme['token'];
}

export const govStatusItems: GovStatusItem[] = [
  { key: GovStatusKey.ALL, label: 'All status' },
  { key: GovStatusKey.PREPARING, label: 'Preparing', icon: HourglassHigh, colorToken: 'gold-6' },
  { key: GovStatusKey.DECIDING, label: 'Deciding', icon: Scales, colorToken: 'blue-7' },
  { key: GovStatusKey.CONFIRMING, label: 'Confirming', icon: ClipboardText, colorToken: 'geekblue-7' },
  { key: GovStatusKey.APPROVED, label: 'Approved', icon: CheckCircle, colorToken: 'lime-7' },
  { key: GovStatusKey.QUEUEING, label: 'Queueing', icon: Stack, colorToken: 'green-6' },
  { key: GovStatusKey.EXECUTED, label: 'Executed', icon: RocketLaunch, colorToken: 'colorSecondaryText' },
  { key: GovStatusKey.REJECTED, label: 'Rejected', icon: Prohibit, colorToken: 'magenta-6' },
  { key: GovStatusKey.TIMEDOUT, label: 'TimedOut', icon: ClockAfternoon, colorToken: 'gray-6' },
  { key: GovStatusKey.CANCELLED, label: 'Cancelled', icon: XCircle, colorToken: 'orange-6' },
  { key: GovStatusKey.KILLED, label: 'Killed', icon: Skull, colorToken: 'red-6' }
];
