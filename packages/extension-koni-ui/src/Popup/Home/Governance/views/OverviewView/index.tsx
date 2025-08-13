// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendaCategory, ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Referendum } from '@subwallet/subsquare-api-sdk/types';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ChainSelector } from './parts/ChainSelector';
import { QuickActionsContainer } from './parts/QuickActionsContainer';
import { ReferendaList } from './parts/ReferendaList';
import { Toolbar } from './parts/Toolbar';

type Props = ThemeProps & ViewBaseType & {
  onChangeChain: (chainSlug: string) => void;
  goReferendumDetail: (id: string) => void;
};

const Component = ({ chainSlug, className, goReferendumDetail, onChangeChain, sdkInstant }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const [selectedReferendaCategory, setSelectedReferendaCategory] = useState<ReferendaCategory>(ReferendaCategory.ONGOING);

  const onClickReferendumItem = useCallback((item: Referendum) => {
    goReferendumDetail(`${item.referendumIndex}`);
  }, [goReferendumDetail]);

  const { data } = useQuery({
    queryKey: ['subsquare', 'referendaList', chainSlug],
    queryFn: async () => {
      return await sdkInstant?.getReferenda();
    },
    staleTime: 60 * 1000
  });

  console.log('asca', data);

  return (
    <div className={className}>
      <div className={'__header-area'}>
        <div className={'__view-title'}>
          {t('Governance')}
        </div>

        <ChainSelector
          onChangeChain={onChangeChain}
          selectedChain={chainSlug}
        />
      </div>

      <QuickActionsContainer />

      <Toolbar
        onChangeCategory={setSelectedReferendaCategory}
        selectedReferendaCategory={selectedReferendaCategory}
      />

      <ReferendaList
        items={data?.items}
        onClickItem={onClickReferendumItem}
        selectedReferendaCategory={selectedReferendaCategory}
      />
    </div>
  );
};

export const OverviewView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__header-area': {
      display: 'flex',
      minHeight: 40
    },

    '.__view-title': {
      flex: 1
    }
  };
});
