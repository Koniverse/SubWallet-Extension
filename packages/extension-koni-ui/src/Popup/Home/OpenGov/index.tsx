// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ReferendumInfo } from '@subwallet/extension-base/services/open-gov/type';
import { AccountAddressSelector, BasicInputEvent, ChainSelector, FilterModal, Layout } from '@subwallet/extension-koni-ui/components';
import EmptyList from '@subwallet/extension-koni-ui/components/EmptyList/EmptyList';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useFilterModal, useOpenGovSelection, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { fetchReferendums } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, ModalContext, SwList } from '@subwallet/react-ui';
import CN from 'classnames';
import { FadersHorizontal, GlobeHemisphereWest } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { GovDetailModal, GovDetailModalId } from './GovDetailModal';
import GovItem from './GovPoolItem';
import { govCategories, GovCategoryType } from './predefined';
import { calculateTimeLeft, govChainSupportItems, isGovOngoing } from './utils';

type Props = ThemeProps;

const FILTER_MODAL_ID = 'openGov-filter-modal';

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(GovCategoryType.ALL);
  const [searchInput, setSearchInput] = useState<string>('');
  const { activeModal } = useContext(ModalContext);
  const [currentSelectItem, setCurrentSelectItem] = useState<_ReferendumInfo | null>(null);
  const [referendums, setReferendums] = useState<_ReferendumInfo[]>([]);

  const filterOptions = useMemo(() => [
    ...govCategories.map((c) => ({
      label: t(c.name),
      value: c.slug
    }))
  ], [t]);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('All'),
        value: GovCategoryType.ALL
      },
      {
        label: t('Ongoing'),
        value: GovCategoryType.VOTED
      },
      {
        label: t('Completed'),
        value: GovCategoryType.NOTVOTED
      }
    ];
  }, [t]);

  const filterFunction = useMemo<(item: _ReferendumInfo) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      for (const filter of selectedFilters) {
        if (item.state.name === filter) {
          return true;
        }
      }

      return false;
    };
  }, [selectedFilters]);

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

  const handleSearch = useCallback((value: string) => setSearchInput(value), [setSearchInput]);

  const onClickActionBtn = useCallback(
    (e?: SyntheticEvent) => {
      e && e.stopPropagation();
      activeModal(FILTER_MODAL_ID);
    },
    [activeModal]
  );

  const onClickItem = useCallback((item: _ReferendumInfo) => {
    setCurrentSelectItem(item);
    activeModal(GovDetailModalId);
  }, [activeModal]);

  const renderItem = useCallback(
    (item: _ReferendumInfo) => {
      return (
        <GovItem
          className={'earning-option-item'}
          data={item}
          key={item._id}
          onClick={onClickItem}
        />
      );
    },
    [onClickItem]
  );

  const emptyList = useCallback(() => {
    return (
      <EmptyList
        emptyMessage={t('No referendum found')}
        emptyTitle={t('Your referendum will show up here')}
        phosphorIcon={GlobeHemisphereWest}
      />
    );
  }, [t]);

  // START HERE
  const { isAllAccount } = useSelector((root) => root.accountState);

  const { accountAddressItems, selectedAddress, selectedChain, setSelectedAddress,
    setSelectedChain } = useOpenGovSelection();

  const onSelectAccount = useCallback((event: BasicInputEvent) => {
    setSelectedAddress(event.target.value);
  }, [setSelectedAddress]);

  const onSelectChain = useCallback((event: BasicInputEvent) => {
    setSelectedChain(event.target.value);
  }, [setSelectedChain]);

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
        const aTime = calculateTimeLeft(
          a.state.indexer.blockTime,
          a.state.indexer.blockHeight,
          a.onchainData.info.alarm ? a.onchainData.info.alarm[0] : null,
          a.trackInfo.decisionPeriod,
          a.state.name
        ).endTime;

        const bTime = calculateTimeLeft(
          b.state.indexer.blockTime,
          b.state.indexer.blockHeight,
          b.onchainData.info.alarm ? b.onchainData.info.alarm[0] : null,
          b.trackInfo.decisionPeriod,
          b.state.name
        ).endTime;

        return aTime - bTime;
      }

      return b.referendumIndex - a.referendumIndex;
    });
  }, [referendums]);

  const tabFilterFunction = useCallback((item: _ReferendumInfo): boolean => {
    switch (selectedFilterTab) {
      case GovCategoryType.VOTED: {
        return isGovOngoing(item.state.name);
      }

      case GovCategoryType.NOTVOTED: {
        return !isGovOngoing(item.state.name);
      }

      default:
        return true;
    }
  }, [selectedFilterTab]);

  const filteredReferendums = useMemo(() => {
    const filtered = sortedReferendums.filter(tabFilterFunction);
    const result = filtered.filter((item) => searchFunction(item, searchInput));

    return result;
  }, [sortedReferendums, tabFilterFunction, searchInput, searchFunction]);

  useEffect(() => {
    const loadReferendums = async () => {
      const data = await fetchReferendums(selectedChain);

      console.log('Hi', data);
      setReferendums(data);
    };

    loadReferendums().catch((err) => {
      console.error('Failed to load referendums:', err);
    });
  }, [selectedChain]);

  const govSelectorsNode = (
    <>
      <ChainSelector
        className={'__gov-chain-selector'}
        items={govChainSupportItems}
        onChange={onSelectChain}
        title={t('Select chain')}
        value={selectedChain}
      />

      {
        (isAllAccount || accountAddressItems.length > 1) && (
          <AccountAddressSelector
            className={'__gov-address-selector'}
            items={accountAddressItems}
            onChange={onSelectAccount}
            value={selectedAddress}
          />
        )
      }
    </>
  );

  return (
    <Layout.Base
      className={CN(className)}
      showSubHeader={true}
      subHeaderBackground={'transparent'}
      subHeaderCenter={false}
      subHeaderPaddingVertical={true}
      title={t<string>('Vote')}
    >
      <div className={'__page-tool-area'}>
        {govSelectorsNode}
      </div>
      <div className={'__tool-area'}>
        <Search
          actionBtnIcon={(
            <Icon
              phosphorIcon={FadersHorizontal}
              size='sm'
            />
          )}
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
      <GovDetailModal
        chain={selectedChain}
        data={currentSelectItem}
      />
    </Layout.Base>
  );
};

const Governance = styled(Component)<Props>(({ theme: { token } }: Props) => {
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
    '.ant-sw-screen-layout-body': {
      display: 'flex',
      flexDirection: 'column'
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
    },
    '.ant-sw-header-container-padding-vertical': {
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: '8px !important',
      marginBottom: '8px !important'
    },

    // START HERE
    '.__page-tool-area': {
      display: 'flex',
      padding: token.padding,
      paddingTop: 0,
      borderBottomLeftRadius: token.size,
      borderBottomRightRadius: token.size,
      backgroundColor: token.colorBgDefault,
      gap: token.sizeSM,
      position: 'relative',
      zIndex: 2,

      '.__gov-address-selector, .__gov-chain-selector': {
        height: 40,
        flex: 1,
        flexBasis: '50%',
        borderRadius: 32,
        overflow: 'hidden',

        '&:before': {
          display: 'none'
        },

        '.ant-select-modal-input-wrapper': {
          paddingLeft: token.padding,
          paddingRight: token.padding
        }
      },

      '.__gov-address-selector': {
        '.__selected-item-address': {
          display: 'none'
        },

        '.ant-field-container:before': {
          display: 'none'
        },

        '.ant-field-wrapper': {
          minHeight: 40,
          paddingTop: 0,
          paddingBottom: 0
        }
      }
    }
  };
});

export default Governance;
