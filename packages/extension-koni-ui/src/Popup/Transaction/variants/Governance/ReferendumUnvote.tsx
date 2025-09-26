// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { GovVoteType, RemoveVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, HiddenInput, MetaInfo, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useDefaultNavigate, useGetNativeTokenBasicInfo, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleRemoveVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { useGovReferendumVotes } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView/useGovReferendumVotes';
import { FormCallbacks, FormFieldData, GovReferendumUnvoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { FreeBalance, TransactionContent, TransactionFooter } from '../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovReferendumUnvoteParams> = ['chain', 'referendumId', 'track'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { className = '' } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, setBackProps, setCustomScreenTitle } = useTransactionContext<GovReferendumUnvoteParams>();
  const [, setGovRefVoteStorage] = useLocalStorage(GOV_REFERENDUM_VOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS);
  const formDefault = useMemo((): GovReferendumUnvoteParams => ({ ...defaultData }), [defaultData]);
  const [form] = Form.useForm<GovReferendumUnvoteParams>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const referendumId = defaultData.referendumId;
  const [isBalanceReady, setIsBalanceReady] = useState(true);

  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainValue);

  const { accountAddressItems, voteMap } = useGovReferendumVotes({
    chain: chainValue,
    referendumId: referendumId,
    fromAccountProxy: defaultData.fromAccountProxy
  });

  const fromVoteDetail = useMemo(() => {
    if (!fromValue) {
      return undefined;
    }

    return voteMap.get(fromValue.toLowerCase());
  }, [fromValue, voteMap]);
  const totalAmount = useMemo(() => {
    if (!fromVoteDetail) {
      return new BigNumber(0);
    }

    if (fromVoteDetail.isSplitAbstain) {
      return new BigNumber(fromVoteDetail.ayeBalance ?? 0)
        .plus(fromVoteDetail.nayBalance ?? 0)
        .plus(fromVoteDetail.abstainBalance ?? 0);
    }

    if (fromVoteDetail.isSplit) {
      return new BigNumber(fromVoteDetail.ayeBalance ?? 0)
        .plus(fromVoteDetail.nayBalance ?? 0);
    }

    return new BigNumber(fromVoteDetail.balance ?? 0);
  }, [fromVoteDetail]);

  const fromVoteType = useMemo<GovVoteType | undefined>(() => {
    if (!fromVoteDetail) {
      return undefined;
    }

    if (fromVoteDetail.isSplitAbstain) {
      return GovVoteType.ABSTAIN;
    }

    if (fromVoteDetail.isSplit) {
      return GovVoteType.SPLIT;
    }

    if (fromVoteDetail.isStandard) {
      return fromVoteDetail.aye ? GovVoteType.AYE : GovVoteType.NAY;
    }

    return undefined;
  }, [fromVoteDetail]);

  const onFieldsChange: FormCallbacks<GovReferendumUnvoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // // TODO: field change
    const { empty, error } = simpleCheckForm(allFields, ['--asset']);

    const values = convertFieldToObject<GovReferendumUnvoteParams>(allFields);

    setIsDisable(empty || error);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovReferendumUnvoteParams>['onFinish'] = useCallback((values: GovReferendumUnvoteParams) => {
    setLoading(true);
    const voteRequest: RemoveVoteRequest = {
      chain: chainValue,
      address: values.from,
      referendumIndex: referendumId,
      trackId: defaultData.track,
      amount: fromVoteDetail?.balance,
      nayAmount: fromVoteDetail?.nayBalance,
      ayeAmount: fromVoteDetail?.ayeBalance,
      abstainAmount: fromVoteDetail?.abstainBalance,
      totalAmount: totalAmount.toString(),
      type: fromVoteType
    };

    handleRemoveVote(voteRequest)
      .then((tx) => {
        onSuccess(tx);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }, [chainValue, referendumId, defaultData.track, fromVoteDetail?.balance, fromVoteDetail?.nayBalance, fromVoteDetail?.ayeBalance, fromVoteDetail?.abstainBalance, totalAmount, fromVoteType, onError, onSuccess]);

  const goRefStandardVote = useCallback(() => {
    setGovRefVoteStorage({
      ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
      fromAccountProxy: defaultData.fromAccountProxy,
      referendumId: referendumId,
      chain: defaultData.chain
    });
    navigate('/transaction/gov-ref-vote/standard');
  }, [defaultData.chain, defaultData.fromAccountProxy, referendumId, navigate, setGovRefVoteStorage]);

  useEffect(() => {
    setCustomScreenTitle(t('Unvote for #{{referendumId}}', { replace: { referendumId: referendumId } }));

    return () => {
      setCustomScreenTitle(undefined);
    };
  }, [referendumId, setCustomScreenTitle, t]);

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
        </Form>
        <FreeBalance
          address={fromValue}
          chain={chainValue}
          className={'free-balance'}
          label={t('Available balance')}
          onBalanceReady={setIsBalanceReady}
        />
        <MetaInfo
          hasBackgroundWrapper={true}
          labelColorScheme='gray'
          labelFontWeight='regular'
          spaceSize='sm'
          valueColorScheme='light'
        >
          <MetaInfo.Number
            decimals={decimals}
            label={'Amount'}
            suffix={symbol || undefined}
            value={totalAmount || '0'}
          />
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
          onClick={goRefStandardVote}
          schema={'secondary'}
        >
          {t('Cancel')}
        </Button>

        <Button
          disabled={isDisable || !isBalanceReady}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onPreCheck(form.submit, ExtrinsicType.GOV_UNVOTE)}
        >
          {t('Continue')}
        </Button>
      </TransactionFooter>
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const { defaultData } = useTransactionContext<GovReferendumUnvoteParams>();
  const dataContext = useContext(DataContext);
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
    <PageWrapper
      className={CN(className, 'referendum-unvote-wrapper')}
      resolve={dataContext.awaitStores(['openGov'])}
    >
      <Component
        isAllAccount={isAllAccount}
        targetAccountProxy={targetAccountProxy}
      />
    </PageWrapper>

  );
};

const ReferendumUnvote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    '.free-balance': {
      marginBottom: 12
    },
    '&.referendum-unvote-wrapper': {
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }
  };
});

export default ReferendumUnvote;
