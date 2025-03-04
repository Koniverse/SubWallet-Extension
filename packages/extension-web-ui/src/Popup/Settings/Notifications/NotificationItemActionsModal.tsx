// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { BaseModal } from '@subwallet/extension-web-ui/components';
import { NOTIFICATION_DETAIL_MODAL } from '@subwallet/extension-web-ui/constants';
import { switchReadNotificationStatus } from '@subwallet/extension-web-ui/messaging/transaction/notification';
import { NotificationInfoItem } from '@subwallet/extension-web-ui/Popup/Settings/Notifications';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { BackgroundIcon } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import { Checks, Coins, DownloadSimple, Eye, Gift, X } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

export type NotificationItemActionsModalProps = {
  onCancel: () => void;
  notificationItem: NotificationInfoItem;
  refreshNotifications: VoidFunction;
  onClickAction: VoidFunction;
};

type Props = ThemeProps & NotificationItemActionsModalProps;

export interface ActionInfo {
  title: string;
  extrinsicType: ExtrinsicType;
  backgroundColor: string;
  leftIcon?: SwIconProps['phosphorIcon'];
  disabled?: boolean;
  isRead?: boolean;
}

export interface BriefActionInfo {
  icon: ActionInfo['leftIcon'];
  title: ActionInfo['title'];
  backgroundColor?: ActionInfo['backgroundColor'];
}

function Component (props: Props): React.ReactElement<Props> {
  const { className, notificationItem, onCancel, onClickAction, refreshNotifications } = props;
  const [readNotification, setReadNotification] = useState<boolean>(notificationItem.isRead);
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  const getNotificationAction = (type: ExtrinsicType): BriefActionInfo => {
    switch (type) {
      case ExtrinsicType.STAKING_WITHDRAW:
        return {
          title: 'Withdraw tokens',
          icon: DownloadSimple
        };
      case ExtrinsicType.STAKING_CLAIM_REWARD:
        return {
          title: 'Claim tokens',
          icon: Gift
        };
      case ExtrinsicType.CLAIM_BRIDGE:
        return {
          title: 'Claim tokens',
          icon: Coins
        };
      default:
        return {
          title: 'View details',
          icon: Eye
        };
    }
  };

  const handleNotificationInfo = useMemo(() => {
    const { icon, title } = getNotificationAction(notificationItem.extrinsicType);
    const sampleData: ActionInfo = {
      title,
      extrinsicType: ExtrinsicType.TRANSFER_TOKEN, // todo: recheck to remove this
      backgroundColor: token.geekblue,
      leftIcon: icon
    };

    return sampleData;
  }, [notificationItem.extrinsicType, token.geekblue]);

  const onClickReadButton = useCallback(() => {
    setReadNotification(!readNotification);
    switchReadNotificationStatus({
      id: notificationItem.id,
      isRead: notificationItem.isRead
    })
      .catch(console.error)
      .finally(() => {
        onCancel();
        refreshNotifications();
      });
  }, [onCancel, notificationItem.id, notificationItem.isRead, readNotification, refreshNotifications]);

  return (
    <BaseModal
      className={className}
      id={NOTIFICATION_DETAIL_MODAL}
      onCancel={onCancel}
      title={t('Actions')}
    >
      <div className={'__button-container'}>
        <div
          className={'__mark-action-details'}
          onClick={onClickAction}
        >
          <div className={'__left-part'}>
            <BackgroundIcon
              backgroundColor={handleNotificationInfo.backgroundColor}
              phosphorIcon={handleNotificationInfo.leftIcon}
              size='sm'
              weight='fill'
            />
          </div>
          <div className={'__right-part'}>{handleNotificationInfo.title}</div>
        </div>
        <div
          className={'__mark-read-button'}
          onClick={onClickReadButton}
        >
          <div className={'__left-part'}>
            <BackgroundIcon
              backgroundColor={readNotification ? token['gray-3'] : token['green-6']}
              phosphorIcon={readNotification ? X : Checks}
              size='sm'
              weight='fill'
            />
          </div>
          <div className={'__right-part'}>{readNotification ? t('Mark as unread') : t('Mark as read')}</div>
        </div>
      </div>

    </BaseModal>
  );
}

export const NotificationItemActionsModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__mark-read-button, .__mark-action-details': {
      display: 'flex',
      gap: 12,
      paddingTop: 14,
      paddingBottom: 14,
      paddingRight: 12,
      paddingLeft: 12,
      borderRadius: 8,
      backgroundColor: token.colorBgSecondary,
      cursor: 'pointer'
    },
    '.__button-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  });
});
