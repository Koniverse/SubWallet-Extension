// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  selectedChain: string;
  onClick: VoidFunction;
};

const Component = ({ className, onClick, selectedChain }: Props): React.ReactElement<Props> => {
  return (
    <div
      className={className}
      onClick={onClick}
    >
      {selectedChain} {'>'}
    </div>
  );
};

export const ChainSelectorTrigger = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    cursor: 'pointer'
  };
});
