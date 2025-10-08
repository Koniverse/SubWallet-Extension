// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGovernanceView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView';
import { UnlockTokenView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/views/UnlockToken';
import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';
import getSubsquareApi from '@subwallet/subsquare-api-sdk';
import React, { useContext, useMemo } from 'react';

import { OverviewView } from './views/OverviewView';
import { ReferendumDetailView } from './views/ReferendumDetailView';
import { chainSlugToSubsquareApi } from './shared';
import { ViewBaseType } from './types';

const Component = () => {
  const { chainSlug: currentChainSlug,
    goOverview, goReferendumDetail, goUnlockToken, referendumId, setChain,
    view: currentScreenView } = useGovernanceView();

  const viewProps: ViewBaseType = useMemo(() => ({
    sdkInstance: chainSlugToSubsquareApi[currentChainSlug] ? getSubsquareApi(chainSlugToSubsquareApi[currentChainSlug]) : undefined,
    chainSlug: currentChainSlug
  }), [currentChainSlug]);

  return (
    <>
      {
        currentScreenView === GovernanceScreenView.OVERVIEW && (
          <OverviewView
            {...viewProps}
            goReferendumDetail={goReferendumDetail}
            goUnlockToken={goUnlockToken}
            onChangeChain={setChain}
          />
        )
      }

      {
        currentScreenView === GovernanceScreenView.REFERENDUM_DETAIL && !!referendumId && (
          <ReferendumDetailView
            {...viewProps}
            goOverview={goOverview}
            referendumId={referendumId}
          />
        )
      }

      {
        currentScreenView === GovernanceScreenView.UNLOCK_TOKEN && (
          <UnlockTokenView
            {...viewProps}
            goOverview={goOverview}
          />
        )
      }
    </>
  );
};

const Governance = () => {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      resolve={dataContext.awaitStores(['openGov', 'balance', 'price'])}
    >
      <Component />
    </PageWrapper>
  );
};

export default Governance;
