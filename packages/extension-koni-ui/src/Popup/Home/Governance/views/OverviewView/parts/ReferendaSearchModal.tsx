// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BackIcon, EmptyList } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useGetGovLockedInfos } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ReferendumWithVoting } from '@subwallet/extension-koni-ui/types/gov';
import { getUserVotingListForReferendum, GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { ActivityIndicator, ModalContext, SwModal } from '@subwallet/react-ui';
import { Referendum, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import { ListChecks } from 'phosphor-react';
import React, { Context, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { ThemeContext } from 'styled-components';

import { useMigrationOffset } from '../../../hooks/useGovernanceView/useMigrationOffset';
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

  const { data: migrationBlockOffset } = useMigrationOffset(chain, sdkInstance);

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
      return {
        ...item,
        userVoting: getUserVotingListForReferendum({ referendum: item, govLockedInfos })
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

  const renderEmpty = useMemo(() => {
    return (
      <EmptyList
        className={'__emptyList'}
        emptyMessage={t('ui.GOVERNANCE.screen.Governance.Overview.ReferendaSearchModal.noReferendaFound')}
        phosphorIcon={ListChecks}
      />
    );
  }, [t]);

  useEffect(() => {
    if (!searchValue) {
      return;
    }

    const lowerCaseSearchValue = searchValue.toLowerCase();

    if (!isFetching && (!textRef.current || lowerCaseSearchValue !== textRef.current)) {
      refetch().catch(console.error);
      textRef.current = lowerCaseSearchValue;
    }
  }, [isFetching, refetch, searchValue]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      closeIcon={(<BackIcon />)}
      id={modalId}
      maskClosable={false}
      onCancel={onCancel}
      title={t('ui.GOVERNANCE.screen.Governance.Overview.ReferendaSearchModal.referendaList')}
    >
      <Search
        autoFocus={true}
        className='referenda-search-input'
        onSearch={handleSearchChange}
        placeholder={t('ui.GOVERNANCE.screen.Governance.Overview.ReferendaSearchModal.searchReferendaByIdTitle')}
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
          migrationBlockOffset={migrationBlockOffset}
          onClickItem={onClickItem}
          renderWhenEmpty={renderEmpty}
        />
      }

    </SwModal>
  );
};

export const ReferendaSearchModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    height: '100%',
    '.ant-sw-modal-body': {
      height: '100%',
      overflowY: 'hidden',
      paddingTop: 0
    },
    '.ant-sw-modal-content': {
      height: '100%',
      maxHeight: 'unset !important',
      borderRadius: 0
    },

    '.ant-sw-modal-header': {
      borderBottom: 0
    },

    '.referenda-list': {
      paddingInline: 0,
      height: '95%',
      overflowY: 'scroll'
    },

    '.referenda-search-input': {
      marginBottom: token.margin
    },

    '.__load-more-container': {
      margin: 'auto',
      width: 'fit-content',
      marginTop: 100,
      height: '95%'
    }
  };
});
