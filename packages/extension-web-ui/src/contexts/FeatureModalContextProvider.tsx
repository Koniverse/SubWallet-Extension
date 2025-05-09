// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NOTIFICATION_MODAL } from '@subwallet/extension-web-ui/constants';
import { NotificationModalProps } from '@subwallet/extension-web-ui/Popup/Settings/Notifications';
import Notification from '@subwallet/extension-web-ui/Popup/Settings/Notifications/Notification';
import { NotificationScreenParam } from '@subwallet/extension-web-ui/types';
import { noop } from '@subwallet/extension-web-ui/utils';
import { ModalContext, useExcludeModal } from '@subwallet/react-ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export interface FeatureModalContextType {
  notificationModal: {
    open: (params?: NotificationScreenParam) => void
  }
}

export const FeatureModalContext = React.createContext<FeatureModalContextType>({
  notificationModal: {
    open: noop
  }
});

export const FeatureModalContextProvider = ({ children }: Props) => {
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const [notificationModalProps, setNotificationModalProps] = useState<NotificationModalProps | undefined>(undefined);

  useExcludeModal(NOTIFICATION_MODAL);

  /* Notification modal */
  const closeNotificationModal = useCallback(() => {
    setNotificationModalProps(undefined);
    inactiveModal(NOTIFICATION_MODAL);
  }, [inactiveModal]);

  const openNotificationModal = useCallback((params?: NotificationScreenParam) => {
    setNotificationModalProps({
      modalId: NOTIFICATION_MODAL,
      onCancel: closeNotificationModal,
      params
    });
    activeModal(NOTIFICATION_MODAL);
  }, [activeModal, closeNotificationModal]);
  /* Notification modal */

  const contextValue: FeatureModalContextType = useMemo(() => ({
    notificationModal: {
      open: openNotificationModal
    }
  }), [openNotificationModal]);

  return (
    <FeatureModalContext.Provider value={contextValue}>
      {children}

      {notificationModalProps && (
        <Notification
          isModal={true}
          modalProps={notificationModalProps}
        />
      )}
    </FeatureModalContext.Provider>
  );
};
