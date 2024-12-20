// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {

};

function Component ({ className = '' }: Props) {
  return (
    <div className={className}>
      this is SummaryView
    </div>
  );
}

export const SummaryView = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({

  });
});
