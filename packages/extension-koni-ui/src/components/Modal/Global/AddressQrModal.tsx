// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from '@subwallet/react-ui/es/button/button';

import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountActions } from '@subwallet/extension-base/types';
import { CloseIcon, TonWalletContractSelectorModal } from '@subwallet/extension-koni-ui/components';
import { ADDRESS_QR_MODAL, TON_WALLET_CONTRACT_SELECTOR_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useDefaultNavigate, useFetchChainInfo, useGetAccountByAddress } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { AccountTokenAddress, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getBitcoinKeypairAttributes, toShort } from '@subwallet/extension-koni-ui/utils';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { Button, Icon, Logo, ModalContext, SwModal, SwQRCode, Tag } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowSquareOut, CaretLeft, CaretRight, CopySimple, Gear, House } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

export interface AddressQrModalProps {
  address: string;
  accountTokenAddresses?: AccountTokenAddress[];
  chainSlug: string;
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
  isNewFormat?: boolean
}

type Props = ThemeProps & AddressQrModalProps & {
  onCancel: VoidFunction;
};

const modalId = ADDRESS_QR_MODAL;
const tonWalletContractSelectorModalId = TON_WALLET_CONTRACT_SELECTOR_MODAL;

const Component: React.FC<Props> = ({ accountTokenAddresses = [], address: initialAddress, chainSlug, className, isNewFormat, onBack, onCancel }: Props) => {
  const { t } = useTranslation();
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const notify = useNotification();
  const chainInfo = useFetchChainInfo(chainSlug);
  const accountInfo = useGetAccountByAddress(initialAddress);
  const isTonWalletContactSelectorModalActive = checkActive(tonWalletContractSelectorModalId);
  const goHome = useDefaultNavigate().goHome;

  const showNavigationButtons = useMemo(() => {
    return accountTokenAddresses.length > 1;
  }, [accountTokenAddresses]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!showNavigationButtons) {
      return 0;
    }

    const index = accountTokenAddresses?.findIndex((item) => item.accountInfo.address === initialAddress);

    return index !== -1 ? index : 0;
  });

  const currentAddress = showNavigationButtons ? accountTokenAddresses[currentIndex]?.accountInfo.address || initialAddress : initialAddress;

  const scanExplorerAddressUrl = useMemo(() => {
    return getExplorerLink(chainInfo, currentAddress, 'account');
  }, [currentAddress, chainInfo]);

  const bitcoinAttributes = useMemo(() => {
    if (isBitcoinAddress(currentAddress)) {
      const keyPairType = getKeypairTypeByAddress(currentAddress);

      return getBitcoinKeypairAttributes(keyPairType);
    }

    return undefined;
  }, [currentAddress]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (accountTokenAddresses) {
      setCurrentIndex((prev) => Math.min(accountTokenAddresses.length - 1, prev + 1));
    }
  }, [accountTokenAddresses]);

  const onGoHome = useCallback(() => {
    goHome();
    onCancel();
  }, [goHome, onCancel]);

  const handleClickViewOnExplorer = useCallback(() => {
    try {
      if (scanExplorerAddressUrl) {
        // eslint-disable-next-line no-void
        void chrome.tabs.create({ url: scanExplorerAddressUrl, active: true }).then(() => console.log('redirecting'));
      }
    } catch (e) {
      console.log('error redirecting to a new tab');
    }
  }, [scanExplorerAddressUrl]);

  const isRelatedToTon = useMemo(() => {
    return accountInfo?.accountActions.includes(AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION);
  }, [accountInfo]);

  const onChangeTonWalletContact = useCallback(() => {
    activeModal(tonWalletContractSelectorModalId);
  }, [activeModal]);

  const onCloseTonWalletContactModal = useCallback(() => {
    inactiveModal(tonWalletContractSelectorModalId);
  }, [inactiveModal]);

  const onClickCopyButton = useCallback(() => notify({ message: t('Copied to clipboard') }), [notify, t]);

  const tonWalletContactSelectorButtonProps = useMemo<ButtonProps>(() => {
    return {
      icon: (
        <Icon
          phosphorIcon={Gear}
        />
      ),
      type: 'ghost',
      onClick: onChangeTonWalletContact,
      tooltip: t('Click to change wallet address'),
      tooltipPlacement: 'topRight'
    };
  }, [onChangeTonWalletContact, t]);

  return (
    <>
      <SwModal
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
            {showNavigationButtons && (
              <Button
                className='__prev-button'
                disabled={currentIndex === 0}
                icon={<Icon
                  phosphorIcon={CaretLeft}
                  size='md'
                />}
                onClick={handlePrevious}
                tooltip={t('Previous address')}
                type='ghost'
              />
            )}
            <SwQRCode
              className='__qr-code'
              color='#000'
              errorLevel='H'
              icon={''}
              size={264}
              value={currentAddress}
            />

            {showNavigationButtons && (
              <Button
                className='__next-button'
                disabled={currentIndex === (accountTokenAddresses?.length ?? 0) - 1}
                icon={<Icon
                  phosphorIcon={CaretRight}
                  size='md'
                />}
                onClick={handleNext}
                tooltip={t('Next address')}
                type='ghost'
              />
            )}
          </div>

          <div className={'__address-box-wrapper'}>
            {!!bitcoinAttributes && !!bitcoinAttributes.label
              ? (
                <div className={'__label-address-wrapper'}>
                  <div className={'__label-address-prefix'}>{bitcoinAttributes.label} BTC</div>
                  <span className={'__label-address-suffix'}>&nbsp;address</span>
                </div>
              )
              : null}
            <div className='__address-box'>
              <Logo
                className='__network-logo'
                network={chainSlug}
                shape='circle'
                size={28}
              />

              <div className='__address'>
                {toShort(currentAddress || '', 7, 7)}
              </div>

              {isNewFormat !== undefined && <div className={'__address-tag'}>
                <Tag
                  bgType={'default'}
                  className={CN(className, '__item-tag')}
                  color={isNewFormat ? 'green' : 'yellow'}
                >
                  {t(isNewFormat ? 'New' : 'Legacy')}
                </Tag>
              </div>}

              <CopyToClipboard text={currentAddress}>
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

          {isNewFormat === undefined || isNewFormat
            ? (
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
            )
            : (
              <Button
                block
                className={'__go-home-button'}
                disabled={!scanExplorerAddressUrl}
                icon={
                  <Icon
                    customSize={'28px'}
                    phosphorIcon={House}
                    size='sm'
                    weight={'fill'}
                  />
                }
                onClick={onGoHome}
                schema={'secondary'}
              >{t('Back to home')}</Button>
            )}
        </>
      </SwModal>
      {isRelatedToTon && isTonWalletContactSelectorModalActive &&
        <TonWalletContractSelectorModal
          address={currentAddress}
          chainSlug={chainSlug}
          id={tonWalletContractSelectorModalId}
          onBack={onCloseTonWalletContactModal}
          onCancel={onCloseTonWalletContactModal}
        />
      }
    </>
  );
};

const AddressQrModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__qr-code-wrapper': {
      paddingTop: token.padding,
      paddingBottom: token.padding,
      display: 'flex',
      alignItems: 'center'
    },

    '.__label-address-wrapper': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      '.__label-address-prefix': {
        fontWeight: 700,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextLight2
      },

      '.__label-address-suffix': {
        fontWeight: 500,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextTertiary
      }
    },

    '.ant-sw-sub-header-title': {
      fontSize: token.fontSizeXL,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.fontWeightStrong
    },

    '.ant-sw-header-center-part': {
      position: 'relative',
      height: 40
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
      flexShrink: 1,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
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
    },

    '.__address-tag': {
      alignItems: 'center',
      display: 'flex',
      paddingRight: token.paddingXS
    },

    '.__item-tag': {
      marginRight: 0,
      'white-space': 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 39,
      padding: `2px ${token.paddingXS}px`,
      fontSize: token.fontSizeXS,
      fontWeight: 700,
      lineHeight: token.lineHeightXS
    }
  };
});

export default AddressQrModal;
