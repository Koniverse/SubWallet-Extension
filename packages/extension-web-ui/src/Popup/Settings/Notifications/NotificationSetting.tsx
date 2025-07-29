// Copyright 2019-2022 @polkadot/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationSetup } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { BaseModal, CloseIcon } from '@subwallet/extension-web-ui/components';
import { useDefaultNavigate } from '@subwallet/extension-web-ui/hooks';
import { saveNotificationSetup } from '@subwallet/extension-web-ui/messaging';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { BackgroundIcon, Button, Checkbox, Icon, SettingItem, Switch, SwSubHeader } from '@subwallet/react-ui';
import { CheckboxChangeEvent } from '@subwallet/react-ui/es/checkbox';
import CN from 'classnames';
import { BellSimpleRinging, CaretLeft } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

type Props = {
  isInModal?: boolean;
  modalProps?: WrapperProps['modalProps'];
};

type WrapperProps = ThemeProps & {
  isModal?: boolean;
  modalProps?: {
    modalId: string;
    onCancel: VoidFunction;
    onBack?: VoidFunction;
  };
  className?: string;
};

// interface ViewOption {
//   label: string;
//   value: NotificationTimePeriod;
// }

interface ShowNoticeOption {
  label: string;
  value: keyof NotificationSetup['showNotice'];
}

const CAN_NOT_CHANGE_SETTING: Array<keyof NotificationSetup['showNotice']> = ['earningClaim', 'earningWithdraw', 'availBridgeClaim', 'polygonBridgeClaim'];

const Component = ({ isInModal, modalProps }: Props): React.ReactElement<Props> => {
  const { token } = useTheme() as Theme;
  const { t } = useTranslation();
  const { goBack: originGoBack } = useDefaultNavigate();
  const { notificationSetup } = useSelector((state: RootState) => state.settings);
  const [currentNotificationSetting, setCurrentNotificationSetting] = useState<NotificationSetup>(notificationSetup);
  const [loadingNotification, setLoadingNotification] = useState(false);

  const goBack = useCallback(() => {
    if (isInModal && modalProps) {
      (modalProps.onBack || modalProps.onCancel)();
    } else {
      originGoBack();
    }
  }, [isInModal, modalProps, originGoBack]);

  const notificationOptions = useMemo((): ShowNoticeOption[] => {
    return [
      {
        label: t('Claim tokens'),
        value: 'earningClaim'
      },
      {
        label: t('Withdraw tokens'),
        value: 'earningWithdraw'
      },
      {
        label: t('Claim AVAIL bridge'),
        value: 'availBridgeClaim'
      },
      {
        label: t('Claim POLYGON bridge'),
        value: 'polygonBridgeClaim'
      }
    ];
  }, [t]);

  // const timeSetup = useMemo((): ViewOption[] => {
  //   return [
  //     {
  //       label: t('Today'),
  //       value: NotificationTimePeriod.TODAY
  //     },
  //     {
  //       label: t('This week'),
  //       value: NotificationTimePeriod.THIS_WEEK
  //     },
  //     {
  //       label: t('This month'),
  //       value: NotificationTimePeriod.THIS_MONTH
  //     }
  //   ];
  // }, [t]);

  const onSaveNotificationSetup = useCallback((setup: NotificationSetup) => {
    return () => {
      setLoadingNotification(true);
      saveNotificationSetup(setup)
        .catch(console.error)
        .finally(() => {
          setLoadingNotification(false);
          goBack();
        });
    };
  }, [goBack]);

  const onSwitchNotification = useCallback(() => {
    setCurrentNotificationSetting((old): NotificationSetup => {
      return {
        isEnabled: !old.isEnabled,
        showNotice: old.showNotice
      };
    });
  }, []);

  const onChangeNotificationDetailSetting = useCallback((e: CheckboxChangeEvent) => {
    setCurrentNotificationSetting((old): NotificationSetup => {
      return {
        isEnabled: old.isEnabled,
        showNotice: {
          ...old.showNotice,
          [e.target.value]: e.target
        }
      };
    });
  }, []);

  useEffect(() => {
    setCurrentNotificationSetting(structuredClone(notificationSetup));
  }, [notificationSetup]);

  return (
    <>
      {!isInModal && (
        <SwSubHeader
          background={'transparent'}
          center
          onBack={goBack}
          paddingVertical
          showBackButton
          title={t('Notification settings')}
        />
      )}

      <div className={'body-container'}>
        <div>
          <SettingItem
            className={CN('security-item')}
            leftItemIcon={(
              <BackgroundIcon
                backgroundColor={token['magenta-7']}
                phosphorIcon={BellSimpleRinging}
                size='sm'
                type='phosphor'
                weight='fill'
              />
            )}
            name={t('Enable notifications')}
            rightItem={(
              <Switch
                checked={currentNotificationSetting.isEnabled}
                onClick={onSwitchNotification}
              />
            )}
          />
          {currentNotificationSetting.isEnabled && <div className={'content-wrapper'}>
            <div className={'options-container'}>
              <div className={'option-title'}>{t('Show notifications about')}</div>
              {
                notificationOptions.map((option) => (
                  <div
                    className={'option-item'}
                    key={option.value}
                  >
                    <Checkbox
                      checked={currentNotificationSetting.showNotice[option.value]}
                      disabled={CAN_NOT_CHANGE_SETTING.includes(option.value)}
                      onChange={onChangeNotificationDetailSetting}
                      value={option.value}
                    >
                      <span className={'option-label'}>{option.label}</span>
                    </Checkbox>
                  </div>
                ))
              }
            </div>
          </div>}
        </div>
        <Button
          block={true}
          disabled={loadingNotification}
          loading={loadingNotification}
          // todo: handle params for notification setup
          onClick={onSaveNotificationSetup(currentNotificationSetting)}
        >
          {t('Save settings')}
        </Button>
      </div>
    </>
  );
};

const Wrapper = (props: WrapperProps) => {
  const { className, isModal, modalProps } = props;
  const { t } = useTranslation();

  return (
    <>
      {
        isModal && !!modalProps
          ? (
            <BaseModal
              className={CN(className, '-modal-container')}
              closeIcon={
                modalProps.onBack
                  ? (
                    <Icon
                      phosphorIcon={CaretLeft}
                      size='md'
                    />
                  )
                  : undefined
              }
              destroyOnClose={true}
              id={modalProps.modalId}
              onCancel={modalProps.onBack || modalProps.onCancel}
              rightIconProps={modalProps.onBack
                ? {
                  icon: <CloseIcon />,
                  onClick: modalProps.onCancel
                }
                : undefined
              }
              title={t('Notifications')}
            >
              <Component
                isInModal
                modalProps={modalProps}
              />
            </BaseModal>
          )
          : (
            <div className={CN(className, '-screen-container')}>
              <Component />
            </div>
          )
      }
    </>
  );
};

const NotificationSetting = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return ({
    '.body-container': {
      padding: token.padding,
      justifyContent: 'space-between',
      display: 'flex',
      height: '100%',
      flexDirection: 'column'
    },

    '.filter-tabs-container': {
      marginLeft: token.margin
    },

    '.ant-sw-list-section': {
      paddingTop: token.padding,
      flex: 1,
      marginBottom: token.margin
    },

    '.ant-sw-list-section .ant-sw-list': {
      paddingBottom: 0
    },

    '.option-title': {
      marginBottom: token.margin,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.fontWeightStrong,
      color: token.colorWhite
    },

    '.option-item + .option-item': {
      marginTop: token.marginMD
    },

    '.option-item': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.bodyFontWeight,
      color: token.colorWhite,
      marginLeft: token.marginSM
    },

    '.ant-radio-group': {
      backgroundColor: 'transparent'
    },

    '.ant-checkbox-wrapper': {
      display: 'flex',
      alignItems: 'center'
    },

    '.time-title': {
      marginBottom: token.margin,
      marginTop: token.margin,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.fontWeightStrong,
      color: token.colorWhite
    },

    '.radio-wrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.bodyFontWeight,
      color: token.colorWhite,
      marginLeft: token.marginSM
    },

    '.security-item': {
      marginBottom: token.margin,
      '.ant-web3-block-right-item': {
        marginRight: 0
      }
    },

    '.ant-checkbox-disabled': {
      '.ant-checkbox-inner': {
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary
      }
    },

    '&.-modal-container': {
      '.ant-sw-modal-body': {
        flex: 1
      },

      '.body-container': {
        padding: 0
      }
    },

    '&.-screen-container': {
      height: '100%',
      backgroundColor: token.colorBgDefault,
      display: 'flex',
      flexDirection: 'column'
    }
  });
});

export default NotificationSetting;
