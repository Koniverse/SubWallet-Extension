// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType, RequestUnbondingSubmit } from '@subwallet/extension-base/background/KoniTypes';
import { SubnetYieldLeaveParams } from '@subwallet/extension-base/types';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { formatBalance } from '@subwallet/extension-koni-ui/utils';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, closeAlert, openAlert, transaction } = props;
  const data = transaction.data as RequestUnbondingSubmit & Pick<SubnetYieldLeaveParams, 'expectedTao'>;
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const subnetSymbol = data.poolInfo?.metadata.subnetData?.subnetSymbol;
  const stakingFee = data.stakingFee;
  const expectedTao = data.expectedTao;
  const networkFee = transaction.estimateFee?.value;

  // A small Bittensor position can return less TAO than the transaction costs (EXT-26)
  useEffect(() => {
    if (expectedTao === undefined || !networkFee || new BigN(expectedTao).gt(networkFee)) {
      return;
    }

    openAlert({
      title: t('ui.TRANSACTION.Confirmations.Unbond.payAttentionExclamation'),
      type: NotificationType.WARNING,
      content: t('ui.TRANSACTION.Confirmations.Unbond.receiveNotMoreThanFeeWarning', { replace: { amount: formatBalance(expectedTao, decimals), fee: formatBalance(networkFee, decimals), symbol } }),
      okButton: {
        text: t('ui.TRANSACTION.Confirmations.Unbond.iUnderstand'),
        onClick: closeAlert,
        icon: CheckCircle
      }
    });
  }, [closeAlert, decimals, expectedTao, networkFee, openAlert, symbol, t]);

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
        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Unbond.unstakeAmount')}
          suffix={subnetSymbol || symbol}
          value={data.amount}
        />

        {!transaction.wrappingStatus && <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Unbond.networkFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />}
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
