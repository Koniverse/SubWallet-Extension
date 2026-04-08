// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LeavePoolAdditionalData, YieldPoolType } from '@subwallet/extension-base/types';
import { MetaInfo } from '@subwallet/extension-web-ui/components';
import { ThemeProps, TransactionHistoryDisplayItem } from '@subwallet/extension-web-ui/types';
import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  data: TransactionHistoryDisplayItem;
}

const Component: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { data } = props;
  const { amount } = data;

  const additionalInfo = data.additionalInfo as LeavePoolAdditionalData;

  const isLending = useMemo(() => additionalInfo.type === YieldPoolType.LENDING, [additionalInfo.type]);
  const amountValue = useMemo(() => new BigN(amount?.value || '0'), [amount?.value]);
  const estimatedValue = useMemo(
    () => amountValue.multipliedBy(additionalInfo.exchangeRate),
    [additionalInfo.exchangeRate, amountValue]
  );
  const minReceiveValue = useMemo(
    () => estimatedValue.multipliedBy(additionalInfo.minAmountPercent),
    [additionalInfo.minAmountPercent, estimatedValue]
  );

  return (
    <>
      <MetaInfo.Number
        decimals={amount?.decimals || undefined}
        label={t('ui.POOL_LEAVE_AMOUNT.Popup.Home.History.Detail.parts.PoolLeaveAmount.amount')}
        suffix={amount?.symbol || undefined}
        value={amountValue}
      />
      {!isLending && (
        <MetaInfo.Number
          decimals={additionalInfo.decimals}
          label={t('ui.POOL_LEAVE_AMOUNT.Popup.Home.History.Detail.parts.PoolLeaveAmount.estimatedReceivables')}
          suffix={additionalInfo.symbol}
          value={estimatedValue}
        />
      )}
      {additionalInfo.isFast && (
        <MetaInfo.Number
          decimals={additionalInfo.decimals}
          label={t('ui.POOL_LEAVE_AMOUNT.Popup.Home.History.Detail.parts.PoolLeaveAmount.minimumReceivables')}
          suffix={additionalInfo.symbol}
          value={minReceiveValue}
        />
      )}
    </>
  );
};

export const PoolLeaveAmount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});
