// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll, isSameAddress } from '@subwallet/extension-base/utils';
import { AccountProxyItem, BaseModal, DAppConfigurationModal } from '@subwallet/extension-web-ui/components';
import ConfirmationGeneralInfo from '@subwallet/extension-web-ui/components/Confirmation/ConfirmationGeneralInfo';
import { DAPP_CONFIGURATION_MODAL } from '@subwallet/extension-web-ui/constants';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { changeAuthorizationBlock, changeAuthorizationPerSite } from '@subwallet/extension-web-ui/messaging';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { updateAuthUrls } from '@subwallet/extension-web-ui/stores/utils';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { convertAuthorizeTypeToChainTypes, filterAuthorizeAccountProxies, isAddressAllowedWithAuthType } from '@subwallet/extension-web-ui/utils';
import { Button, Icon, ModalContext, NetworkItem } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretRight, CheckCircle, GearSix, GlobeHemisphereWest, ShieldCheck, ShieldSlash, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  id: string;
  onCancel: () => void;
  isNotConnected: boolean;
  isBlocked: boolean;
  authInfo?: AuthUrlInfo;
  url: string;
}

type ConnectIcon = {
  linkIcon?: React.ReactNode;
  linkIconBg?: string;
};

const dAppConfigurationModalId = DAPP_CONFIGURATION_MODAL;

function Component ({ authInfo, className = '', id, isBlocked = true, isNotConnected = false, onCancel, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { switchNetworkAuthorizeModal } = useContext(WalletModalContext);
  const { activeModal } = useContext(ModalContext);
  const [allowedMap, setAllowedMap] = useState<Record<string, boolean>>(authInfo?.isAllowedMap || {});
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  // const [oldConnected, setOldConnected] = useState(0);
  const [isSubmit, setIsSubmit] = useState(false);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { token } = useTheme() as Theme;
  const _isNotConnected = isNotConnected || !authInfo;
  const isEvmAuthorize = useMemo(() => !!authInfo?.accountAuthTypes.includes('evm'), [authInfo?.accountAuthTypes]);
  const currentEvmNetworkInfo = useMemo(() => authInfo?.currentNetworkMap?.evm && chainInfoMap[authInfo?.currentNetworkMap.evm], [authInfo?.currentNetworkMap?.evm, chainInfoMap]);
  const handlerUpdateMap = useCallback((accountProxy: AccountProxy, oldValue: boolean) => {
    return () => {
      setAllowedMap((values) => {
        const newValues = { ...values };
        const listAddress = accountProxy.accounts
          .filter(({ address }) => isAddressAllowedWithAuthType(address, authInfo?.accountAuthTypes || []));

        listAddress.forEach(({ address }) => {
          newValues[address] = !oldValue;
        });

        return newValues;
      });
    };
  }, [authInfo?.accountAuthTypes]);

  const onOpenDAppConfigurationModal = useCallback(() => {
    activeModal(dAppConfigurationModalId);
  }, [activeModal]);

  const openSwitchNetworkAuthorizeModal = useCallback(() => {
    authInfo && switchNetworkAuthorizeModal.open(
      {
        authUrlInfo: authInfo,
        onComplete: (list) => {
          updateAuthUrls(list);
        },
        needsTabAuthCheck: true
      }
    );
  }, [authInfo, switchNetworkAuthorizeModal]);

  const handlerSubmit = useCallback(() => {
    if (!isSubmit && authInfo?.id) {
      setIsSubmit(true);
      changeAuthorizationPerSite({ values: allowedMap, id: authInfo.id })
        .catch((e) => {
          console.log('changeAuthorizationPerSite error', e);
        }).finally(() => {
          onCancel();
          setIsSubmit(false);
        });
    }
  }, [allowedMap, authInfo?.id, isSubmit, onCancel]);

  const handlerUnblock = useCallback(() => {
    if (!isSubmit && authInfo?.id) {
      setIsSubmit(true);
      changeAuthorizationBlock({ connectedValue: true, id: authInfo.id })
        .then(() => {
          setIsSubmit(false);
        })
        .catch(console.error);
    }
  }, [authInfo?.id, isSubmit]);

  useEffect(() => {
    if (!!authInfo?.isAllowedMap && !!authInfo?.accountAuthTypes) {
      // const connected = Object.values(authInfo.isAllowedMap).filter((s) => s).length;

      const types = authInfo.accountAuthTypes;
      const allowedMap = authInfo.isAllowedMap;

      const filterType = (address: string) => {
        return isAddressAllowedWithAuthType(address, types);
      };

      const result: Record<string, boolean> = {};

      Object.entries(allowedMap)
        .filter(([address]) => filterType(address))
        .forEach(([address, value]) => {
          result[address] = value;
        });

      setAllowedMap(result);
      // setOldConnected(connected);
    } else {
      // setOldConnected(0);
      setAllowedMap({});
    }
  }, [authInfo?.accountAuthTypes, authInfo?.isAllowedMap]);

  const actionButtons = useMemo(() => {
    if (_isNotConnected) {
      return (
        <>
          <Button
            block
            icon={
              <Icon
                phosphorIcon={XCircle}
                weight='fill'
              />
            }
            loading={isSubmit}
            onClick={onCancel}
          >
            {t('Close')}
          </Button>
        </>
      );
    }

    if (isBlocked) {
      return (
        <>
          <Button
            block
            icon={
              <Icon
                phosphorIcon={XCircle}
                weight={'fill'}
              />
            }
            loading={isSubmit}
            onClick={onCancel}
            schema={'secondary'}
          >
            {t('Cancel')}
          </Button>
          <Button
            block
            icon={
              <Icon
                phosphorIcon={ShieldCheck}
                weight={'fill'}
              />
            }
            loading={isSubmit}
            onClick={handlerUnblock}
          >
            {t('Unblock')}
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          block
          icon={
            <Icon
              phosphorIcon={XCircle}
              weight={'fill'}
            />
          }
          loading={isSubmit}
          onClick={onCancel}
          schema={'secondary'}
        >
          {t('Cancel')}
        </Button>
        <Button
          block
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />
          }
          loading={isSubmit}
          onClick={handlerSubmit}
        >
          {t('Confirm')}
        </Button>
      </>
    );
  }, [t, _isNotConnected, handlerSubmit, handlerUnblock, isBlocked, isSubmit, onCancel]);

  const connectIconProps = useMemo<ConnectIcon>(() => {
    if (_isNotConnected) {
      return {
        linkIcon: (
          <Icon
            customSize='24px'
            phosphorIcon={GlobeHemisphereWest}
          />
        ),
        linkIconBg: token.colorWarning
      };
    }

    if (isBlocked) {
      return {
        linkIcon: <Icon
          customSize='24px'
          phosphorIcon={ShieldSlash}
        />,
        linkIconBg: token.colorError
      };
    }

    return {};
  }, [_isNotConnected, isBlocked, token]);

  const renderContent = () => {
    if (_isNotConnected) {
      return (
        <>
          <div className={'__content-heading'}>{t('Not connected to this site')}</div>
          <div className={'text-tertiary __content-text'}>
            {t('SubWallet is not connected to this site. Please find and click in the website the "Connect Wallet" button to connect.')}
          </div>
        </>
      );
    }

    if (isBlocked) {
      return (
        <>
          <div className={'__content-heading'}>{t('This site has been blocked')}</div>
          <div className={'text-tertiary __content-text'}>
            {t('This site has been previously blocked. Do you wish to unblock and grant access to it?')}
          </div>
        </>
      );
    }

    const listAccountProxy = filterAuthorizeAccountProxies(accountProxies, {
      accountAuthTypes: authInfo?.accountAuthTypes || [],
      canConnectSubstrateEcdsa: authInfo?.canConnectSubstrateEcdsa
    }).map((proxy) => {
      const value = proxy.accounts.some(({ address }) => allowedMap[address]);

      return {
        ...proxy,
        value
      };
    });
    const current = listAccountProxy.find(({ id }) => isSameAddress(id, currentAccountProxy?.id || ''));

    if (current) {
      const idx = listAccountProxy.indexOf(current);

      listAccountProxy.splice(idx, 1);
      listAccountProxy.unshift(current);
    }

    return (
      <>
        <div className={CN('__number-of-select-text')}>
          {t('Your following account(s) are connected to this site')}
        </div>

        <div className={'__account-item-container'}>
          {
            listAccountProxy.map((ap) => {
              if (isAccountAll(ap.id)) {
                return null;
              }

              const isCurrent = ap.id === currentAccountProxy?.id;

              return (
                <AccountProxyItem
                  accountProxy={ap}
                  chainTypes={convertAuthorizeTypeToChainTypes(authInfo?.accountAuthTypes, ap.chainTypes)}
                  className={CN({
                    '-is-current': isCurrent
                  }, '__account-proxy-connect-item')}
                  isSelected={ap.value}
                  key={ap.id}
                  onClick={handlerUpdateMap(ap, ap.value)}
                  showUnselectIcon
                />
              );
            })
          }
        </div>
      </>
    );
  };

  return (
    <>
      <BaseModal
        center={true}
        className={className}
        footer={actionButtons}
        id={id}
        onCancel={onCancel}
        rightIconProps={
          authInfo
            ? {
              icon: (
                <Icon
                  phosphorIcon={GearSix}
                  size='md'
                  type='phosphor'
                  weight='bold'
                />
              ),
              onClick: onOpenDAppConfigurationModal
            }
            : undefined
        }
        title={t('Connect website')}
      >
        {isEvmAuthorize && !!currentEvmNetworkInfo && <div className={'__switch-network-authorize-item'}>
          <div className={'__switch-network-authorize-label'}>
            {t('Switch network')}
          </div>
          <NetworkItem
            name={currentEvmNetworkInfo.name}
            networkKey={currentEvmNetworkInfo.slug}
            networkMainLogoShape='circle'
            networkMainLogoSize={20}
            onPressItem={openSwitchNetworkAuthorizeModal}
            rightItem={<div className={'__check-icon'}>
              <Icon
                className='__right-icon'
                customSize={'16px'}
                phosphorIcon={CaretRight}
                type='phosphor'
              />
            </div>}
          />
        </div>}

        <ConfirmationGeneralInfo
          request={{
            id: url,
            url: url
          }}
          {...connectIconProps}
        />
        {renderContent()}
      </BaseModal>
      {
        !!authInfo && (
          <DAppConfigurationModal
            authInfo={authInfo}
          />
        )
      }
    </>
  );
}

export const ConnectWebsiteModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 0
    },

    '.dual-logo-container': {
      paddingTop: 0
    },

    '.__domain': {
      marginBottom: token.margin
    },

    '.__content-heading': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4
    },

    '.confirmation-general-info-container + .__content-heading': {
      paddingTop: token.paddingXS,
      textAlign: 'center',
      marginBottom: token.marginMD
    },

    '.__content-text': {
      textAlign: 'center',
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.__account-item-container:not(:empty)': {
      marginTop: token.margin
    },

    '.__account-item-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS,

      '.__account-proxy-connect-item': {
        minHeight: 52,

        '.__item-middle-part': {
          textWrap: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          fontWeight: 600,
          fontSize: token.fontSizeHeading6,
          lineHeight: token.lineHeightHeading6
        }
      }
    },

    '.account-item-with-name': {
      position: 'relative',
      cursor: 'pointer',

      '&:before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        display: 'block',
        border: '2px solid transparent',
        borderRadius: token.borderRadiusLG
      },

      '&:-is-current:before': {
        borderColor: token.colorPrimary
      }
    },

    '.account-item-with-name + .account-item-with-name': {
      marginTop: token.marginSM
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      borderTop: 0,

      '.ant-btn + .ant-btn.ant-btn': {
        marginInlineStart: token.sizeSM
      }
    },

    '.__switch-network-authorize-item': {
      display: 'flex',
      gap: token.sizeXS,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: token.margin,

      '.__switch-network-authorize-label': {
        fontWeight: 500,
        fontSize: token.fontSizeHeading6,
        lineHeight: token.lineHeightHeading6
      },

      '.ant-network-item': {
        borderRadius: token.borderRadiusXL,

        '.ant-web3-block-middle-item': {
          width: 'fit-content'
        },

        '.ant-network-item-content': {
          paddingLeft: token.paddingSM,
          paddingRight: token.paddingSM,
          paddingTop: token.paddingXS,
          paddingBottom: token.paddingXS,
          borderRadius: token.borderRadiusXL
        },

        '.ant-network-item-name': {
          fontWeight: 600,
          fontSize: token.fontSizeHeading6,
          marginRight: token.marginXXS
        },

        '.ant-web3-block-left-item': {
          paddingRight: token.paddingXXS,

          '.ant-image': {
            height: 20,
            display: 'flex',
            alignItems: 'center'
          }
        },

        '.ant-web3-block-right-item': {
          marginRight: 0
        }
      }
    }
  });
});
