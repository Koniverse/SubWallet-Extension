// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestChangeBittensorRootClaimType } from '@subwallet/extension-base/types';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import CommonTransactionInfo from '@subwallet/extension-koni-ui/components/Confirmation/CommonTransactionInfo';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import useGetNativeTokenBasicInfo from '@subwallet/extension-koni-ui/hooks/common/useGetNativeTokenBasicInfo';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;

  const data = transaction.data as RequestChangeBittensorRootClaimType;

  const { t } = useTranslation();

  const { decimals, symbol } = useGetNativeTokenBasicInfo(data.chain);
  const isKeepClaim = useMemo(() => data.bittensorRootClaimType === 'Keep', [data.bittensorRootClaimType]);

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
        <MetaInfo.Default label={t('ui.TRANSACTION.Confirmations.ChangeBittensorRootClaimReward.claimRewardsType')}>
          {data.bittensorRootClaimType}
        </MetaInfo.Default>
        <MetaInfo.Number
          decimals={decimals}
          label={t('ui.TRANSACTION.Confirmations.ChangeBittensorRootClaimReward.estimatedFee')}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
      <AlertBox
        description={isKeepClaim ? t('ui.TRANSACTION.Confirmations.ChangeBittensorRootClaimReward.alphaClaimDescription') : t('ui.TRANSACTION.Confirmations.ChangeBittensorRootClaimReward.TAOClaimDescription') }
        title={isKeepClaim ? t('ui.TRANSACTION.Confirmations.ChangeBittensorRootClaimReward.alphaClaimTitle') : t('ui.TRANSACTION.Confirmations.ChangeBittensorRootClaimReward.TAOClaimTitle')}
        type={'info'}
      />
    </div>
  );
};

const ChangeBittensorRootClaimRewardType = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.meta-info': {
      marginBottom: token.marginSM
    }
  };
});

export default ChangeBittensorRootClaimRewardType;
