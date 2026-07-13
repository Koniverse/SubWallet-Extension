// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainEvmCompatible, _isChainSubstrateCompatible, _isCustomChain } from '@subwallet/extension-base/services/chain-service/utils';
import { AlertModal, FilterModal, Layout, NetworkEmptyList, NetworkToggleItem, OptionType, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { ChainInfoWithState, useAlert, useFilterModal, useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import useChainInfoWithStateAndStatus, { ChainInfoWithStateAndStatus } from '@subwallet/extension-koni-ui/hooks/chain/useChainInfoWithStateAndStatus';
import { disableAllNetwork } from '@subwallet/extension-koni-ui/messaging';
import { ManageChainsParam, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, ButtonProps, Icon, ModalContext, SettingItem, Switch, SwList } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import { FadersHorizontal, Plus, WifiSlash } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps

const FILTER_MODAL_ID = 'filterTokenModal';
const DISABLE_ALL_ALERT_MODAL_ID = 'manage-chains-disable-all-alert';

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
  const notify = useNotification();
  const { token } = useTheme() as Theme;
  const navigate = useNavigate();
  const dataContext = useContext(DataContext);
  const { activeModal } = useContext(ModalContext);
  const chainInfoList = useChainInfoWithStateAndStatus();
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const [disablingAll, setDisablingAll] = useState(false);
  const { alertProps, closeAlert, openAlert } = useAlert(DISABLE_ALL_ALERT_MODAL_ID);

  const hasActiveChains = useMemo(() => {
    return chainInfoList.some((chain) => chain.active);
  }, [chainInfoList]);

  const doDisableAll = useCallback(() => {
    closeAlert();
    setDisablingAll(true);
    disableAllNetwork()
      .catch((error: Error) => {
        notify({
          message: error?.message || t('ui.SETTINGS.screen.Setting.Chains.Manage.turnOffAllNetworksUnable'),
          type: NotificationType.ERROR
        });
      })
      .finally(() => {
        setDisablingAll(false);
      });
  }, [closeAlert, notify, t]);

  const onDisableAll = useCallback(() => {
    if (!disablingAll && hasActiveChains) {
      openAlert({
        title: t('ui.SETTINGS.screen.Setting.Chains.Manage.turnOffAllNetworks'),
        type: NotificationType.WARNING,
        hideIcon: true,
        content: t('ui.SETTINGS.screen.Setting.Chains.Manage.disableAllNetworkConfirmation'),
        subtitle: t('ui.SETTINGS.screen.Setting.Chains.Manage.disableAllNetworkSubtitle'),
        subtitleDanger: true,
        okButton: {
          text: t('ui.SETTINGS.screen.Setting.Chains.Manage.turnOff'),
          schema: 'error',
          onClick: doDisableAll,
          icon: WifiSlash
        }
      });
    }
  }, [disablingAll, doDisableAll, hasActiveChains, openAlert, t]);

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
    navigate('/settings/list');
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
        <SettingItem
          className={'manage_chains__disable_all'}
          leftItemIcon={(
            <BackgroundIcon
              backgroundColor={token.colorError}
              iconColor={token.colorTextLight1}
              phosphorIcon={WifiSlash}
              size='sm'
              type='phosphor'
              weight='fill'
            />
          )}
          name={t('ui.SETTINGS.screen.Setting.Chains.Manage.turnOffAllNetworks')}
          rightItem={(
            <Switch
              checked={!hasActiveChains}
              disabled={!hasActiveChains}
              loading={disablingAll}
              onClick={onDisableAll}
              size={'small'}
              style={{ marginRight: 8 }}
            />
          )}
        />

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

        <FilterModal
          id={FILTER_MODAL_ID}
          onApplyFilter={onApplyFilter}
          onCancel={onCloseFilterModal}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          options={FILTER_OPTIONS}
        />

        {!!alertProps && (
          <AlertModal
            modalId={DISABLE_ALL_ALERT_MODAL_ID}
            {...alertProps}
          />
        )}
      </Layout.Base>
    </PageWrapper>
  );
}

const ManageChains = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-screen-layout-body': {
      display: 'flex',
      flexDirection: 'column'
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
      flex: 1,

      '.ant-sw-list-search-input': {
        marginBottom: token.marginSM
      }
    },

    '.manage_chains__disable_all': {
      marginTop: token.padding,
      marginBottom: token.paddingSM,
      marginInline: token.padding,

      '.ant-setting-item-content': {
        minHeight: 52,
        paddingTop: 0,
        paddingBottom: 0,
        alignItems: 'center'
      },

      '.ant-sw-switch': {
        flexShrink: 0
      }
    },

    '.manage_chains__disable_all .ant-setting-item-name-wrapper': {
      alignItems: 'center',
      gap: token.sizeSM
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
