// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _EnhancedReferendumInfo, _ReferendumInfo } from '@subwallet/extension-base/services/open-gov/type';
import { FilterModal, LoadingScreen } from '@subwallet/extension-koni-ui/components';
import EmptyList from '@subwallet/extension-koni-ui/components/EmptyList/EmptyList';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useFilterModal } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext, SwList } from '@subwallet/react-ui';
import { FadersHorizontal, GlobeHemisphereWest } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { govCategories, GovCategoryType } from '../predefined';
import { calculateTimeLeft, getTimeLeft, isGovOngoing } from '../utils';
import { ReferendumDetailModal, ReferendumDetailModalId } from './ReferendumDetail';
import ReferendumItem from './ReferendumItem';

type Props = ThemeProps & {
  referendums: _EnhancedReferendumInfo[];
  isLoading: boolean;
  chainAsset: _ChainAsset;
  selectedAddress: string;
};

const FILTER_MODAL_ID = 'referendum-filter-modal';

function Component ({ chainAsset, className, isLoading, referendums, selectedAddress }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(GovCategoryType.ALL);
  const [searchInput, setSearchInput] = useState<string>('');
  const [currentSelectItem, setCurrentSelectItem] = useState<_ReferendumInfo | null>(null);
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeftMap = referendums.reduce((acc, item) => {
        acc[item._id] = calculateTimeLeft(
          item.state.indexer.blockTime,
          item.state.indexer.blockHeight,
          item.onchainData.info.alarm?.[0] || null,
          item.state.name
        ).timeLeft;

        return acc;
      }, {} as Record<string, string>);

      setTimeLeftMap(newTimeLeftMap);
    }, 1000);

    return () => clearInterval(timer);
  }, [referendums]);

  const searchFunction = useCallback((item: _ReferendumInfo, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    if (!item.title && !searchTextLowerCase) {
      return true;
    }

    return (
      item.title?.toLowerCase().includes(searchTextLowerCase) || item.referendumIndex.toString().includes(searchTextLowerCase)
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

  const onClickItem = useCallback((item: _ReferendumInfo) => {
    setCurrentSelectItem(item);
    activeModal(ReferendumDetailModalId);
  }, [activeModal]);

  const tabFilterFunction = useCallback((item: _ReferendumInfo): boolean => {
    switch (selectedFilterTab) {
      case GovCategoryType.VOTED:
        return isGovOngoing(item.state.name);
      case GovCategoryType.NOTVOTED:
        return !isGovOngoing(item.state.name);
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

  const sortedReferendums = useMemo(() => {
    return [...referendums].sort((a, b) => {
      const aIsOngoing = isGovOngoing(a.state.name);
      const bIsOngoing = isGovOngoing(b.state.name);

      if (aIsOngoing && !bIsOngoing) {
        return -1;
      }

      if (!aIsOngoing && bIsOngoing) {
        return 1;
      }

      if (aIsOngoing && bIsOngoing) {
        return a.endTime - b.endTime;
      }

      return b.referendumIndex - a.referendumIndex;
    });
  }, [referendums]);

  const filteredReferendums = useMemo(() => {
    return sortedReferendums.filter(tabFilterFunction).filter((item) => searchFunction(item, searchInput));
  }, [sortedReferendums, tabFilterFunction, searchInput, searchFunction]);

  const renderItem = useCallback(
    (item: _ReferendumInfo) => (
      <ReferendumItem
        className={'earning-option-item'}
        data={item}
        key={item._id}
        onClick={onClickItem}
        timeLeft={timeLeftMap[item._id] || getTimeLeft(item)}
      />
    ),
    [onClickItem, timeLeftMap]
  );

  const emptyList = useCallback(
    () => (
      <EmptyList
        emptyMessage={t('No referendum found')}
        emptyTitle={t('Your referendum will show up here')}
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
          placeholder={t('Referenda...')}
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
              list={filteredReferendums}
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
      <ReferendumDetailModal
        address={selectedAddress}
        chainAsset={chainAsset}
        data={currentSelectItem}
      />
    </div>
  );
}

const ReferendumTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
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

export default ReferendumTab;
