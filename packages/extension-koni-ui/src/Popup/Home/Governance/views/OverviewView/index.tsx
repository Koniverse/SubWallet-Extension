// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReferendaCategory, ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { Button, Icon } from '@subwallet/react-ui';
import { ALL_TRACK_ID, GovStatusKey, Referendum } from '@subwallet/subsquare-api-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CaretRight, LockKey } from 'phosphor-react';
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
  goUnlockToken: () => void;
};

const Component = ({ chainSlug, className, goReferendumDetail, goUnlockToken, onChangeChain, sdkInstance }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const [selectedReferendaCategory, setSelectedReferendaCategory] = useState<ReferendaCategory>(ReferendaCategory.ONGOING);
  const onClickReferendumItem = useCallback((item: Referendum) => {
    goReferendumDetail(`${item.referendumIndex}`);
  }, [goReferendumDetail]);

  const onGoUnlockToken = useCallback(() => {
    goUnlockToken();
  }, [goUnlockToken]);

  const [isEnableTreasuryFilter, setIsEnableTreasuryFilter] = useState(false);
  const [statusSelected, setStatusSelected] = useState<GovStatusKey>(GovStatusKey.ALL);
  const [trackSelected, setTrackSelected] = useState<string>(ALL_TRACK_ID);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      GOV_QUERY_KEYS.referendaList(chainSlug),
      {
        is_treasury: isEnableTreasuryFilter,
        status: statusSelected !== GovStatusKey.ALL ? statusSelected : undefined,
        track: trackSelected !== ALL_TRACK_ID ? trackSelected : undefined
      }
    ],
    queryFn: async ({ pageParam, queryKey }) => {
      const [, filters] = queryKey as [string, {
        is_treasury?: boolean;
        status?: string;
        track?: string;
      }];

      if (filters.track !== undefined) {
        return await sdkInstance?.getReferendaWithTrack(Number(filters.track), {
          page: pageParam,
          page_size: 20,
          status: filters.status,
          simple: true
        });
      }

      return await sdkInstance?.getReferenda({
        page: pageParam,
        page_size: 20,
        is_treasury: filters.is_treasury,
        status: filters.status,
        simple: true
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) {
        return undefined;
      }

      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);

      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000
  });

  const handleLoadMore = useCallback(() => {
    fetchNextPage().catch((err) => console.error('Failed to load more:', err));
  }, [fetchNextPage]);

  const items = (data?.pages.flatMap((page) => page?.items ?? []) || []);

  return (
    <div className={className}>
      <div className='__header-area'>
        <div className='__view-title'>{t('Governance')}</div>
        <ChainSelector
          onChangeChain={onChangeChain}
          selectedChain={chainSlug}
        />
      </div>
      <div
        className='panel__nav'
        onClick={onGoUnlockToken}
      >
        <div className='panel__title'>
          <Icon
            phosphorIcon={LockKey}
            size='sm'
          />
          {t('Locked')}
        </div>
      </div>

      <QuickActionsContainer />

      <Toolbar
        chain={chainSlug}
        isEnableTreasuryFilter={isEnableTreasuryFilter}
        onChangeCategory={setSelectedReferendaCategory}
        sdkInstance={sdkInstance}
        selectedReferendaCategory={selectedReferendaCategory}
        setIsEnableTreasuryFilter={setIsEnableTreasuryFilter}
        setStatusSelected={setStatusSelected}
        setTrackSelected={setTrackSelected}
        statusSelected={statusSelected}
        trackSelected={trackSelected}
      />

      <ReferendaList
        items={items}
        onClickItem={onClickReferendumItem}
        selectedReferendaCategory={selectedReferendaCategory}
      />

      {hasNextPage && selectedReferendaCategory !== ReferendaCategory.VOTED && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button
            disabled={isFetchingNextPage}
            onClick={handleLoadMore}
          >
            {isFetchingNextPage ? t('Loading...') : t('Load more')}
          </Button>
        </div>
      )}
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
