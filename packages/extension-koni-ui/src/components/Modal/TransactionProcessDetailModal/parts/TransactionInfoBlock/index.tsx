// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProcessType } from '@subwallet/extension-base/types';
import React, { FC } from 'react';
import styled from 'styled-components';

import { Earn } from './Earn';
import { Swap } from './Swap';
import { TransactionInfoBlockProps } from './types';

type Props = TransactionInfoBlockProps;

const Component: FC<Props> = (props: Props) => {
  const { className, processData } = props;

  if (processData.type === ProcessType.SWAP) {
    return (
      <Swap
        {...props}
      />
    );
  }

  if (processData.type === ProcessType.EARNING) {
    return (
      <Earn
        {...props}
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
