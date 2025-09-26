// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RemoveVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { MetaInfo, NumberDisplay, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useGetGovVoteConfirmationInfo, useGetNativeTokenBasicInfo, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { VoteMetaInfo } from '@subwallet/extension-koni-ui/Popup/Confirmations/variants/Transaction/variants/index';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Number } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import React, { useContext } from 'react';
import styled from 'styled-components';

export interface BaseTransactionConfirmationProps extends ThemeProps {
  transaction: SWTransactionResult;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const Component: React.FC<BaseTransactionConfirmationProps> = (props: BaseTransactionConfirmationProps) => {
  const { className, transaction } = props;
  const data = transaction.data as RemoveVoteRequest;
  const { t } = useTranslation();

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const account = useGetAccountByAddress(transaction.address);
  const networkPrefix = useGetChainPrefixBySlug(transaction.chain);
  const { currencyData } = useSelector((state: RootState) => state.price);

  const govConfirmationInfo = useGetGovVoteConfirmationInfo({
    address: transaction.address,
    chain: transaction.chain,
    amount: new BigNumber(data.totalAmount),
    transactionFee: transaction.estimateFee?.value,
    isUnVote: true
  });

  return (
    <div className={CN(className)}>
      <div className={'overview-info-wrapper'}>
        {data.type && (<VoteMetaInfo
          type={data.type}
        />)}
        <Number
          className={'__voted-amount'}
          decimal={decimals}
          size={30}
          suffix={symbol}
          value={data.totalAmount}
        />
        <Number
          decimal={0}
          decimalOpacity={0.45}
          intOpacity={0.45}
          prefix={(currencyData?.isPrefix && currencyData.symbol) || ''}
          size={16}
          suffix={(!currencyData?.isPrefix && currencyData?.symbol) || ''}
          unitOpacity={0.45}
          value={govConfirmationInfo?.convertedAmount || 0}
          weight={500}
        />
      </div>
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Account
          address={account?.address || transaction.address}
          chainSlug={transaction.chain}
          label={t('Account')}
          name={account?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Number
          decimals={decimals}
          label={t('Network fee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >
        <MetaInfo.Default
          className={'transferable-value-info'}
          label={t('Transferable')}
        >
          {
            !!govConfirmationInfo?.transferable.from && (
              <>
                <NumberDisplay
                  className={'transferable-value-from'}
                  decimal={decimals}
                  value={govConfirmationInfo?.transferable.from}
                />
                <span className={'governance-trans'}>&nbsp;→&nbsp;</span>
              </>
            )
          }
          <NumberDisplay
            className={'transferable-value-to'}
            decimal={decimals}
            suffix={symbol}
            value={govConfirmationInfo?.transferable.to || '0'}
          />
        </MetaInfo.Default>
        <MetaInfo.Default
          className={'governance-lock-value-info'}
          label={t('Governance lock')}
        >
          {
            !!govConfirmationInfo?.governanceLock.from && (
              <>
                <NumberDisplay
                  className={'governance-lock-value-from'}
                  decimal={decimals}
                  value={govConfirmationInfo?.governanceLock.from}
                />
                <span className={'governance-trans'}>&nbsp;→&nbsp;</span>
              </>
            )
          }
          <NumberDisplay
            className={'governance-lock-value-to'}
            decimal={decimals}
            suffix={symbol}
            value={govConfirmationInfo?.governanceLock.to || '0'}
          />
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Referenda')}
        >
          #{data.referendumIndex}
        </MetaInfo.Default>
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

const GovUnvoteTransactionConfirmation = styled(Wrapper)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
  return {
    '.address-field': {
      whiteSpace: 'nowrap'
    },

    '.__voted-amount': {
      '.ant-number-suffix': {
        color: `${token.colorTextSecondary} !important`,
        fontSize: `${token.fontSizeHeading3}px !important`,
        fontWeight: 'inherit !important',
        lineHeight: token.lineHeightHeading3
      }
    },

    '.transferable-value-info, .governance-lock-value-info': {
      '.__value-col .__value': {
        display: 'flex'
      }
    },

    '.overview-info-wrapper': {
      paddingBottom: 24
    }
  };
});

export default GovUnvoteTransactionConfirmation;
