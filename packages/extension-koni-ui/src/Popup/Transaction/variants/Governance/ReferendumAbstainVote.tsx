// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals, _getAssetSymbol, _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { GovVoteType, SplitAbstainVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, GovAmountInput, HiddenInput } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useCoreCreateReformatAddress, useDefaultNavigate, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AccountAddressItemType, FormCallbacks, FormFieldData, GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
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

const hideFields: Array<keyof GovReferendumVoteParams> = ['chain', 'referendumId', 'conviction', 'fromAccountProxy'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  // @ts-ignore
  const { className = '', isAllAccount, targetAccountProxy } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, setBackProps, setCustomScreenTitle } = useTransactionContext<GovReferendumVoteParams>();
  const [, setGovRefVoteStorage] = useLocalStorage(GOV_REFERENDUM_VOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS);
  const formDefault = useMemo((): GovReferendumVoteParams => ({ ...defaultData }), [defaultData]);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const [form] = Form.useForm<GovReferendumVoteParams>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const getReformatAddress = useCoreCreateReformatAddress();
  const { accountProxies } = useSelector((state: RootState) => state.accountState);

  const { chainInfoMap } = useSelector((root) => root.chainStore);

  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();

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

  const assetInfo = useMemo(() => {
    const assetSlug = _getChainNativeTokenSlug(chainInfoMap[defaultData.chain]);

    return assetRegistry[assetSlug];
  }, [assetRegistry, chainInfoMap, defaultData.chain]);

  const onFieldsChange: FormCallbacks<GovReferendumVoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // // TODO: field change
    const { empty, error } = simpleCheckForm(allFields, ['--asset']);

    const values = convertFieldToObject<GovReferendumVoteParams>(allFields);

    setIsDisable(empty || error);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovReferendumVoteParams>['onFinish'] = useCallback((values: GovReferendumVoteParams) => {
    setLoading(true);
    const voteRequest: SplitAbstainVoteRequest = {
      chain: chainValue,
      address: values.from,
      referendumIndex: defaultData.referendumId,
      trackId: defaultData.track,
      type: GovVoteType.ABSTAIN,
      abstainAmount: values.abstainAmount || '0',
      ayeAmount: values.ayeAmount || '0',
      nayAmount: values.nayAmount || '0'
    };

    handleVote(voteRequest)
      .then((tx) => {
        onSuccess(tx);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }, [chainValue, defaultData.referendumId, defaultData.track, onError, onSuccess]);

  const goRefStandardVote = useCallback(() => {
    setGovRefVoteStorage({
      ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
      fromAccountProxy: defaultData.fromAccountProxy,
      referendumId: defaultData.referendumId,
      chain: defaultData.chain
    });
    navigate('/transaction/gov-ref-standard-vote');
  }, [defaultData.chain, defaultData.fromAccountProxy, defaultData.referendumId, navigate, setGovRefVoteStorage]);

  useEffect(() => {
    setCustomScreenTitle(t('Abstain for #{{referendumId}}', { replace: { referendumId: defaultData.referendumId } }));

    return () => {
      setCustomScreenTitle(undefined);
    };
  }, [defaultData.referendumId, setCustomScreenTitle, t]);

  useEffect(() => {
    setBackProps((prev) => ({
      ...prev,
      onClick: goRefStandardVote
    }));

    return () => {
      setBackProps((prev) => ({
        ...prev,
        onClick: null
      }));
    };
  }, [goRefStandardVote, setBackProps, setGovRefVoteStorage]);

  useEffect(() => {
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        if (!fromValue || accountAddressItems[0].address !== fromValue) {
          form.setFieldValue('from', accountAddressItems[0].address);
        }
      } else {
        if (fromValue && !accountAddressItems.some((i) => i.address === fromValue)) {
          form.setFieldValue('from', '');
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, form, fromValue]);

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
            name={'abstainAmount'}
          >
            <GovAmountInput
              decimals={_getAssetDecimals(assetInfo)}
              label={t('Abstain amount')}
              logoKey={assetInfo.slug.toLowerCase()}
              tokenSymbol={_getAssetSymbol(assetInfo)}
              topRightPart={'1231231'}
            />
          </Form.Item>

          <Form.Item
            name={'ayeAmount'}
          >
            <GovAmountInput
              decimals={_getAssetDecimals(assetInfo)}
              label={t('Aye amount')}
              logoKey={assetInfo.slug.toLowerCase()}
              tokenSymbol={_getAssetSymbol(assetInfo)}
              topRightPart={'1231231'}
            />
          </Form.Item>

          <Form.Item
            name={'nayAmount'}
          >
            <GovAmountInput
              decimals={_getAssetDecimals(assetInfo)}
              label={t('Nay amount')}
              logoKey={assetInfo.slug.toLowerCase()}
              tokenSymbol={_getAssetSymbol(assetInfo)}
              topRightPart={'1231231'}
            />
          </Form.Item>
        </Form>
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
          onClick={goRefStandardVote}
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
          onClick={onPreCheck(form.submit, ExtrinsicType.GOV_VOTE)}
        >
          {t('Vote')}
        </Button>
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

  const isNotAllowed = !targetAccountProxy || !defaultData.referendumId || !defaultData.chain;

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

const ReferendumAbstainVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {

  };
});

export default ReferendumAbstainVote;
