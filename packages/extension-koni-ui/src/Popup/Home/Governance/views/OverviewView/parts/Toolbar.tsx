// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { GovFilterModal } from '@subwallet/extension-koni-ui/components/Modal/Governance/GovFilterModal';
import { ReferendaCategory } from '@subwallet/extension-koni-ui/Popup/Home/Governance/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Badge, Button, Icon, ModalContext } from '@subwallet/react-ui';
import { GovStatusKey, SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { FadersHorizontal, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  onChangeCategory: (category: ReferendaCategory) => void;
  selectedReferendaCategory: ReferendaCategory;
  isEnableTreasuryFilter: boolean;
  isEnableVotedFilter: boolean;
  isEnableDelegatedFilter: boolean;
  setIsEnableVotedFilter: (value: boolean) => void;
  setIsEnableDelegatedFilter: (value: boolean) => void;
  setIsEnableTreasuryFilter: (value: boolean) => void;
  statusSelected: GovStatusKey;
  setStatusSelected: (value: GovStatusKey) => void;
  trackSelected: string;
  setTrackSelected: (value: string) => void;
  sdkInstance?: SubsquareApiSdk
  chain: string;
};

const GOV_FILTER_MODAL_ID = 'gov-filter-modal';
const GOV_SEARCH_MODAL_ID = 'referenda-search-modal';

const Component = ({ chain, className, isEnableDelegatedFilter, isEnableTreasuryFilter,
  isEnableVotedFilter, onChangeCategory, sdkInstance, selectedReferendaCategory,
  setIsEnableDelegatedFilter, setIsEnableTreasuryFilter, setIsEnableVotedFilter, setStatusSelected, setTrackSelected, statusSelected, trackSelected }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const filterTabItems = useMemo(() => {
    return [
      {
        label: t('All Referenda'),
        value: ReferendaCategory.ALL
      },
      {
        label: t('Ongoing'),
        value: ReferendaCategory.ONGOING
      }
    ];
  }, [t]);

  const onOpenFilter = useCallback(() => {
    activeModal(GOV_FILTER_MODAL_ID);
  }, [activeModal]);

  const onOpenSearch = useCallback(() => {
    activeModal(GOV_SEARCH_MODAL_ID);
  }, [activeModal]);

  const onCancelFilter = useCallback(() => {
    inactiveModal(GOV_FILTER_MODAL_ID);
  }, [inactiveModal]);

  const onSelectFilterTab = useCallback((value: string) => {
    onChangeCategory(value as ReferendaCategory);
  }, [onChangeCategory]);

  const onApplyFilter = useCallback(() => {
    inactiveModal(GOV_FILTER_MODAL_ID);
  }, [inactiveModal]);

  const hasAnyFilterValue = isEnableDelegatedFilter || isEnableTreasuryFilter || isEnableVotedFilter || (trackSelected !== 'All' || statusSelected !== 'All');

  return (
    <div className={className}>
      <FilterTabs
        className={'__filter-tabs-bar'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedReferendaCategory}
      />

      <div className='__buttons-wrapper'>
        <Button
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={MagnifyingGlass}
            />
          )}
          onClick={onOpenSearch}
          size={'xs'}
          type={'ghost'}
        />

        <Button
          icon={
            <Badge
              className={'g-filter-badge'}
              dot={hasAnyFilterValue}
            >
              <Icon
                customSize='20px'
                phosphorIcon={FadersHorizontal}
              />
            </Badge>
          }
          onClick={onOpenFilter}
          size='xs'
          type='ghost'
        />

        <GovFilterModal
          chain={chain}
          id={GOV_FILTER_MODAL_ID}
          isEnableDelegatedFilter={isEnableDelegatedFilter}
          isEnableTreasuryFilter={isEnableTreasuryFilter}
          isEnableVotedFilter={isEnableVotedFilter}
          onApplyFilter={onApplyFilter}
          onCancel={onCancelFilter}
          sdkInstance={sdkInstance}
          setIsEnableDelegatedFilter={setIsEnableDelegatedFilter}
          setIsEnableTreasuryFilter={setIsEnableTreasuryFilter}
          setIsEnableVotedFilter={setIsEnableVotedFilter}
          setStatusSelected={setStatusSelected}
          setTrackSelected={setTrackSelected}
          statusSelected={statusSelected}
          title={t('Filter')}
          trackSelected={trackSelected}
        />
      </div>
    </div>
  );
};

export const Toolbar = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    alignItems: 'center',
    paddingInline: token.padding,
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingXS,

    '.__filter-tabs-bar': {
      flex: 1,

      '.__tab-item-label': {
        paddingTop: 0,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        paddingBottom: token.paddingXXS
      }
    },

    '.__buttons-wrapper': {
      display: 'flex',
      alignItems: 'center'
    }
  };
});
