// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountChainType } from '@subwallet/extension-base/types';
import { PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetGovLockedInfos, useNotification } from '@subwallet/extension-koni-ui/hooks';
import { useGovernanceView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView';
import { UnlockTokenView } from '@subwallet/extension-koni-ui/Popup/Home/Governance/views/UnlockToken';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';
import getSubsquareApi from '@subwallet/subsquare-api-sdk';
import React, { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { OverviewView } from './views/OverviewView';
import { ReferendumDetailView } from './views/ReferendumDetailView';
import { chainSlugToSubsquareApi } from './shared';
import { ViewBaseType } from './types';

const Component = () => {
  const { chainSlug: currentChainSlug,
    goOverview, goReferendumDetail, goUnlockToken, referendumId, setChain,
    view: currentScreenView } = useGovernanceView();
  const navigate = useNavigate();
  const notify = useNotification();
  const { t } = useTranslation();
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);

  const viewProps: ViewBaseType = useMemo(() => ({
    sdkInstance: chainSlugToSubsquareApi[currentChainSlug] ? getSubsquareApi(chainSlugToSubsquareApi[currentChainSlug]) : undefined,
    chainSlug: currentChainSlug
  }), [currentChainSlug]);

  useEffect(() => {
    if (!currentAccountProxy?.chainTypes.includes(AccountChainType.SUBSTRATE)) {
      setTimeout(() => {
        navigate('/home/tokens');
        notify({
          message: t('ui.GOVERNANCE.screen.Governance.featurePolkadotSupportedAccounts'),
          type: 'error'
        });
      }, 100);
    }
  }, [currentAccountProxy?.chainTypes, navigate, notify, t]);

  const govLockedInfos = useGetGovLockedInfos(currentChainSlug);

  return (
    <>
      {
        currentScreenView === GovernanceScreenView.OVERVIEW && (
          <OverviewView
            {...viewProps}
            goReferendumDetail={goReferendumDetail}
            goUnlockToken={goUnlockToken}
            govLockedInfos={govLockedInfos}
            onChangeChain={setChain}
          />
        )
      }

      {
        currentScreenView === GovernanceScreenView.REFERENDUM_DETAIL && !!referendumId && (
          <ReferendumDetailView
            {...viewProps}
            goOverview={goOverview}
            govLockedInfos={govLockedInfos}
            referendumId={referendumId}
          />
        )
      }

      {
        currentScreenView === GovernanceScreenView.UNLOCK_TOKEN && (
          <UnlockTokenView
            {...viewProps}
            goOverview={goOverview}
            govLockedInfos={govLockedInfos}
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
      resolve={dataContext.awaitStores(['openGov', 'balance', 'price', 'accountState'])}
    >
      <Component />
    </PageWrapper>
  );
};

export default Governance;
