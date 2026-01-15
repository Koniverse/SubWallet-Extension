// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteRequest, GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { getGovConvictionOptions } from '@subwallet/extension-base/services/open-gov/utils';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountProxyAvatar, MetaInfo, NumberDisplay, PageWrapper, VoteAmountDetail, VoteTypeLabel } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetAccountByAddress, useGetGovVoteConfirmationInfo, useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { VoteAmountDetailProps } from '@subwallet/extension-koni-ui/types/gov';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

export interface BaseTransactionConfirmationProps extends ThemeProps {
  transaction: SWTransactionResult;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const VoteAmountDetailModalId = 'vote-amount-detail-modal';

const Component: React.FC<BaseTransactionConfirmationProps> = (props: BaseTransactionConfirmationProps) => {
  const { className, transaction } = props;
  const data = transaction.data as GovVoteRequest;
  const { t } = useTranslation();
  const currency = useSelector((state: RootState) => state.price.currencyData);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const account = useGetAccountByAddress(transaction.address);
  const shortAddress = toShort(transaction.address);

  const totalAmount = useMemo(() => {
    switch (data.type) {
      case GovVoteType.AYE:
      case GovVoteType.NAY:
        return new BigNumber(data.amount ?? 0);

      case GovVoteType.SPLIT:
        return new BigNumber(data.ayeAmount ?? 0).plus(data.nayAmount ?? 0);

      case GovVoteType.ABSTAIN:
        return new BigNumber(data.abstainAmount ?? 0)
          .plus(data.ayeAmount ?? 0)
          .plus(data.nayAmount ?? 0);

      default:
        return new BigNumber(0);
    }
  }, [data]);

  const amountDetail = useMemo<VoteAmountDetailProps>(() => {
    switch (data.type) {
      case GovVoteType.AYE:
        return { ayeAmount: data.amount };
      case GovVoteType.NAY:
        return { nayAmount: data.amount };

      case GovVoteType.SPLIT:
        return {
          ayeAmount: data.ayeAmount,
          nayAmount: data.nayAmount
        };

      case GovVoteType.ABSTAIN:
        return {
          ayeAmount: data.ayeAmount,
          nayAmount: data.nayAmount,
          abstainAmount: data.abstainAmount
        };

      default:
        return {};
    }
  }, [data]);

  const govConfirmationInfo = useGetGovVoteConfirmationInfo({
    address: transaction.address,
    chain: transaction.chain,
    amount: totalAmount,
    transactionFee: transaction.estimateFee?.value,
    signerSubstrateProxyAddress: transaction.signerSubstrateProxyAddress
  });

  const govConvictionOptions = useMemo(() => {
    return getGovConvictionOptions(transaction.chain);
  }, [transaction.chain]);

  const convictionInfo = useMemo(() => {
    return govConvictionOptions.find((c) => c.value === data.conviction) || { label: '-', description: '-' };
  }, [data.conviction, govConvictionOptions]);

  const onCancel = useCallback(() => {
    inactiveModal(VoteAmountDetailModalId);
  }, [inactiveModal]);

  const onClickDetail = useCallback(() => {
    activeModal(VoteAmountDetailModalId);
  }, [activeModal]);

  return (
    <div className={CN(className)}>
      <div className={'__vote-amount-wrapper'}>
        <div className={'__vote-type-label-wrapper'}>
          <VoteTypeLabel
            type={data.type}
          />
          {Object.values(amountDetail).length > 1 && <div onClick={onClickDetail}>
            <Icon
              className={'__i-vote-amount-detail'}
              customSize={'16px'}
              phosphorIcon={Info}
              weight={'bold'}
            />
          </div>}
        </div>

        <NumberDisplay
          className={'__vote-amount'}
          decimal={decimals}
          formatType={'balance'}
          size={30}
          suffix={symbol}
          value={totalAmount}
          weight={600}
        />

        <NumberDisplay
          decimal={0}
          decimalOpacity={0.45}
          intOpacity={0.45}
          prefix={(currency?.isPrefix && currency.symbol) || ''}
          size={16}
          suffix={(!currency?.isPrefix && currency?.symbol) || ''}
          unitOpacity={0.45}
          value={govConfirmationInfo?.convertedAmount || 0}
          weight={500}
        />
      </div>

      <MetaInfo
        className={'__meta-info'}
        hasBackgroundWrapper
      >
        {!!account?.name &&
          <MetaInfo.Default
            className={'__account-field'}
            label={t('ui.TRANSACTION.Confirmations.GovVote.account')}
          >
            <AccountProxyAvatar
              className={'__account-avatar'}
              size={24}
              value={account.proxyId || transaction.address}
            />
            <div className={'__account-item-name'}>{account.name}</div>
          </MetaInfo.Default>
        }

        <MetaInfo.Default
          className={'__address-field'}
          label={t('ui.TRANSACTION.Confirmations.GovVote.address')}
        >
          {shortAddress}
        </MetaInfo.Default>

        {!transaction.wrappingStatus && <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.GovVote.networkFee')}
          suffix={symbol}
          useNumberDisplay={true}
          value={transaction.estimateFee?.value || 0}
        />}
      </MetaInfo>
      <MetaInfo
        className={'__meta-info'}
        hasBackgroundWrapper
      >
        {!!govConfirmationInfo &&
          <>
            <MetaInfo.Default
              className={'governance-value-info'}
              label={t('ui.TRANSACTION.Confirmations.GovVote.transferable')}
            >
              {
                !!govConfirmationInfo?.transferable.from && (
                  <>
                    <NumberDisplay
                      className={'governance-value-from'}
                      decimal={decimals}
                      value={govConfirmationInfo?.transferable.from}
                    />
                    <span className={'governance-trans'}>&nbsp;→&nbsp;</span>
                  </>
                )
              }
              <NumberDisplay
                className={'governance-value-to'}
                decimal={decimals}
                suffix={symbol}
                value={govConfirmationInfo.transferable.to}
              />
            </MetaInfo.Default>
            <MetaInfo.Default
              className={'governance-value-info'}
              label={t('ui.TRANSACTION.Confirmations.GovVote.governanceLock')}
            >
              {
                !!govConfirmationInfo?.governanceLock.from && (
                  <>
                    <NumberDisplay
                      className={'governance-value-from'}
                      decimal={decimals}
                      value={govConfirmationInfo?.governanceLock.from}
                    />
                    <span className={'governance-trans'}>&nbsp;→&nbsp;</span>
                  </>
                )
              }
              <NumberDisplay
                className={'governance-value-to'}
                decimal={decimals}
                suffix={symbol}
                value={govConfirmationInfo.governanceLock.to}
              />
            </MetaInfo.Default>
          </>
        }
        <MetaInfo.Default
          label={t('ui.TRANSACTION.Confirmations.GovVote.conviction')}
        >
          {convictionInfo.label}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('ui.TRANSACTION.Confirmations.GovVote.lockDuration')}
        >
          {convictionInfo.description}
        </MetaInfo.Default>
      </MetaInfo>

      <SwModal
        className={CN(className, '__transaction-detail-modal')}
        closable={true}
        id={VoteAmountDetailModalId}
        onCancel={onCancel}
        title={t('ui.TRANSACTION.Confirmations.GovVote.voteAmountDetails')}
      >
        <VoteAmountDetail
          amountDetail={amountDetail}
          decimals={decimals}
          symbol={symbol}
        />
      </SwModal>
    </div>
  );
};

const Wrapper = (props: BaseTransactionConfirmationProps) => {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={CN(props.className)}
      hideLoading={true}
      resolve={dataContext.awaitStores(['openGov', 'balance'])}
    >
      <Component {...props} />
    </PageWrapper>
  );
};

const GovVoteTransactionConfirmation = styled(Wrapper)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
  return {
    '.__vote-amount-wrapper': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.sizeXXS,
      marginBottom: token.marginLG,

      '.__label': {
        fontWeight: token.headingFontWeight
      }
    },

    '.__vote-amount': {
      '.ant-number-suffix': {
        fontSize: `${token.fontSizeHeading3}px !important`,
        lineHeight: `${token.lineHeightHeading3} !important`,
        color: `${token.colorTextLight3} !important`
      }
    },

    '.__vote-type-label-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXXS,

      '.__i-vote-amount-detail': {
        color: token.colorTextLight1,
        opacity: 0.45,
        transition: 'opacity 0.2s',
        cursor: 'pointer',

        '&:hover': {
          opacity: 1
        }
      }
    },

    '.__account-field .__value': {
      display: 'flex',
      overflow: 'hidden',
      gap: token.sizeXS
    },

    '.address-field': {
      whiteSpace: 'nowrap'
    },

    '.governance-value-info': {
      '.__value': {
        display: 'inherit'
      }
    }
  };
});

export default GovVoteTransactionConfirmation;
