// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningStatus } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { InfoItemBase } from '@subwallet/extension-koni-ui/components/MetaInfo/parts/types';
import { EarningStatusUiProps, NominationPoolState } from '@subwallet/extension-koni-ui/types';
import { CheckCircle, ListChecks, LockSimple, XCircle } from 'phosphor-react';

export const EarningStatusUi: Record<EarningStatus, EarningStatusUiProps> = {
  [EarningStatus.EARNING_REWARD]: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.earningReward')
  },
  [EarningStatus.PARTIALLY_EARNING]: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecks,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.earningReward')
  },
  [EarningStatus.NOT_EARNING]: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.notEarning')
  },
  [EarningStatus.WAITING]: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.waiting')
  },
  [EarningStatus.NOT_STAKING]: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.notEarning')
  }
};

export const NominationPoolsEarningStatusUi: Record<NominationPoolState['state'], EarningStatusUiProps> = {
  Open: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.open')
  },
  Locked: {
    schema: 'gray' as InfoItemBase['valueColorSchema'],
    icon: LockSimple,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.locked')
  },
  Destroying: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecks,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.destroying')
  },
  Blocked: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: detectTranslate('ui.EARNING.constant.earningStatusUi.blocked')
  }
};

// @ts-ignore
const stakingValidatorLabel = [detectTranslate('ui.EARNING.constant.earningStatusUi.dapp'), detectTranslate('ui.EARNING.constant.earningStatusUi.validator'), detectTranslate('ui.EARNING.constant.earningStatusUi.collator')];
