// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useGovernanceView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView';
import { UnlockTokenView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/views/UnlockToken';
import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';
import getSubsquareApi from '@subwallet/subsquare-api-sdk';
import React, { useContext, useEffect, useMemo } from 'react';

import { OverviewView } from './views/OverviewView';
import { ReferendumDetailView } from './views/ReferendumDetailView';
import { chainSlugToSubsquareNetwork } from './shared';
import { ViewBaseType } from './types';

const Component = () => {
  const { chainSlug: currentChainSlug,
    goOverview, goReferendumDetail, goUnlockToken, referendumId, setChain,
    view: currentScreenView } = useGovernanceView();

  const { uiState: { setShowTabBar } } = useContext(HomeContext);

  const viewProps: ViewBaseType = useMemo(() => ({
    sdkInstance: chainSlugToSubsquareNetwork[currentChainSlug] ? getSubsquareApi(chainSlugToSubsquareNetwork[currentChainSlug]) : undefined,
    chainSlug: currentChainSlug
  }), [currentChainSlug]);

  useEffect(() => {
    setShowTabBar(false);

    return () => {
      setShowTabBar(true);
    };
  }, [setShowTabBar]);

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
