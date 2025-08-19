// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, GovAmountInput, GovVoteConvictionSlider, HiddenInput } from '@subwallet/extension-koni-ui/components';
import { useCoreCreateReformatAddress, useDefaultNavigate, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { VoteButton } from '@subwallet/extension-koni-ui/Popup/Transaction/variants/Governance/parts/VoteButton';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, FormCallbacks, FormFieldData, GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Form } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TransactionContent, TransactionFooter } from '../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovReferendumVoteParams> = ['chain', 'referendumId'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  // @ts-ignore
  const { className = '', isAllAccount, targetAccountProxy } = props;
  const { t } = useTranslation();
  const { defaultData, persistData } = useTransactionContext<GovReferendumVoteParams>();
  const formDefault = useMemo((): GovReferendumVoteParams => ({ ...defaultData }), [defaultData]);
  const [form] = Form.useForm<GovReferendumVoteParams>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const getReformatAddress = useCoreCreateReformatAddress();
  const { accountProxies } = useSelector((state: RootState) => state.accountState);

  const { chainInfoMap } = useSelector((root) => root.chainStore);

  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach((a) => {
        const address = getReformatAddress(a, chainInfo);

        if (address) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address
          });
        }
      });
    };

    if (isAccountAll(targetAccountProxy.id)) {
      accountProxies.forEach((ap) => {
        if (isAccountAll(ap.id)) {
          return;
        }

        if ([AccountProxyType.READ_ONLY].includes(ap.accountType)) {
          return;
        }

        updateResult(ap);
      });
    } else {
      updateResult(targetAccountProxy);
    }

    return result;
  }, [accountProxies, chainInfoMap, chainValue, getReformatAddress, targetAccountProxy]);

  const onFieldsChange: FormCallbacks<GovReferendumVoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // // TODO: field change
    const { empty, error } = simpleCheckForm(allFields, ['--asset']);

    const values = convertFieldToObject<GovReferendumVoteParams>(allFields);

    setIsDisable(empty || error);

    console.log('values', values);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovReferendumVoteParams>['onFinish'] = useCallback((values: GovReferendumVoteParams) => {
    setLoading(true);
  }, []);

  return (
    <>
      <TransactionContent className={CN(`${className} -transaction-content`)}>
        <Form
          className={'form-container form-space-sm'}
          form={form}
          initialValues={formDefault}
          onFieldsChange={onFieldsChange}
          onFinish={onSubmit}
        >

          <HiddenInput fields={hideFields} />
          <Form.Item
            name={'from'}
          >
            <AccountAddressSelector
              items={accountAddressItems}
              label={`${t('From')}:`}
              labelStyle={'horizontal'}
            />
          </Form.Item>

          <Form.Item
            name={'amount'}
          >
            <GovAmountInput
              decimals={10}
              label={t('Amount')}
              logoKey={'polkadot'}
              tokenSymbol={'DOT'}
              topRightPart={'1231231'}
            />
          </Form.Item>

          <Form.Item
            name={'conviction'}
          >
            <GovVoteConvictionSlider />
          </Form.Item>

        </Form>
      </TransactionContent>

      <TransactionFooter className={`${className} -transaction-footer`}>
        <div className={'__vote-buttons-container'}>
          <VoteButton
            disabled={isDisable}
            loading={loading}
            type={'nay'}
          />
          <VoteButton
            disabled={isDisable}
            loading={loading}
            type={'abstain'}
          />
          <VoteButton
            disabled={isDisable}
            loading={loading}
            type={'split'}
          />
          <VoteButton
            disabled={isDisable}
            loading={loading}
            type={'aye'}
          />
        </div>
      </TransactionFooter>
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const { defaultData } = useTransactionContext<GovReferendumVoteParams>();
  const { goHome } = useDefaultNavigate();
  const { accountProxies, isAllAccount } = useSelector((state) => state.accountState);

  const targetAccountProxy = useMemo(() => {
    return accountProxies.find((ap) => {
      if (!defaultData.fromAccountProxy) {
        return isAccountAll(ap.id);
      }

      return ap.id === defaultData.fromAccountProxy;
    });
  }, [accountProxies, defaultData.fromAccountProxy]);

  const isNotAllowed = !targetAccountProxy;

  useEffect(() => {
    if (isNotAllowed) {
      goHome();
    }
  }, [goHome, isNotAllowed]);

  if (isNotAllowed) {
    return (
      <></>
    );
  }

  return (
    <Component
      className={className}
      isAllAccount={isAllAccount}
      targetAccountProxy={targetAccountProxy}
    />
  );
};

const ReferendumStandardVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    '.__vote-buttons-container': {
      display: 'flex',
      borderRadius: 34,
      padding: token.paddingXS,
      justifyContent: 'space-between',
      backgroundColor: 'rgba(33, 33, 33, 0.8)',
      gap: token.sizeSM,
      flex: 1,

      '.ant-btn': {
        flexGrow: 0
      }
    }
  };
});

export default ReferendumStandardVote;
