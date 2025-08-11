// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { OverviewView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/OverviewView';
import React, { useCallback, useState } from 'react';

import { ReferendumDetailView } from './ReferendumDetailView';
import { ScreenView } from './types';

const Component = () => {
  const [currentScreenView, setCurrentScreenView] = useState<ScreenView>(ScreenView.OVERVIEW);

  const navigateToReferendumDetail = useCallback(() => {
    setCurrentScreenView(ScreenView.REFERENDUM_DETAIL);
  }, []);

  const navigateToOverview = useCallback(() => {
    setCurrentScreenView(ScreenView.OVERVIEW);
  }, []);

  return (
    <>
      {
        currentScreenView === ScreenView.OVERVIEW && (
          <OverviewView
            navigateToReferendumDetail={navigateToReferendumDetail}
          />
        )
      }

      {
        currentScreenView === ScreenView.REFERENDUM_DETAIL && (
          <ReferendumDetailView
            navigateToOverview={navigateToOverview}
          />
        )
      }
    </>
  );
};

const Governance = (Component);

export default Governance;
