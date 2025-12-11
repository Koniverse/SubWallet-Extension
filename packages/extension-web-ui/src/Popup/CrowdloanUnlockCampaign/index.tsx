// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { PageWrapper } from '@subwallet/extension-web-ui/components';
import { CROWDLOAN_UNLOCK_TIME } from '@subwallet/extension-web-ui/constants';
import { DEFAULT_CROWDLOAN_UNLOCK_TIME } from '@subwallet/extension-web-ui/constants/event';
import { DataContext } from '@subwallet/extension-web-ui/contexts/DataContext';
import { updateChainLogoMaps } from '@subwallet/extension-web-ui/stores/utils';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { CrowdloanFundInfo } from "@subwallet/extension-base/koni/api/dotsama/crowdloan";
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import CN from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

function crowdloanFundsToMap (crowdloanFunds: CrowdloanFundInfo[]): Record<string, CrowdloanFundInfo> {
  const result: Record<string, CrowdloanFundInfo> = {};

  crowdloanFunds.forEach((cf) => {
    if (cf.fundId) {
      result[cf.fundId] = cf;
    }
  });

  return result;
}

function chainInfoItemsToMap (chainInfoItems: _ChainInfo[]): Record<string, _ChainInfo> {
  const result: Record<string, _ChainInfo> = {};

  chainInfoItems.forEach((ci) => {
    if (ci.slug) {
      result[ci.slug] = ci;
    }
  });

  return result;
}

function getLogoMap (chainInfoItems: _ChainInfo[]): Record<string, string> {
  const result: Record<string, string> = {};

  chainInfoItems.forEach((ci) => {
    if (ci.slug && ci.icon) {
      result[ci.slug] = ci.icon;
    }
  });

  return result;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const dataContext = useContext(DataContext);
  const [crowdloanUnlockTime, setCrowdloanUnlockTime] = useLocalStorage<number>(CROWDLOAN_UNLOCK_TIME, DEFAULT_CROWDLOAN_UNLOCK_TIME);
  const [crowdloanFundInfoMap, setCrowdloanFundInfoMap] = useState<Record<string, CrowdloanFundInfo>>({});
  const [chainInfoMap, setChainInfoMap] = useState<Record<string, _ChainInfo>>({});

  useEffect(() => {
    Promise.all([
      subwalletApiSdk.staticContentApi.fetchCrowdloanFundList(),
      subwalletApiSdk.staticContentApi.fetchLatestChainData(),
      subwalletApiSdk.staticContentApi.fetchPeriodTimeInfo()
    ]).then(([crowdloanFunds, chainInfoItems, periodTimeInfo]) => {
      setCrowdloanFundInfoMap(crowdloanFundsToMap(crowdloanFunds));
      setChainInfoMap(chainInfoItemsToMap(chainInfoItems));

      const currentTimestamp = (new Date()).getTime();
      const nearestTime = Object.values(periodTimeInfo.polkadot).find((t) => t > currentTimestamp);

      setCrowdloanUnlockTime(nearestTime || 0);

      updateChainLogoMaps(getLogoMap(chainInfoItems));
    }).catch((e) => {
      console.log('fetch error', e);
    });
  }, [setCrowdloanUnlockTime]);

  return (
    <PageWrapper
      className={CN(className, 'page-wrapper')}
      resolve={dataContext.awaitStores(['price'])}
    >
      <Outlet
        context={{
          crowdloanUnlockTime,
          crowdloanFundInfoMap,
          chainInfoMap
        }}
      />
    </PageWrapper>
  );
};

const CrowdloanUnlockCampaign = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default CrowdloanUnlockCampaign;
