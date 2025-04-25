// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningProcessType, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { BaseProcessConfirmationProps } from '../Base';
import NativeStakingProcessConfirmation from './Bond';
import NominationPoolProcessConfirmation from './JoinPool';
import YieldProcessConfirmation from './JoinYieldPool';

type Props = BaseProcessConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { process } = props;

  const type = useMemo(() => (process.combineInfo as SummaryEarningProcessData).type, [process]);

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
