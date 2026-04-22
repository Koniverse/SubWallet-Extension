// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { IMPORT_ACCOUNT_MODAL, TRUST_WALLET_MNEMONIC_TYPE } from '@subwallet/extension-koni-ui/constants';
import { useClickOutSide, useExtensionDisplayModes, useGoBackSelectAccount, useSetSessionLatest, useSidePanelUtils, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { PhosphorIcon, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { renderModalSelector } from '@subwallet/extension-koni-ui/utils';
import { BackgroundIcon, ModalContext, SwModal } from '@subwallet/react-ui';
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
  const { setStateSelectAccount } = useSetSessionLatest();
  const { checkActive, inactiveModal } = useContext(ModalContext);
  const isActive = checkActive(modalId);

  const { isExpanseMode, isSidePanelMode } = useExtensionDisplayModes();
  const { closeSidePanel } = useSidePanelUtils();
  const onBack = useGoBackSelectAccount(modalId);

  const onCancel = useCallback(() => {
    setStateSelectAccount(true);
    inactiveModal(modalId);
  }, [inactiveModal, setStateSelectAccount]);

  useClickOutSide(isActive, renderModalSelector(className), onCancel);

  const onClickItem = useCallback((path: string) => {
    return () => {
      inactiveModal(modalId);
      setStateSelectAccount(true);
      navigate(path);
    };
  }, [inactiveModal, setStateSelectAccount, navigate]);

  const onClickJson = useCallback(() => {
    if (!isExpanseMode) {
      windowOpen({ allowedPath: '/accounts/restore-json' }).catch(console.error);

      isSidePanelMode && closeSidePanel();
    } else {
      inactiveModal(modalId);
      navigate('/accounts/restore-json');
    }
  }, [closeSidePanel, inactiveModal, isExpanseMode, isSidePanelMode, navigate]);

  const onClickSeed = useCallback(() => {
    inactiveModal(modalId);
    navigate('/accounts/import-seed-phrase');
  }, [inactiveModal, navigate]);

  const onClickSeedTrust = useCallback(() => {
    inactiveModal(modalId);
    navigate(`/accounts/import-seed-phrase?type=${TRUST_WALLET_MNEMONIC_TYPE}`);
  }, [inactiveModal, navigate]);

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
    <SwModal
      className={CN(className)}
      closeIcon={(<BackIcon />)}
      id={modalId}
      maskClosable={false}
      onCancel={onBack}
      rightIconProps={{
        icon: <CloseIcon />,
        onClick: onCancel
      }}
      title={t<string>('ui.ACCOUNT.components.Modal.Account.Import.importAccount')}
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
    </SwModal>
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
