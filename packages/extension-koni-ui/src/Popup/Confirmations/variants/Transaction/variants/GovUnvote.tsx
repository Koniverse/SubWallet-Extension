// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RemoveVoteRequest } from '@subwallet/extension-base/services/open-gov/interface';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { MetaInfo, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Number } from '@subwallet/react-ui';
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

  return (
    <div className={CN(className)}>
      <div>{data.type}</div>
      <Number
        className={'__voted-amount'}
        decimal={decimals}
        suffix={symbol}
        value={data.totalAmount}
      />
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
    }
  };
});

export default GovUnvoteTransactionConfirmation;
