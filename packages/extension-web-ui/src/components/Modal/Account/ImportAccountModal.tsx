// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-web-ui/assets/logo';
import { BaseModal } from '@subwallet/extension-web-ui/components/Modal/BaseModal';
import { IMPORT_ACCOUNT_MODAL, IMPORT_SEED_MODAL, IMPORT_SEED_TRUST_MODAL, TRUST_WALLET_MNEMONIC_TYPE } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useClickOutSide, useGoBackSelectAccount, useIsPopup, useTranslation } from '@subwallet/extension-web-ui/hooks';
import usePreloadView from '@subwallet/extension-web-ui/hooks/router/usePreloadView';
import { windowOpen } from '@subwallet/extension-web-ui/messaging';
import { Theme } from '@subwallet/extension-web-ui/themes';
import { PhosphorIcon, ThemeProps } from '@subwallet/extension-web-ui/types';
import { renderModalSelector } from '@subwallet/extension-web-ui/utils';
import { BackgroundIcon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { FileJs, Leaf, QrCode, Wallet } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { BackIcon, CloseIcon } from '../../Icon';
import { SettingItemSelection } from '../../Setting';

type Props = ThemeProps;

interface ImportAccountItem {
  label: string;
  key: string;
  icon: PhosphorIcon | React.ReactNode;
  backgroundColor: string;
  onClick: () => void;
}

const modalId = IMPORT_ACCOUNT_MODAL;

const Component: React.FC<Props> = ({ className }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const isActive = checkActive(modalId);
  const { isWebUI } = useContext(ScreenContext);

  usePreloadView([
    'ImportSeedPhrase',
    'ImportPrivateKey',
    'RestoreJson',
    'ImportQrCode'
  ]);

  const isPopup = useIsPopup();
  const onBack = useGoBackSelectAccount(modalId);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  useClickOutSide(isActive, renderModalSelector(className), onCancel);

  const onClickItem = useCallback((path: string) => {
    return () => {
      inactiveModal(modalId);
      navigate(path);
    };
  }, [navigate, inactiveModal]);

  const onClickJson = useCallback(() => {
    if (isPopup) {
      windowOpen({ allowedPath: '/accounts/restore-json' }).catch(console.error);
    } else {
      inactiveModal(modalId);
      navigate('/accounts/restore-json');
    }
  }, [inactiveModal, isPopup, navigate]);

  const onClickSeed = useCallback(() => {
    inactiveModal(modalId);

    if (isWebUI) {
      navigate('/accounts/import-seed-phrase');
    } else {
      activeModal(IMPORT_SEED_MODAL);
    }
  }, [activeModal, inactiveModal, isWebUI, navigate]);

  const onClickSeedTrust = useCallback(() => {
    inactiveModal(modalId);

    if (isWebUI) {
      navigate(`/accounts/import-seed-phrase?type=${TRUST_WALLET_MNEMONIC_TYPE}`);
    } else {
      activeModal(IMPORT_SEED_TRUST_MODAL);
    }
  }, [activeModal, inactiveModal, isWebUI, navigate]);

  const items = useMemo((): ImportAccountItem[] => [
    {
      backgroundColor: token['green-7'],
      icon: Leaf,
      key: 'import-seed-phrase',
      label: t('ui.ACCOUNT.components.Modal.Account.Import.importFromSeedPhrase'),
      onClick: onClickSeed
    },
    {
      backgroundColor: token['orange-7'],
      icon: FileJs,
      key: 'restore-json',
      label: t('ui.ACCOUNT.components.Modal.Account.Import.importFromJsonFile'),
      onClick: onClickJson
    },
    {
      backgroundColor: token['gray-3'],
      icon: Wallet,
      key: 'import-private-key',
      label: t('ui.ACCOUNT.components.Modal.Account.Import.importFromPrivateKey'),
      onClick: onClickItem('/accounts/import-private-key')
    },
    {
      backgroundColor: token['blue-7'],
      icon: QrCode,
      key: 'import-by-qr',
      label: t('ui.ACCOUNT.components.Modal.Account.Import.importByQrCode'),
      onClick: onClickItem('/accounts/import-by-qr')
    },
    {
      backgroundColor: token.colorTextBase,
      icon: (
        <img
          alt=''
          src={DefaultLogosMap.trust}
          style={{ width: '24px', height: '24px', objectFit: 'contain', display: 'block', borderRadius: '50%' }}
        />
      ),
      key: 'import-seed-phrase-trust',
      label: t('ui.ACCOUNT.components.Modal.Account.Import.importFromSeedPhraseTrust'),
      onClick: onClickSeedTrust
    }
  ], [token, t, onClickSeed, onClickJson, onClickItem, onClickSeedTrust]);

  const renderIcon = useCallback((item: ImportAccountItem) => {
    const isNode = React.isValidElement(item.icon);

    return (
      <BackgroundIcon
        backgroundColor={item.backgroundColor}
        customIcon={isNode ? item.icon as React.ReactNode : undefined}
        iconColor={token.colorText}
        phosphorIcon={isNode ? undefined : item.icon as PhosphorIcon}
        size='sm'
        type={isNode ? 'customIcon' : 'phosphor'}
        weight='fill'
      />
    );
  }, [token.colorText]);

  return (
    <BaseModal
      className={CN(className)}
      closeIcon={isWebUI ? undefined : (<BackIcon />)}
      id={modalId}
      maskClosable={false}
      onCancel={isWebUI ? onCancel : onBack}
      rightIconProps={isWebUI
        ? undefined
        : ({
          icon: <CloseIcon />,
          onClick: onCancel
        })}
      title={t<string>('ui.ACCOUNT.components.Modal.Account.ImportSeed.importAccount')}
    >
      <div className='items-container'>
        {items.map((item) => {
          return (
            <div
              key={item.key}
              onClick={item.onClick}
            >
              <SettingItemSelection
                label={item.label}
                leftItemIcon={renderIcon(item)}
              />
            </div>
          );
        })}
      </div>
    </BaseModal>
  );
};

const ImportAccountModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.items-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    }
  };
});

export default ImportAccountModal;
