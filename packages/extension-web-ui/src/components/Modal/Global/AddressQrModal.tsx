// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from '@subwallet/react-ui/es/button/button';

import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { AccountActions } from '@subwallet/extension-base/types';
import { BaseModal, CloseIcon } from '@subwallet/extension-web-ui/components';
import { RELAY_CHAINS_TO_MIGRATE } from '@subwallet/extension-web-ui/constants';
import { ADDRESS_QR_MODAL } from '@subwallet/extension-web-ui/constants/modal';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useDefaultNavigate, useFetchChainInfo, useGetAccountByAddress } from '@subwallet/extension-web-ui/hooks';
import useNotification from '@subwallet/extension-web-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { AccountTokenAddress, ThemeProps } from '@subwallet/extension-web-ui/types';
import { getBitcoinKeypairAttributes, openInNewTab, toShort } from '@subwallet/extension-web-ui/utils';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { Button, Icon, Logo, SwQRCode, Tag } from '@subwallet/react-ui';
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

const Component: React.FC<Props> = ({ accountTokenAddresses = [], address: initialAddress, chainSlug, className, isNewFormat, onBack, onCancel }: Props) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const chainInfo = useFetchChainInfo(chainSlug);
  const accountInfo = useGetAccountByAddress(initialAddress);
  const { tonWalletContractSelectorModal } = useContext(WalletModalContext);
  const goHome = useDefaultNavigate().goHome;

  const isRelayChainToMigrate = useMemo(() => RELAY_CHAINS_TO_MIGRATE.includes(chainSlug), [chainSlug]);

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
          address: currentAddress,
          chainSlug,
          onBack: tonWalletContractSelectorModal.close,
          onCancel: tonWalletContractSelectorModal.close
        });
      },
      tooltip: t('Click to change wallet address'),
      tooltipPlacement: 'topRight'
    };
  }, [currentAddress, chainSlug, t, tonWalletContractSelectorModal]);

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
        footer={isNewFormat === undefined || isNewFormat
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
                type='ghost'
              />
            )}
            <SwQRCode
              className={CN('__qr-code', { '-is-relay-chain': isRelayChainToMigrate })}
              color='#000'
              errorLevel='H'
              icon={''}
              size={232}
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
                type='ghost'
              />
            )}
          </div>

          <div className={'__address-box-wrapper'}>
            {!!bitcoinAttributes && !!bitcoinAttributes.label
              ? (
                <div className={'__label-address-wrapper'}>
                  <div className={'__label-address-prefix'}>{bitcoinAttributes.label}</div>
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
                  className={CN('__copy-button', { '-is-relay-chain': isRelayChainToMigrate })}
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
        </>
      </BaseModal>
    </>
  );
};

const AddressQrModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '.__qr-code-wrapper': {
      paddingTop: token.padding,
      paddingBottom: token.padding,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '.__prev-button': {
        marginLeft: -20
      },
      '.__next-button': {
        marginRight: -20
      },
      '.__qr-code ': {
        marginLeft: 0,
        marginRight: 0
      },

      '& .-is-relay-chain': {
        filter: 'blur(10px)'
      }
    },

    '.__label-address-wrapper': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,

      '.__label-address-prefix': {
        fontWeight: 700,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextLight2
      }
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

    },

    '.__address-box': {
      borderRadius: token.borderRadiusLG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingXXS,
      minHeight: 52
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

      '&.-is-relay-chain': {
        display: 'none'
      },

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
