// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import WalletConnect from '@subwallet/extension-web-ui/components/Layout/parts/Header/parts/WalletConnect';
import { FeatureModalContext } from '@subwallet/extension-web-ui/contexts/FeatureModalContextProvider';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { BellSimpleRinging, CaretLeft } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import SelectAccount from '../SelectAccount';
import LockStatus from './parts/LockStatus';
import Networks from './parts/Networks';

export type Props = ThemeProps & {
  title?: string | React.ReactNode;
  onBack?: () => void
  showBackButton?: boolean
}

function Component ({ className, onBack, showBackButton, title = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { unreadNotificationCountMap } = useSelector((state: RootState) => state.notification);
  const { currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { notificationSetup: { isEnabled: notiEnable } } = useSelector((state: RootState) => state.settings);
  const { notificationModal: { open: openNotificationModal } } = useContext(FeatureModalContext);

  const unreadNotificationCount = useMemo(() => {
    if (!currentAccountProxy || !unreadNotificationCountMap) {
      return 0;
    }

    return isAllAccount ? Object.values(unreadNotificationCountMap).reduce((acc, val) => acc + val, 0) : unreadNotificationCountMap[currentAccountProxy.id] || 0;
  }, [currentAccountProxy, isAllAccount, unreadNotificationCountMap]);

  const onOpenNotification = useCallback(() => {
    openNotificationModal();
  }, [openNotificationModal]);

  const backButton = useMemo(() => {
    if (showBackButton && onBack) {
      return (
        <Button
          icon={
            (
              <Icon
                phosphorIcon={CaretLeft}
                size={'lg'}
              />
            )
          }
          onClick={onBack}
          size={'xs'}
          type='ghost'
        />
      );
    }

    return null;
  }, [onBack, showBackButton]);

  return (
    <div className={CN(className)}>
      <div className='common-header'>
        <div className='title-group'>
          {backButton}
          <Typography.Title className='page-name'>{title}</Typography.Title>
        </div>
        <div className='action-group'>
          <WalletConnect />

          <Networks />

          <div className={'trigger-container -select-account'}>
            <SelectAccount />
          </div>

          <Button
            icon={
              <div className={'notification-icon'}>
                <Icon
                  phosphorIcon={BellSimpleRinging}
                  size='sm'
                />
                {notiEnable && !!unreadNotificationCount &&
                  <div className={CN('__unread-count')}>{unreadNotificationCount}</div>}
              </div>
            }
            onClick={onOpenNotification}
            schema={'secondary'}
            shape={'circle'}
            size={'xs'}
            tooltip={t('Notifications')}
            tooltipPlacement={'bottomRight'}
          >
          </Button>

          <LockStatus />
        </div>
      </div>
    </div>
  );
}

const Controller = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  width: '100%',

  '.common-header': {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: token.size,

    '.title-group': {
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',

      '.page-name': {
        fontSize: 30,
        lineHeight: '38px',
        color: '#FFF',
        margin: 0
      }
    },

    '.action-group': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8
    },

    '.trigger-container': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      padding: `0 ${token.padding}px`,
      height: 40,
      gap: 8,
      background: token.colorBgSecondary,
      borderRadius: 32
    },

    '.trigger-container.-select-account': {
      paddingLeft: token.paddingXXS,
      paddingRight: 0,

      '.account-name': {
        maxWidth: 150
      },

      '.ant-select-modal-input-suffix .anticon': {
        fontSize: 12,
        color: token.colorTextLight3
      }
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
  }
}));

export default Controller;
