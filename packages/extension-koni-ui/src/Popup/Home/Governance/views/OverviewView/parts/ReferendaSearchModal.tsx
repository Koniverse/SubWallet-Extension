// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BackIcon } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useGetGovLockedInfos } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumWithVoting, UserVoting } from '@subwallet/extension-koni-ui/types/gov';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { ActivityIndicator, ModalContext, SwModal } from '@subwallet/react-ui';
import { Referendum, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import React, { Context, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { ThemeContext } from 'styled-components';

import { ReferendaList } from './ReferendaList';

type Props = ThemeProps & {
  onClickItem: (item: Referendum) => void;
  chain: string;
  sdkInstance: SubsquareApiSdk | undefined;
};

const modalId = 'referenda-search-modal';

const filterItemBySearchText = (item: ReferendumWithVoting, searchText: string): boolean => {
  const lowerCaseSearchText = searchText.toLowerCase();

  return item.title?.toLowerCase().includes(lowerCaseSearchText) ||
    item.referendumIndex?.toString().toLowerCase().includes(lowerCaseSearchText);
};

const Component = ({ chain, className, onClickItem, sdkInstance }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const [searchValue, setSearchValue] = React.useState<string>('');
  const textRef = React.useRef<string>('');
  const govLockedInfos = useGetGovLockedInfos(chain);

  const onCancel = useCallback(() => {
    setSearchValue('');
    inactiveModal(modalId);
  }, [inactiveModal]);

  const { data: refData } = useQuery({
    queryKey: [
      GOV_QUERY_KEYS.referendaList(chain),
      {}
    ],
    queryFn: async () => {
      return sdkInstance?.getReferenda({
        page_size: 20,
        simple: true
      });
    },
    staleTime: 60 * 1000
  });

  const { data: searchData, isFetching, refetch } = useQuery<{ govReferenda: Referendum[] }>({
    queryKey: GOV_QUERY_KEYS.referendaList(chain),
    queryFn: async () => {
      if (!sdkInstance) {
        return { govReferenda: [] };
      }

      return await sdkInstance.findReferendumByValue(searchValue);
    },
    enabled: false,
    staleTime: 60 * 1000
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const items = useMemo<ReferendumWithVoting[]>(() => {
    const items = (refData?.items || []);

    return items.map((item) => {
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
  }, [govLockedInfos, refData?.items]);

  const filteredItems = useMemo<ReferendumWithVoting[]>(() => {
    const itemsFiltered = items.filter((item) => filterItemBySearchText(item, searchValue));

    if (searchData?.govReferenda?.length && !itemsFiltered.length && searchValue.trim()) {
      return searchData.govReferenda.filter((item) => filterItemBySearchText(item, searchValue));
    } else {
      return itemsFiltered;
    }
  }, [searchData?.govReferenda, items, searchValue]);

  useEffect(() => {
    if (!searchValue) {
      return;
    }

    const lowerCaseSearchValue = searchValue.toLowerCase();

    if (filteredItems.length === 0 && !isFetching && (!textRef.current || !lowerCaseSearchValue.includes(textRef.current))) {
      refetch().catch(console.error);
      textRef.current = lowerCaseSearchValue;
    }
  }, [searchValue, filteredItems.length, isFetching, refetch]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      closeIcon={(<BackIcon />)}
      id={modalId}
      maskClosable={false}
      onCancel={onCancel}
      title={t('Referenda list')}
    >
      <Search
        autoFocus={true}
        className='referenda-search-input'
        onSearch={handleSearchChange}
        placeholder={t('Search referenda by title or ID')}
        searchValue={searchValue}
      />

      {isFetching
        ? (
          <div className='__load-more-container'>
            <ActivityIndicator size={token.sizeXXL} />
          </div>
        )
        : <ReferendaList
          chain={chain}
          className='referenda-list'
          items={filteredItems}
          onClickItem={onClickItem}
        />}

    </SwModal>
  );
};

export const ReferendaSearchModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

    '.ant-sw-modal-body': {
      height: '100%',
      overflowY: 'hidden',
      paddingTop: 0
    },
    '.ant-sw-modal-content': {
      height: '100%',
      minHeight: 599,
      maxHeight: 599,
      borderRadius: 0
    },

    '.ant-sw-modal-header': {
      borderBottom: 0
    },

    '.referenda-list': {
      paddingInline: 0,
      height: 412,
      overflowY: 'scroll'
    },

    '.referenda-search-input': {
      marginBottom: token.margin
    },

    '.__load-more-container': {
      margin: 'auto',
      width: 'fit-content',
      marginTop: 100,
      height: 412
    }
  };
});
