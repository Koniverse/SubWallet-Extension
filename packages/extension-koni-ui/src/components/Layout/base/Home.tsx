// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useExtensionDisplayModes, useSelector, useSidePanelUtils } from '@subwallet/extension-koni-ui/hooks';
import { windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps, Dropdown, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowsOut, BellSimpleRinging, FadersHorizontal, MagnifyingGlass, PuzzlePiece, SidebarSimple } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Props extends ThemeProps {
  children?: React.ReactNode;
  showFaderIcon?: boolean;
  showSearchToken?: boolean;
  showSidebarIcon?: boolean;
  showNotificationIcon?: boolean;
  showHeader?: boolean;
  onClickSearchToken?: () => void;
  showTabBar?: boolean;
  isDisableHeader?: boolean;
}

const Component = ({ children, className, isDisableHeader, onClickSearchToken, showFaderIcon, showHeader = true, showNotificationIcon, showSearchToken, showSidebarIcon, showTabBar }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { unreadNotificationCountMap } = useSelector((state: RootState) => state.notification);
  const { currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { notificationSetup: { isEnabled: notiEnable } } = useSelector((state: RootState) => state.settings);
  const { closeSidePanel, isSidePanelSupported, openSidePanel } = useSidePanelUtils();
  const { isExpanseMode, isPopupMode, isSidePanelMode } = useExtensionDisplayModes();

  const unreadNotificationCount = useMemo(() => {
    if (!currentAccountProxy || !unreadNotificationCountMap) {
      return 0;
    }

    return isAllAccount ? Object.values(unreadNotificationCountMap).reduce((acc, val) => acc + val, 0) : unreadNotificationCountMap[currentAccountProxy.id] || 0;
  }, [currentAccountProxy, isAllAccount, unreadNotificationCountMap]);

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onOpenNotification = useCallback(() => {
    navigate('/settings/notification');
  }, [navigate]);

  const faderMenu = useMemo(() => {
    return [
      {
        key: '1',
        label: t('Network display'),
        icon: (
          <Icon phosphorIcon={FadersHorizontal} />
        ),
        onClick: onOpenCustomizeModal
      },
      {
        key: '2',
        label: t('Search token'),
        icon: (
          <Icon phosphorIcon={MagnifyingGlass} />
        ),
        onClick: onClickSearchToken
      }
    ];
  }, [onClickSearchToken, onOpenCustomizeModal, t]);

  const sidebarMenu = useMemo(() => {
    const expandViewItem = {
      key: '1',
      label: t('Expand view'),
      icon: (
        <Icon phosphorIcon={ArrowsOut} />
      ),
      onClick: () => {
        windowOpen({ allowedPath: '/' }).catch(console.error);
        isSidePanelMode && closeSidePanel();
      }
    };

    const openInSidebarItem = {
      key: '2',
      label: t('Open in sidebar'),
      icon: (
        <Icon phosphorIcon={SidebarSimple} />
      ),
      disabled: !isSidePanelSupported,
      onClick: () => {
        isPopupMode && window.close();
        openSidePanel();
      }
    };

    const openInPopupItem = {
      key: '3',
      label: t('Open in popup'),
      icon: (
        <Icon
          phosphorIcon={PuzzlePiece}
          weight={'fill'}
        />
      ),
      onClick: () => {
        isSidePanelMode && closeSidePanel();
      }
    };

    if (isPopupMode) {
      return [expandViewItem, openInSidebarItem];
    }

    if (isSidePanelMode) {
      return [expandViewItem, openInPopupItem];
    }

    return [];
  }, [closeSidePanel, isPopupMode, isSidePanelMode, isSidePanelSupported, openSidePanel, t]);

  const headerIcons = useMemo<ButtonProps[]>(() => {
    const icons: ButtonProps[] = [];

    if (showNotificationIcon) {
      icons.push({
        icon: (
          <div className={'notification-icon'}>
            <Icon
              phosphorIcon={BellSimpleRinging}
              size='md'
            />
            {notiEnable && !!unreadNotificationCount && <div className={CN('__unread-count')}>{unreadNotificationCount}</div>}
          </div>

        ),
        onClick: onOpenNotification,
        tooltip: t('Notifications'),
        tooltipPlacement: 'bottomRight'
      });
    }

    if (showFaderIcon) {
      if (showSearchToken) {
        icons.push({
          icon: (
            <>
              <Icon
                phosphorIcon={FadersHorizontal}
                size='md'
              />
              <Dropdown
                arrow={false}
                menu={{ items: faderMenu }}
                overlayClassName={'sw-dropdown-menu'}
                placement='bottomRight'
                trigger={['click']}
              >
                <i className={'sw-dropdown-trigger'}></i>
              </Dropdown>
            </>
          )
        });
      } else {
        icons.push({
          icon: (
            <Icon
              phosphorIcon={FadersHorizontal}
              size='md'
            />
          ),
          onClick: onOpenCustomizeModal,
          tooltip: t('Customize your asset display'),
          tooltipPlacement: 'bottomRight'
        });
      }
    }

    if (showSidebarIcon) {
      if (isExpanseMode) {
        icons.push({
          icon: (
            <Icon
              phosphorIcon={SidebarSimple}
              size='md'
            />
          ),
          disabled: !isSidePanelSupported,
          onClick: openSidePanel,
          tooltip: t('Open in sidebar'),
          tooltipPlacement: 'bottomRight'
        });
      } else {
        icons.push({
          icon: (
            <>
              <Icon
                phosphorIcon={SidebarSimple}
                size='md'
              />
              <Dropdown
                arrow={false}
                menu={{ items: sidebarMenu }}
                overlayClassName={'sw-dropdown-menu'}
                placement='bottomRight'
                trigger={['click']}
              >
                <i className={'sw-dropdown-trigger'}></i>
              </Dropdown>
            </>
          )
        });
      }
    }

    return icons;
  }, [faderMenu, isExpanseMode, isSidePanelSupported, notiEnable, onOpenCustomizeModal, onOpenNotification, openSidePanel, showFaderIcon, showNotificationIcon, showSearchToken, showSidebarIcon, sidebarMenu, t, unreadNotificationCount]);

  const onClickListIcon = useCallback(() => {
    navigate('/settings/list');
  }, [navigate]);

  return (
    <Layout.Base
      className={className}
      headerCenter={false}
      headerIcons={headerIcons}
      headerLeft={'default'}
      headerOnClickLeft={onClickListIcon}
      headerPaddingVertical={true}
      isDisableHeader={isDisableHeader}
      showHeader={showHeader}
      showLeftButton={true}
      showTabBar={showTabBar ?? true}
    >
      {children}
    </Layout.Base>
  );
};

const Home = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  '.ant-sw-header-right-part': {
    display: 'flex'
  },

  '.ant-sw-header-center-part.ant-sw-header-center-part': {
    paddingRight: 0
  },

  '.notification-icon': {
    position: 'relative',
    display: 'flex'
  },

  '.__unread-count': {
    borderRadius: '50%',
    color: token.colorWhite,
    fontSize: token.sizeXS,
    fontWeight: token.bodyFontWeight,
    lineHeight: token.lineHeightLG,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: token.colorError,
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: '12px'
  }
}));

export { Home };
