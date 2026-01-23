// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _isChainEvmCompatible, _isChainSubstrateCompatible, _isCustomChain } from '@subwallet/extension-base/services/chain-service/utils';
import { FilterModal, Layout, NetworkEmptyList, NetworkToggleItem, OptionType, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { ChainInfoWithState, useFilterModal, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import useChainInfoWithStateAndStatus, { ChainInfoWithStateAndStatus } from '@subwallet/extension-koni-ui/hooks/chain/useChainInfoWithStateAndStatus';
import { disableAllNetwork } from '@subwallet/extension-koni-ui/messaging';
import { ManageChainsParam, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps, Icon, ModalContext, Switch, SwList } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { FadersHorizontal, Plus } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

const FILTER_MODAL_ID = 'filterTokenModal';

enum FilterValue {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  CUSTOM = 'custom',
  SUBSTRATE = 'substrate',
  EVM = 'evm'
}

const renderEmpty = () => <NetworkEmptyList />;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const locationState = useLocation().state as ManageChainsParam;
  const [defaultSearch] = useState<string | undefined>(locationState?.defaultSearch);
  const sectionRef = useRef<SwListSectionRef>(null);
  const isFillDefaultSearch = useRef<boolean>(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const dataContext = useContext(DataContext);
  const { activeModal } = useContext(ModalContext);
  const chainInfoList = useChainInfoWithStateAndStatus();
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const [disablingAll, setDisablingAll] = useState(false);

  const hasActiveChains = useMemo(() => {
    return chainInfoList.some((chain) => chain.active);
  }, [chainInfoList]);

  const onDisableAll = useCallback(() => {
    if (!disablingAll) {
      if (hasActiveChains) {
        setDisablingAll(true);
        disableAllNetwork()
          .finally(() => {
            setDisablingAll(false);
          });
      }
    }
  }, [disablingAll, hasActiveChains]);

  const FILTER_OPTIONS = useMemo((): OptionType[] => ([
    { label: t('ui.SETTINGS.screen.Setting.Chains.Manage.evmNetworks'), value: FilterValue.EVM },
    { label: t('ui.SETTINGS.screen.Setting.Chains.Manage.substrateNetworks'), value: FilterValue.SUBSTRATE },
    { label: t('ui.SETTINGS.screen.Setting.Chains.Manage.customNetworks'), value: FilterValue.CUSTOM },
    { label: t('ui.SETTINGS.screen.Setting.Chains.Manage.enabledNetworks'), value: FilterValue.ENABLED },
    { label: t('ui.SETTINGS.screen.Setting.Chains.Manage.disabledNetworks'), value: FilterValue.DISABLED }
  ]), [t]);

  const filterFunction = useMemo<(item: ChainInfoWithState) => boolean>(() => {
    return (chainInfo) => {
      if (!selectedFilters.length) {
        return true;
      }

      for (const filter of selectedFilters) {
        if (filter === FilterValue.CUSTOM) {
          if (_isCustomChain(chainInfo.slug)) {
            return true;
          }
        } else if (filter === FilterValue.ENABLED) {
          if (chainInfo.active) {
            return true;
          }
        } else if (filter === FilterValue.DISABLED) {
          if (!chainInfo.active) {
            return true;
          }
        } else if (filter === FilterValue.SUBSTRATE) {
          if (_isChainSubstrateCompatible(chainInfo)) {
            return true;
          }
        } else if (filter === FilterValue.EVM) {
          if (_isChainEvmCompatible(chainInfo)) {
            return true;
          }
        }
      }

      return false;
    };
  }, [selectedFilters]);

  const searchToken = useCallback((chainInfo: ChainInfoWithState, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return chainInfo.name.toLowerCase().includes(searchTextLowerCase);
  }, []);

  const renderChainItem = useCallback((chainInfo: ChainInfoWithStateAndStatus) => {
    return (
      <NetworkToggleItem
        chainInfo={chainInfo}
        isShowSubLogo={true}
        key={chainInfo.slug}
      />
    );
  }, []);

  const subHeaderButton: ButtonProps[] = useMemo(() => {
    return [
      {
        icon: (
          <Icon
            phosphorIcon={Plus}
            size='md'
            type='phosphor'
          />
        ),
        onClick: () => {
          navigate('/settings/chains/import', { state: { isExternalRequest: false } });
        }
      }
    ];
  }, [navigate]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const openFilterModal = useCallback((e?: SyntheticEvent) => {
    e && e.stopPropagation();
    activeModal(FILTER_MODAL_ID);
  }, [activeModal]);

  const isSectionRefFilled = !!sectionRef.current;

  useEffect(() => {
    if (defaultSearch && !isFillDefaultSearch.current && isSectionRefFilled) {
      isFillDefaultSearch.current = true;
      sectionRef.current?.setSearchValue(defaultSearch);
    }
  }, [defaultSearch, isSectionRefFilled]);

  return (
    <PageWrapper
      className={`manage_chains ${className}`}
      resolve={dataContext.awaitStores(['chainStore'])}
    >
      <Layout.Base
        onBack={onBack}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={true}
        subHeaderIcons={subHeaderButton}
        subHeaderPaddingVertical={true}
        title={t<string>('ui.SETTINGS.screen.Setting.Chains.Manage.manageNetworks')}
      >
        <SwList.Section
          actionBtnIcon={(
            <Icon
              phosphorIcon={FadersHorizontal}
              size='sm'
              weight={'fill'}
            />
          )}
          className={'manage_chains__container'}
          enableSearchInput
          filterBy={filterFunction}
          list={chainInfoList}
          mode={'boxed'}
          onClickActionBtn={openFilterModal}
          ref={sectionRef}
          renderItem={renderChainItem}
          renderWhenEmpty={renderEmpty}
          searchFunction={searchToken}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('ui.SETTINGS.screen.Setting.Chains.Manage.searchNetwork')}
          showActionBtn
        />
        <div className={'manage_chains__disable_all_row'}>
          <span className={'manage_chains__disable_all_label'}>{t('Disable all networks')}</span>
          <Switch
            checked={!hasActiveChains}
            disabled={!hasActiveChains}
            loading={disablingAll}
            onClick={onDisableAll}
            size={'small'}
          />
        </div>

        <FilterModal
          id={FILTER_MODAL_ID}
          onApplyFilter={onApplyFilter}
          onCancel={onCloseFilterModal}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          options={FILTER_OPTIONS}
        />
      </Layout.Base>
    </PageWrapper>
  );
}

const ManageChains = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-screen-layout-body': {
      display: 'flex'
    },

    '.ant-sw-list-wrapper.ant-sw-list-wrapper:before': {
      zIndex: 0,
      borderRadius: token.borderRadiusLG
    },

    '.ant-sw-list-section.-boxed-mode .ant-sw-list': {
      paddingLeft: token.padding,
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingXS
    },

    '.ant-sw-list-section.-boxed-mode .ant-sw-list.-ignore-scrollbar': {
      paddingRight: token.padding + 6
    },

    '.ant-network-item.-with-divider': {
      position: 'relative',
      zIndex: 1
    },

    '&__inner': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    '.manage_chains__container': {
      paddingBottom: token.paddingSM,
      flex: 1,

      '.ant-sw-list-search-input': {
        marginBottom: 40
      }
    },

    '.manage_chains__disable_all_row': {
      position: 'absolute',
      top: 116,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: token.sizeXS,
      padding: `0 ${token.padding}px`,
      zIndex: 5
    },

    '.manage_chains__disable_all_label': {
      fontSize: token.fontSizeSM,
      color: token.colorTextLight4
    },

    '.ant-network-item-content .__toggle-area': {
      marginRight: -token.marginXXS,

      'button + button': {
        marginLeft: token.marginXS
      }
    },

    '.ant-web3-block .ant-web3-block-middle-item': {
      width: 190,
      overflow: 'hidden'
    },

    '.ant-network-item-name': {
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      paddingRight: token.paddingXS
    }
  });
});

export default ManageChains;
