// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { MetaArea } from './parts/MetaArea';
import { RequestedAmount } from './parts/RequestedAmount';
import { TabsContainer } from './parts/TabsContainer';
import { VoteArea } from './parts/VoteArea';

type Props = ThemeProps & ViewBaseType & {
  referendumDetailIndex: number | undefined;
  navigateToOverview: VoidFunction;
};

const Component = ({ chainSlug, className, navigateToOverview, referendumDetailIndex, sdkInstant }: Props): React.ReactElement<Props> => {
  const onBack = useCallback(() => {
    navigateToOverview();
  }, [navigateToOverview]);

  const { data } = useQuery({
    queryKey: ['subsquare', 'referendumDetail', chainSlug, referendumDetailIndex],
    queryFn: async () => {
      if (!referendumDetailIndex) {
        return undefined;
      }

      return await sdkInstant?.getReferendaDetails(`${referendumDetailIndex}`);
    },
    staleTime: 60 * 1000
  });

  if (!referendumDetailIndex || !data) {
    return <></>;
  }

  return (
    <div className={className}>
      <div onClick={onBack}>
        {'< Back'}
      </div>

      <div>
        {data.title}
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
