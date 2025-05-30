// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletUnlockType } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { EDIT_AUTO_LOCK_TIME_MODAL, EDIT_UNLOCK_TYPE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DEFAULT_ROUTER_PATH } from '@subwallet/extension-koni-ui/constants/router';
import { useExtensionDisplayModes, useSidePanelUtils } from '@subwallet/extension-koni-ui/hooks';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { saveAllowOneSign, saveAutoLockTime, saveCameraSetting, saveEnableChainPatrol, saveUnlockType, windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { PhosphorIcon, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { isNoAccount } from '@subwallet/extension-koni-ui/utils/account/account';
import { BackgroundIcon, Icon, ModalContext, SettingItem, Switch, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { Camera, CaretRight, CheckCircle, Key, LockKeyOpen, LockLaminated, PenNib, ShieldStar } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

enum SecurityType {
  WALLET_PASSWORD = 'wallet-password',
  WEBSITE_ACCESS = 'website-access',
  CAMERA_ACCESS = 'camera-access',
  AUTO_LOCK = 'auto-lock',
  UNLOCK_TYPE = 'unlock-type',
  CHAIN_PATROL_SERVICE = 'chain-patrol-service',
  SIGN_ONCE = 'sign-once'
}

interface SecurityItem {
  icon: PhosphorIcon;
  key: SecurityType;
  title: string;
  url: string;
  disabled: boolean;
}

interface AutoLockOption {
  label: string;
  value: number;
}

const editAutoLockTimeModalId = EDIT_AUTO_LOCK_TIME_MODAL;
const editUnlockTypeModalId = EDIT_UNLOCK_TYPE_MODAL;

const timeOptions = [5, 10, 15, 30, 60];

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = !!location.state;
  const { isExpanseMode, isSidePanelMode } = useExtensionDisplayModes();
  const { closeSidePanel } = useSidePanelUtils();

  const { activeModal, inactiveModal } = useContext(ModalContext);

  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { allowOneSign, camera, enableChainPatrol, timeAutoLock, unlockType } = useSelector((state: RootState) => state.settings);

  const noAccount = useMemo(() => isNoAccount(accounts), [accounts]);

  const autoLockOptions = useMemo((): AutoLockOption[] => timeOptions.map((value) => {
    if (value > 0) {
      return {
        value: value,
        label: t('{{time}} minutes', { replace: { time: value } })
      };
    } else if (value < 0) {
      return {
        value: value,
        label: t('Required once')
      };
    } else {
      return {
        value: value,
        label: t('Always require')
      };
    }
  }), [t]);

  const items = useMemo((): SecurityItem[] => [
    {
      icon: Key,
      key: SecurityType.WALLET_PASSWORD,
      title: t('Change wallet password'),
      url: '/keyring/change-password',
      disabled: noAccount
    },
    {
      icon: LockLaminated,
      key: SecurityType.AUTO_LOCK,
      title: t('Extension auto lock'),
      url: '',
      disabled: false
    },
    {
      icon: LockKeyOpen,
      key: SecurityType.UNLOCK_TYPE,
      title: t('Authenticate with password'),
      url: '',
      disabled: false
    }
  ], [noAccount, t]);

  const [loadingCamera, setLoadingCamera] = useState(false);
  const [loadingChainPatrol, setLoadingChainPatrol] = useState(false);
  const [loadingSignOnce, setLoadingSignOnce] = useState(false);

  const onBack = useCallback(() => {
    if (canGoBack) {
      goBack();
    } else {
      if (noAccount) {
        navigate(DEFAULT_ROUTER_PATH);
      } else {
        navigate('/settings/list');
      }
    }
  }, [canGoBack, goBack, navigate, noAccount]);

  const updateCamera = useCallback((currentValue: boolean) => {
    return () => {
      setLoadingCamera(true);

      let openNewTab = false;

      if (!currentValue) {
        if (!isExpanseMode) {
          openNewTab = true;
        }
      }

      saveCameraSetting(!currentValue)
        .then(() => {
          if (openNewTab) {
            windowOpen({ allowedPath: '/settings/security' })
              .catch((e: Error) => {
                console.log(e);
              });

            isSidePanelMode && closeSidePanel();
          }
        })
        .catch(console.error)
        .finally(() => {
          setLoadingCamera(false);
        });
    };
  }, [closeSidePanel, isExpanseMode, isSidePanelMode]);

  const updateSignOneStatus = useCallback((currentValue: boolean) => {
    return () => {
      setLoadingSignOnce(true);

      saveAllowOneSign(!currentValue)
        .catch(console.error)
        .finally(() => {
          setLoadingSignOnce(false);
        });
    };
  }, []);

  const updateChainPatrolEnable = useCallback((currentValue: boolean) => {
    return () => {
      setLoadingChainPatrol(true);

      saveEnableChainPatrol(!currentValue)
        .catch(console.error)
        .finally(() => {
          setLoadingChainPatrol(false);
        });
    };
  }, []);

  const onOpenAutoLockTimeModal = useCallback(() => {
    activeModal(editAutoLockTimeModalId);
  }, [activeModal]);

  const onOpenUnlockTypeModal = useCallback(() => {
    activeModal(editUnlockTypeModalId);
  }, [activeModal]);

  const onCloseAutoLockTimeModal = useCallback(() => {
    inactiveModal(editAutoLockTimeModalId);
  }, [inactiveModal]);

  const onCloseUnlockTypeModal = useCallback(() => {
    inactiveModal(editUnlockTypeModalId);
  }, [inactiveModal]);

  const onClickItem = useCallback((item: SecurityItem) => {
    return () => {
      switch (item.key) {
        case SecurityType.AUTO_LOCK:
          onOpenAutoLockTimeModal();
          break;
        case SecurityType.UNLOCK_TYPE:
          onOpenUnlockTypeModal();
          break;
        default:
          navigate(item.url);
      }
    };
  }, [navigate, onOpenAutoLockTimeModal, onOpenUnlockTypeModal]);

  const onSelectTime = useCallback((item: AutoLockOption) => {
    return () => {
      inactiveModal(editAutoLockTimeModalId);
      saveAutoLockTime(item.value).finally(noop);
    };
  }, [inactiveModal]);

  const onSetUnlockType = useCallback((value: WalletUnlockType) => {
    return () => {
      inactiveModal(editAutoLockTimeModalId);
      saveUnlockType(value).finally(noop);
    };
  }, [inactiveModal]);

  const onRenderItem = useCallback((item: SecurityItem) => {
    return (
      <SettingItem
        className={CN(
          'security-item', 'setting-item',
          `security-type-${item.key}`,
          {
            disabled: item.disabled
          }
        )}
        key={item.key}
        leftItemIcon={(
          <BackgroundIcon
            backgroundColor={'var(--icon-bg-color)'}
            phosphorIcon={item.icon}
            size='sm'
            type='phosphor'
            weight='fill'
          />
        )}
        name={item.title}
        onPressItem={item.disabled ? undefined : onClickItem(item)}
        rightItem={(
          <Icon
            className='security-item-right-icon'
            phosphorIcon={CaretRight}
            size='sm'
            type='phosphor'
          />
        )}
      />
    );
  }, [onClickItem]);

  useEffect(() => {
    if (camera) {
      window.navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Close video
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        })
        .catch(console.error);
    }
  }, [camera]);

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        onBack={onBack}
        title={t('Security settings')}
      >
        <div className='body-container'>
          <div className='items-container'>
            {items.map(onRenderItem)}
          </div>
          <div className='setting-config-container'>
            <div className='items-container'>
              <SettingItem
                className={CN('security-item', `security-type-${SecurityType.CHAIN_PATROL_SERVICE}`)}
                leftItemIcon={(
                  <BackgroundIcon
                    backgroundColor={'var(--icon-bg-color)'}
                    phosphorIcon={ShieldStar}
                    size='sm'
                    type='phosphor'
                    weight='fill'
                  />
                )}
                name={t('Advanced phishing detection')}
                rightItem={(
                  <Switch
                    checked={enableChainPatrol}
                    loading={loadingChainPatrol}
                    onClick={updateChainPatrolEnable(enableChainPatrol)}
                  />
                )}
              />
            </div>
            <SettingItem
              className={CN('security-item', `security-type-${SecurityType.CAMERA_ACCESS}`)}
              leftItemIcon={(
                <BackgroundIcon
                  backgroundColor={'var(--icon-bg-color)'}
                  phosphorIcon={Camera}
                  size='sm'
                  type='phosphor'
                  weight='fill'
                />
              )}
              name={t('Camera access for QR')}
              rightItem={(
                <Switch
                  checked={camera}
                  loading={loadingCamera}
                  onClick={updateCamera(camera)}
                />
              )}
            />
            <div className={CN('security-item', 'custom-security-item', `security-type-${SecurityType.SIGN_ONCE}`)}>
              <div className='__item-left-part'>
                <BackgroundIcon
                  backgroundColor={'var(--icon-bg-color)'}
                  phosphorIcon={PenNib}
                  size='sm'
                  type='phosphor'
                  weight='fill'
                />
              </div>
              <div className='__item-center-part'>
                <div className='__item-title'>
                  {t('Sign for multiple transactions')}
                </div>
                <div className='__item-description'>
                  {t('Allow signing once for multiple transactions')}
                </div>
              </div>
              <div className='__item-right-part'>
                <Switch
                  checked={allowOneSign}
                  loading={loadingSignOnce}
                  onClick={updateSignOneStatus(allowOneSign)}
                />
              </div>
            </div>
          </div>
        </div>
        <SwModal
          className={className}
          id={editAutoLockTimeModalId}
          onCancel={onCloseAutoLockTimeModal}
          title={t('Auto lock')}
        >
          <div className='modal-body-container'>
            {
              autoLockOptions.map((item) => {
                const _selected = timeAutoLock === item.value;

                return (
                  <SettingItem
                    className={CN('__selection-item')}
                    key={item.value}
                    name={item.label}
                    onPressItem={onSelectTime(item)}
                    rightItem={
                      _selected
                        ? (
                          <Icon
                            className='__right-icon'
                            iconColor='var(--icon-color)'
                            phosphorIcon={CheckCircle}
                            size='sm'
                            type='phosphor'
                            weight='fill'
                          />
                        )
                        : null
                    }
                  />
                );
              })
            }
          </div>
        </SwModal>
        <SwModal
          className={className}
          id={editUnlockTypeModalId}
          onCancel={onCloseUnlockTypeModal}
          title={t('Authenticate with password')}
        >
          <div className='modal-body-container'>
            <SettingItem
              className={CN('__selection-item')}
              key={WalletUnlockType.ALWAYS_REQUIRED}
              name={t('Always required')}
              onPressItem={onSetUnlockType(WalletUnlockType.ALWAYS_REQUIRED)}
              rightItem={
                unlockType === WalletUnlockType.ALWAYS_REQUIRED
                  ? (
                    <Icon
                      className='__right-icon'
                      iconColor='var(--icon-color)'
                      phosphorIcon={CheckCircle}
                      size='sm'
                      type='phosphor'
                      weight='fill'
                    />
                  )
                  : null
              }
            />
            <SettingItem
              className={CN('__selection-item')}
              key={WalletUnlockType.WHEN_NEEDED}
              name={t('When needed')}
              onPressItem={onSetUnlockType(WalletUnlockType.WHEN_NEEDED)}
              rightItem={
                unlockType === WalletUnlockType.WHEN_NEEDED
                  ? (
                    <Icon
                      className='__right-icon'
                      iconColor='var(--icon-color)'
                      phosphorIcon={CheckCircle}
                      size='sm'
                      type='phosphor'
                      weight='fill'
                    />
                  )
                  : null
              }
            />
          </div>
        </SwModal>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const SecurityList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.body-container': {
      padding: `${token.padding}px ${token.padding}px`
    },

    '.items-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },

    [`.security-type-${SecurityType.WALLET_PASSWORD}`]: {
      '--icon-bg-color': token['geekblue-6'],

      '&:hover': {
        '--icon-bg-color': token['geekblue-7']
      }
    },

    [`.security-type-${SecurityType.WEBSITE_ACCESS}`]: {
      '--icon-bg-color': token['blue-7'],

      '&:hover': {
        '--icon-bg-color': token['blue-8']
      }
    },

    [`.security-type-${SecurityType.CAMERA_ACCESS}`]: {
      '--icon-bg-color': token['green-6'],

      '&:hover': {
        '--icon-bg-color': token['green-7']
      }
    },

    [`.security-type-${SecurityType.CHAIN_PATROL_SERVICE}`]: {
      '--icon-bg-color': token['magenta-6'],

      '&:hover': {
        '--icon-bg-color': token['magenta-7']
      }
    },

    [`.security-type-${SecurityType.AUTO_LOCK}`]: {
      '--icon-bg-color': token['green-6'],

      '&:hover': {
        '--icon-bg-color': token['green-7']
      }
    },

    [`.security-type-${SecurityType.UNLOCK_TYPE}, .security-type-${SecurityType.SIGN_ONCE}`]: {
      '--icon-bg-color': token['purple-8'],

      '&:hover': {
        '--icon-bg-color': token['purple-9']
      }
    },

    '.security-item': {
      '.ant-web3-block-right-item': {
        marginRight: 0,
        color: token['gray-4']
      },

      '&:hover': {
        '.ant-web3-block-right-item': {
          color: token['gray-6']
        }
      },

      '&.disabled': {
        opacity: 0.4,

        '.ant-setting-item-content': {
          cursor: 'not-allowed'
        }
      }
    },

    '.custom-security-item': {
      display: 'flex',
      gap: token.sizeSM,
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      cursor: 'pointer',

      '.__item-left-part': {

      },
      '.__item-center-part': {

      },
      '.__item-right-part': {

      },
      '.__item-title': {
        fontSize: token.fontSizeHeading5,
        lineHeight: token.lineHeightHeading5,
        fontWeight: token.headingFontWeight,
        color: token.colorTextLight1
      },
      '.__item-description': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextLight3
      },

      '&:hover': {
        backgroundColor: token.colorBgInput
      }
    },

    '.setting-config-container': {
      marginTop: token.marginXS,
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS,

      '.label': {
        fontWeight: token.fontWeightStrong,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextLabel,
        textTransform: 'uppercase'
      }
    },

    '.modal-body-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },

    '.__selection-item': {
      '--icon-color': token.colorSuccess
    },

    '.__right-icon': {
      marginRight: token.marginXS
    }
  };
});

export default SecurityList;
