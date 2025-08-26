// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals, _getAssetSymbol, _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { GovVoteType, SplitVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, GovAmountInput, HiddenInput } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType } from '@subwallet/extension-koni-ui/types/gov';
import { convertFieldToObject, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { balanceFormatter, Button, Form, formatNumber, Icon } from '@subwallet/react-ui';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk/interface';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { TransactionContent, TransactionFooter } from '../../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovReferendumVoteParams> = ['chain', 'referendumId', 'conviction', 'fromAccountProxy', 'track'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  // @ts-ignore
  const { className = '' } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, setBackProps, setCustomScreenTitle } = useTransactionContext<GovReferendumVoteParams>();
  const [govRefVoteStorage] = useLocalStorage(GOV_REFERENDUM_VOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS);
  const formDefault = useMemo((): GovReferendumVoteParams => ({ ...defaultData, from: govRefVoteStorage.from, fromAccountProxy: govRefVoteStorage.fromAccountProxy }), [defaultData, govRefVoteStorage.from, govRefVoteStorage.fromAccountProxy]);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const [form] = Form.useForm<GovReferendumVoteParams>();
  const splitRenderKey = 'split_vote_amount';
  const [splitAmountRenderKey, setSplitAmountRenderKey] = useState<string>(splitRenderKey);

  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);

  const { chainInfoMap } = useSelector((root) => root.chainStore);
  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const { voteMap = new Map<string, ReferendumVoteDetail>(),
    accountAddressItems = [] }: {
    voteMap: Map<string, ReferendumVoteDetail>,
    accountAddressItems: GovAccountAddressItemType[]
  } = useOutletContext();

  const voteInfo = useMemo(() => {
    if (!fromValue) {
      return undefined;
    }

    return voteMap.get(fromValue.toLowerCase());
  }, [voteMap, fromValue]);

  useEffect(() => {
    if (voteInfo?.isSplit) {
      form.setFieldsValue({
        ayeAmount: voteInfo.ayeBalance,
        nayAmount: voteInfo.nayBalance
      });

      setSplitAmountRenderKey(`${splitAmountRenderKey}_${Date.now()}`);
    }
  }, [voteInfo, form, splitAmountRenderKey, govRefVoteStorage.from]);
  const assetInfo = useMemo(() => {
    const assetSlug = _getChainNativeTokenSlug(chainInfoMap[defaultData.chain]);

    return assetRegistry[assetSlug];
  }, [assetRegistry, chainInfoMap, defaultData.chain]);

  const onFieldsChange: FormCallbacks<GovReferendumVoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // // TODO: field change
    const fieldsToCheck = allFields.filter(
      (field) => ['chain', 'referendumId', 'from'].includes(String(Array.isArray(field.name) ? field.name[0] : field.name))
    );

    const { empty, error } = simpleCheckForm(fieldsToCheck);

    const values = convertFieldToObject<GovReferendumVoteParams>(allFields);

    const hasAmount =
  (values.ayeAmount && new BigNumber(values.ayeAmount).gt(0)) ||
  (values.nayAmount && new BigNumber(values.nayAmount).gt(0));

    setIsDisable(empty || error || !hasAmount);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovReferendumVoteParams>['onFinish'] = useCallback((values: GovReferendumVoteParams) => {
    setLoading(true);
    const voteRequest: SplitVoteRequest = {
      chain: chainValue,
      address: values.from,
      referendumIndex: defaultData.referendumId,
      trackId: defaultData.track,
      type: GovVoteType.SPLIT,
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
    navigate('/transaction/gov-ref-vote/standard');
  }, [navigate]);

  useEffect(() => {
    setCustomScreenTitle(t('Split for #{{referendumId}}', { replace: { referendumId: defaultData.referendumId } }));

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
  }, [goRefStandardVote, setBackProps]);

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
              isGovModal={true}
              items={accountAddressItems}
              label={`${t('From')}:`}
              labelStyle={'horizontal'}
            />
          </Form.Item>

          <Form.Item
            name={'ayeAmount'}
          >
            <GovAmountInput
              decimals={_getAssetDecimals(assetInfo)}
              key={splitAmountRenderKey}
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
              key={splitAmountRenderKey}
              label={t('Nay amount')}
              logoKey={assetInfo.slug.toLowerCase()}
              tokenSymbol={_getAssetSymbol(assetInfo)}
              topRightPart={'1231231'}
            />
          </Form.Item>
        </Form>
        {voteInfo?.isSplit && (
          <div className='mt-2 text-sm text-gray-500'>
            {t('Already voted')}:
            ({t('Aye')}: {formatNumber(voteInfo.ayeBalance || '0', _getAssetDecimals(assetInfo), balanceFormatter)} {assetInfo.symbol})
            ({t('Nay')}:{formatNumber(voteInfo.nayBalance || '0', _getAssetDecimals(assetInfo), balanceFormatter)} {assetInfo.symbol})
          </div>
        )}
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

const ReferendumSplitVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {

  };
});

export default ReferendumSplitVote;
