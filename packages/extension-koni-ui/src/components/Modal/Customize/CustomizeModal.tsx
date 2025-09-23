// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { BackIcon, EmptyList, FilterModal, OptionType, TokenToggleWithChainItem } from '@subwallet/extension-koni-ui/components';
import Search from '@subwallet/extension-koni-ui/components/Search';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useChainInfoWithStateAndStatus, useFilterModal } from '@subwallet/extension-koni-ui/hooks';
import { useChainAssets } from '@subwallet/extension-koni-ui/hooks/assets';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { saveShowZeroBalance } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, Badge, ButtonProps, Icon, ModalContext, SettingItem, Switch, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { Coins, FadersHorizontal, Plus, Wallet } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chainInfoList = useChainInfoWithStateAndStatus();
  const { token } = useTheme() as Theme;
  const navigate = useNavigate();
  const isShowZeroBalance = useSelector((state: RootState) => state.settings.isShowZeroBalance);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const id = CUSTOMIZE_MODAL;
  const filterModalId = `${id}-filter-modal`;
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, onResetFilter, selectedFilters } = useFilterModal(filterModalId);
  const assetItems = useChainAssets({ isFungible: true }).chainAssets;
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [currentSearchText, setCurrentSearchText] = useState<string>('');
  const onChangeZeroBalance = useCallback(() => {
    saveShowZeroBalance(!isShowZeroBalance).catch(console.error);
  }, [isShowZeroBalance]);

  const handleSearch = useCallback((value: string) => {
    setCurrentSearchText(value);
  }, []);

  const emptyToken = useCallback(() => {
    return (
      <EmptyList
        className='__empty-list'
        emptyMessage={t('ui.BALANCE.screen.Tokens.trySearchingOrImporting')}
        emptyTitle={t('ui.BALANCE.screen.Tokens.noTokensFound')}
        phosphorIcon={Coins}
      />
    );
  }, [t]);

  const onCancel = useCallback(() => {
    onResetFilter();
    inactiveModal(CUSTOMIZE_MODAL);
    setCurrentSearchText('');
  }, [inactiveModal, onResetFilter]);

  const FILTER_OPTIONS = useMemo((): OptionType[] => {
    const grouped = chainInfoList.reduce((acc, item) => {
      acc[item.slug] = item.name;

      return acc;
    }, {} as Record<string, string>);

    return Object.entries(grouped).map(([slug, name]) => ({
      label: name,
      value: slug
    }));
  }, [chainInfoList]);

  const filterFunction = useMemo<(item: _ChainAsset) => boolean>(() => {
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

  const searchFunction = useCallback((item: _ChainAsset, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();
    const chainName = chainInfoMap[item.originChain]?.name?.toLowerCase();
    const symbol = item.symbol.toLowerCase();

    return (
      symbol.includes(searchTextLowerCase) ||
      chainName.includes(searchTextLowerCase)
    );
  }, [chainInfoMap]);

  const hasAnyFilterValue = !!selectedFilters.length;

  const listItems = useMemo(() => {
    let result = assetItems;

    const needToFilter = !!currentSearchText || hasAnyFilterValue;

    if (needToFilter) {
      result = result.filter((i) => {
        return (!hasAnyFilterValue || filterFunction(i)) && (!currentSearchText || searchFunction(i, currentSearchText));
      });
    }

    return result;
  }, [assetItems, currentSearchText, filterFunction, hasAnyFilterValue, searchFunction]);

  const filterSearchBox = useMemo(() => {
    return {
      placeholder: t('ui.BALANCE.components.Modal.Customize.Modal.searchNetwork')
    };
  }, [t]);

  const renderItem = useCallback((tokenInfo: _ChainAsset) => {
    return (
      <TokenToggleWithChainItem
        chainName={tokenInfo.name}
        chainSlug={tokenInfo.originChain}
        className={'token-toggle-with-chain'}
        key={tokenInfo.slug}
        showButtonEdit={false}
        showToggle={true}
        tokenInfo={tokenInfo}
        tokenSlug={tokenInfo.slug}
        tokenSymbol={tokenInfo.symbol}
      />
    );
  }, []);

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

  const subHeaderButton: ButtonProps = useMemo(() => {
    return {
      icon: (
        <Icon
          phosphorIcon={Plus}
          size='md'
          type='phosphor'
        />
      ),
      onClick: () => {
        onCancel();
        navigate('/settings/tokens/import-token', { state: { isExternalRequest: false, isCustomizeModal: true } });
      }
    };
  }, [navigate, onCancel]);

  return (
    <>
      <SwModal
        className={CN(className, '-modal-container')}
        destroyOnClose={true}
        id={CUSTOMIZE_MODAL}
        onCancel={onCancel}
        rightIconProps={subHeaderButton}
        title={t('ui.BALANCE.components.Modal.Customize.Modal.customizeTokenDisplay')}
      >
        <div className={'__group-content'}>
          <SettingItem
            className={'__setting-item'}
            leftItemIcon={
              <BackgroundIcon
                backgroundColor={token['green-6']}
                iconColor={token.colorTextLight1}
                phosphorIcon={Wallet}
                size='sm'
                type='phosphor'
                weight='fill'
              />
            }
            name={t('ui.BALANCE.components.Modal.Customize.Modal.showZeroBalance')}
            rightItem={
              <Switch
                checked={isShowZeroBalance}
                onClick={onChangeZeroBalance}
                style={{ marginRight: 8 }}
              />}
          />
        </div>

        <div className={'__group-label'}>{t('ui.BALANCE.components.Modal.Customize.Modal.tokens')}</div>

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
          placeholder={t<string>('ui.BALANCE.components.Modal.Customize.Modal.tokenOrNetworkName')}
          searchValue={currentSearchText}
          showActionBtn
        />
        <SwList
          className={'__list-container'}
          list={listItems}
          renderItem={renderItem}
          renderWhenEmpty={emptyToken}
          searchableMinCharactersCount={2}
        />
      </SwModal>
      <FilterModal
        closeIcon={<BackIcon />}
        id={filterModalId}
        onApplyFilter={applyFilter}
        onCancel={cancelFilter}
        onChangeOption={onChangeFilterOption}
        onResetFilter={onResetFilter}
        optionSelectionMap={filterSelectionMap}
        options={FILTER_OPTIONS}
        searchBox={filterSearchBox}
        showResetButton={true}
      />
    </>
  );
}

export const CustomizeModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content': {
      maxHeight: 586,
      height: 586,
      overflow: 'hidden'
    },

    '.__empty-list': {
      marginTop: 56,
      marginBottom: 16
    },

    '.-side-panel-mode & .ant-sw-modal-content': {
      maxHeight: 'calc(100vh - 56px)',
      height: 'calc(100vh - 56px)'
    },

    '.ant-sw-modal-body': {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 0,
      display: 'flex',
      flexDirection: 'column'
    },

    '.__group-label': {
      color: token.colorTextLight3,
      textTransform: 'uppercase',
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginBottom: token.marginXS
    },

    '.__group-content': {
      marginBottom: token.marginXS
    },

    '.__setting-item .ant-setting-item-content': {
      paddingTop: 0,
      paddingBottom: 0,
      height: 52,
      alignItems: 'center'
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.network_item__container .ant-web3-block-right-item': {
      marginRight: 0
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
        padding: token.padding,
        paddingTop: 8
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
        paddingBottom: token.padding,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      },

      '.token-selector-item + .token-selector-item': {
        marginTop: token.marginXS
      }
    }
  });
});
