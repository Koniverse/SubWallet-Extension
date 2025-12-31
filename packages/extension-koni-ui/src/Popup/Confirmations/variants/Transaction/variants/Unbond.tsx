// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestUnbondingSubmit } from '@subwallet/extension-base/background/KoniTypes';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as RequestUnbondingSubmit;
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const subnetSymbol = data.poolInfo?.metadata.subnetData?.subnetSymbol;
  const stakingFee = data.stakingFee;

  return (
    <div className={CN(className)}>
      <CommonTransactionInfo
        address={transaction.address}
        network={transaction.chain}
      />
      <MetaInfo
        className={'meta-info'}
        hasBackgroundWrapper
      >

        {!!transaction.signerSubstrateProxyAddress &&
          <MetaInfo.Account
            address={transaction.signerSubstrateProxyAddress}
            chainSlug={transaction.chain}
            label={t('ui.TRANSACTION.Confirmations.Unbond.signWith')}
          />
        }

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Unbond.unstakeAmount')}
          suffix={subnetSymbol || symbol}
          value={data.amount}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Unbond.estimatedFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
      {!!stakingFee && (
        <AlertBox
          className={CN(className, 'alert-box')}
          description={t('ui.TRANSACTION.Confirmations.Unbond.taoUnstakingFeeDeductedInfo', { replace: { fee: stakingFee } })}
          title={t('ui.TRANSACTION.Confirmations.Unbond.taoUnstakingFee')}
          type='info'
        />
      )}
    </div>
  );
};

const UnbondTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.alert-box': {
      marginTop: token.marginSM
    }
  };
});

export default UnbondTransactionConfirmation;
