// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningStatus } from '@subwallet/extension-base/types';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { InfoItemBase } from '@subwallet/extension-web-ui/components/MetaInfo/parts/types';
import { EarningStatusUiProps, NominationPoolState } from '@subwallet/extension-web-ui/types';
import { CheckCircle, ListChecks, LockSimple, XCircle } from 'phosphor-react';

export const EarningStatusUi: Record<EarningStatus, EarningStatusUiProps> = {
  [EarningStatus.EARNING_REWARD]: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.earningReward')
  },
  [EarningStatus.PARTIALLY_EARNING]: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecks,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.earningReward')
  },
  [EarningStatus.NOT_EARNING]: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.notEarning')
  },
  [EarningStatus.WAITING]: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.waiting')
  },
  [EarningStatus.NOT_STAKING]: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.notEarning')
  }
};

export const NominationPoolsEarningStatusUi: Record<NominationPoolState['state'], EarningStatusUiProps> = {
  Open: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.open')
  },
  Locked: {
    schema: 'gray' as InfoItemBase['valueColorSchema'],
    icon: LockSimple,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.locked')
  },
  Destroying: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecks,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.destroying')
  },
  Blocked: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: detectTranslate('ui.STATUS_UI.constants.earning.statusUi.blocked')
  }
};

// @ts-ignore
const stakingValidatorLabel = [detectTranslate('ui.STATUS_UI.constants.earning.statusUi.dapp'), detectTranslate('ui.STATUS_UI.constants.earning.statusUi.validator'), detectTranslate('ui.STATUS_UI.constants.earning.statusUi.collator')];
