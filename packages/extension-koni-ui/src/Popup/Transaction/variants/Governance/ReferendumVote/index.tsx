// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useTransactionContext } from '@subwallet/extension-koni-ui/hooks';
import { useGovReferendumVotes } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView/useGovReferendumVotes';
import { GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useContext } from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
};

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { defaultData } = useTransactionContext<GovReferendumVoteParams>();

  const { accountAddressItems, voteMap } = useGovReferendumVotes({
    chain: defaultData.chain,
    referendumId: defaultData.referendumId,
    fromAccountProxy: defaultData.fromAccountProxy
  });

  return (
    <>
      <Outlet context={{ voteMap, accountAddressItems }} />
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={CN(className)}
      resolve={dataContext.awaitStores(['openGov'])}
    >
      <Component />
    </PageWrapper>

  );
};

const ReferendumVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {

  };
});

export default ReferendumVote;
