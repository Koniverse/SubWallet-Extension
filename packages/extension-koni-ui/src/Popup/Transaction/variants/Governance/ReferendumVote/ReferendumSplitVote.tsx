// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals, _getAssetSymbol, _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { GovVoteType, SplitVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, AlertBox, GovAmountInput, HiddenInput, MetaInfo, NumberDisplay, VoteAmountDetail } from '@subwallet/extension-koni-ui/components';
import { DEFAULT_GOV_REFERENDUM_VOTE_PARAMS, GOV_REFERENDUM_VOTE_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, GovReferendumVoteParams, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovAccountAddressItemType, PreviousVoteAmountDetail } from '@subwallet/extension-koni-ui/types/gov';
import { convertFieldToObject } from '@subwallet/extension-koni-ui/utils';
import { calculateTotalAmountVotes, getPreviousVoteAmountDetail } from '@subwallet/extension-koni-ui/utils/gov';
import { Button, Form, Icon } from '@subwallet/react-ui';
import { ReferendumVoteDetail } from '@subwallet/subsquare-api-sdk';
import { BigNumber } from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { FreeBalance, TransactionContent, TransactionFooter } from '../../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  targetAccountProxy: AccountProxy;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovReferendumVoteParams> = ['chain', 'referendumId', 'conviction', 'fromAccountProxy', 'track'];
const CONVICTION_DEFAULT = 0.1;

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
  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const ayeAmount = useWatchTransaction('ayeAmount', form, formDefault);
  const nayAmount = useWatchTransaction('nayAmount', form, formDefault);

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

  const previousVoteAmountDetail = useMemo<PreviousVoteAmountDetail | undefined>(() => getPreviousVoteAmountDetail(voteInfo), [voteInfo]);

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

  const totalAmount = useMemo<{ from?: BigNumber, to: BigNumber }>(() => {
    const currentTotalAmount = calculateTotalAmountVotes({ ayeAmount, nayAmount });

    if (previousVoteAmountDetail) {
      const prevTotal = calculateTotalAmountVotes(previousVoteAmountDetail);

      if (!prevTotal.isEqualTo(currentTotalAmount)) {
        return { from: prevTotal, to: currentTotalAmount };
      }
    }

    return { to: currentTotalAmount };
  }, [ayeAmount, nayAmount, previousVoteAmountDetail]);

  const totalVote = useMemo<{ from?: BigNumber, to: BigNumber }>(() => {
    const currentTotalVote = totalAmount.to.multipliedBy(CONVICTION_DEFAULT);

    if (voteInfo && previousVoteAmountDetail) {
      const prevTotal = calculateTotalAmountVotes(previousVoteAmountDetail);
      const prevConviction = voteInfo.conviction;
      const prevTotalVote = prevTotal.multipliedBy(prevConviction);

      if (!currentTotalVote.isEqualTo(prevTotalVote)) {
        return { from: prevTotalVote, to: currentTotalVote };
      }
    }

    return { to: currentTotalVote };
  }, [previousVoteAmountDetail, totalAmount.to, voteInfo]);

  const onFieldsChange: FormCallbacks<GovReferendumVoteParams>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    // // TODO: field change

    const values = convertFieldToObject<GovReferendumVoteParams>(allFields);

    persistData(values);
  }, [persistData]);

  const onSubmit: FormCallbacks<GovReferendumVoteParams>['onFinish'] = useCallback((values: GovReferendumVoteParams) => {
    setLoading(true);
    const voteRequest: SplitVoteRequest = {
      conviction: 0,
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
          <div className={'form-group'}>
            <Form.Item
              name={'from'}
            >
              <AccountAddressSelector
                avatarSize={20}
                isGovModal={true}
                items={accountAddressItems}
              />
            </Form.Item>

            <FreeBalance
              address={fromValue}
              chain={chainValue}
              className={'free-balance'}
              label={t('Available balance')}
              onBalanceReady={setIsBalanceReady}
            />
          </div>

          <div className={'form-group'}>
            <Form.Item
              name={'ayeAmount'}
            >
              <GovAmountInput
                decimals={_getAssetDecimals(assetInfo)}
                key={splitAmountRenderKey}
                label={t('Aye amount')}
                logoKey={assetInfo.slug.toLowerCase()}
                tokenSymbol={_getAssetSymbol(assetInfo)}
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
              />
            </Form.Item>

            <MetaInfo
              className={'vote-metadata-info'}
              labelColorScheme={'gray'}
              labelFontWeight={'regular'}
              spaceSize={'xs'}
              valueColorScheme={'light'}
            >
              <MetaInfo.Default
                className={'meta-value-info'}
                label={t('Total amount')}
              >
                {
                  !!totalAmount.from && (
                    <>
                      <NumberDisplay
                        className={'meta-value-from'}
                        decimal={_getAssetDecimals(assetInfo)}
                        value={totalAmount.from}
                      />
                      <span className={'meta-value-trans'}>&nbsp;→&nbsp;</span>
                    </>
                  )
                }
                <NumberDisplay
                  className={'meta-value-to'}
                  decimal={_getAssetDecimals(assetInfo)}
                  suffix={_getAssetSymbol(assetInfo)}
                  value={totalAmount.to}
                />
              </MetaInfo.Default>
              <MetaInfo.Default
                className={'meta-value-info'}
                label={t('Total vote')}
              >
                {
                  !!totalVote.from && (
                    <>
                      <NumberDisplay
                        className={'meta-value-from'}
                        decimal={_getAssetDecimals(assetInfo)}
                        value={totalVote.from}
                      />
                      <span className={'meta-value-trans'}>&nbsp;→&nbsp;</span>
                    </>
                  )
                }
                <NumberDisplay
                  className={'meta-value-to'}
                  decimal={_getAssetDecimals(assetInfo)}
                  suffix={_getAssetSymbol(assetInfo)}
                  value={totalVote.to}
                />
              </MetaInfo.Default>
            </MetaInfo>
          </div>
        </Form>

        <AlertBox
          description={t('Split your voting power between Aye and Nay with a Conviction of 0.1x')}
          type='info'
        />

        {previousVoteAmountDetail &&
          <div className='previous-vote-amount-detail'>
            <div className={'__label'}>{t('Previous vote')}</div>
            <VoteAmountDetail
              amountDetail={previousVoteAmountDetail}
              decimals={_getAssetDecimals(assetInfo)}
              symbol={_getAssetSymbol(assetInfo)}
            />
          </div>
        }
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
          disabled={!isBalanceReady}
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
    '&.-transaction-content, .form-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeSM
    },

    '&.-transaction-footer': {
      gap: token.sizeSM,
      marginBottom: 0,
      padding: token.padding,
      paddingBottom: token.paddingXL
    },

    '.form-group': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS,

      '.ant-form-item': {
        marginBottom: 0
      }
    },

    '.alert-description': {
      color: token['geekblue-6']
    },

    '.previous-vote-amount-detail': {
      '.__label': {
        textTransform: 'uppercase',
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        fontWeight: token.fontWeightStrong,
        color: token.colorTextLight3,
        marginBottom: token.marginXS
      }
    },

    '.lock-meta-info': {
      '.__value': {
        color: token.colorTextLight1
      }
    },
    '.vote-metadata-info': {
      '.__value': {
        color: token.colorTextLight1
      }
    },

    '.meta-value-info': {
      '.__value': {
        display: 'inherit'
      }
    },

    '.meta-value-from, .meta-value-trans': {
      color: token.colorTextLight3
    }
  };
});

export default ReferendumSplitVote;
