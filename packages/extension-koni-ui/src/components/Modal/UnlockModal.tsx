// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PasskeyUnlockContext } from '@subwallet/extension-base/background/KoniTypes';
import { useExtensionDisplayModes, useSidePanelUtils, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { keyringUnlock, passkeyUnlockAuthenticate, passkeyUnlockGetContext, windowOpen } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { evaluatePasskeyCredential, isPasskeyPromptCancelled } from '@subwallet/extension-koni-ui/utils/passkeyUnlock';
import { Button, Form, Icon, Input, ModalContext, SwIconProps, SwModal } from '@subwallet/react-ui';
import { Fingerprint } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import useFocusById from '../../hooks/form/useFocusById';

export type ActionItemType = {
  key: string,
  icon: SwIconProps['phosphorIcon'],
  iconBackgroundColor: string,
  title: string,
  onClick?: () => void
};

type Props = ThemeProps

export const UNLOCK_MODAL_ID = 'unlock-modal';

const passwordInputId = 'login-password';

enum FormFieldName {
  PASSWORD = 'password'
}

interface LoginFormState {
  [FormFieldName.PASSWORD]: string;
}

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { checkActive, inactiveModal } = useContext(ModalContext);
  const isLocked = useSelector((state: RootState) => state.accountState.isLocked);
  const [form] = Form.useForm<LoginFormState>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [passkeyUnlockLoading, setPasskeyUnlockLoading] = useState(false);
  const [passkeyUnlockContext, setPasskeyUnlockContext] = useState<PasskeyUnlockContext | null>(null);
  const { isSidePanelMode } = useExtensionDisplayModes();
  const { closeSidePanel } = useSidePanelUtils();

  const closeModal = useCallback(
    () => {
      form.resetFields();
      inactiveModal(UNLOCK_MODAL_ID);
    },
    [form, inactiveModal]
  );

  // Auto close modal if unlocked
  useEffect(() => {
    if (!isLocked && checkActive(UNLOCK_MODAL_ID)) {
      inactiveModal(UNLOCK_MODAL_ID);
    }
  }, [checkActive, inactiveModal, isLocked]);

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
            onError(data.errors[0]);
          }
        })
        .catch((e: Error) => {
          onError(e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);
  }, [onError]);

  const onPasskeyUnlock = useCallback(async () => {
    if (!passkeyUnlockContext) {
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

    try {
      const evaluation = await evaluatePasskeyCredential(passkeyUnlockContext.credentialId, passkeyUnlockContext.prfInput, passkeyUnlockContext.transports);
      const response = await passkeyUnlockAuthenticate(evaluation);

      if (!response.status) {
        !response.enrolled && setPasskeyUnlockContext(null);
        onError(t('ui.ACCOUNT.screen.Keyring.Login.passkeyUnlockFailed'));
      }
    } catch (error) {
      if (!isPasskeyPromptCancelled(error)) {
        console.log('Passkey unlock error:', error);
        onError(t('ui.ACCOUNT.screen.Keyring.Login.passkeyUnlockFailed'));
      }
    } finally {
      setPasskeyUnlockLoading(false);
    }
  }, [closeSidePanel, isSidePanelMode, onError, passkeyUnlockContext, t]);

  const onClickPasskeyUnlock = useCallback(() => {
    onPasskeyUnlock().catch(console.error);
  }, [onPasskeyUnlock]);

  useEffect(() => {
    passkeyUnlockGetContext().then(setPasskeyUnlockContext).catch(console.error);
  }, []);

  useFocusById(passwordInputId);

  return (
    <SwModal
      className={className}
      id={UNLOCK_MODAL_ID}
      onCancel={closeModal}
      title={t('ui.ACCOUNT.components.Modal.Unlock.enterPasswordTitle')}
      zIndex={9999}
    >
      <div className='body-container'>
        {!!passkeyUnlockContext && (
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
        )}
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
                message: t('ui.ACCOUNT.components.Modal.Unlock.passwordIsRequired'),
                required: true
              }
            ]}
            statusHelpAsTooltip={true}
          >
            <Input.Password
              containerClassName='password-input'
              id={passwordInputId}
              placeholder={t('ui.ACCOUNT.components.Modal.Unlock.password')}
            />
          </Form.Item>
          <Form.Item>
            <Button
              block={true}
              disabled={isDisable}
              htmlType='submit'
              loading={loading}
            >
              {t('ui.ACCOUNT.components.Modal.Unlock.unlock')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </SwModal>
  );
}

export const UnlockModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.passkey-unlock-button': {
      marginBottom: token.margin
    },

    '.__action-item + .__action-item': {
      marginTop: token.marginXS
    }
  });
});
