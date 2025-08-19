// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovAmountInput } from '@subwallet/extension-koni-ui/components';
import { ReferendaCategory, ViewBaseType } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { VoteButton } from '@subwallet/extension-koni-ui/Popup/Transaction/variants/Governance/parts/VoteButton';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button } from '@subwallet/react-ui';
import { Referendum } from '@subwallet/subsquare-api-sdk/types';
import { useInfiniteQuery } from '@tanstack/react-query';
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['subsquare', 'referendaList', chainSlug],
    queryFn: async ({ pageParam }) => {
      return await sdkInstant?.getReferenda({ page: pageParam, page_size: 20 });
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

  console.log('items count:', items.length, items);

  return (
    <div className={className}>
      <div className='__header-area'>
        <div className='__view-title'>{t('Governance')}</div>
        <ChainSelector
          onChangeChain={onChangeChain}
          selectedChain={chainSlug}
        />
      </div>

      <VoteButton type={'aye'} />
      <VoteButton type={'nay'} />
      <VoteButton type={'abstain'} />
      <VoteButton type={'split'} />

      <GovAmountInput
        decimals={10}
        label={t('Amount')}
        logoKey={'polkadot'}
        tokenSymbol={'DOT'}
        topRightPart={'1231231'}
      />

      <QuickActionsContainer />

      <Toolbar
        onChangeCategory={setSelectedReferendaCategory}
        selectedReferendaCategory={selectedReferendaCategory}
      />

      <ReferendaList
        items={items}
        onClickItem={onClickReferendumItem}
        selectedReferendaCategory={selectedReferendaCategory}
      />

      {hasNextPage && (
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
