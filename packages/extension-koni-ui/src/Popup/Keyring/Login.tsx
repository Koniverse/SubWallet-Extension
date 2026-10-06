// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PasskeyUnlockContext } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper, PasskeyUnlockSetupModal, ResetWalletModal } from '@subwallet/extension-koni-ui/components';
import { PASSKEY_UNLOCK_SETUP_MODAL, PASSKEY_UNLOCK_SETUP_PROMPTED, RESET_WALLET_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useExtensionDisplayModes, useSidePanelUtils } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useUILock, { isManualLockRequested } from '@subwallet/extension-koni-ui/hooks/common/useUILock';
import useFocusById from '@subwallet/extension-koni-ui/hooks/form/useFocusById';
import { keyringUnlock, passkeyUnlockAuthenticate, passkeyUnlockEnroll, passkeyUnlockGetContext, windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-koni-ui/types/form';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils/form/form';
import { evaluatePasskeyCredential, forgetPasskeyCredential, holdPasskeyPromptRoom, isPasskeyPromptCancelled, registerPasskeyCredential, supportsPasskeyUnlock } from '@subwallet/extension-koni-ui/utils/passkeyUnlock';
import { Button, Form, Icon, Image, Input, ModalContext } from '@subwallet/react-ui';
import { Fingerprint } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

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
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);

  const [form] = Form.useForm<LoginFormState>();

  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [passkeyUnlockLoading, setPasskeyUnlockLoading] = useState(false);
  const [passkeyUnlockError, setPasskeyUnlockError] = useState('');
  const [passkeyUnlockContext, setPasskeyUnlockContext] = useState<PasskeyUnlockContext | null>(null);
  const [passkeyUnlockContextLoaded, setPasskeyUnlockContextLoaded] = useState(false);
  const [passkeyUnlockAvailable, setPasskeyUnlockAvailable] = useState(false);
  const [passkeySetupPrompted, setPasskeySetupPrompted] = useLocalStorage<boolean>(PASSKEY_UNLOCK_SETUP_PROMPTED, false);
  // True from the moment a password unlock is sent until the biometric offer is answered, so the
  // unlock screen stays put under the offer instead of opening the wallet as soon as the keyring unlocks.
  const [isOfferingPasskeySetup, setIsOfferingPasskeySetup] = useState(false);
  // Kept only for as long as the offer is open: enrollment wraps the password, and asking for it
  // again right after it was typed is the trip to Settings this offer is meant to save.
  const passkeySetupPassword = useRef('');
  const passkeyAutoTriggered = useRef(false);
  const isManualLock = useMemo(isManualLockRequested, []);
  const { keepLocked, unlock } = useUILock();
  const { isSidePanelMode } = useExtensionDisplayModes();
  const { closeSidePanel } = useSidePanelUtils();
  const isLocked = useSelector((state: RootState) => state.accountState.isLocked);
  const isPasskeySetupOfferOpen = checkActive(PASSKEY_UNLOCK_SETUP_MODAL);

  // Offered once, and only where biometrics can be set up: never when already enrolled, and not in
  // the side panel, which hands passkey prompts to a separate window - the offer waits for a surface
  // that can host the prompt itself.
  const canOfferPasskeySetup = useMemo(() => {
    return passkeyUnlockAvailable && passkeyUnlockContextLoaded && !passkeyUnlockContext && !passkeySetupPrompted && !isSidePanelMode;
  }, [isSidePanelMode, passkeySetupPrompted, passkeyUnlockAvailable, passkeyUnlockContext, passkeyUnlockContextLoaded]);

  const onUpdate: FormCallbacks<LoginFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setIsDisable(error || empty);
  }, []);

  const onError = useCallback((error: string) => {
    form.setFields([{ name: FormFieldName.PASSWORD, errors: [error] }]);
    (document.getElementById(passwordInputId) as HTMLInputElement)?.select();
  }, [form]);

  const onSubmit: FormCallbacks<LoginFormState>['onFinish'] = useCallback((values: LoginFormState) => {
    const password = values[FormFieldName.PASSWORD];
    const offerPasskeySetup = canOfferPasskeySetup;

    setLoading(true);

    // Both raised before the keyring is asked, so they are in place by the time the unlocked state
    // lands: the local flag stops this screen from opening the wallet itself, the UI lock stops the
    // router from leaving it - the wallet only opens once the offer is answered.
    if (offerPasskeySetup) {
      setIsOfferingPasskeySetup(true);
      keepLocked();
    }

    setTimeout(() => {
      keyringUnlock({ password })
        .then((data) => {
          if (!data.status) {
            offerPasskeySetup && setIsOfferingPasskeySetup(false);
            onError(t(data.errors[0]));
          } else if (offerPasskeySetup) {
            passkeySetupPassword.current = password;
            setPasskeySetupPrompted(true);
            activeModal(PASSKEY_UNLOCK_SETUP_MODAL);
          } else {
            unlock();
          }
        })
        .catch((e: Error) => {
          offerPasskeySetup && setIsOfferingPasskeySetup(false);
          onError(e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);
  }, [activeModal, canOfferPasskeySetup, keepLocked, onError, setPasskeySetupPrompted, t, unlock]);

  const closePasskeySetupOffer = useCallback(() => {
    passkeySetupPassword.current = '';
    inactiveModal(PASSKEY_UNLOCK_SETUP_MODAL);
    setIsOfferingPasskeySetup(false);
    unlock();
  }, [inactiveModal, unlock]);

  // Enrolls right here, the way passkey unlock runs here too. The enrollment is committed by the
  // background the moment the browser prompt completes, so if the prompt takes the popup down with
  // it the next popup finds the keyring open and biometrics on - see the unlock effect below.
  const onEnablePasskeySetup = useCallback(async () => {
    const credential = await registerPasskeyCredential();
    const response = await passkeyUnlockEnroll({ ...credential, password: passkeySetupPassword.current });

    if (!response.status) {
      await forgetPasskeyCredential(credential.credentialId);
      throw new Error(response.errors[0]);
    }

    closePasskeySetupOffer();
  }, [closePasskeySetupOffer]);

  const onReset = useCallback(() => {
    activeModal(RESET_WALLET_MODAL);
  }, [activeModal]);

  const onPasskeyUnlock = useCallback(async () => {
    if (!passkeyUnlockContext || passkeyUnlockLoading) {
      return;
    }

    if (isSidePanelMode) {
      const opened = await windowOpen({
        allowedPath: '/',
        params: { passkeyUnlock: 'true' }
      });

      opened && closeSidePanel();

      return;
    }

    setPasskeyUnlockLoading(true);
    setPasskeyUnlockError('');

    try {
      const evaluation = await evaluatePasskeyCredential(passkeyUnlockContext.credentialId, passkeyUnlockContext.prfInput, passkeyUnlockContext.transports);
      const response = await passkeyUnlockAuthenticate(evaluation);

      if (response.status) {
        unlock();
      } else {
        !response.enrolled && setPasskeyUnlockContext(null);
        setPasskeyUnlockError(t('ui.ACCOUNT.screen.Keyring.Login.biometricUnlockFailed'));
      }
    } catch (error) {
      console.error('Passkey unlock failed', error);

      if (!isPasskeyPromptCancelled(error)) {
        setPasskeyUnlockError(t('ui.ACCOUNT.screen.Keyring.Login.biometricUnlockFailed'));
      }
    } finally {
      setPasskeyUnlockLoading(false);
    }
  }, [closeSidePanel, isSidePanelMode, passkeyUnlockContext, passkeyUnlockLoading, t, unlock]);

  const onClickPasskeyUnlock = useCallback(() => {
    onPasskeyUnlock().catch(console.error);
  }, [onPasskeyUnlock]);

  useEffect(() => {
    supportsPasskeyUnlock().then(setPasskeyUnlockAvailable).catch(console.error);
    passkeyUnlockGetContext()
      .then((context) => {
        setPasskeyUnlockContext(context);
        setPasskeyUnlockContextLoaded(true);
      })
      .catch(console.error);
  }, []);

  // Take the room the browser prompt needs up front, so it is already in place if the user asks
  // for passkey unlock - or accepts the offer to set it up. Released when this screen goes away,
  // which is once the wallet is open.
  useEffect(() => {
    return (passkeyUnlockContext || isPasskeySetupOfferOpen) ? holdPasskeyPromptRoom() : undefined;
  }, [isPasskeySetupOfferOpen, passkeyUnlockContext]);

  // The passkey prompt can destroy a toolbar popup before its response clears the persisted UI
  // lock. A reopened popup must trust the already-unlocked keyring instead of starting passkey again.
  useEffect(() => {
    if (!isManualLock && !isLocked && !isOfferingPasskeySetup) {
      unlock();
    }
  }, [isLocked, isManualLock, isOfferingPasskeySetup, unlock]);

  useEffect(() => {
    const trigger = () => {
      if (isManualLock || !isLocked || passkeyAutoTriggered.current || !passkeyUnlockContext || passkeyUnlockLoading || document.visibilityState !== 'visible' || !document.hasFocus()) {
        return;
      }

      passkeyAutoTriggered.current = true;
      onPasskeyUnlock().catch(console.error);
    };

    trigger();
    window.addEventListener('focus', trigger);

    return () => window.removeEventListener('focus', trigger);
  }, [isLocked, isManualLock, onPasskeyUnlock, passkeyUnlockContext, passkeyUnlockLoading]);

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
                  {t('ui.ACCOUNT.screen.Keyring.Login.unlockWithBiometrics')}
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
          <PasskeyUnlockSetupModal
            onEnable={onEnablePasskeySetup}
            onSkip={closePasskeySetupOffer}
          />
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
