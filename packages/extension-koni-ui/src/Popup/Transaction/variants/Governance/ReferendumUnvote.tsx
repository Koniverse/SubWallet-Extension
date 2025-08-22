// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { RemoveVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, HiddenInput } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useCoreCreateReformatAddress, useDefaultNavigate, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleRemoveVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { chainSlugToSubsquareNetwork } from '@subwallet/extension-koni-ui/Popup/Home/Governance/shared';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, GovReferendumUnvoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { convertFieldToObject, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { GOV_QUERY_KEYS } from '@subwallet/extension-koni-ui/utils/gov';
import { Button, Form, Icon } from '@subwallet/react-ui';
import getSubsquareApi, { SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk/interface';
import { useQuery } from '@tanstack/react-query';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { chain } from '@polkadot/types/interfaces/definitions';

import { TransactionContent, TransactionFooter } from '../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovReferendumUnvoteParams> = ['chain', 'referendumId'];

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { className = '', targetAccountProxy } = props;
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

  const getReformatAddress = useCoreCreateReformatAddress();
  const { accountProxies } = useSelector((state: RootState) => state.accountState);

  const { chainInfoMap } = useSelector((root) => root.chainStore);

  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const sdkInstant: SubsquareApiSdk = useMemo(() => {
    return getSubsquareApi(chainSlugToSubsquareNetwork[chainValue]);
  }, [chainValue]);

  const { data: voteData } = useQuery({
    queryKey: GOV_QUERY_KEYS.referendumVotes(chainValue, referendumId),
    queryFn: async () => {
      if (!referendumId) {
        return undefined;
      }

      return await sdkInstant?.getReferendaVotes(`${referendumId}`);
    },
    enabled: !!referendumId && !!chain,
    staleTime: 60 * 1000
  });

  const voteMap = useMemo(() => {
    if (!voteData) {
      return new Map<string, ReferendumVoteDetail>();
    }

    const map = new Map<string, ReferendumVoteDetail>();

    voteData.forEach((vote: ReferendumVoteDetail) => {
      map.set(vote.account.toLowerCase(), vote);
    });

    return map;
  }, [voteData]);

  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo || !targetAccountProxy) {
      return [];
    }

    const result: GovAccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach((a) => {
        const address = getReformatAddress(a, chainInfo);

        if (address) {
          const voteInfo = voteMap.get(address.toLowerCase());

          const govVoteStatus = voteInfo
            ? (voteInfo.isDelegating ? GovVoteStatus.DELEGATED : GovVoteStatus.VOTED)
            : GovVoteStatus.NOT_VOTED;

          if (govVoteStatus === GovVoteStatus.VOTED) {
            result.push({
              accountName: ap.name,
              accountProxyId: ap.id,
              accountProxyType: ap.accountType,
              accountType: a.type,
              address,
              govVoteStatus
            });
          }
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
  }, [chainValue, chainInfoMap, targetAccountProxy, getReformatAddress, voteMap, accountProxies]);

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
      trackId: defaultData.track
    };

    handleRemoveVote(voteRequest)
      .then((tx) => {
        onSuccess(tx);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }, [chainValue, referendumId, defaultData.track, onError, onSuccess]);

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

const ReferendumUnvote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {

  };
});

export default ReferendumUnvote;
