// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { FC } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
//
};

const Component: FC<Props> = (props: Props) => {
  const { className } = props;

  return (
    <div
      className={className}
    >

    </div>
  );
};

export const ProgressStepItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({

  });
});
