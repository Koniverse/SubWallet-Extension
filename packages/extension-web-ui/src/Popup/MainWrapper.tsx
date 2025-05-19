// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionProcessWarning } from '@subwallet/extension-web-ui/components';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import React, { useContext } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  children?: React.ReactNode;
};

const Component: React.FC<Props> = (props: Props) => {
  const { children, className } = props;
  const { isWebUI } = useContext(ScreenContext);

  return (
    <div className={className}>
      {!!children && (
        <div className={'main-layout-content'}>
          {children}
        </div>
      )}
      {
        !isWebUI && (
          <TransactionProcessWarning />
        )
      }
    </div>
  );
};

export const MainWrapper = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  '.web-layout-container': {
    height: '100%'
  },

  '.transaction-process-warning-container': {
    padding: token.padding
  }
}));
