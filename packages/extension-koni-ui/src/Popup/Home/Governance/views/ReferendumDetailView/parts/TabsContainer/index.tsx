// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumDetail } from '@subwallet/subsquare-api-sdk/interface';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DescriptionTab } from './DescriptionTab';
import { DetailsTab } from './DetailsTab';
import { TimelineTab } from './TimelineTab';

type Props = ThemeProps & {
  referendumDetail: ReferendumDetail;
};

export enum Tab {
  DESCRIPTION= 'description',
  DETAILS= 'details',
  TIMELINE= 'timeline',
}

const Component = ({ className, referendumDetail }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(Tab.DESCRIPTION);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('Description'),
        value: Tab.DESCRIPTION
      },
      {
        label: t('Details'),
        value: Tab.DETAILS
      },
      {
        label: t('Timeline'),
        value: Tab.TIMELINE
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  return (
    <div className={className}>
      <FilterTabs
        className={'filter-tabs-bar'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedFilterTab}
      />

      {
        selectedFilterTab === Tab.DESCRIPTION && (
          <DescriptionTab content={referendumDetail.content || referendumDetail.polkassemblyContentHtml} />
        )
      }

      {
        selectedFilterTab === Tab.DETAILS && (
          <DetailsTab referendumDetail={referendumDetail} />
        )
      }

      {
        selectedFilterTab === Tab.TIMELINE && (
          <TimelineTab timeline={referendumDetail.onchainData.timeline} />
        )
      }
    </div>
  );
};

export const TabsContainer = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
