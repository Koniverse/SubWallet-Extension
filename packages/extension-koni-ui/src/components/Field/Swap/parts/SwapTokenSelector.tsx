// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { BackIcon, FilterModal, GeneralEmptyList, TokenSelectorItem } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { useFilterModal, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TokenSelectorItemType } from '@subwallet/extension-koni-ui/types/field';
import { Badge, Icon, Logo, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, FadersHorizontal } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  items: TokenSelectorItemType[];
  onSelect: (value: string) => void;
  id?: string;
  placeholder?: string;
  title?: string;
  label?: string;
  disabled?: boolean;
  value?: string;
}

interface FilterOption {
  label: string;
  value: string;
}

const renderEmpty = () => <GeneralEmptyList />;

const Component = (props: Props) => {
  const { className = '', disabled, id = 'swap-token-selector',
    items, label, onSelect, placeholder, value } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  const modalId = id;
  const filterModalId = `${id}-filter-modal`;
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const [currentSearchText, setCurrentSearchText] = useState<string>('');
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, onResetFilter, selectedFilters } = useFilterModal(filterModalId);

  const handleSearch = useCallback((value: string) => {
    setCurrentSearchText(value);
  }, []);

  const onOpenModal = useCallback(() => {
    if (disabled) {
      return;
    }

    activeModal(modalId);
  }, [activeModal, disabled, modalId]);

  const onCloseModal = useCallback(() => {
    inactiveModal(modalId);
    onResetFilter();
    setCurrentSearchText('');
  }, [inactiveModal, modalId, onResetFilter]);

  const onClickItem = useCallback((item: TokenSelectorItemType) => {
    return () => {
      onSelect?.(item.slug);
      onCloseModal();
    };
  }, [onCloseModal, onSelect]);

  const renderItem = useCallback((item: TokenSelectorItemType) => {
    return (
      <TokenSelectorItem
        balanceInfo={item.balanceInfo}
        chainName={_getChainName(chainInfoMap[item.originChain])}
        chainSlug={item.originChain}
        className={CN('token-selector-item')}
        isSelected={value === item.slug}
        key={item.slug}
        onClick={onClickItem(item)}
        showBalance={true}
        tokenSlug={item.slug}
        tokenSymbol={item.symbol}
      />
    );
  }, [chainInfoMap, onClickItem, value]);

  const filterOptions: FilterOption[] = useMemo(() => {
    const uniqueOriginChains = Array.from(new Set(items.map((item) => item.originChain)));

    const result = uniqueOriginChains.map((originChain) => {
      return {
        label: _getChainName(chainInfoMap[originChain]),
        value: originChain
      };
    });

    result.sort((a, b) => {
      const priority: Record<string, number> = {
        polkadot: 0,
        ethereum: 1
      };

      const aPriority = priority[a.value] ?? 2;
      const bPriority = priority[b.value] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Sort by priority first
      }

      // If both have same priority (i.e., both are not polkadot/ethereum), sort by label
      return a.label.localeCompare(b.label);
    });

    return result;
  }, [chainInfoMap, items]);

  const openFilter = useCallback(() => {
    activeModal(filterModalId);
  }, [activeModal, filterModalId]);

  const applyFilter = useCallback(() => {
    onApplyFilter();
    activeModal(id);
  }, [activeModal, id, onApplyFilter]);

  const cancelFilter = useCallback(() => {
    onCloseFilterModal();
    activeModal(id);
  }, [activeModal, id, onCloseFilterModal]);

  const selectedItem = useMemo(() => {
    if (!value) {
      return undefined;
    }

    return items.find((i) => i.slug === value);
  }, [items, value]);

  const searchFunction = useCallback((item: TokenSelectorItemType, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();
    const chainName = chainInfoMap[item.originChain]?.name?.toLowerCase();
    const symbol = item.symbol.toLowerCase();

    return (
      symbol.includes(searchTextLowerCase) ||
      chainName.includes(searchTextLowerCase)
    );
  }, [chainInfoMap]);

  const filterFunction = useMemo<(item: TokenSelectorItemType) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      for (const filter of selectedFilters) {
        if (item.originChain === filter) {
          return true;
        }
      }

      return false;
    };
  }, [selectedFilters]);

  const hasAnyFilterValue = !!selectedFilters.length;

  const listItems = useMemo(() => {
    let result = items;

    if (selectedItem) {
      result = result.filter((i) => i.slug !== selectedItem.slug);

      result.unshift(selectedItem);
    }

    const needToFilter = !!currentSearchText || hasAnyFilterValue;

    if (needToFilter) {
      result = result.filter((i) => {
        return (!hasAnyFilterValue || filterFunction(i)) && (!currentSearchText || searchFunction(i, currentSearchText));
      });
    }

    return result;
  }, [items, selectedItem, currentSearchText, hasAnyFilterValue, filterFunction, searchFunction]);

  const filterSearchBox = useMemo(() => {
    return {
      placeholder: t('Search network')
    };
  }, [t]);

  return (
    <>
      <div
        className={CN(className, '-modal-trigger', {
          '-disabled': disabled
        })}
        onClick={onOpenModal}
      >
        <div className='__modal-trigger-content'>
          {
            !selectedItem
              ? (
                <div className={'__placeholder-text'}>
                  {placeholder || t('Select token')}
                </div>
              )
              : (
                <div className={'__selected-item'}>
                  <Logo
                    className='__token-logo'
                    isShowSubLogo={true}
                    shape='squircle'
                    size={token.sizeXL}
                    subNetwork={selectedItem.originChain}
                    token={selectedItem.slug.toLowerCase()}
                  />
                  <div className={'__item-token-info'}>
                    <span className={'__item-token-symbol'}>{selectedItem.symbol}</span>
                    <span className={'__item-token-name'}>{chainInfoMap[selectedItem.originChain]?.name}</span>
                  </div>
                </div>
              )
          }
        </div>
        <Icon
          className={'__caret-icon'}
          customSize={'16px'}
          phosphorIcon={CaretDown}
        />
      </div>
      <SwModal
        className={CN(className, '-modal-container')}
        destroyOnClose={true}
        id={modalId}
        onCancel={onCloseModal}
        title={label || t('Select token')}
      >
        <Search
          actionBtnIcon={(
            <Badge
              className={'g-filter-badge'}
              dot={hasAnyFilterValue}
            >
              <Icon
                phosphorIcon={FadersHorizontal}
                size='sm'
                type='phosphor'
                weight='fill'
              />
            </Badge>
          )}
          autoFocus={true}
          className={'__search-box'}
          onClickActionBtn={openFilter}
          onSearch={handleSearch}
          placeholder={t<string>('Enter token name or network name')}
          searchValue={currentSearchText}
          showActionBtn
        />
        <SwList
          className={'__list-container'}
          list={listItems}
          renderItem={renderItem}
          renderWhenEmpty={renderEmpty}
          searchableMinCharactersCount={2}
        />
      </SwModal>

      <FilterModal
        closeIcon={<BackIcon />}
        id={filterModalId}
        onApplyFilter={applyFilter}
        onCancel={cancelFilter}
        onChangeOption={onChangeFilterOption}
        optionSelectionMap={filterSelectionMap}
        options={filterOptions}
        searchBox={filterSearchBox}
      />
    </>
  );
};

const SwapTokenSelector = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.-modal-trigger': {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',

      '.__modal-trigger-content': {
        flex: 1,
        overflow: 'hidden'
      },

      '.__placeholder-text': {

      },

      '.__selected-item': {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      },

      '.__item-token-info': {
        display: 'flex',
        flexDirection: 'column',
        color: token.colorWhite,
        overflow: 'hidden'
      },

      '.__item-token-symbol': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        color: token.colorTextLight1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      '.__item-token-name': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextTertiary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      '.__caret-icon': {
        minWidth: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },

      '&:-disabled': {
        cursor: 'not-allowed'
      }
    },

    '&.-modal-container': {
      '.ant-sw-modal-content': {
        height: '100vh',
        paddingBottom: 0
      },

      '.ant-sw-modal-body': {
        overflow: 'auto',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 0
      },

      '.ant-sw-list-section': {
        flex: 1
      },

      '.ant-sw-list': {
        paddingBottom: 0
      },

      '.__search-box': {
        marginBottom: token.marginXS
      },

      '.__list-container': {
        flex: 1,
        overflow: 'auto',
        paddingBottom: token.padding
      },

      '.token-selector-item + .token-selector-item': {
        marginTop: token.marginXS
      }
    }
  });
});

export default SwapTokenSelector;
