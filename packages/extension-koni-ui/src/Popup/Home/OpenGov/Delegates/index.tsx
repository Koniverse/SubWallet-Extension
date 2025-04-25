// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _DelegateInfo, _ReferendumInfo } from '@subwallet/extension-base/services/open-gov/type';
import { FilterModal, LoadingScreen } from '@subwallet/extension-koni-ui/components';
import EmptyList from '@subwallet/extension-koni-ui/components/EmptyList/EmptyList';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useFilterModal } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext, SwList } from '@subwallet/react-ui';
import { FadersHorizontal, GlobeHemisphereWest } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { govCategories, GovCategoryType } from '../predefined';
import { DelegateDetailModal, DelegateDetailModalId } from './DelegateDetail';
import DelegateItem from './DelegateItem';

type Props = ThemeProps & {
  delegate: _DelegateInfo[];
  isLoading: boolean;
  chainAsset: _ChainAsset;
  selectedAddress: string;
};

const FILTER_MODAL_ID = 'referendum-filter-modal';

function Component ({ chainAsset, className, delegate, isLoading, selectedAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(GovCategoryType.ALL);
  const [searchInput, setSearchInput] = useState<string>('');
  const [currentSelectItem, setCurrentSelectItem] = useState<_DelegateInfo | null>(null);

  const searchFunction = useCallback((item: _DelegateInfo, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    if (!item.address && !item.manifesto?.name && !searchTextLowerCase) {
      return true;
    }

    return (
      item.address?.toLowerCase().includes(searchTextLowerCase) || item.manifesto?.name?.toLowerCase().includes(searchTextLowerCase)
    );
  }, []);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const handleSearch = useCallback((value: string) => setSearchInput(value), []);

  const onClickActionBtn = useCallback(
    (e?: SyntheticEvent) => {
      e && e.stopPropagation();
      activeModal(FILTER_MODAL_ID);
    },
    [activeModal]
  );

  const onClickItem = useCallback((item: _DelegateInfo) => {
    setCurrentSelectItem(item);
    activeModal(DelegateDetailModalId);
  }, [activeModal]);

  const tabFilterFunction = useCallback((item: _DelegateInfo): boolean => {
    switch (selectedFilterTab) {
      case GovCategoryType.VOTED:
        return true;
      case GovCategoryType.NOTVOTED:
        return false;
      default:
        return true;
    }
  }, [selectedFilterTab]);

  const filterOptions = useMemo(() => [
    ...govCategories.map((c) => ({
      label: t(c.name),
      value: c.slug
    }))
  ], [t]);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => [
    { label: t('All'), value: GovCategoryType.ALL },
    { label: t('Ongoing'), value: GovCategoryType.VOTED },
    { label: t('Completed'), value: GovCategoryType.NOTVOTED }
  ], [t]);

  const filterFunction = useMemo<(item: _ReferendumInfo) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      return selectedFilters.some((filter) => item.state.name === filter);
    };
  }, [selectedFilters]);

  const filteredDelegates = useMemo(() => {
    return delegate.filter(tabFilterFunction).filter((item) => searchFunction(item, searchInput));
  }, [delegate, tabFilterFunction, searchInput, searchFunction]);

  const renderItem = useCallback(
    (item: _DelegateInfo) => (
      <DelegateItem
        className={'earning-option-item'}
        data={item}
        key={item.address}
        onClick={onClickItem}
      />
    ),
    [onClickItem]
  );

  const emptyList = useCallback(
    () => (
      <EmptyList
        emptyMessage={t('No delegate found')}
        emptyTitle={t('Your delegates will show up here')}
        phosphorIcon={GlobeHemisphereWest}
      />
    ),
    [t]
  );

  return (
    <div className={className}>
      <div className={'__tool-area'}>
        <Search
          actionBtnIcon={
            <Icon
              phosphorIcon={FadersHorizontal}
              size='sm'
            />}
          className={'__search-item'}
          onClickActionBtn={onClickActionBtn}
          onSearch={handleSearch}
          placeholder={t('Delegates...')}
          searchValue={searchInput}
          showActionBtn
        />
        <FilterTabs
          className={'filter-tabs-container'}
          items={filterTabItems}
          onSelect={onSelectFilterTab}
          selectedItem={selectedFilterTab}
        />
      </div>
      <div className={'__content-wrapper'}>
        {isLoading
          ? (
            <LoadingScreen />
          )
          : (
            <SwList
              actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
              className={'__section-list-container'}
              enableSearchInput
              filterBy={filterFunction}
              list={filteredDelegates}
              renderItem={renderItem}
              renderWhenEmpty={emptyList}
              searchFunction={searchFunction}
              searchMinCharactersCount={2}
              searchPlaceholder={t<string>('Campaign name...')}
              showActionBtn
            />
          )}
      </div>
      <FilterModal
        applyFilterButtonTitle={t('Apply filter')}
        id={FILTER_MODAL_ID}
        onApplyFilter={onApplyFilter}
        onCancel={onCloseFilterModal}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        options={filterOptions}
        title={t('Filter')}
      />
      <DelegateDetailModal
        address={selectedAddress}
        chainAsset={chainAsset}
        data={currentSelectItem}
      />
    </div>
  );
}

const DelegateTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '.__tab-item-label': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },
    '.__section-list-container': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },
    '.filter-tabs-container': {
      paddingLeft: token.padding,
      paddingRight: token.padding
    },
    '.__search-item': {
      display: 'block',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingXS,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },
    '.__tool-area': {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: token.marginXS
    },
    '.__content-wrapper': {
      overflowX: 'auto'
    }
  };
});

export default DelegateTab;
