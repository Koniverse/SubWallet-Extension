// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateRecipientAddress } from '@subwallet/extension-base/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { UNSUPPORTED_PROXY_NETWORKS } from '@subwallet/extension-base/services/proxy-service/constant';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { AddressInputNew, ChainSelector, HiddenInput, NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useCreateGetChainAndExcludedTokenByAccountProxy, useGetAccountProxyByAddress, useGetBalance, useGetNativeTokenBasicInfo, useHandleSubmitTransaction, usePreCheckAction, useRestoreTransaction, useSelector, useSetCurrentPage, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { useGetProxyAccountsInfoByAddress } from '@subwallet/extension-koni-ui/hooks/proxyAccount/useGetProxyAccountsInfoByAddress';
import { handleAddProxy } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { TransactionContent, TransactionFooter } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AddProxyParams, ChainItemType, FormCallbacks, FormFieldData, SendNftParams, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, findAccountByAddress, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import CN from 'classnames';
import { TreeStructure } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { ProxyTypeSelector } from '../../parts/ProxyTypeSelector';

type Props = ThemeProps;

const hiddenFields: Array<keyof SendNftParams> = ['asset', 'fromAccountProxy', 'from'];

const Component = (): React.ReactElement<Props> => {
  useSetCurrentPage('/transaction/add-proxy');
  const { defaultData, persistData, setBackProps } = useTransactionContext<AddProxyParams>();
  const { token } = useTheme() as Theme;
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((state) => state.chainStore);
  const [form] = Form.useForm<AddProxyParams>();
  const { t } = useTranslation();
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const navigate = useNavigate();
  const [isDisable, setIsDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const formDefault = useMemo<AddProxyParams>(() => {
    return {
      ...defaultData
    };
  }, [defaultData]);

  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);

  const { error, isLoading: balanceLoading } = useGetBalance(chainValue, fromValue);
  const onPreCheck = usePreCheckAction(fromValue);
  const proxyInfo = useGetProxyAccountsInfoByAddress(fromValue, chainValue);
  const nativeToken = useGetNativeTokenBasicInfo(chainValue);

  const accountProxy = useGetAccountProxyByAddress(fromValue);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  const { allowedChains } = useMemo(() => {
    return getChainAndExcludedTokenByAccountProxy(accountProxy);
  }, [accountProxy, getChainAndExcludedTokenByAccountProxy]);

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    Object.values(chainInfoMap).forEach((c) => {
      if (c.substrateInfo !== null && allowedChains.includes(c.slug) && !UNSUPPORTED_PROXY_NETWORKS.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoMap]);

  const onFieldsChange: FormCallbacks<AddProxyParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields, ['--asset', '--fromAccountProxy']);

    const values = convertFieldToObject<AddProxyParams>(allFields);

    setIsDisable(empty || error);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<AddProxyParams>['onFinish'] = useCallback((values: AddProxyParams) => {
    setLoading(true);

    handleAddProxy({
      address: values.from,
      chain: values.chain,
      proxyAddress: values.proxyAddress,
      proxyType: values.proxyType,
      proxyDeposit: proxyInfo.proxyDeposit
    })
      .then(onSuccess)
      .catch(onError)
      .finally(() => {
        setLoading(false);
      });
  }, [onError, onSuccess, proxyInfo.proxyDeposit]);

  const validateProxyAddress = useCallback((rule: Rule, _recipientAddress: string): Promise<void> => {
    const { chain, from } = form.getFieldsValue();
    const destChainInfo = chainInfoMap[chain];
    const account = findAccountByAddress(accounts, _recipientAddress);

    return validateRecipientAddress({ srcChain: chain,
      destChainInfo,
      fromAddress: from,
      toAddress: _recipientAddress,
      account,
      actionType: ActionType.PROXY,
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
    const { proxyAddress } = form.getFieldsValue();

    if (!proxyInfo.proxies.length) {
      return Promise.resolve();
    }

    const isInvalidProxy = proxyInfo.proxies.some(
      (p) => isSameAddress(proxyAddress, p.proxyAddress) && p.proxyType === _proxyType
    );

    if (isInvalidProxy) {
      return Promise.reject(new Error(t('ui.TRANSACTION.screen.Transaction.AddProxy.proxyTypeNotAuthorized')));
    }

    return Promise.resolve();
  }, [form, proxyInfo.proxies, t]);

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
              label={t('ui.TRANSACTION.screen.Transaction.AddProxy.network')}
            />
          </Form.Item>

          <Form.Item
            dependencies={['proxyAddress']}
            name={'proxyAddress'}
            rules={[
              {
                validator: validateProxyAddress
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger={false}
          >
            <AddressInputNew
              actionType={ActionType.PROXY}
              chainSlug={chainValue}
              dropdownHeight={227}
              label={t('ui.TRANSACTION.screen.Transaction.AddProxy.proxyAccount')}
              placeholder={t('ui.TRANSACTION.screen.Transaction.AddProxy.enterAddress')}
              saveAddress={true}
              showAddressBook={true}
              showScanner={true}
            />
          </Form.Item>

          <Form.Item
            name={'proxyType'}
            rules={[
              {
                validator: validateProxyType
              }
            ]}
            statusHelpAsTooltip={true}
            validateTrigger={false}
          >
            <ProxyTypeSelector
              label={t('ui.TRANSACTION.screen.Transaction.AddProxy.proxyType')}
            />
          </Form.Item>
        </Form>
        <div className={CN('proxy-deposit')}>
          <NumberDisplay
            decimal={nativeToken?.decimals || 0}
            decimalOpacity={0.45}
            intOpacity={0.45}
            prefix={t('ui.TRANSACTION.screen.Transaction.AddProxy.proxyDeposit') + ': '}
            size={token.fontSize}
            suffix={nativeToken?.symbol}
            unitOpacity={0.45}
            value={proxyInfo.proxyDeposit}
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
          onClick={onPreCheck(form.submit, ExtrinsicType.ADD_PROXY)}
        >
          {t('ui.TRANSACTION.screen.Transaction.AddProxy.addProxy')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const AddProxy = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.proxy-deposit': {
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      color: token.colorTextLight4
    }
  };
});

export default AddProxy;
