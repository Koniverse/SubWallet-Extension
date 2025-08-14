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
  referendumId: string;
  goOverview: VoidFunction;
};

const Component = ({ chainSlug, className, goOverview, referendumId, sdkInstant }: Props): React.ReactElement<Props> => {
  const onBack = useCallback(() => {
    goOverview();
  }, [goOverview]);

  const { data } = useQuery({
    queryKey: ['subsquare', 'referendumDetail', chainSlug, referendumId],
    queryFn: async () => {
      if (!referendumId) {
        return undefined;
      }

      return await sdkInstant?.getReferendaDetails(`${referendumId}`);
    },
    staleTime: 60 * 1000
  });

  if (!data) {
    return <></>;
  }

  console.log('data', data);

  return (
    <div className={className}>
      <div onClick={onBack}>
        {'< Back'}
      </div>

      <div>
        {data.title}
      </div>

      <MetaArea />
      <VoteArea referendumDetail={data} />
      <RequestedAmount allSpend={data.allSpends} />
      <TabsContainer referendumDetail={data} />
    </div>
  );
};

export const ReferendumDetailView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
