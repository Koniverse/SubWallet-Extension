// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateRecipientAddress } from '@subwallet/extension-base/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { UNSUPPORTED_SUBSTRATE_PROXY_NETWORKS } from '@subwallet/extension-base/services/substrate-proxy-service/constant';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { AddressInputNew, ChainSelector, HiddenInput, NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useCreateGetChainAndExcludedTokenByAccountProxy, useGetAccountProxyByAddress, useGetBalance, useGetNativeTokenBasicInfo, useHandleSubmitTransaction, usePreCheckAction, useRestoreTransaction, useSelector, useSetCurrentPage, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { useGetSubstrateProxyAccountsInfoByAddress } from '@subwallet/extension-koni-ui/hooks/substrateProxyAccount/useGetSubstrateProxyAccountsInfoByAddress';
import { handleAddSubstrateProxyAccount } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AddSubstrateProxyAccountParams, ChainItemType, FormCallbacks, FormFieldData, SendNftParams, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, findAccountByAddress, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import CN from 'classnames';
import { TreeStructure } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { SubstrateProxyTypeSelector } from '../../parts/SubstrateProxyTypeSelector';

type Props = ThemeProps;

const hiddenFields: Array<keyof SendNftParams> = ['asset', 'fromAccountProxy', 'from'];

const Component = (): React.ReactElement<Props> => {
  useSetCurrentPage('/transaction/add-proxy');
  const { defaultData, persistData, setBackProps } = useTransactionContext<AddSubstrateProxyAccountParams>();
  const { token } = useTheme() as Theme;
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((state) => state.chainStore);
  const [form] = Form.useForm<AddSubstrateProxyAccountParams>();
  const { t } = useTranslation();
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const navigate = useNavigate();
  const [isDisable, setIsDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const formDefault = useMemo<AddSubstrateProxyAccountParams>(() => {
    return {
      ...defaultData
    };
  }, [defaultData]);

  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);

  const { error, isLoading: balanceLoading } = useGetBalance(chainValue, fromValue);
  const onPreCheck = usePreCheckAction(fromValue);
  const proxyInfo = useGetSubstrateProxyAccountsInfoByAddress(fromValue, chainValue);
  const nativeToken = useGetNativeTokenBasicInfo(chainValue);

  const accountProxy = useGetAccountProxyByAddress(fromValue);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  const { allowedChains } = useMemo(() => {
    return getChainAndExcludedTokenByAccountProxy(accountProxy);
  }, [accountProxy, getChainAndExcludedTokenByAccountProxy]);

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    Object.values(chainInfoMap).forEach((c) => {
      if (c.substrateInfo !== null && allowedChains.includes(c.slug) && !UNSUPPORTED_SUBSTRATE_PROXY_NETWORKS.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoMap]);

  const onFieldsChange: FormCallbacks<AddSubstrateProxyAccountParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields, ['--asset', '--fromAccountProxy']);

    const values = convertFieldToObject<AddSubstrateProxyAccountParams>(allFields);

    setIsDisable(empty || error);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<AddSubstrateProxyAccountParams>['onFinish'] = useCallback((values: AddSubstrateProxyAccountParams) => {
    setLoading(true);

    handleAddSubstrateProxyAccount({
      address: values.from,
      chain: values.chain,
      substrateProxyAddress: values.substrateProxyAddress,
      substrateProxyType: values.substrateProxyType,
      substrateProxyDeposit: proxyInfo.substrateProxyDeposit
    })
      .then(onSuccess)
      .catch(onError)
      .finally(() => {
        setLoading(false);
      });
  }, [onError, onSuccess, proxyInfo]);

  const validateProxyAddress = useCallback((rule: Rule, _recipientAddress: string): Promise<void> => {
    const { chain, from } = form.getFieldsValue();
    const destChainInfo = chainInfoMap[chain];
    const account = findAccountByAddress(accounts, _recipientAddress);

    return validateRecipientAddress({ srcChain: chain,
      destChainInfo,
      fromAddress: from,
      toAddress: _recipientAddress,
      account,
      actionType: ActionType.SUBSTRATE_PROXY_ACCOUNT,
      autoFormatValue: false,
      allowLedgerGenerics: ledgerGenericAllowNetworks })
      .catch((err: unknown) => {
        const msg = (err instanceof Error ? err.message : String(err ?? 'Unknown error'))
          .replace(/recipient/gi, (m) => m[0] === m[0].toUpperCase() ? 'Proxy' : 'proxy')
          .replace(/sender/gi, (m) => m[0] === m[0].toUpperCase() ? 'Proxied' : 'proxied');

        throw new Error(msg);
      });
  }, [accounts, chainInfoMap, form, ledgerGenericAllowNetworks]);

  const validateProxyType = useCallback(async (rule: Rule, _proxyType: string) => {
    const { substrateProxyAddress } = form.getFieldsValue();

    if (!proxyInfo.substrateProxyAccounts.length) {
      return Promise.resolve();
    }

    const isInvalidProxy = proxyInfo.substrateProxyAccounts.some(
      (p) => isSameAddress(substrateProxyAddress, p.substrateProxyAddress) && p.substrateProxyType === _proxyType
    );

    if (isInvalidProxy) {
      return Promise.reject(new Error(t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccountAccount.substrateProxyTypeNotAuthorized')));
    }

    return Promise.resolve();
  }, [form, proxyInfo.substrateProxyAccounts, t]);

  useRestoreTransaction(form);

  useEffect(() => {
    setIsBalanceReady(!balanceLoading && !error);
  }, [error, balanceLoading]);

  useEffect(() => {
    if (accountProxy?.id) {
      setBackProps((prevState) => ({
        ...prevState,
        onClick: () => {
          navigate(`/accounts/detail/${accountProxy?.id}`);
        }
      }));
    }

    return () => {
      setBackProps((prevState) => ({
        ...prevState,
        onClick: null
      }));
    };
  }, [accountProxy?.id, navigate, setBackProps]);

  return (
    <>
      <TransactionContent className={CN('-transaction-content')}>
        <Form
          className={'form-container form-space-sm'}
          form={form}
          initialValues={formDefault}
          onFieldsChange={onFieldsChange}
          onFinish={onSubmit}
        >
          <HiddenInput fields={hiddenFields} />

          <Form.Item name={'chain'}>
            <ChainSelector
              disabled={!isBalanceReady}
              items={chainItems}
              label={t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccount.network')}
            />
          </Form.Item>

          <Form.Item
            dependencies={['substrateProxyAddress']}
            name={'substrateProxyAddress'}
            rules={[
              {
                validator: validateProxyAddress
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger={false}
          >
            <AddressInputNew
              actionType={ActionType.SUBSTRATE_PROXY_ACCOUNT}
              chainSlug={chainValue}
              dropdownHeight={227}
              label={t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccount.substrateProxyAccount')}
              placeholder={t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccount.enterAddress')}
              saveAddress={true}
              showAddressBook={true}
              showScanner={true}
            />
          </Form.Item>

          <Form.Item
            name={'substrateProxyType'}
            rules={[
              {
                validator: validateProxyType
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger={false}
          >
            <SubstrateProxyTypeSelector
              label={t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccount.proxyType')}
            />
          </Form.Item>
        </Form>
        <div className={CN('proxy-deposit')}>
          <NumberDisplay
            decimal={nativeToken?.decimals || 0}
            decimalOpacity={0.45}
            intOpacity={0.45}
            prefix={t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccount.proxyDeposit') + ': '}
            size={token.fontSize}
            suffix={nativeToken?.symbol}
            unitOpacity={0.45}
            value={proxyInfo.substrateProxyDeposit}
          />
        </div>
      </TransactionContent>
      <TransactionFooter
        className={'add-proxy-transaction-footer'}
      >
        <Button
          disabled={!isBalanceReady || isDisable}
          icon={(
            <Icon
              phosphorIcon={TreeStructure}
              weight={'fill'}
            />
          )}
          loading={balanceLoading || loading}
          onClick={onPreCheck(form.submit, ExtrinsicType.ADD_SUBSTRATE_PROXY_ACCOUNT)}
        >
          {t('ui.TRANSACTION.screen.Transaction.AddSubstrateProxyAccount.addProxy')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const AddSubstrateProxyAccount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.proxy-deposit': {
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      color: token.colorTextLight4
    }
  };
});

export default AddSubstrateProxyAccount;
