// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NOTIFICATION_MODAL_WHITELIST_PATHS, REMIND_DUPLICATE_ACCOUNT_NAME_MODAL, UPGRADE_DUPLICATE_ACCOUNT_NAME } from '@subwallet/extension-web-ui/constants';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { getValueLocalStorageWS, setValueLocalStorageWS } from '@subwallet/extension-web-ui/messaging';
import { Theme } from '@subwallet/extension-web-ui/themes';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { noop } from '@subwallet/extension-web-ui/utils';
import { Button, ModalContext, PageIcon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ShieldWarning } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { BaseModal } from './BaseModal';

type Props = ThemeProps;

const RemindDuplicateAccountNameModalId = REMIND_DUPLICATE_ACCOUNT_NAME_MODAL;
const CHANGE_ACCOUNT_NAME_URL = 'https://docs.subwallet.app/main/extension-user-guide/account-management/switch-between-accounts-and-change-account-name#change-your-account-name';

function Component ({ className }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;

  const onCancel = useCallback(() => {
    inactiveModal(RemindDuplicateAccountNameModalId);
    setValueLocalStorageWS({ key: UPGRADE_DUPLICATE_ACCOUNT_NAME, value: 'false' }).catch(noop);
  }, [inactiveModal]);

  const isInWhitelistPaths = useMemo(() => {
    return NOTIFICATION_MODAL_WHITELIST_PATHS.includes(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (isInWhitelistPaths) {
      getValueLocalStorageWS(UPGRADE_DUPLICATE_ACCOUNT_NAME).then((value) => {
        if (value === 'true') {
          activeModal(RemindDuplicateAccountNameModalId);
        }
      }).catch(noop);
    }
  }, [activeModal, isInWhitelistPaths]);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          onClick={onCancel}
        >
          {t('I understand')}
        </Button>
      </>
    );
  }, [onCancel, t]);

  return (
    <>
      <BaseModal
        className={CN(className)}
        closable={true}
        destroyOnClose={true}
        footer={footerModal}
        id={RemindDuplicateAccountNameModalId}
        maskClosable={false}
        onCancel={onCancel}
        title={t('Duplicate account name')}
      >
        <div className={'__modal-content'}>
          <PageIcon
            color={token['colorWarning-5']}
            iconProps={{
              weight: 'fill',
              phosphorIcon: ShieldWarning
            }}
          />
          <div className='__modal-description'>
            {t('You have accounts with the same name. We have added characters to these account names to differentiate them. You can change account names later using')}
            <a
              href={CHANGE_ACCOUNT_NAME_URL}
              rel='noopener noreferrer'
              style={{ textDecoration: 'underline' }}
              target='_blank'
            > this guide</a>
          </div>
        </div>
      </BaseModal>
    </>
  );
}

const RemindDuplicateAccountNameModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__modal-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.size,
      alignItems: 'center',
      padding: `${token.padding}px ${token.padding}px 0 ${token.padding}px`
    },

    '.ant-sw-header-center-part': {
      width: 'fit-content'
    },

    '.__modal-description': {
      textAlign: 'center',
      color: token.colorTextDescription,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6
    },

    '.__modal-user-guide': {
      marginLeft: token.marginXXS
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      display: 'flex',
      gap: token.sizeXXS
    }
  };
});

export default RemindDuplicateAccountNameModal;
