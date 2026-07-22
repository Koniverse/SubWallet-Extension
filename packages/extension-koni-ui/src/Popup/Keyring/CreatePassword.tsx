// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import { AlertBox, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import InfoIcon from '@subwallet/extension-koni-ui/components/Icon/InfoIcon';
import { TERMS_OF_SERVICE_URL } from '@subwallet/extension-koni-ui/constants/common';
import { REQUEST_CREATE_PASSWORD_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { DEFAULT_ROUTER_PATH } from '@subwallet/extension-koni-ui/constants/router';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useFocusFormItem from '@subwallet/extension-koni-ui/hooks/form/useFocusFormItem';
import { keyringChangeMasterPassword } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isNoAccount } from '@subwallet/extension-koni-ui/utils/account/account';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils/form/form';
import { renderBaseConfirmPasswordRules, renderBasePasswordRules } from '@subwallet/extension-koni-ui/utils/form/validators/password';
import { Checkbox, Form, Icon, Input, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft, CheckCircle } from 'phosphor-react';
import { Callbacks, FieldData, RuleObject } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

enum FormFieldName {
  PASSWORD = 'password',
  CONFIRM_PASSWORD = 'confirm_password',
  CONFIRM_CHECKBOX = 'confirm_checkbox'
}

interface CreatePasswordFormState {
  [FormFieldName.PASSWORD]: string;
  [FormFieldName.CONFIRM_PASSWORD]: string;
  [FormFieldName.CONFIRM_CHECKBOX]: boolean;
}

const FooterIcon = (
  <Icon
    phosphorIcon={CheckCircle}
    weight='fill'
  />
);

const modalId = 'create-password-instruction-modal';
const formName = 'create-password-form';

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const previousInfo = useLocation().state as { prevPathname: string, prevSearch?: string, prevState: any };

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const [noAccount] = useState(isNoAccount(accounts));

  const notification = useNotification();

  const passwordRules = useMemo(() => renderBasePasswordRules(t('ui.ACCOUNT.screen.Keyring.CreatePassword.password'), t), [t]);
  const confirmPasswordRules = useMemo(() => renderBaseConfirmPasswordRules(FormFieldName.PASSWORD, t), [t]);
  const checkBoxValidator = useCallback((rule: RuleObject, value: boolean): Promise<void> => {
    if (!value) {
      return Promise.reject(new Error(t('ui.ACCOUNT.screen.Keyring.CreatePassword.checkboxIsRequired')));
    }

    return Promise.resolve();
  }, [t]);
  const [form] = Form.useForm<CreatePasswordFormState>();
  const [isDisabled, setIsDisable] = useState(true);

  const [loading, setLoading] = useState(false);

  const onComplete = useCallback(() => {
    if (previousInfo?.prevPathname) {
      const searchParams = previousInfo.prevSearch ? `?${previousInfo.prevSearch}` : '';

      navigate(`${previousInfo.prevPathname}${searchParams}`, { state: previousInfo.prevState as unknown });
    } else {
      navigate(DEFAULT_ROUTER_PATH);
    }
  }, [navigate, previousInfo?.prevPathname, previousInfo?.prevSearch, previousInfo?.prevState]);

  const onSubmit: Callbacks<CreatePasswordFormState>['onFinish'] = useCallback((values: CreatePasswordFormState) => {
    const password = values[FormFieldName.PASSWORD];
    const checkBox = values[FormFieldName.CONFIRM_CHECKBOX];

    if (password && checkBox) {
      setLoading(true);
      keyringChangeMasterPassword({
        createNew: true,
        newPassword: password
      }).then((res) => {
        if (!res.status) {
          notification({
            message: res.errors[0],
            type: 'error'
          });
        } else {
          onComplete();
        }
      }).catch((e: Error) => {
        notification({
          message: e.message,
          type: 'error'
        });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [onComplete, notification]);

  const onUpdate: Callbacks<CreatePasswordFormState>['onFieldsChange'] = useCallback((changedFields: FieldData[], allFields: FieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setIsDisable(error || empty);
  }, []);

  const onChangePassword = useCallback(() => {
    form.resetFields([FormFieldName.CONFIRM_PASSWORD]);
  }, [form]);

  const openModal = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  const closeModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  useEffect(() => {
    if (!noAccount) {
      activeModal(REQUEST_CREATE_PASSWORD_MODAL);
    }
  }, [activeModal, noAccount]);

  useFocusFormItem(form, FormFieldName.PASSWORD, !checkActive(REQUEST_CREATE_PASSWORD_MODAL));

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        rightFooterButton={{
          children: t('ui.ACCOUNT.screen.Keyring.CreatePassword.continue'),
          onClick: form.submit,
          loading: loading,
          disabled: isDisabled,
          icon: FooterIcon
        }}
        subHeaderIcons={[
          {
            icon: <InfoIcon />,
            onClick: openModal
          }
        ]}
        title={t('ui.ACCOUNT.screen.Keyring.CreatePassword.createAPassword')}
      >
        <div className='body-container'>
          <div className='notify'>
            {t('ui.ACCOUNT.screen.Keyring.CreatePassword.passwordForThisBrowserOnly')}
          </div>
          <Form
            form={form}
            initialValues={{
              [FormFieldName.PASSWORD]: '',
              [FormFieldName.CONFIRM_PASSWORD]: '',
              [FormFieldName.CONFIRM_CHECKBOX]: ''
            }}
            name={formName}
            onFieldsChange={onUpdate}
            onFinish={onSubmit}
          >
            <Form.Item
              name={FormFieldName.PASSWORD}
              rules={passwordRules}
              statusHelpAsTooltip={true}
            >
              <Input.Password
                onChange={onChangePassword}
                placeholder={t('ui.ACCOUNT.screen.Keyring.CreatePassword.enterPassword')}
                type='password'
              />
            </Form.Item>
            <Form.Item
              name={FormFieldName.CONFIRM_PASSWORD}
              rules={confirmPasswordRules}
              statusHelpAsTooltip={true}
            >
              <Input.Password
                placeholder={t('ui.ACCOUNT.screen.Keyring.CreatePassword.confirmPassword')}
                type='password'
              />
            </Form.Item>
            <Form.Item>
              <div className={'annotation'}>
                {t('ui.ACCOUNT.screen.Keyring.CreatePassword.passwordRequirements')}
              </div>
            </Form.Item>
            <Form.Item
              className={'form-checkbox'}
              name={FormFieldName.CONFIRM_CHECKBOX}
              rules={[
                {
                  validator: checkBoxValidator
                }
              ]}
              statusHelpAsTooltip={true}
              valuePropName={'checked'}
            >
              <Checkbox
                className={'checkbox'}
              >
                <Trans
                  components={{
                    highlight: (
                      <a
                        className='link'
                        href={TERMS_OF_SERVICE_URL}
                        rel='noopener noreferrer'
                        style={{ textDecoration: 'underline' }}
                        target='_blank'
                      />
                    )
                  }}
                  i18nKey={detectTranslate('ui.ACCOUNT.screen.Keyring.CreatePassword.understandPasswordNotRecoverable')}
                />
              </Checkbox>
            </Form.Item>
          </Form>
          <SwModal
            closeIcon={(
              <Icon
                phosphorIcon={CaretLeft}
                size='sm'
              />
            )}
            id={modalId}
            onCancel={closeModal}
            rightIconProps={{
              icon: <InfoIcon />
            }}
            title={t('ui.ACCOUNT.screen.Keyring.CreatePassword.instructions')}
            wrapClassName={className}
          >
            <div className='instruction-container'>
              <AlertBox
                description={t('ui.ACCOUNT.screen.Keyring.CreatePassword.walletAutoLockInfo')}
                title={t('ui.ACCOUNT.screen.Keyring.CreatePassword.whyNeedPassword')}
              />
              <AlertBox
                description={t('ui.ACCOUNT.screen.Keyring.CreatePassword.passwordNotRecoverable')}
                title={t('ui.ACCOUNT.screen.Keyring.CreatePassword.canRecoverPassword')}
              />
            </div>
          </SwModal>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const CreatePassword = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.body-container': {
      padding: `0 ${token.padding}px`,
      textAlign: 'center',

      '.page-icon': {
        display: 'flex',
        justifyContent: 'center',
        marginTop: token.margin,
        '--page-icon-color': token.colorSecondary
      },

      '.notify': {
        marginTop: token.margin,
        marginBottom: token.margin * 2,
        fontWeight: token.fontWeightStrong,
        fontSize: token.fontSize,
        lineHeight: token.lineHeightHeading3,
        color: token.colorWarningText
      },

      '.annotation': {
        fontSize: token.fontSizeSM,
        color: token.colorTextLight5,
        textAlign: 'left'
      },
      '.form-checkbox': {
        '.checkbox': {
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center'
        }
      }
    },

    '.ant-form-item:last-child': {
      marginBottom: 0
    },

    '.instruction-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    }
  };
});

export default CreatePassword;
