// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningProcessType, ProcessTransactionData, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import YieldProcessConfirmation from '@subwallet/extension-web-ui/Popup/Confirmations/variants/Transaction/variants/Process/Earn/JoinYieldPool';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { BaseProcessConfirmationProps } from '../Base';
import NativeStakingProcessConfirmation from './Bond';
import NominationPoolProcessConfirmation from './JoinPool';

type Props = BaseProcessConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { transaction } = props;

  const type = useMemo(() => ((transaction.process as ProcessTransactionData).combineInfo as SummaryEarningProcessData).type, [transaction.process]);

  if (type === EarningProcessType.NATIVE_STAKING) {
    return <NativeStakingProcessConfirmation {...props} />;
  } else if (type === EarningProcessType.NOMINATION_POOL) {
    return <NominationPoolProcessConfirmation {...props} />;
  } else {
    return <YieldProcessConfirmation {...props} />;
  }
};

const EarnProcessConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});

export default EarnProcessConfirmation;
