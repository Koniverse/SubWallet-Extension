// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { initSyncMantaPay, windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { Button } from '@subwallet/react-ui';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import useNotification from '../common/useNotification';
import useIsPopup from '../dom/useIsPopup';

const logger = createLogger('useHandleMantaPaySync');

export default function useHandleMantaPaySync () {
  const notify = useNotification();
  const { t } = useTranslation();
  const isPopup = useIsPopup();
  const navigate = useNavigate();

  const onClose = useCallback(() => {
    notify({
      message: 'ZK assets are only available after sync',
      type: NotificationType.INFO
    });
  }, [notify]);

  return useCallback((address: string) => {
    const onOk = () => {
      initSyncMantaPay(address)
        .catch((error) => logger.error('Failed to init sync MantaPay', error));

      if (isPopup) {
        windowOpen({
          allowedPath: '/accounts/detail',
          subPath: `/${address}`
        })
          .catch((error) => logger.warn('Failed to open window', error));
      } else {
        navigate(`/accounts/detail/${address}`);
      }
    };

    const button: JSX.Element = (
      <div style={{
        display: 'flex',
        gap: '8px'
      }}
      >
        <Button
          // eslint-disable-next-line react/jsx-no-bind
          onClick={onOk}
          schema={'warning'}
          size={'xs'}
        >
          {t('ui.ACCOUNT.hook.account.useHandleMantaPaySync.sync')}
        </Button>

        <Button
          onClick={onClose}
          schema={'secondary'}
          size={'xs'}
        >
          {t('ui.ACCOUNT.hook.account.useHandleMantaPaySync.cancel')}
        </Button>
      </div>
    );

    notify({
      description: t('ui.ACCOUNT.hook.account.useHandleMantaPaySync.thisMayTakeAFewMinutes'),
      message: t('ui.ACCOUNT.hook.account.useHandleMantaPaySync.syncZkMode'),
      type: NotificationType.WARNING,
      btn: button,
      duration: 3
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopup, notify, onClose, t]);
}
