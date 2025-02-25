// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSameAddress } from '@subwallet/extension-base/utils';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { createAccountExternalV2, validateAccountName } from '@subwallet/extension-web-ui/messaging';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { convertFieldToObject, readOnlyScan, simpleCheckForm } from '@subwallet/extension-web-ui/utils';
import { Button, Form, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { Wallet } from 'phosphor-react';
import { Callbacks, FieldData, RuleObject } from 'rc-field-form/lib/interface';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  termModalHandler: (action: VoidFunction) => void;
  markTermAsRead: VoidFunction;
};

interface WatchOnlyAccountInput {
  address?: string;
}

const Component: React.FC<Props> = (props: Props) => {
  const { markTermAsRead, termModalHandler } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm<WatchOnlyAccountInput>();
  const formDefault: WatchOnlyAccountInput = {
    address: ''
  };

  const { accounts } = useSelector((root: RootState) => root.accountState);
  const [isAttachReadonlyAccountButtonDisable, setIsAttachReadonlyAccountButtonDisable] = useState(true);
  const [isAccountNameInputVisible, setIsAccountNameInputVisible] = useState(false);
  const navigate = useNavigate();

  const [reformatAttachAddress, setReformatAttachAddress] = useState('');

  const handleResult = useCallback((val: string) => {
    const result = readOnlyScan(val);

    if (result) {
      setReformatAttachAddress(result.content);
    }
  }, []);

  const [loading, setLoading] = useState(false);

  const onFieldsChange: Callbacks<WatchOnlyAccountInput>['onFieldsChange'] =
    useCallback(
      (changes: FieldData[], allFields: FieldData[]) => {
        const { empty, error } = simpleCheckForm(allFields);

        setIsAttachReadonlyAccountButtonDisable(error || empty);

        const changeMap = convertFieldToObject<WatchOnlyAccountInput>(changes);

        if (changeMap.address) {
          handleResult(changeMap.address);
        }
      },
      [handleResult]
    );

  const accountNameValidator = useCallback(async (rule: RuleObject, value: string) => {
    if (value) {
      try {
        const { isValid } = await validateAccountName({ name: value });

        if (!isValid) {
          return Promise.reject(t('Account name already in use'));
        }
      } catch (e) {
        return Promise.reject(t('Account name invalid'));
      }
    }

    return Promise.resolve();
  }, [t]);

  const accountAddressValidator = useCallback(
    (rule: RuleObject, value: string) => {
      if (!value || !value.trim()) {
        return Promise.reject(t('Account address is required'));
      }

      const result = readOnlyScan(value);

      if (result) {
        // For each account, check if the address already exists return promise reject
        for (const account of accounts) {
          if (isSameAddress(account.address, result.content)) {
            setReformatAttachAddress('');

            return Promise.reject(t('Account already exists'));
          }
        }
      } else {
        setReformatAttachAddress('');

        if (value !== '') {
          return Promise.reject(t('Invalid address'));
        }
      }

      setIsAccountNameInputVisible(true);

      return Promise.resolve();
    },
    [accounts, t]
  );

  const afterConfirmTermToAttachReadonlyAccount = useCallback(() => {
    setLoading(true);
    const accountName = form.getFieldValue('name') as string;

    if (reformatAttachAddress) {
      createAccountExternalV2({
        name: accountName,
        address: reformatAttachAddress,
        genesisHash: '',
        isAllowed: true,
        isReadOnly: true
      })
        .then((errors) => {
          if (errors.length) {
            form.setFields([
              { name: 'address', errors: errors.map((e) => e.message) }
            ]);
          } else {
            navigate('/create-done');
          }
        })
        .catch((error: Error) => {
          form.setFields([{ name: 'address', errors: [error.message] }]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    markTermAsRead();
  }, [form, reformatAttachAddress, markTermAsRead, navigate]);

  const onSubmitAttachReadonlyAccount = useCallback(() => {
    termModalHandler(afterConfirmTermToAttachReadonlyAccount);
  }, [afterConfirmTermToAttachReadonlyAccount, termModalHandler]);

  return (
    <>
      <Form
        className={CN('add-wallet-container')}
        form={form}
        initialValues={formDefault}
        onFieldsChange={onFieldsChange}
        onFinish={onSubmitAttachReadonlyAccount}
      >
        <div className='form-title lg-text'>{t('Watch any wallet')}?</div>
        <Form.Item
          name={'address'}
          rules={[
            {
              message: t('Account address is required'),
              required: true
            },
            {
              validator: accountAddressValidator
            }
          ]}
          statusHelpAsTooltip={true}
        >
          <Input
            placeholder={t('Enter address')}
            prefix={<Wallet size={24} />}
            type={'text'}
          />
        </Form.Item>

        <Form.Item
          className={CN('__account-name-field')}
          hidden={!isAccountNameInputVisible}
          name={'name'}
          rules={[{
            message: t('Account name is required'),
            transform: (value: string) => value.trim(),
            required: true
          },
          {
            validator: accountNameValidator
          }

          ]}
          statusHelpAsTooltip={true}
        >
          <Input
            className='__account-name-input'
            disabled={loading}
            label={t('Account name')}
            placeholder={t('Enter the account name')}
          />
        </Form.Item>
        <Button
          block
          className='add-wallet-button'
          disabled={isAttachReadonlyAccountButtonDisable}
          loading={loading}
          onClick={form.submit}
          schema='primary'
        >
          {t('Add watch-only wallet')}
        </Button>
      </Form>
    </>
  );
};

export const WelcomeWatchOnlyAccountForm = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
  };
});
