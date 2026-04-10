// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { AlertBox } from '@subwallet/extension-web-ui/components';
import CommonTransactionInfo from '@subwallet/extension-web-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-web-ui/components/MetaInfo/MetaInfo';
import useGetNativeTokenBasicInfo from '@subwallet/extension-web-ui/hooks/common/useGetNativeTokenBasicInfo';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as RequestBondingSubmit;

  const { t } = useTranslation();

  const stakingFee = data.subnetData?.stakingFee;

  const handleValidatorLabel = useMemo(() => {
    return getValidatorLabel(transaction.chain);
  }, [transaction.chain]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const pluralizedValidators = data.selectedValidators.length > 1 ? `${handleValidatorLabel.toLowerCase()}s` : handleValidatorLabel.toLowerCase();

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
        <MetaInfo.AccountGroup
          accounts={data.selectedValidators}
          content={t('ui.TRANSACTION.Confirmations.Bond.numberSelectedValidator', { replace: { number: data.selectedValidators.length, validatorLabel: pluralizedValidators } })}
          label={data.type === StakingType.POOLED ? t('ui.TRANSACTION.screen.Transaction.Earn.pool') : t(handleValidatorLabel)}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Process.Earn.Bond.amount')}
          suffix={symbol}
          value={data.amount}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Process.Earn.Bond.estimatedFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      {/* <AlertBox */}
      {/*  className={'description'} */}
      {/*  description={t('ui.JOIN_POOL.Popup.Confirmations.variants.Transaction.variants.JoinPool.onceStakedYourFundsWillBeLockedAndBecomeNonTransferableToUnlockYourFundsYouNeedToUnstakeManuallyWaitForTheUnstakingPeriodToEndAndThenWithdrawManually')} */}
      {/*  title={t('ui.JOIN_POOL.Popup.Confirmations.variants.Transaction.variants.JoinPool.yourStakedFundsWillBeLocked')} */}
      {/*  type='warning' */}
      {/* /> */}

      {!!stakingFee && (
        <AlertBox
          className={CN(className, 'alert-box')}
          description={t('ui.TRANSACTION.Confirmations.Bond.taoStakingFeeDeductedInfo', { replace: { fee: stakingFee } })}
          title={t('ui.TRANSACTION.Confirmations.Bond.taoStakingFee')}
          type='info'
        />
      )}
    </div>
  );
};

const BondTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.alert-box': {
      marginTop: token.marginSM
    }
  };
});

export default BondTransactionConfirmation;
