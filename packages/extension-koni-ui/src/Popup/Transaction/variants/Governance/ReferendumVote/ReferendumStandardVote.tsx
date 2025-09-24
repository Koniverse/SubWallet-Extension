// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals, _getAssetSymbol, _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { govConvictionOptions, GovVoteType, StandardVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll, isSameAddress } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, GovAmountInput, GovVoteConvictionSlider, HiddenInput, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_REFERENDUM_UNVOTE_PARAMS, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_UNVOTE_TRANSACTION, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useGetAccountTokenBalance, useGetGovLockedInfos, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, GovVoteStatus } from '@subwallet/extension-koni-ui/types/gov';
import { convertFieldToObject, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { balanceFormatter, Button, ButtonProps, Form, formatNumber } from '@subwallet/react-ui';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { TransactionContent, TransactionFooter } from '../../../parts';
import { VoteButton } from '../parts/VoteButton';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovReferendumVoteParams> = ['chain', 'referendumId', 'fromAccountProxy', 'track'];

const getConvictionDescription = (value?: number): string => {
  const option = govConvictionOptions.find((o) => o.value === value);

  return option?.description || '-';
};

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { className = '', targetAccountProxy } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, setCustomScreenTitle, setSubHeaderRightButtons } = useTransactionContext<GovReferendumVoteParams>();
  const [govRefVoteStorage, setGovRefVoteStorage] = useLocalStorage(GOV_REFERENDUM_VOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_VOTE_PARAMS);
  const formDefault = useMemo((): GovReferendumVoteParams => ({ ...defaultData, from: govRefVoteStorage.from, fromAccountProxy: govRefVoteStorage.fromAccountProxy }), [defaultData, govRefVoteStorage.from, govRefVoteStorage.fromAccountProxy]);
  const [, setGovRefUnvoteStorage] = useLocalStorage(GOV_REFERENDUM_UNVOTE_TRANSACTION, DEFAULT_GOV_REFERENDUM_UNVOTE_PARAMS);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const [form] = Form.useForm<GovReferendumVoteParams>();

  const standardRenderKey = 'standard_vote_amount';
  const [standardAmountRenderKey, setStandardAmountRenderKey] = useState<string>(standardRenderKey);

  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [voteType, setVoteType] = useState<GovVoteType | null>(null);

  const [initialAccountType, setInitialAccountType] = useState<GovVoteStatus | null>(null);

  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const conviction = useWatchTransaction('conviction', form, defaultData);
  const amountValue = useWatchTransaction('amount', form, defaultData);

  const govLockedInfos = useGetGovLockedInfos(chainValue);
  const getAccountTokenBalance = useGetAccountTokenBalance();

  const referendumId = defaultData.referendumId;

  const { voteMap = new Map<string, ReferendumVoteDetail>(),
    accountAddressItems = [] }: {
    voteMap: Map<string, ReferendumVoteDetail>,
    accountAddressItems: GovAccountAddressItemType[]
  } = useOutletContext();

  const onPreCheck = usePreCheckAction(fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction();

  const { chainInfoMap } = useSelector((root) => root.chainStore);

  const targetAccountProxyIdForGetBalance = useMemo(() => {
    if (!isAccountAll(targetAccountProxy.id) || !fromValue) {
      return targetAccountProxy.id;
    }

    const accountProxyByFromValue = accountAddressItems.find((a) => a.address === fromValue);

    return accountProxyByFromValue?.accountProxyId || targetAccountProxy.id;
  }, [accountAddressItems, fromValue, targetAccountProxy.id]);

  const currentGovInfo = useMemo(() => {
    if (!fromValue) {
      return undefined;
    }

    return govLockedInfos.find((info) =>
      isSameAddress(info.address, fromValue)
    );
  }, [govLockedInfos, fromValue]);

  const assetInfo = useMemo(() => {
    const assetSlug = _getChainNativeTokenSlug(chainInfoMap[defaultData.chain]);

    return assetRegistry[assetSlug];
  }, [assetRegistry, chainInfoMap, defaultData.chain]);

  const tokenBalanceMap = getAccountTokenBalance(
    [assetInfo.slug],
    targetAccountProxyIdForGetBalance
  );

  const balanceInfo = useMemo(
    () => (chainValue ? tokenBalanceMap[assetInfo.slug] : undefined),
    [assetInfo.slug, chainValue, tokenBalanceMap]
  );

  const lockedValue = useMemo(() => balanceInfo?.locked.value ?? new BigN(0), [balanceInfo]);

  const handleVoteClick = useCallback((type: GovVoteType) => {
    setVoteType(type);

    form.submit();
  }, [form]);

  const handleClickNay = useCallback(() => handleVoteClick(GovVoteType.NAY), [handleVoteClick]);
  const handleClickAye = useCallback(() => handleVoteClick(GovVoteType.AYE), [handleVoteClick]);

  const onFieldsChange: FormCallbacks<GovReferendumVoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // TODO: field change
    const { empty, error } = simpleCheckForm(allFields, ['--asset', '--conviction', '--fromAccountProxy']);

    const values = convertFieldToObject<GovReferendumVoteParams>(allFields);

    setIsDisable(empty || error);
    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovReferendumVoteParams>['onFinish'] = useCallback((values: GovReferendumVoteParams) => {
    if (!voteType) {
      return;
    }

    setLoading(true);

    if (voteType === GovVoteType.AYE || voteType === GovVoteType.NAY) {
      const voteRequest: StandardVoteRequest = {
        chain: chainValue,
        address: values.from,
        referendumIndex: referendumId,
        trackId: defaultData.track,
        type: voteType,
        amount: values.amount || '0',
        conviction: conviction
      };

      handleVote(voteRequest)
        .then((tx) => {
          onSuccess(tx);
        })
        .catch(onError)
        .finally(() => setLoading(false));
    }
  }, [chainValue, conviction, referendumId, defaultData.track, onError, onSuccess, voteType]);

  const goRefSplitVote = useCallback(() => {
    setGovRefVoteStorage({
      ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
      from: fromValue,
      fromAccountProxy: defaultData.fromAccountProxy,
      referendumId: referendumId,
      track: defaultData.track,
      chain: defaultData.chain
    });
    navigate('/transaction/gov-ref-vote/split');
  }, [defaultData.chain, defaultData.fromAccountProxy, defaultData.track, fromValue, navigate, referendumId, setGovRefVoteStorage]);

  const goRefAbstainVote = useCallback(() => {
    setGovRefVoteStorage({
      ...DEFAULT_GOV_REFERENDUM_VOTE_PARAMS,
      from: fromValue,
      fromAccountProxy: defaultData.fromAccountProxy,
      referendumId: referendumId,
      track: defaultData.track,
      chain: defaultData.chain
    });
    navigate('/transaction/gov-ref-vote/abstain');
  }, [defaultData.chain, defaultData.fromAccountProxy, defaultData.track, fromValue, navigate, referendumId, setGovRefVoteStorage]);

  const reUseGovernanceLock = useCallback(() => {
    if (currentGovInfo?.summary.totalLocked) {
      form.setFieldValue('amount', currentGovInfo.summary.totalLocked);

      setStandardAmountRenderKey(`${standardRenderKey}_${Date.now()}`);
      setIsDisable(false);
    }
  }, [currentGovInfo, form]);

  const reUseAllLock = useCallback(() => {
    if (lockedValue) {
      const decimals = _getAssetDecimals(assetInfo);

      const bnLockedValue = new BigN(lockedValue).multipliedBy(new BigN(10).pow(decimals)).toString();

      form.setFieldValue('amount', bnLockedValue);

      setStandardAmountRenderKey(`${standardRenderKey}_${Date.now()}`);
      setIsDisable(false);
    }
  }, [lockedValue, form, standardRenderKey, assetInfo]);

  const getAccountVoteStatus = useCallback((address: string): GovVoteStatus => {
    const voteDetail = voteMap.get(address.toLowerCase());

    if (!voteDetail) {
      return GovVoteStatus.NOT_VOTED;
    }

    return voteDetail.isDelegating ? GovVoteStatus.DELEGATED : GovVoteStatus.VOTED;
  }, [voteMap]);

  // Filter accounts based on initial account type
  const filteredAccountItems = useMemo(() => {
    if (!initialAccountType || !accountAddressItems.length) {
      return accountAddressItems;
    }

    return accountAddressItems.filter((item) => {
      const status = getAccountVoteStatus(item.address);

      return status === initialAccountType;
    });
  }, [accountAddressItems, initialAccountType, getAccountVoteStatus]);

  // Determine current vote status for title
  const currentVoteStatus = useMemo(() => {
    if (!fromValue) {
      return null;
    }

    return getAccountVoteStatus(fromValue);
  }, [fromValue, getAccountVoteStatus]);

  const screenTitle = useMemo(() => {
    let action = 'Vote';

    if (currentVoteStatus === GovVoteStatus.VOTED) {
      action = 'Revote';
    }

    return t('{{action}} for #{{referendumId}}', {
      replace: {
        action,
        referendumId: referendumId
      }
    });
  }, [currentVoteStatus, referendumId, t]);

  const subHeaderButtons: ButtonProps[] = useMemo(() => {
    if (currentVoteStatus !== GovVoteStatus.VOTED) {
      return [];
    }

    return [
      {
        children: t('Unvote'),
        onClick: () => {
          setGovRefUnvoteStorage({
            ...DEFAULT_GOV_REFERENDUM_UNVOTE_PARAMS,
            fromAccountProxy: defaultData.fromAccountProxy,
            referendumId: referendumId,
            track: defaultData.track,
            chain: defaultData.chain
          });
          navigate('/transaction/gov-ref-unvote');
        }
      }
    ];
  }, [currentVoteStatus, t, setGovRefUnvoteStorage, defaultData.fromAccountProxy, defaultData.track, defaultData.chain, referendumId, navigate]);

  const voteInfo = useMemo(() => {
    if (!fromValue) {
      return undefined;
    }

    return voteMap.get(fromValue.toLowerCase());
  }, [voteMap, fromValue]);

  useEffect(() => {
    if (voteInfo?.isStandard) {
      form.setFieldsValue({
        amount: voteInfo.balance,
        conviction: voteInfo.conviction
      });

      setStandardAmountRenderKey(`${standardRenderKey}_${Date.now()}`);
    }
  }, [voteInfo, form]);

  useEffect(() => {
    setCustomScreenTitle(screenTitle);

    return () => {
      setCustomScreenTitle(undefined);
    };
  }, [screenTitle, setCustomScreenTitle]);

  useEffect(() => {
    setSubHeaderRightButtons(subHeaderButtons);

    return () => {
      setSubHeaderRightButtons(undefined);
    };
  }, [setSubHeaderRightButtons, subHeaderButtons]);

  useEffect(() => {
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        const singleAccount = accountAddressItems[0];

        if (!fromValue || singleAccount.address !== fromValue) {
          form.setFieldValue('from', singleAccount.address);

          const status = getAccountVoteStatus(singleAccount.address);

          setInitialAccountType(status);
        }
      } else {
        if (fromValue && !accountAddressItems.some((i) => i.address === fromValue)) {
          form.setFieldValue('from', '');
          setInitialAccountType(null);
        } else if (fromValue && !initialAccountType) {
          const status = getAccountVoteStatus(fromValue);

          setInitialAccountType(status);
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, form, fromValue, getAccountVoteStatus, initialAccountType]);

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
              items={filteredAccountItems}
              label={`${t('From')}:`}
              labelStyle={'horizontal'}
            />
          </Form.Item>

          <Form.Item
            name={'amount'}
          >
            <GovAmountInput
              decimals={_getAssetDecimals(assetInfo)}
              key={standardAmountRenderKey}
              label={t('Amount')}
              logoKey={assetInfo.slug.toLowerCase()}
              tokenSymbol={_getAssetSymbol(assetInfo)}
              topRightPart={
                voteInfo?.isStandard
                  ? (voteInfo?.aye ? GovVoteType.AYE : GovVoteType.NAY)
                  : undefined
              }
            />
          </Form.Item>

          <div className='carousel-buttons-container'>
            <Button
              className='gov-locked-amount'
              onClick={reUseGovernanceLock}
              size='sm'
              type='ghost'
            >
              {t('Reuse governance lock:')}{' '}
              {currentGovInfo?.summary.totalLocked
                ? `${formatNumber(currentGovInfo.summary.totalLocked, _getAssetDecimals(assetInfo), balanceFormatter)}`
                : t('No lock')}
            </Button>

            <Button
              className='all-locked-amount'
              onClick={reUseAllLock}
              size='sm'
              type='ghost'
            >
              {t('Reuse all lock:')} {lockedValue.toString()}
            </Button>
          </div>

          <Form.Item
            name={'conviction'}
          >
            <GovVoteConvictionSlider />
          </Form.Item>

        </Form>
        <MetaInfo>
          <MetaInfo.Default
            label={'Lock duration'}
          >
            {voteInfo?.conviction !== undefined
              ? (
                voteInfo.conviction === conviction
                  ? getConvictionDescription(conviction)
                  : `${getConvictionDescription(voteInfo.conviction)} 🡢 ${getConvictionDescription(conviction)}`
              )
              : (
                getConvictionDescription(conviction)
              )}
          </MetaInfo.Default>
          <MetaInfo.Default
            label={t('Governance lock')}
          >
            {currentGovInfo?.summary.totalLocked
              ? (
                new BigN(amountValue || 0).gt(currentGovInfo.summary.totalLocked)
                  ? `${formatNumber(currentGovInfo.summary.totalLocked, _getAssetDecimals(assetInfo), balanceFormatter)} 🡢 ${formatNumber(amountValue || '0', _getAssetDecimals(assetInfo), balanceFormatter)}`
                  : formatNumber(currentGovInfo.summary.totalLocked, _getAssetDecimals(assetInfo), balanceFormatter)
              )
              : formatNumber(amountValue || '0', _getAssetDecimals(assetInfo), balanceFormatter)
            }
          </MetaInfo.Default>
        </MetaInfo>
      </TransactionContent>

      <TransactionFooter className={`${className} -transaction-footer`}>
        <div className={'__vote-buttons-container'}>
          <VoteButton
            disabled={isDisable}
            loading={loading}
            onClick={onPreCheck(handleClickNay, ExtrinsicType.GOV_VOTE)}
            type={GovVoteType.NAY}
          />
          <VoteButton
            loading={loading}
            onClick={goRefAbstainVote}
            type={GovVoteType.ABSTAIN}
          />
          <VoteButton
            loading={loading}
            onClick={goRefSplitVote}
            type={GovVoteType.SPLIT}
          />
          <VoteButton
            disabled={isDisable}
            loading={loading}
            onClick={onPreCheck(handleClickAye, ExtrinsicType.GOV_VOTE)}
            type={GovVoteType.AYE}
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

  const isNotAllowed = !targetAccountProxy || !defaultData.referendumId || !defaultData.chain;

  useEffect(() => {
    if (isNotAllowed) {
      // goHome();
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
