// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { NetworkSelector } from './parts/NetworkSelector';
import { QuickActionsContainer } from './parts/QuickActionsContainer';
import { ReferendaList } from './parts/ReferendaList';
import { Toolbar } from './parts/Toolbar';

type Props = ThemeProps & {
  navigateToReferendumDetail: () => void;
};

const Component = ({ className, navigateToReferendumDetail }: Props): React.ReactElement<Props> => {
  const onClickReferendumItem = useCallback(() => {
    navigateToReferendumDetail();
  }, [navigateToReferendumDetail]);

  return (
    <div className={className}>
      <div>
        <div>
          Governance
        </div>

        <NetworkSelector />
      </div>

      <QuickActionsContainer />

      <Toolbar />

      <ReferendaList
        onClickItem={onClickReferendumItem}
      />
    </div>
  );
};

export const OverviewView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
