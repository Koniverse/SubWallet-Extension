// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { UnlockVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, HiddenInput, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_UNLOCK_VOTE_PARAMS, GOV_UNLOCK_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useCoreCreateReformatAddress, useDefaultNavigate, useGetNativeTokenBasicInfo, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleUnlockVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, FormCallbacks, FormFieldData, GovUnlockVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, simpleCheckForm, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { TransactionContent, TransactionFooter } from '../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovUnlockVoteParams> = ['chain', 'amount', 'referendumIds', 'tracks'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { className = '', targetAccountProxy } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, setBackProps } = useTransactionContext<GovUnlockVoteParams>();
  const [govUnlockVoteStorage, setGovUnlockVoteStorage] = useLocalStorage(GOV_UNLOCK_VOTE_TRANSACTION, DEFAULT_GOV_UNLOCK_VOTE_PARAMS);
  const formDefault = useMemo((): GovUnlockVoteParams => ({ ...defaultData }), [defaultData]);
  const [form] = Form.useForm<GovUnlockVoteParams>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);

  const { chainInfoMap } = useSelector((root) => root.chainStore);
  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const getReformatAddress = useCoreCreateReformatAddress();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainValue);
  const { accountProxies } = useSelector((state: RootState) => state.accountState);

  const onFieldsChange: FormCallbacks<GovUnlockVoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // // TODO: field change
    const { empty, error } = simpleCheckForm(allFields, ['--asset']);

    const values = convertFieldToObject<GovUnlockVoteParams>(allFields);

    setIsDisable(empty || error);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovUnlockVoteParams>['onFinish'] = useCallback((values: GovUnlockVoteParams) => {
    setLoading(true);
    const unlockVoteRequest: UnlockVoteRequest = {
      chain: chainValue,
      address: values.from,
      referendumIds: values.referendumIds,
      trackIds: values.tracks
    };

    handleUnlockVote(unlockVoteRequest)
      .then((tx) => {
        onSuccess(tx);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }, [chainValue, onError, onSuccess]);

  const goHome = useCallback(() => {
    setGovUnlockVoteStorage({
      ...DEFAULT_GOV_UNLOCK_VOTE_PARAMS,
      fromAccountProxy: defaultData.fromAccountProxy,
      chain: defaultData.chain
    });
    navigate('/home/governance');
  }, [defaultData.chain, defaultData.fromAccountProxy, navigate, setGovUnlockVoteStorage]);

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

  useEffect(() => {
    setBackProps((prev) => ({
      ...prev,
      onClick: goHome
    }));

    return () => {
      setBackProps((prev) => ({
        ...prev,
        onClick: null
      }));
    };
  }, [goHome, setBackProps, setGovUnlockVoteStorage]);

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
              autoSelectFirstItem={true}
              items={accountAddressItems}
              label={`${t('From')}:`}
              labelStyle={'horizontal'}
            />
          </Form.Item>
        </Form>
        <MetaInfo
          className='custom-label'
          hasBackgroundWrapper={true}
        >
          <MetaInfo.Default label={t('Address')}>
            {toShort(fromValue)}
          </MetaInfo.Default>

          <MetaInfo.Number
            decimals={decimals}
            label={t('Amount')}
            suffix={symbol}
            value={govUnlockVoteStorage.amount || 0}
          />

          {govUnlockVoteStorage.referendumIds && govUnlockVoteStorage.referendumIds.length > 0 && (
            <MetaInfo.Default label={t('Referenda voted')}>
              {govUnlockVoteStorage.referendumIds.length}
            </MetaInfo.Default>
          )}
        </MetaInfo>
      </TransactionContent>

      <TransactionFooter className={`${className} -transaction-footer`}>
        <Button
          disabled={loading}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight='fill'
            />
          )}
          onClick={goHome}
          schema={'secondary'}
        >
          {t('Cancel')}
        </Button>

        <Button
          disabled={isDisable}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onPreCheck(form.submit, ExtrinsicType.GOV_UNLOCK_VOTE)}
        >
          {t('Continue')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const { defaultData } = useTransactionContext<GovUnlockVoteParams>();
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

  const isNotAllowed = !targetAccountProxy || !defaultData.tracks || !defaultData.chain;

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

const GovUnlockVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    '.__total-amount-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0px 12px',
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      marginTop: token.sizeSM,
      fontSize: token.fontSizeHeading6
    }
  };
});

export default GovUnlockVote;
