// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessTransactionData, ProcessType } from '@subwallet/extension-base/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { FC } from 'react';
import styled from 'styled-components';

import { Swap } from './Swap';

type Props = ThemeProps & {
  progressData: ProcessTransactionData
};

const Component: FC<Props> = (props: Props) => {
  const { className, progressData } = props;

  if (progressData.type === ProcessType.SWAP) {
    return (
      <Swap
        className={className}
        progressData={progressData}
      />
    );
  }

  return (
    <div
      className={className}
    >

    </div>
  );
};

export const TransactionInfoBlock = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({

  });
});
