// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UnlockVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { AccountProxyAvatar, MetaInfo, NumberDisplay, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetAccountByAddress, useGetGovVoteConfirmationInfo, useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Number } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

export interface BaseTransactionConfirmationProps extends ThemeProps {
  transaction: SWTransactionResult;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const Component: React.FC<BaseTransactionConfirmationProps> = (props: BaseTransactionConfirmationProps) => {
  const { className, transaction } = props;
  const data = transaction.data as UnlockVoteRequest;
  const { t } = useTranslation();
  const currency = useSelector((state: RootState) => state.price.currencyData);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const account = useGetAccountByAddress(transaction.address);
  const shortAddress = toShort(transaction.address);

  const govConfirmationInfo = useGetGovVoteConfirmationInfo({
    address: transaction.address,
    chain: transaction.chain,
    amount: new BigNumber(data.amount),
    transactionFee: transaction.estimateFee?.value,
    isUnlock: true
  });

  return (
    <div className={CN(className)}>
      <div className={'__vote-amount-wrapper'}>

        <Number
          className={'__vote-amount'}
          decimal={decimals}
          formatType={'balance'}
          size={30}
          suffix={symbol}
          value={data.amount}
          weight={600}
        />

        <Number
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
            label={t('Account')}
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
          label={t('Address')}
        >
          {shortAddress}
        </MetaInfo.Default>

        <MetaInfo.Number
          decimals={decimals}
          label={t('Network fee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
      <MetaInfo
        className={'__meta-info'}
        hasBackgroundWrapper
      >
        {!!govConfirmationInfo &&
          <>
            <MetaInfo.Default
              className={'governance-value-info'}
              label={t('Transferable')}
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
              label={t('Governance lock')}
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
      </MetaInfo>
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

const GovUnlockTransactionConfirmation = styled(Wrapper)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
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

export default GovUnlockTransactionConfirmation;
