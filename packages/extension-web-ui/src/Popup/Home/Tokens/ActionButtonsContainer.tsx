// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-web-ui/types';
import styled from 'styled-components';

export const ActionButtonsContainer = styled('div')<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  '.ant-btn.ant-btn': {
    backgroundColor: token['gray-1'],

    '&:not(:disabled):hover': {
      backgroundColor: token['colorPrimary-5']
    },

    '&:not(:disabled):active': {
      backgroundColor: token['colorPrimary-4']
    }
  }
}));
