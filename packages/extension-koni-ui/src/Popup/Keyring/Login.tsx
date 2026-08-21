// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PasskeyUnlockContext } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper, ResetWalletModal } from '@subwallet/extension-koni-ui/components';
import { RESET_WALLET_MODAL } from '@subwallet/extension-koni-ui/constants';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useUILock, { isManualLockRequested } from '@subwallet/extension-koni-ui/hooks/common/useUILock';
import useFocusById from '@subwallet/extension-koni-ui/hooks/form/useFocusById';
import { keyringUnlock, passkeyUnlockAuthenticate, passkeyUnlockGetContext } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-koni-ui/types/form';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils/form/form';
import { evaluatePasskeyCredential, holdPasskeyPromptWidth, isPasskeyPromptCancelled } from '@subwallet/extension-koni-ui/utils/passkeyUnlock';
import { Button, Form, Icon, Image, Input, ModalContext } from '@subwallet/react-ui';
import { Fingerprint } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps

enum FormFieldName {
  PASSWORD = 'password'
}

interface LoginFormState {
  [FormFieldName.PASSWORD]: string;
}

const passwordInputId = 'login-password';

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);

  const [form] = Form.useForm<LoginFormState>();

  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [passkeyUnlockLoading, setPasskeyUnlockLoading] = useState(false);
  const [passkeyUnlockError, setPasskeyUnlockError] = useState('');
  const [passkeyUnlockContext, setPasskeyUnlockContext] = useState<PasskeyUnlockContext | null>(null);
  const passkeyAutoTriggered = useRef(false);
  const isManualLock = useMemo(isManualLockRequested, []);
  const { unlock } = useUILock();

  const onUpdate: FormCallbacks<LoginFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setIsDisable(error || empty);
  }, []);

  const onError = useCallback((error: string) => {
    form.setFields([{ name: FormFieldName.PASSWORD, errors: [error] }]);
    (document.getElementById(passwordInputId) as HTMLInputElement)?.select();
  }, [form]);

  const onSubmit: FormCallbacks<LoginFormState>['onFinish'] = useCallback((values: LoginFormState) => {
    setLoading(true);
    setTimeout(() => {
      keyringUnlock({
        password: values[FormFieldName.PASSWORD]
      })
        .then((data) => {
          if (!data.status) {
            onError(t(data.errors[0]));
          } else {
            unlock();
          }
        })
        .catch((e: Error) => {
          onError(e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);
  }, [onError, t, unlock]);

  const onReset = useCallback(() => {
    activeModal(RESET_WALLET_MODAL);
  }, [activeModal]);

  const onPasskeyUnlock = useCallback(async () => {
    if (!passkeyUnlockContext || passkeyUnlockLoading) {
      return;
    }

    setPasskeyUnlockLoading(true);
    setPasskeyUnlockError('');

    try {
      const evaluation = await evaluatePasskeyCredential(passkeyUnlockContext.credentialId, passkeyUnlockContext.prfInput);
      const response = await passkeyUnlockAuthenticate(evaluation);

      if (response.status) {
        unlock();
      } else {
        !response.enrolled && setPasskeyUnlockContext(null);
        setPasskeyUnlockError(t('ui.ACCOUNT.screen.Keyring.Login.passkeyUnlockFailed'));
      }
    } catch (error) {
      console.error('Passkey unlock failed', error);

      if (!isPasskeyPromptCancelled(error)) {
        setPasskeyUnlockError(t('ui.ACCOUNT.screen.Keyring.Login.passkeyUnlockFailed'));
      }
    } finally {
      setPasskeyUnlockLoading(false);
    }
  }, [passkeyUnlockContext, passkeyUnlockLoading, t, unlock]);

  const onClickPasskeyUnlock = useCallback(() => {
    onPasskeyUnlock().catch(console.error);
  }, [onPasskeyUnlock]);

  useEffect(() => {
    passkeyUnlockGetContext().then(setPasskeyUnlockContext).catch(console.error);
  }, []);

  // Take the width the browser prompt needs up front, so it is already in place if the user asks
  // for passkey unlock. Released when this screen goes away, which is once the wallet is open.
  useEffect(() => {
    return passkeyUnlockContext ? holdPasskeyPromptWidth() : undefined;
  }, [passkeyUnlockContext]);

  useEffect(() => {
    const trigger = () => {
      if (isManualLock || passkeyAutoTriggered.current || !passkeyUnlockContext || passkeyUnlockLoading || document.visibilityState !== 'visible' || !document.hasFocus()) {
        return;
      }

      passkeyAutoTriggered.current = true;
      onPasskeyUnlock().catch(console.error);
    };

    trigger();
    window.addEventListener('focus', trigger);

    return () => window.removeEventListener('focus', trigger);
  }, [isManualLock, onPasskeyUnlock, passkeyUnlockContext, passkeyUnlockLoading]);

  useFocusById(passwordInputId);

  return (
    <PageWrapper className={className}>
      <Layout.Base>
        <div className='bg-image' />
        <div className='body-container'>
          <div className='logo-container'>
            <Image
              src='./images/subwallet/gradient-logo.png'
              width={80}
            />
          </div>
          <div className='title'>
            {t('ui.ACCOUNT.screen.Keyring.Login.welcomeBack')}
          </div>
          <div className='sub-title'>
            {t('ui.ACCOUNT.screen.Keyring.Login.enterPasswordToUnlock')}
          </div>
          <Form
            form={form}
            initialValues={{ [FormFieldName.PASSWORD]: '' }}
            onFieldsChange={onUpdate}
            onFinish={onSubmit}
          >
            <Form.Item
              name={FormFieldName.PASSWORD}
              rules={[
                {
                  message: t('ui.ACCOUNT.screen.Keyring.Login.passwordIsRequired'),
                  required: true
                }
              ]}
              statusHelpAsTooltip={true}
            >
              <Input.Password
                containerClassName='password-input'
                id={passwordInputId}
                placeholder={t('ui.ACCOUNT.screen.Keyring.Login.password')}
              />
            </Form.Item>
            <Form.Item>
              <Button
                block={true}
                disabled={isDisable}
                htmlType='submit'
                loading={loading}
              >
                {t('ui.ACCOUNT.screen.Keyring.Login.unlock')}
              </Button>
            </Form.Item>
            {!!passkeyUnlockContext && (
              <Form.Item>
                <Button
                  block={true}
                  className='passkey-unlock-button'
                  icon={(
                    <Icon
                      phosphorIcon={Fingerprint}
                      weight='fill'
                    />
                  )}
                  loading={passkeyUnlockLoading}
                  onClick={onClickPasskeyUnlock}
                  schema='secondary'
                >
                  {t('ui.ACCOUNT.screen.Keyring.Login.unlockWithPasskey')}
                </Button>
                {!!passkeyUnlockError && <div className='passkey-unlock-error'>{passkeyUnlockError}</div>}
              </Form.Item>
            )}
            <Form.Item>
              <div
                className='forgot-password'
                onClick={onReset}
              >
                {t('ui.ACCOUNT.screen.Keyring.Login.dontRememberPassword')}
              </div>
            </Form.Item>
          </Form>
          <ResetWalletModal />
        </div>
      </Layout.Base>
    </PageWrapper>
  );
};

const Login = styled(Component)<Props>(({ theme }: Props) => {
  const { token } = theme;

  return {
    position: 'relative',

    '.bg-image': {
      backgroundImage: 'url("./images/subwallet/welcome-background.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top',
      backgroundSize: 'contain',
      height: '100%',
      position: 'absolute',
      width: '100%',
      left: 0,
      top: 0
    },

    '.-side-panel-mode & .bg-image, .-passkey-prompt-mode & .bg-image': {
      backgroundSize: 'cover'
    },

    '.body-container': {
      padding: `0 ${token.padding}px`,
      textAlign: 'center',
      opacity: 0.999,

      '.logo-container': {
        marginTop: 100,
        color: token.colorTextBase
      },

      '.title': {
        marginTop: token.margin,
        fontWeight: token.fontWeightStrong,
        fontSize: token.fontSizeHeading3,
        lineHeight: token.lineHeightHeading3,
        color: token.colorTextBase
      },

      '.sub-title': {
        marginTop: token.marginXS,
        fontSize: token.fontSizeHeading5,
        lineHeight: token.lineHeightHeading5,
        color: token.colorTextLight3
      },

      '.password-input': {
        marginTop: 62
      },

      '.passkey-unlock-button': {
        marginTop: token.marginXS
      },

      '.passkey-unlock-error': {
        color: token.colorError,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        marginTop: token.marginXS
      },

      '.forgot-password': {
        cursor: 'pointer',
        fontSize: token.fontSizeHeading5,
        lineHeight: token.lineHeightHeading5,
        color: token.colorTextLight4,
        marginTop: 27
      }
    }
  };
});

export default Login;
