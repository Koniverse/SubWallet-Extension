// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CloseIcon, Layout, QrScannerErrorNotice, WalletConnect } from '@subwallet/extension-web-ui/components';
import { BaseModal } from '@subwallet/extension-web-ui/components/Modal/BaseModal';
import { TIME_OUT_RECORD, WALLET_CONNECT_CREATE_MODAL } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useDefaultNavigate, useOpenQrScanner } from '@subwallet/extension-web-ui/hooks';
import { addConnection } from '@subwallet/extension-web-ui/messaging';
import { FormCallbacks, ScannerResult, Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { validWalletConnectUri } from '@subwallet/extension-web-ui/utils';
import { Button, Form, Icon, Input, ModalContext, PageIcon, SwQrScanner } from '@subwallet/react-ui';
import { SwModalProps } from '@subwallet/react-ui/es/sw-modal/SwModal';
import CN from 'classnames';
import { t } from 'i18next';
import { Scan, XCircle } from 'phosphor-react';
import { RuleObject } from 'rc-field-form/lib/interface';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps & {
  isModal?: boolean;
  modalProps?: {
    closeIcon?: SwModalProps['closeIcon'],
    onCancel?: SwModalProps['onCancel'],
  };
  onAfterConnect?: () => void;
};

interface ConnectionError {
  message: string;
  isConnectionBlockedError?: boolean;
}

interface AddConnectionFormState {
  uri: string;
}

const DEFAULT_FORM_VALUES: AddConnectionFormState = {
  uri: ''
};

const faqUrl = 'https://docs.subwallet.app/main/web-dashboard-user-guide/connect-and-sign-transactions-on-dapps-with-walletconnect/connect-dapps-with-walletconnect#i-see-the-connection-unsuccessful-popup-after-approving-the-request-to-connect-to-dapp';
const modalId = 'WALLET_CONNECT_CONFIRM_MODAL';
const scannerId = 'connect-connection-scanner-modal';
const showScanner = true;
const keyRecords = 'unsuccessful_connect_wc_modal';
let idTimeOut: NodeJS.Timeout;
const connectionErrorDefault: ConnectionError = {
  message: t('Connection unsuccessful. Review our user guide and try connecting again.')
};

const convertWCErrorMessage = (e: Error): ConnectionError => {
  const message = e.message.toLowerCase();
  let newStandardMessage = t('Connection unsuccessful. Review our user guide and try connecting again.');
  let isConnectionBlockedError = false;

  if (message.includes('socket hang up') || message.includes('stalled') || message.includes('interrupted')) {
    newStandardMessage = t('Turn off VPN/ad blocker apps, reload the dApp, and try again. If the issue persists, contact support at agent@subwallet.app');
    isConnectionBlockedError = true;
  }

  if (message.includes('failed for host')) {
    newStandardMessage = t('Turn off some networks on the wallet or close any privacy protection apps (e.g. VPN, ad blocker apps) and try again. If the issue persists, contact support at agent@subwallet.app');
    isConnectionBlockedError = true;
  }

  return { message: newStandardMessage, isConnectionBlockedError };
};

const getTimeOutRecords = () => {
  return JSON.parse(localStorage.getItem(TIME_OUT_RECORD) || '{}') as Record<string, number>;
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, isModal, modalProps = {}, onAfterConnect } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const { isWebUI } = useContext(ScreenContext);
  const { token } = useTheme() as Theme;

  const [form] = Form.useForm<AddConnectionFormState>();
  const [, setTimeOutRecords] = useLocalStorage(TIME_OUT_RECORD, {});
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<ConnectionError>(connectionErrorDefault);
  const [scanError, setScanError] = useState('');

  const goBack = useCallback(() => {
    navigate('/wallet-connect/list');
  }, [navigate]);

  const _onAfterConnect = onAfterConnect || goBack;

  const onConnect = useCallback((uri: string) => {
    setLoading(true);

    addConnection({
      uri
    })
      .then(() => {
        setLoading(false);
        _onAfterConnect();
        form.resetFields();
      })
      .catch((e: Error) => {
        console.error(e);
        setLoading(false);
        setConnectionError(convertWCErrorMessage(e));
        activeModal(modalId);
      });
  }, [_onAfterConnect, activeModal, form]);

  const onFinish: FormCallbacks<AddConnectionFormState>['onFinish'] = useCallback((values: AddConnectionFormState) => {
    const { uri } = values;

    onConnect(uri);
  }, [onConnect]);

  const onSuccess = useCallback((result: ScannerResult) => {
    const uri = result.text;
    const error = validWalletConnectUri(uri, t);

    if (!error && !loading) {
      setScanError('');
      inactiveModal(scannerId);
      form.setFieldValue('uri', result.text);
    } else {
      if (error) {
        setScanError(error);
      }
    }
  }, [loading, inactiveModal, form, t]);

  const openScanner = useOpenQrScanner(scannerId);

  const onOpenScan = useCallback((e?: SyntheticEvent) => {
    e && e.stopPropagation();
    openScanner();
  }, [openScanner]);

  const onCloseScan = useCallback(() => {
    setScanError('');
  }, []);

  const onScanError = useCallback((error: string) => {
    console.log(error);
    setScanError(error);
  }, []);

  const uriValidator = useCallback((rule: RuleObject, uri: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const error = validWalletConnectUri(uri, t);

      if (!error) {
        resolve();
      } else {
        reject(new Error(error));
      }
    });
  }, [t]);

  const onCloseModal = useCallback(() => {
    modalProps?.onCancel?.();
    form.resetFields();
  }, [form, modalProps]);

  const reOpenModalWhenTimeOut = useCallback(() => {
    const timeOutRecord = getTimeOutRecords();

    if (timeOutRecord[keyRecords]) {
      setLoading(false);
      activeModal(modalId);
    }
  }, [activeModal]);

  const onClickToFAQ = useCallback((isDismiss: boolean) => {
    return () => {
      const timeOutRecord = getTimeOutRecords();

      clearTimeout(idTimeOut);
      delete timeOutRecord[keyRecords];
      !isDismiss && window.open(faqUrl, '_blank');
      inactiveModal(modalId);
      form.setFieldValue('uri', DEFAULT_FORM_VALUES.uri);
      setTimeOutRecords(timeOutRecord);
    };
  }, [form, inactiveModal, setTimeOutRecords]);

  const isActiveModal = useMemo(() => checkActive(modalId), [checkActive]);

  const footerModalWC = useMemo(() => {
    return (
      <div className={'__footer-wc-modal'}>
        <Button
          block={true}
          onClick={onClickToFAQ(true)}
          schema={'secondary'}
        >{t('Dismiss')}</Button>
        <Button
          block={true}
          onClick={onClickToFAQ(false)}
        >{t('Review guide')}</Button>
      </div>
    );
  }, [onClickToFAQ, t]);

  const contentNode = (
    <>
      <div className='body-container'>
        <div className='description'>
          {t('By clicking "Connect", you allow this dapp to view your public address')}
        </div>
        <div className='page-icon'>
          <PageIcon
            color='var(--page-icon-color)'
            iconProps={{
              customIcon: (
                <WalletConnect
                  height='1em'
                  width='1em'
                />
              ),
              type: 'customIcon'
            }}
          />
        </div>
        <Form
          form={form}
          initialValues={DEFAULT_FORM_VALUES}
          onFinish={onFinish}
        >
          <Form.Item
            name={'uri'}
            rules={[
              {
                required: true,
                message: t('URI is required')
              },
              {
                validator: uriValidator
              }
            ]}
            statusHelpAsTooltip={isWebUI}
          >
            <Input
              disabled={loading}
              label={t('URI')}
              placeholder={t('Please type or paste or scan URI')}
              suffix={(
                <>
                  {
                    showScanner && (
                      <Button
                        disabled={loading}
                        icon={(
                          <Icon
                            phosphorIcon={Scan}
                            size='sm'
                          />
                        )}
                        onClick={onOpenScan}
                        size='xs'
                        type='ghost'
                      />
                    )
                  }
                </>
              )}
            />
          </Form.Item>
        </Form>
        {
          showScanner && (
            <SwQrScanner
              className={className}
              id={scannerId}
              isError={!!scanError}
              onClose={onCloseScan}
              onError={onScanError}
              onSuccess={onSuccess}
              overlay={scanError && <QrScannerErrorNotice message={scanError} />}
              selectCameraMotion={isWebUI ? 'move-right' : undefined}
            />
          )
        }
      </div>
      <BaseModal
        center={true}
        className={CN(className, '-wc-modal-unsuccessful')}
        closable={true}
        footer={footerModalWC}
        id={modalId}
        onCancel={onClickToFAQ(true)}
        title={t('Connection unsuccessful')}
      >
        <div className='__wc-modal-container'>
          <div className='page-icon'>
            <PageIcon
              color={token.colorError}
              iconProps={{
                weight: 'fill',
                phosphorIcon: XCircle
              }}
            />
          </div>
          <div className={'__wc-modal-content'}>
            {connectionError.message}
          </div>
        </div>
      </BaseModal>
    </>

  );

  useEffect(() => {
    const timeOutRecord = getTimeOutRecords();

    if (loading && !isActiveModal && !timeOutRecord[keyRecords]) {
      idTimeOut = setTimeout(reOpenModalWhenTimeOut, 20000);
      setTimeOutRecords({ ...timeOutRecord, [keyRecords]: idTimeOut });
    } else if (timeOutRecord[keyRecords]) {
      setLoading(false);
    }
  }, [isActiveModal, loading, reOpenModalWhenTimeOut, setTimeOutRecords]);

  if (isModal) {
    return (
      <BaseModal
        className={CN(className, '-modal')}
        closeIcon={modalProps?.closeIcon}
        id={WALLET_CONNECT_CREATE_MODAL}
        onCancel={onCloseModal}
        title={t('WalletConnect')}
      >
        {contentNode}

        <div className='__footer'>
          <Button
            block={true}
            icon={
              <Icon
                customIcon={(
                  <WalletConnect
                    height='1em'
                    width='1em'
                  />
                )}
                type='customIcon'
              />
            }
            loading={loading}
            onClick={form.submit}
          >
            {t('Connect')}
          </Button>
        </div>
      </BaseModal>
    );
  }

  return (
    <Layout.WithSubHeaderOnly
      className={CN(className, 'setting-pages')}
      onBack={goBack}
      rightFooterButton={{
        children: t('Connect'),
        onClick: form.submit,
        loading: loading,
        icon: (
          <Icon
            customIcon={(
              <WalletConnect
                height='1em'
                width='1em'
              />
            )}
            type='customIcon'
          />
        )
      }}
      subHeaderIcons={[{
        icon: <CloseIcon />,
        onClick: goHome
      }]}
      title={t('WalletConnect')}
    >
      {contentNode}
    </Layout.WithSubHeaderOnly>
  );
};

const ConnectWalletConnect = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.body-container': {
      padding: `0 ${token.padding}px`,

      '.description': {
        padding: `0 ${token.padding}px`,
        fontSize: token.fontSizeHeading6,
        lineHeight: token.lineHeightHeading6,
        color: token.colorTextDescription,
        textAlign: 'center'
      },

      '.page-icon': {
        display: 'flex',
        justifyContent: 'center',
        marginTop: token.controlHeightLG,
        marginBottom: token.sizeXXL,
        '--page-icon-color': token.colorPrimary
      },

      '.ant-input-suffix': {
        minWidth: token.sizeXS
      }
    },

    '&.-modal': {
      '.body-container': {
        paddingLeft: 0,
        paddingRight: 0
      },

      '.page-icon': {
        marginTop: token.marginXL,
        marginBottom: token.marginXL
      },

      '.__footer': {
        paddingTop: token.paddingXS
      }
    },

    '&.-wc-modal-unsuccessful': {
      '.__wc-modal-container': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: -token.margin
      },

      '.__wc-modal-content': {
        color: token.colorTextTertiary,
        padding: '0 16px',
        textAlign: 'center',
        marginTop: token.marginMD
      },

      '.ant-sw-modal-footer': {
        borderTop: 0,
        '.__footer-wc-modal': {
          display: 'flex'
        }
      }
    }
  };
});

export default ConnectWalletConnect;
