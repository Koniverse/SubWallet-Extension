// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { useGetChainPrefixBySlug } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const data = transaction.data as RequestBondingSubmit;
  const handleValidatorLabel = useMemo(() => {
    return getValidatorLabel(transaction.chain);
  }, [transaction.chain]);
  const networkPrefix = useGetChainPrefixBySlug(transaction.chain);

  const stakingFee = data.subnetData?.stakingFee;

  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

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
          content={t('ui.TRANSACTION.Confirmations.Bond.numberSelectedValidator', { replace: { number: data.selectedValidators.length, validatorLabel: handleValidatorLabel.toLowerCase() } })}
          identPrefix={networkPrefix}
          label={t(data.type === StakingType.POOLED ? 'Pool' : handleValidatorLabel)}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Bond.amount')}
          suffix={symbol}
          value={data.amount}
        />

        {!transaction?.isWrappedTx && <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.Bond.estimatedFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />}
      </MetaInfo>
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
