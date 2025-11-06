// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { ReferendaCategory } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
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
  [GovStatusKey.ALL]: { key: GovStatusKey.ALL, label: detectTranslate('ui.GOVERNANCE.constant.governance.allStatus') },
  [GovStatusKey.PREPARING]: { key: GovStatusKey.PREPARING, label: detectTranslate('ui.GOVERNANCE.constant.governance.preparing'), icon: HourglassHigh, colorToken: 'gold-6' },
  [GovStatusKey.DECIDING]: { key: GovStatusKey.DECIDING, label: detectTranslate('ui.GOVERNANCE.constant.governance.deciding'), icon: Scales, colorToken: 'blue-7' },
  [GovStatusKey.CONFIRMING]: { key: GovStatusKey.CONFIRMING, label: detectTranslate('ui.GOVERNANCE.constant.governance.confirming'), icon: ClipboardText, colorToken: 'geekblue-7' },
  [GovStatusKey.APPROVED]: { key: GovStatusKey.APPROVED, label: detectTranslate('ui.GOVERNANCE.constant.governance.approved'), icon: CheckCircle, colorToken: 'lime-7' },
  [GovStatusKey.QUEUEING]: { key: GovStatusKey.QUEUEING, label: detectTranslate('ui.GOVERNANCE.constant.governance.queueing'), icon: Stack, colorToken: 'green-6' },
  [GovStatusKey.EXECUTED]: { key: GovStatusKey.EXECUTED, label: detectTranslate('ui.GOVERNANCE.constant.governance.executed'), icon: RocketLaunch, colorToken: 'colorSecondaryText' },
  [GovStatusKey.REJECTED]: { key: GovStatusKey.REJECTED, label: detectTranslate('ui.GOVERNANCE.constant.governance.rejected'), icon: Prohibit, colorToken: 'magenta-6' },
  [GovStatusKey.TIMEDOUT]: { key: GovStatusKey.TIMEDOUT, label: detectTranslate('ui.GOVERNANCE.constant.governance.timedOut'), icon: ClockAfternoon, colorToken: 'gray-6' },
  [GovStatusKey.CANCELLED]: { key: GovStatusKey.CANCELLED, label: detectTranslate('ui.GOVERNANCE.constant.governance.cancelled'), icon: XCircle, colorToken: 'orange-6' },
  [GovStatusKey.KILLED]: { key: GovStatusKey.KILLED, label: detectTranslate('ui.GOVERNANCE.constant.governance.killed'), icon: Skull, colorToken: 'red-6' },
  [GovStatusKey.STARTED]: { key: GovStatusKey.STARTED, label: detectTranslate('ui.GOVERNANCE.constant.governance.started'), icon: Scales, colorToken: 'blue-7' },
  [GovStatusKey.PASSED]: { key: GovStatusKey.PASSED, label: detectTranslate('ui.GOVERNANCE.constant.governance.passed'), icon: CheckCircle, colorToken: 'lime-7' },
  [GovStatusKey.NOTPASSED]: { key: GovStatusKey.NOTPASSED, label: detectTranslate('ui.GOVERNANCE.constant.governance.notPassed'), icon: XCircle, colorToken: 'magenta-6' }
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

export const ongoingGovStatusItems: GovStatusItem[] = [
  govStatusDisplayMap[GovStatusKey.PREPARING],
  govStatusDisplayMap[GovStatusKey.DECIDING],
  govStatusDisplayMap[GovStatusKey.CONFIRMING],
  govStatusDisplayMap[GovStatusKey.QUEUEING]
];

export const govStatusItemsByRefCategory: Record<string, GovStatusItem[]> = {
  [ReferendaCategory.ALL]: govStatusItems,
  [ReferendaCategory.ONGOING]: ongoingGovStatusItems
};

export const democracyGovStatusItems: GovStatusItem[] = [
  govStatusDisplayMap[GovStatusKey.STARTED],
  govStatusDisplayMap[GovStatusKey.PASSED],
  govStatusDisplayMap[GovStatusKey.NOTPASSED],
  govStatusDisplayMap[GovStatusKey.TIMEDOUT],
  govStatusDisplayMap[GovStatusKey.CANCELLED],
  govStatusDisplayMap[GovStatusKey.EXECUTED]
];
