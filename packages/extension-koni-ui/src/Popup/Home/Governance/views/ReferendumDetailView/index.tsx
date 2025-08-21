// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getTransactionFromAccountProxyValue } from '@subwallet/extension-koni-ui/utils';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { MetaArea } from './parts/MetaArea';
import { RequestedAmount } from './parts/RequestedAmount';
import { TabsContainer } from './parts/TabsContainer';
import { VoteArea } from './parts/VoteArea';

type Props = ThemeProps & ViewBaseType & {
  referendumId: string;
  goOverview: VoidFunction;
};

const Component = ({ chainSlug, className, goOverview, referendumId, sdkInstant }: Props): React.ReactElement<Props> => {
  const { currentAccountProxy } = useSelector((state) => state.accountState);
  const navigate = useNavigate();
  const [, setGovRefVoteStorage] = useLocalStorage(GOV_REFERENDUM_VOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS);
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

  const onClickVote = useCallback(() => {
    if (!referendumId || !data?.track) {
      return;
    }

    setGovRefVoteStorage({
      ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
      referendumId,
      track: data.track,
      chain: chainSlug,
      fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
    });
    navigate('/transaction/gov-ref-vote/standard');
  }, [chainSlug, currentAccountProxy, data?.track, navigate, referendumId, setGovRefVoteStorage]);

  if (!data) {
    return <></>;
  }

  const allSpends = data.allSpends;

  return (
    <div className={className}>
      <div onClick={onBack}>
        {'< Back'}
      </div>

      <div>
        {data.title}
      </div>

      <MetaArea />

      <VoteArea
        onClickVote={onClickVote}
        referendumDetail={data}
      />

      { allSpends && (<RequestedAmount allSpend={allSpends} />)}

      <TabsContainer referendumDetail={data} />
    </div>
  );
};

export const ReferendumDetailView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
