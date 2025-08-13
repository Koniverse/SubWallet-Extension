// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { OverviewView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/OverviewView';
import getSubsquareApi from '@subwallet/subsquare-api-sdk';
import { Referendum } from '@subwallet/subsquare-api-sdk/types';
import React, { useCallback, useMemo, useState } from 'react';

import { ReferendumDetailView } from './ReferendumDetailView';
import { chainSlugToSubsquareNetwork } from './shared';
import { ScreenView, ViewBaseType } from './types';

const Component = () => {
  const [currentScreenView, setCurrentScreenView] = useState<ScreenView>(ScreenView.OVERVIEW);
  const [referendumDetailIndex, setReferendumDetailIndex] = useState<number | undefined>(undefined);
  const [currentChainSlug, setCurrentChainSlug] = useState<string>('polkadot');

  const navigateToReferendumDetail = useCallback((item: Referendum) => {
    setReferendumDetailIndex(item.referendumIndex);
    setCurrentScreenView(ScreenView.REFERENDUM_DETAIL);
  }, []);

  const navigateToOverview = useCallback(() => {
    setCurrentScreenView(ScreenView.OVERVIEW);
  }, []);

  const viewProps: ViewBaseType = useMemo(() => ({
    sdkInstant: chainSlugToSubsquareNetwork[currentChainSlug] ? getSubsquareApi(chainSlugToSubsquareNetwork[currentChainSlug]) : undefined,
    chainSlug: currentChainSlug
  }), [currentChainSlug]);

  return (
    <>
      {
        currentScreenView === ScreenView.OVERVIEW && (
          <OverviewView
            {...viewProps}
            navigateToReferendumDetail={navigateToReferendumDetail}
            onChangeChain={setCurrentChainSlug}
          />
        )
      }

      {
        currentScreenView === ScreenView.REFERENDUM_DETAIL && (
          <ReferendumDetailView
            {...viewProps}
            navigateToOverview={navigateToOverview}
            referendumDetailIndex={referendumDetailIndex}
          />
        )
      }
    </>
  );
};

const Governance = (Component);

export default Governance;
