// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { UnlockVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { AccountAddressSelector, HiddenInput, MetaInfo, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useDefaultNavigate, useGetGovLockedInfos, useGetNativeTokenBasicInfo, useHandleSubmitTransaction, usePreCheckAction, useSelector, useTransactionContext, useWatchTransaction } from '@subwallet/extension-koni-ui/hooks';
import { handleUnlockVote } from '@subwallet/extension-koni-ui/messaging/transaction/gov';
import { useGovReferendumVotes } from '@subwallet/extension-koni-ui/Popup/Home/Governance/hooks/useGovernanceView/useGovReferendumVotes';
import { FormCallbacks, FormFieldData, GovUnlockVoteParams, SelectSignableAccountProxyResult, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertFieldToObject, funcSortByName, simpleCheckForm, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle, Info, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { FreeBalance, TransactionContent, TransactionFooter } from '../../parts';

type WrapperProps = ThemeProps;

type ComponentProps = {
  className?: string;
  isAllAccount?: boolean
};

const hideFields: Array<keyof GovUnlockVoteParams> = ['chain', 'amount', 'referendumIds', 'tracks'];
const REFERENDA_VOTED_MODAL_ID = 'referenda-voted-modal';

const Component = (props: ComponentProps): React.ReactElement<ComponentProps> => {
  const { className = '', isAllAccount } = props;
  const { t } = useTranslation();
  const { defaultData, persistData, selectSignableAccountProxyToSign, setBackProps } = useTransactionContext<GovUnlockVoteParams>();
  const formDefault = useMemo((): GovUnlockVoteParams => ({ ...defaultData }), [defaultData]);
  const [form] = Form.useForm<GovUnlockVoteParams>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const fromValue = useWatchTransaction('from', form, defaultData);
  const chainValue = useWatchTransaction('chain', form, defaultData);
  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const { accountAddressItems } = useGovReferendumVotes({
    chain: defaultData.chain,
    referendumId: '',
    fromAccountProxy: defaultData.fromAccountProxy
  });

  const govLockInfo = useGetGovLockedInfos(chainValue);

  const accountAddressFiltered = useMemo(() => accountAddressItems.filter((acc) => {
    const votingInfo = govLockInfo.find((v) => isSameAddress(v.address, acc.address));

    return votingInfo && votingInfo.summary.unlockable.trackIds.length > 0;
  }).sort(funcSortByName), [accountAddressItems, govLockInfo]);

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

  const onCancelReferendaVotedModal = useCallback(() => {
    inactiveModal(REFERENDA_VOTED_MODAL_ID);
  }, [inactiveModal]);

  const onOpenReferendaVotedModal = useCallback(() => {
    activeModal(REFERENDA_VOTED_MODAL_ID);
  }, [activeModal]);

  const onSubmit: FormCallbacks<GovUnlockVoteParams>['onFinish'] = useCallback((values: GovUnlockVoteParams) => {
    setLoading(true);
    const unlockVoteRequest: UnlockVoteRequest = {
      chain: chainValue,
      address: values.from,
      referendumIds: values.referendumIds,
      trackIds: values.tracks,
      amount: values.amount || '0'
    };

    const sendPromise = (otherSignerSelected: SelectSignableAccountProxyResult) => {
      return handleUnlockVote({
        ...unlockVoteRequest,
        ...otherSignerSelected
      });
    };

    selectSignableAccountProxyToSign({
      chain: chainValue,
      address: values.from,
      extrinsicType: ExtrinsicType.GOV_UNLOCK_VOTE
    }).then(sendPromise)
      .then(onSuccess)
      .catch(onError)
      .finally(() => setLoading(false));
  }, [chainValue, onError, onSuccess, selectSignableAccountProxyToSign]);

  const goBack = useCallback(() => {
    navigate(`/home/governance?view=unlock-token&chainSlug=${chainValue}`);
  }, [chainValue, navigate]);

  const selectedLockInfo = useMemo(() => {
    return govLockInfo.find((info) => isSameAddress(info.address, fromValue));
  }, [govLockInfo, fromValue]);

  const unlockableReferenda = useMemo((): string[] => {
    if (!selectedLockInfo) {
      return [];
    }

    return selectedLockInfo.summary.unlockable.unlockableReferenda || [];
  }, [selectedLockInfo]);

  const unlockableTracks = useMemo((): number[] => {
    if (!selectedLockInfo) {
      return [];
    }

    return selectedLockInfo.summary.unlockable.trackIds || [];
  }, [selectedLockInfo]);

  const lockedAmount = useMemo(() => {
    if (!selectedLockInfo) {
      return BN_ZERO;
    }

    return new BigN(selectedLockInfo.summary.unlockable.balance || BN_ZERO);
  }, [selectedLockInfo]);

  useEffect(() => {
    if (selectedLockInfo) {
      form.setFieldsValue({
        referendumIds: selectedLockInfo.summary.unlockable.unlockableReferenda,
        amount: selectedLockInfo.summary.unlockable.balance || '0',
        tracks: selectedLockInfo.summary.unlockable.trackIds
      });

      persistData({
        ...defaultData,
        from: fromValue,
        referendumIds: selectedLockInfo.summary.unlockable.unlockableReferenda,
        amount: selectedLockInfo.summary.unlockable.balance || '0',
        tracks: selectedLockInfo.summary.unlockable.trackIds
      } as GovUnlockVoteParams);
    }
  }, [form, fromValue, selectedLockInfo, persistData, defaultData]);

  useEffect(() => {
    setBackProps((prevState) => ({
      ...prevState,
      onClick: goBack
    }));

    return () => {
      setBackProps((prevState) => ({
        ...prevState,
        onClick: null
      }));
    };
  }, [chainValue, goBack, navigate, setBackProps]);

  return (
    <>
      <TransactionContent className={CN(`${className} -transaction-content`)}>
        <Form
          className={'form-container form-space-xxs'}
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
              avatarSize={24}
              disabled={!isAllAccount}
              isGovModal
              items={accountAddressFiltered}
            />
          </Form.Item>
        </Form>
        <FreeBalance
          address={fromValue}
          chain={chainValue}
          className={'free-balance'}
          label={t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.availableBalance')}
          onBalanceReady={setIsBalanceReady}
        />
        <MetaInfo
          className='custom-label'
          hasBackgroundWrapper={true}
        >
          <MetaInfo.Default label={t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.address')}>
            {toShort(fromValue)}
          </MetaInfo.Default>

          <MetaInfo.Number
            decimals={decimals}
            label={t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.amount')}
            suffix={symbol}
            value={lockedAmount.toFixed()}
          />

          {unlockableReferenda && unlockableReferenda.length > 0 && (
            <MetaInfo.Default label={t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.referendaVoted')}>

              <span>
                {unlockableReferenda.length}
                <span
                  className='referenda-voted-button'
                  onClick={onOpenReferendaVotedModal}
                >
                        &nbsp;&nbsp;
                  <Icon
                    customSize={'18px'}
                    phosphorIcon={Info}
                    weight='bold'
                  />
                </span>
              </span>
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
          onClick={goBack}
          schema={'secondary'}
        >
          {t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.cancel')}
        </Button>

        <Button
          disabled={isDisable || accountAddressFiltered.length === 0 || !isBalanceReady || (!(unlockableReferenda.length > 0) && !(unlockableTracks.length > 0))}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onPreCheck(form.submit, ExtrinsicType.GOV_UNLOCK_VOTE)}
        >
          {t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.continue')}
        </Button>
      </TransactionFooter>
      <SwModal
        closable={true}
        id={REFERENDA_VOTED_MODAL_ID}
        onCancel={onCancelReferendaVotedModal}
        title={t('ui.TRANSACTION.screen.Transaction.GovUnlockVote.referendaVoted')}
      >
        <MetaInfo
          hasBackgroundWrapper
        >
          <MetaInfo.Data
            valueColorSchema={'gray'}
          >
            {
              unlockableReferenda.map((id, index) => (
                <span key={id}>{`#${id}`}
                  { index < unlockableReferenda.length - 1 ? ', ' : '' }
                </span>
              ))
            }
          </MetaInfo.Data>
        </MetaInfo>
      </SwModal>

    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className } = props;
  const { defaultData } = useTransactionContext<GovUnlockVoteParams>();
  const { goHome } = useDefaultNavigate();
  const { isAllAccount } = useSelector((state) => state.accountState);
  const dataContext = useContext(DataContext);

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
    <PageWrapper
      className={className}
      resolve={dataContext.awaitStores(['openGov', 'balance'])}
    >
      <Component
        isAllAccount={isAllAccount}
      />
    </PageWrapper>

  );
};

const GovUnlockVote = styled(Wrapper)<WrapperProps>(({ theme: { token } }: WrapperProps) => {
  return {
    display: 'flex',
    flexDirection: 'column',

    '.free-balance': {
      marginBottom: token.marginSM
    },

    '.referenda-voted-button': {
      cursor: 'pointer',
      transition: 'all 0.3s',

      '&:hover': {
        color: token.colorTextLight1
      }
    },

    '.__total-amount-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0px 12px',
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgSecondary,
      marginTop: token.sizeSM,
      fontSize: token.fontSizeHeading6
    },

    '&.-transaction-footer': {
      gap: token.sizeSM,
      marginBottom: 0,
      padding: token.padding,
      paddingBottom: token.paddingXL
    }
  };
});

export default GovUnlockVote;
