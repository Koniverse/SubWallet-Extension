// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { balanceNoPrefixFormater } from '@subwallet/extension-base/utils';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import { useGetChainPrefixBySlug } from '@subwallet/extension-koni-ui/hooks';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import { getEarningImpact } from '@subwallet/extension-koni-ui/messaging';
import { formatNumber } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
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

  const poolPosition = data.poolPosition;
  const [stakingFee, setStakingFee] = useState<string | undefined>();

  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const isBittensorChain = useMemo(() => {
    return data.poolPosition?.chain === 'bittensor' || data.poolPosition?.chain === 'bittensor_testnet';
  }, [data.poolPosition?.chain]);

  useEffect(() => {
    if (!poolPosition || !isBittensorChain) {
      return;
    }

    getEarningImpact({
      slug: poolPosition.slug,
      value: data.amount,
      netuid: data.subnetData?.netuid || 0,
      type: ExtrinsicType.STAKING_BOND
    }).then((impact) => {
      const stakingTaoFee = formatNumber(impact.stakingTaoFee || '0', decimals, balanceNoPrefixFormater);

      setStakingFee(stakingTaoFee);
    }).catch((error) => {
      console.error('Failed to get earning impact:', error);
    });
  }, [data.amount, data.subnetData?.netuid, decimals, isBittensorChain, poolPosition]);

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
          content={t(`{{number}} selected ${handleValidatorLabel.toLowerCase()}`, { replace: { number: data.selectedValidators.length } })}
          identPrefix={networkPrefix}
          label={t(data.type === StakingType.POOLED ? 'Pool' : handleValidatorLabel)}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('Amount')}
          suffix={symbol}
          value={data.amount}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={t('Estimated fee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
      {stakingFee && (
        <AlertBox
          className={CN(className, 'alert-box')}
          description={t('A staking fee of {{fee}} TAO will be deducted from your stake once the transaction is complete', { replace: { fee: stakingFee } })}
          title={t('TAO staking fee')}
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
