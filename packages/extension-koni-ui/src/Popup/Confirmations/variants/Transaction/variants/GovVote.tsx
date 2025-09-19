// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govConvictionOptions, GovVoteRequest, GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { MetaInfo, VoteTypeLabel } from '@subwallet/extension-koni-ui/components';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Number } from '@subwallet/react-ui';
import BigNumber from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

export interface BaseTransactionConfirmationProps extends ThemeProps {
  transaction: SWTransactionResult;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const Component: React.FC<BaseTransactionConfirmationProps> = (props: BaseTransactionConfirmationProps) => {
  const { className, transaction } = props;
  const data = transaction.data as GovVoteRequest;

  const { t } = useTranslation();

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

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

  const convictionInfo = useMemo(() => {
    return govConvictionOptions.find((c) => c.value === data.conviction) || { label: '-', description: '-' };
  }, [data.conviction]);

  const account = useGetAccountByAddress(transaction.address);
  const networkPrefix = useGetChainPrefixBySlug(transaction.chain);

  return (
    <div className={CN(className)}>

      <VoteTypeLabel
        type={data.type}
      />

      <Number
        className={'__voted-amount'}
        decimal={decimals}
        suffix={symbol}
        value={totalAmount}
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
          label={t('Conviction')}
        >
          {convictionInfo.label}
        </MetaInfo.Default>
        <MetaInfo.Default
          label={t('Lock duration')}
        >
          {convictionInfo.description}
        </MetaInfo.Default>
      </MetaInfo>
    </div>
  );
};

const GovVoteTransactionConfirmation = styled(Component)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
  return {
    '.address-field': {
      whiteSpace: 'nowrap'
    }
  };
});

export default GovVoteTransactionConfirmation;
