// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from '@subwallet/react-ui/es/button/button';

import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountActions } from '@subwallet/extension-base/types';
import { BaseModal, CloseIcon } from '@subwallet/extension-web-ui/components';
import { ADDRESS_QR_MODAL } from '@subwallet/extension-web-ui/constants/modal';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useFetchChainInfo, useGetAccountByAddress } from '@subwallet/extension-web-ui/hooks';
import useNotification from '@subwallet/extension-web-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { openInNewTab, toShort } from '@subwallet/extension-web-ui/utils';
import { Button, Icon, Logo, SwQRCode } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowSquareOut, CaretLeft, CopySimple, Gear } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

export interface AddressQrModalProps {
  address: string;
  chainSlug: string;
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
}

type Props = ThemeProps & AddressQrModalProps & {
  onCancel: VoidFunction;
};

const modalId = ADDRESS_QR_MODAL;

const Component: React.FC<Props> = ({ address, chainSlug, className, onBack, onCancel }: Props) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const chainInfo = useFetchChainInfo(chainSlug);
  const accountInfo = useGetAccountByAddress(address);
  const { tonWalletContractSelectorModal } = useContext(WalletModalContext);

  const scanExplorerAddressUrl = useMemo(() => {
    return getExplorerLink(chainInfo, address, 'account');
  }, [address, chainInfo]);

  const handleClickViewOnExplorer = useCallback(() => {
    try {
      if (scanExplorerAddressUrl) {
        openInNewTab(scanExplorerAddressUrl)();
      }
    } catch (e) {
      console.log('error redirecting to a new tab');
    }
  }, [scanExplorerAddressUrl]);

  const isRelatedToTon = useMemo(() => {
    return accountInfo?.accountActions.includes(AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION);
  }, [accountInfo]);

  const onClickCopyButton = useCallback(() => notify({ message: t('Copied to clipboard') }), [notify, t]);

  const tonWalletContactSelectorButtonProps = useMemo<ButtonProps>(() => {
    return {
      icon: (
        <Icon
          phosphorIcon={Gear}
        />
      ),
      type: 'ghost',
      onClick: () => {
        tonWalletContractSelectorModal.open({
          address,
          chainSlug,
          onBack: tonWalletContractSelectorModal.close,
          onCancel: tonWalletContractSelectorModal.close
        });
      },
      tooltip: t('Click to change wallet address'),
      tooltipPlacement: 'topRight'
    };
  }, [address, chainSlug, t, tonWalletContractSelectorModal]);

  useEffect(() => {
    console.log('selectedAccount-888888');
  }, []);

  return (
    <>
      <BaseModal
        className={CN(className)}
        closeIcon={
          onBack
            ? (
              <Icon
                phosphorIcon={CaretLeft}
                size='md'
              />
            )
            : undefined
        }
        destroyOnClose={true}
        id={modalId}
        onCancel={onBack || onCancel}
        rightIconProps={onBack
          ? {
            icon: <CloseIcon />,
            onClick: onCancel
          }
          : isRelatedToTon ? tonWalletContactSelectorButtonProps : undefined
        }
        title={(
          <>
            {t<string>('Your address')}
            {onBack && isRelatedToTon && (
              <Button
                {...tonWalletContactSelectorButtonProps}
                className={'__change-version-button -schema-header'}
                size={'xs'}
              />
            )}
          </>
        )}
      >
        <>
          <div className='__qr-code-wrapper'>
            <SwQRCode
              className='__qr-code'
              color='#000'
              errorLevel='H'
              icon={''}
              size={264}
              value={address}
            />
          </div>

          <div className={'__address-box-wrapper'}>
            <div className='__address-box'>
              <Logo
                className='__network-logo'
                network={chainSlug}
                shape='circle'
                size={28}
              />

              <div className='__address'>
                {toShort(address || '', 7, 7)}
              </div>

              <CopyToClipboard text={address}>
                <Button
                  className='__copy-button'
                  icon={
                    <Icon
                      phosphorIcon={CopySimple}
                      size='sm'
                    />
                  }
                  onClick={onClickCopyButton}
                  size='xs'
                  tooltip={t('Copy address')}
                  type='ghost'
                />
              </CopyToClipboard>
            </div>
          </div>

          <Button
            block
            className={'__view-on-explorer'}
            disabled={!scanExplorerAddressUrl}
            icon={
              <Icon
                customSize={'28px'}
                phosphorIcon={ArrowSquareOut}
                size='sm'
                weight={'fill'}
              />
            }
            onClick={handleClickViewOnExplorer}
          >{t('View on explorer')}</Button>
        </>
      </BaseModal>
    </>
  );
};

const AddressQrModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__qr-code-wrapper': {
      paddingTop: token.padding,
      paddingBottom: token.padding
    },
    '.ant-sw-sub-header-title': {
      fontSize: token.fontSizeXL,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.fontWeightStrong
    },

    '.ant-sw-header-center-part.ant-sw-header-center-part': {
      position: 'relative',
      height: 40,
      marginRight: 0,
      marginLeft: 0
    },

    '.ant-sw-header-center-part .__change-version-button': {
      position: 'absolute',
      right: 0,
      top: 0
    },

    '.ant-sw-qr-code': {
      marginLeft: 'auto',
      marginRight: 'auto'
    },

    '.__address-box-wrapper': {
      marginBottom: token.margin
    },

    '.__address-box': {
      borderRadius: token.borderRadiusLG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingXXS,
      minHeight: 48
    },

    '.__address': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
      color: token.colorTextLight4,
      flexShrink: 1
    },

    '.__change-version-icon': {
      color: token.colorWhite
    },

    '.__copy-button': {
      color: token.colorTextLight3,

      '&:hover': {
        color: token.colorTextLight2
      }
    },

    '.__view-on-explorer': {
      fontSize: token.fontSizeLG
    }
  };
});

export default AddressQrModal;
