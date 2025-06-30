// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningProcessType, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import React, { FC, useMemo } from 'react';

import { TransactionInfoBlockProps } from '../types';
import { NativeStakingProcessConfirmation } from './Bond';
import { NominationPoolProcessConfirmation } from './JoinPool';
import { YieldProcessConfirmation } from './JoinYieldPool';

type Props = TransactionInfoBlockProps;

export const Earn: FC<Props> = (props: Props) => {
  const { processData } = props;

  const type = useMemo(() => (processData.combineInfo as SummaryEarningProcessData).type, [processData]);

  if (type === EarningProcessType.NATIVE_STAKING) {
    return <NativeStakingProcessConfirmation {...props} />;
  } else if (type === EarningProcessType.NOMINATION_POOL) {
    return <NominationPoolProcessConfirmation {...props} />;
  } else {
    return <YieldProcessConfirmation {...props} />;
  }
};
