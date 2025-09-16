// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { UnlockVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountSelector, HiddenInput, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { BN_ZERO, DEFAULT_GOV_UNLOCK_VOTE_PARAMS, GOV_UNLOCK_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useGetGovLockedInfos, useGetNativeTokenBasicInfo, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleUnlockVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, GovUnlockVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, funcSortByName, simpleCheckForm, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
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
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovUnlockVoteParams> = ['chain', 'amount', 'referendumIds', 'tracks'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { className = '', isAllAccount } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, setBackProps } = useTransactionContext<GovUnlockVoteParams>();
  const [, setGovUnlockVoteStorage] = useLocalStorage(GOV_UNLOCK_VOTE_TRANSACTION, DEFAULT_GOV_UNLOCK_VOTE_PARAMS);
  const formDefault = useMemo((): GovUnlockVoteParams => ({ ...defaultData }), [defaultData]);
  const [form] = Form.useForm<GovUnlockVoteParams>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);

  const govLockInfo = useGetGovLockedInfos(chainValue);

  const accounts = useSelector((state: RootState) => {
    const accs = [...state.accountState.accounts];

    return accs.filter((acc) => {
      const votingInfo = govLockInfo.find((v) => v.address === acc.address);

      return votingInfo && votingInfo.summary.unlockable.unlockableReferenda.length > 0;
    })
      .sort(funcSortByName);
  });

  const { chainInfoMap } = useSelector((root) => root.chainStore);
  const networkPrefix = chainInfoMap[chainValue].substrateInfo?.addressPrefix;

  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainValue);

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

  const selectedLockInfo = useMemo(() => {
    return govLockInfo.find((info) => info.address === fromValue);
  }, [govLockInfo, fromValue]);

  const unlockableReferenda = useMemo((): string[] => {
    if (!selectedLockInfo) {
      return [];
    }

    return selectedLockInfo.summary.unlockable.unlockableReferenda || [];
  }, [selectedLockInfo]);

  const lockedAmount = useMemo(() => {
    if (!selectedLockInfo) {
      return BN_ZERO;
    }

    return new BigN(selectedLockInfo.summary.totalLocked || BN_ZERO);
  }, [selectedLockInfo]);

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

  useEffect(() => {
    if (selectedLockInfo) {
      form.setFieldsValue({
        referendumIds: selectedLockInfo.summary.unlockable.unlockableReferenda,
        tracks: selectedLockInfo.tracks.map((t) => t.trackId)
      });

      persistData({
        ...defaultData,
        from: fromValue,
        referendumIds: selectedLockInfo.summary.unlockable.unlockableReferenda,
        tracks: selectedLockInfo.tracks.map((t) => t.trackId)
      } as GovUnlockVoteParams);
    }
  }, [form, fromValue, selectedLockInfo, persistData, defaultData]);

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
            <AccountSelector
              addressPrefix={networkPrefix}
              disabled={!isAllAccount}
              doFilter={false}
              externalAccounts={accounts}
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
            value={lockedAmount.toFixed()}
          />

          {unlockableReferenda && unlockableReferenda.length > 0 && (
            <MetaInfo.Default label={t('Referenda voted')}>
              {unlockableReferenda.length}
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
          disabled={isDisable || accounts.length === 0}
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
  const { isAllAccount } = useSelector((state) => state.accountState);

  const isNotAllowed = !defaultData.tracks || !defaultData.chain;

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
