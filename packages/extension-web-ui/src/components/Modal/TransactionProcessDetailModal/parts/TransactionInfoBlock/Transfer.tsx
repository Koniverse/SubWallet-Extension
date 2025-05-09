// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import styled from 'styled-components';

import { TransactionInfoBlockProps } from './types';

type Props = TransactionInfoBlockProps;

const Component: FC<Props> = (props: Props) => {
  const { className } = props;

  return (
    <div
      className={className}
    >

    </div>
  );
};

export const Transfer = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({

  });
});
