// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGovernanceView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView';
import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';
import getSubsquareApi from '@subwallet/subsquare-api-sdk';
import React, { useMemo } from 'react';

import { OverviewView } from './views/OverviewView';
import { ReferendumDetailView } from './views/ReferendumDetailView';
import { chainSlugToSubsquareNetwork } from './shared';
import { ViewBaseType } from './types';
import { UnlockTokenView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/views/UnlockToken';

const Component = () => {
  const { chainSlug: currentChainSlug,
    goOverview, goReferendumDetail, referendumId, setChain,
    view: currentScreenView } = useGovernanceView();

  const viewProps: ViewBaseType = useMemo(() => ({
    sdkInstance: chainSlugToSubsquareNetwork[currentChainSlug] ? getSubsquareApi(chainSlugToSubsquareNetwork[currentChainSlug]) : undefined,
    chainSlug: currentChainSlug
  }), [currentChainSlug]);

  return (
    <>
      {
        currentScreenView === GovernanceScreenView.OVERVIEW && (
          <OverviewView
            {...viewProps}
            goReferendumDetail={goReferendumDetail}
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
          />
        )
      }
    </>
  );
};

const Governance = (Component);

export default Governance;
