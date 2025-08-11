// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestedAmount } from '@subwallet/extension-koni-ui/Popup/Home/Governance/ReferendumDetailView/parts/RequestedAmount';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { MetaArea } from './parts/MetaArea';
import { TabsContainer } from './parts/TabsContainer';
import { VoteArea } from './parts/VoteArea';

type Props = ThemeProps & {
  navigateToOverview: VoidFunction;
};

const Component = ({ className, navigateToOverview }: Props): React.ReactElement<Props> => {
  const onBack = useCallback(() => {
    navigateToOverview();
  }, [navigateToOverview]);

  return (
    <div className={className}>
      <div onClick={onBack}>
        {'< Back'}
      </div>

      <div>
        Referendum Detail
      </div>

      <MetaArea />
      <VoteArea />
      <RequestedAmount />
      <TabsContainer />
    </div>
  );
};

export const ReferendumDetailView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
