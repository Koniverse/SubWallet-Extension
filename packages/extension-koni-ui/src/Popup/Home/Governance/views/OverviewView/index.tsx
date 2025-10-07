// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetGovLockedInfos } from '@subwallet/extension-koni-ui/hooks';
import { ReferendaCategory, ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ReferendaSearchModal } from '@subwallet/extension-koni-ui/Popup/Home/Governance/views/OverviewView/parts/ReferendaSearchModal';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumWithVoting, UserVoting } from '@subwallet/extension-koni-ui/types/gov';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { ActivityIndicator } from '@subwallet/react-ui';
import { ALL_TRACK_ID, GOV_ONGOING_STATES, GovStatusKey, Referendum } from '@subwallet/subsquare-api-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { Context, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { ThemeContext } from 'styled-components';

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
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const [selectedReferendaCategory, setSelectedReferendaCategory] = useState<ReferendaCategory>(ReferendaCategory.ALL);
  const [isEnableTreasuryFilter, setIsEnableTreasuryFilter] = useState(false);
  const [isEnableVotedFilter, setIsEnableVotedFilter] = useState(false);
  const [isEnableDelegatedFilter, setIsEnableDelegatedFilter] = useState(false);
  const [statusSelected, setStatusSelected] = useState<GovStatusKey>(GovStatusKey.ALL);
  const [trackSelected, setTrackSelected] = useState<string>(ALL_TRACK_ID);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [referendaItems, setReferendaItems] = useState<ReferendumWithVoting[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const govLockedInfos = useGetGovLockedInfos(chainSlug);

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [
      GOV_QUERY_KEYS.referendaList(chainSlug),
      {
        is_treasury: isEnableTreasuryFilter,
        ongoing: selectedReferendaCategory === ReferendaCategory.ONGOING,
        status: statusSelected !== GovStatusKey.ALL ? statusSelected : undefined,
        track: trackSelected !== ALL_TRACK_ID ? trackSelected : undefined
      }
    ],
    queryFn: async ({ pageParam, queryKey }) => {
      const [, filters] = queryKey as [string, {
        is_treasury?: boolean;
        ongoing?: boolean;
        status?: string;
        track?: string;
      }];

      if (filters.track !== undefined) {
        return await sdkInstance?.getReferendaWithTrack(Number(filters.track), {
          page: pageParam,
          page_size: 20,
          status: filters.status,
          ongoing: filters.ongoing,
          simple: true
        });
      }

      return await sdkInstance?.getReferenda({
        page: pageParam,
        page_size: 20,
        is_treasury: filters.is_treasury,
        ongoing: filters.ongoing,
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

  const onClickReferendumItem = useCallback((item: Referendum) => {
    goReferendumDetail(`${item.referendumIndex}`);
  }, [goReferendumDetail]);

  const onGoUnlockToken = useCallback(() => {
    goUnlockToken();
  }, [goUnlockToken]);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    fetchNextPage()
      .catch((err) => console.error('Failed to load more:', err))
      .finally(() => {
        setTimeout(() => setIsLoadingMore(false), 500);
      });
  }, [fetchNextPage]);

  const onScroll = useCallback(() => {
    if (containerRef.current && hasNextPage && !isLoadingMore) {
      const { clientHeight, scrollHeight, scrollTop } = containerRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        handleLoadMore();
      }
    }
  }, [handleLoadMore, hasNextPage, isLoadingMore]);

  useEffect(() => {
    const items = (data?.pages.flatMap((page) => page?.items ?? []) || []);

    const filterFunc = (item: Referendum) => {
      const stateName = item.state.name;

      if (selectedReferendaCategory === ReferendaCategory.ALL) {
        return true;
      }

      if (selectedReferendaCategory === ReferendaCategory.ONGOING) {
        return GOV_ONGOING_STATES.includes(stateName);
      }

      return false;
    };

    const filteredItems = items.filter(filterFunc);

    const extended: ReferendumWithVoting[] = filteredItems.map((item) => {
      if (item.version === 1) {
        return {
          ...item,
          userVoting: undefined
        };
      }

      const trackId = Number(item.trackInfo.id);

      const userVoting: UserVoting[] = [];

      (govLockedInfos || []).forEach((acc) => {
        const track = acc.tracks?.find((t) => Number(t.trackId) === trackId);

        if (!track) {
          return;
        }

        const votesForThisRef = track.votes?.find(
          (v) => Number(v.referendumIndex) === item.referendumIndex
        );

        const delegation = track.delegation ? { ...track.delegation } : undefined;

        if (votesForThisRef || delegation) {
          userVoting.push({
            address: acc.address,
            trackId,
            votes: votesForThisRef,
            delegation
          });
        }
      });

      return {
        ...item,
        userVoting: userVoting.length > 0 ? userVoting : undefined
      };
    });

    const filteredExtended = extended.filter((ref) => {
      if (isEnableVotedFilter) {
        return !!ref.userVoting?.some((u) => u.votes);
      }

      if (isEnableDelegatedFilter) {
        return !!ref.userVoting?.some((u) => u.delegation);
      }

      return true;
    });

    setReferendaItems(filteredExtended);
  }, [data?.pages, selectedReferendaCategory, govLockedInfos, isEnableVotedFilter, isEnableDelegatedFilter]);

  return (
    <div
      className={className}
      onScroll={onScroll}
      ref={containerRef}
    >
      <div className='__view-header-area'>
        <div className='__view-title-area'>
          <div className='__view-title'>{t('Governance')}</div>
          <ChainSelector
            onChangeChain={onChangeChain}
            selectedChain={chainSlug}
          />
        </div>

        <QuickActionsContainer
          className={className}
          govLockedInfos={govLockedInfos}
          onGoUnlockToken={onGoUnlockToken}
        />
      </div>

      <Toolbar
        chain={chainSlug}
        isEnableDelegatedFilter={isEnableDelegatedFilter}
        isEnableTreasuryFilter={isEnableTreasuryFilter}
        isEnableVotedFilter={isEnableVotedFilter}
        onChangeCategory={setSelectedReferendaCategory}
        sdkInstance={sdkInstance}
        selectedReferendaCategory={selectedReferendaCategory}
        setIsEnableDelegatedFilter={setIsEnableDelegatedFilter}
        setIsEnableTreasuryFilter={setIsEnableTreasuryFilter}
        setIsEnableVotedFilter={setIsEnableVotedFilter}
        setStatusSelected={setStatusSelected}
        setTrackSelected={setTrackSelected}
        statusSelected={statusSelected}
        trackSelected={trackSelected}
      />

      <ReferendaList
        chain={chainSlug}
        items={referendaItems}
        onClickItem={onClickReferendumItem}
      />

      {isLoadingMore && selectedReferendaCategory !== ReferendaCategory.VOTED && (
        <div className='__load-more-container'>
          <ActivityIndicator size={token.sizeXL} />
        </div>
      )}

      <ReferendaSearchModal
        chain={chainSlug}
        onClickItem={onClickReferendumItem}
        sdkInstance={sdkInstance}
      />
    </div>
  );
};

export const OverviewView = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    height: '100%',
    overflowY: 'auto',
    '.__view-header-area': {
      backgroundColor: token.colorBgDefault,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      padding: token.padding,
      paddingTop: token.paddingXS
    },

    '.__view-title-area': {
      display: 'flex',
      height: 40,
      alignItems: 'center',
      marginBottom: token.marginSM
    },

    '.__view-title': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      color: token.colorTextLight1,
      fontWeight: token.headingFontWeight,
      gap: token.sizeSM,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
      flex: 1
    },

    '.__load-more-container': {
      textAlign: 'center',
      marginBottom: token.margin
    }
  };
});
