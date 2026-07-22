// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { SUBSCAN_API_CONFIG_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { getSubscanApiKey, saveSubscanApiKey } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Input, ModalContext, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const notify = useNotification();
  const { checkActive, inactiveModal } = useContext(ModalContext);

  const [subscanApiKey, setSubscanApiKey] = useState('');

  const onChangeApiKey = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSubscanApiKey(event.target.value);
  }, []);
  const [savedSubscanApiKey, setSavedSubscanApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isModalActive = useMemo(() => checkActive(SUBSCAN_API_CONFIG_MODAL), [checkActive]);
  const normalizedSaved = useMemo(() => savedSubscanApiKey.trim(), [savedSubscanApiKey]);
  const normalizedCurrent = useMemo(() => subscanApiKey.trim(), [subscanApiKey]);
  const isSaveDisabled = useMemo(
    () => !normalizedCurrent || normalizedCurrent === normalizedSaved || isLoading,
    [isLoading, normalizedCurrent, normalizedSaved]
  );

  const onClose = useCallback(() => {
    if (isLoading) {
      return;
    }

    setSubscanApiKey(savedSubscanApiKey);
    inactiveModal(SUBSCAN_API_CONFIG_MODAL);
  }, [inactiveModal, isLoading, savedSubscanApiKey]);

  const onSave = useCallback(() => {
    if (isSaveDisabled) {
      return;
    }

    setIsLoading(true);

    saveSubscanApiKey({ apiKey: normalizedCurrent })
      .then(() => {
        setSavedSubscanApiKey(normalizedCurrent);
        setSubscanApiKey(normalizedCurrent);
        inactiveModal(SUBSCAN_API_CONFIG_MODAL);
        notify({
          message: t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.saveSuccess'),
          type: NotificationType.SUCCESS
        });
      })
      .catch((error) => {
        console.error(error);
        notify({
          message: t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.saveFailed'),
          type: NotificationType.ERROR
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [inactiveModal, isSaveDisabled, normalizedCurrent, notify, t]);

  useEffect(() => {
    let isSync = true;

    if (isModalActive) {
      setIsLoading(true);

      getSubscanApiKey()
        .then((value) => {
          if (!isSync) {
            return;
          }

          const apiKey = value || '';

          setSavedSubscanApiKey(apiKey);
          setSubscanApiKey(apiKey);
        })
        .catch((error) => {
          if (!isSync) {
            return;
          }

          console.error(error);
          notify({
            message: t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.loadFailed'),
            type: NotificationType.ERROR
          });
        })
        .finally(() => {
          if (isSync) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isSync = false;
    };
  }, [isModalActive, notify, t]);

  return (
    <SwModal
      className={className}
      footer={(
        <div className='__footer'>
          <Button
            block={true}
            disabled={isLoading}
            onClick={onClose}
            schema={'secondary'}
          >
            {t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.cancel')}
          </Button>
          <Button
            block={true}
            disabled={isSaveDisabled}
            loading={isLoading}
            onClick={onSave}
          >
            {t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.save')}
          </Button>
        </div>
      )}
      id={SUBSCAN_API_CONFIG_MODAL}
      maskClosable={false}
      onCancel={onClose}
      title={t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.title')}
    >
      <div className='__content'>
        <div className='__description'>
          {t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.description')}
        </div>
        <Input.Password
          disabled={isLoading}
          onChange={onChangeApiKey}
          placeholder={t('ui.SETTINGS.screen.Setting.Account.SubscanApiConfigModal.apiKeyPlaceholder')}
          value={subscanApiKey}
        />
      </div>
    </SwModal>
  );
}

export const SubscanApiConfigModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.__content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.size,
      paddingTop: token.paddingSM
    },

    '.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.__description': {
      color: token.colorTextLight4,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'center'
    },

    '.__footer': {
      display: 'flex',
      gap: token.sizeXXS,
      width: '100%'
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none'
    }
  });
});

export default SubscanApiConfigModal;
