// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, TransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ClaimPolygonBridgeNotificationMetadata, NotificationActionType } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { RequestClaimBridge } from '@subwallet/extension-base/types/bridge';
import { BN_TEN } from '@subwallet/extension-base/utils';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps, TransactionHistoryDisplayItem } from '@subwallet/extension-koni-ui/types';
import { isPoolLeave, isTypeMint, isTypeStaking } from '@subwallet/extension-koni-ui/utils';
import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { PoolLeaveAmount } from './PoolLeaveAmount';

interface Props extends ThemeProps {
  data: TransactionHistoryDisplayItem;
}

const Component: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { amount, type: transactionType } = data;

  const { assetRegistry } = useSelector((state) => state.assetRegistry);

  const { t } = useTranslation();

  const isStaking = isTypeStaking(data.type);
  const isCrowdloan = data.type === ExtrinsicType.CROWDLOAN;
  const isNft = data.type === ExtrinsicType.SEND_NFT;
  const isMint = isTypeMint(data.type);
  const isLeavePool = isPoolLeave(data.type);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const additionalInfo = data.additionalInfo;

  const amountLabel = useMemo((): string => {
    switch (transactionType) {
      case ExtrinsicType.STAKING_BOND:
      case ExtrinsicType.STAKING_JOIN_POOL:
        return t('ui.HISTORY.screen.HistoryDetail.Amount.stakingValue');
      case ExtrinsicType.STAKING_WITHDRAW:
      case ExtrinsicType.STAKING_POOL_WITHDRAW:
        return t('ui.HISTORY.screen.HistoryDetail.Amount.withdrawValue');
      case ExtrinsicType.STAKING_UNBOND:
        return t('ui.HISTORY.screen.HistoryDetail.Amount.unstakeValue');
      case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
        return t('ui.HISTORY.screen.HistoryDetail.Amount.cancelUnstakeValue');
      case ExtrinsicType.CROWDLOAN:
        return t('ui.HISTORY.screen.HistoryDetail.Amount.contributeBalance');
      default:
        return t('ui.HISTORY.screen.HistoryDetail.Amount.amount');
    }
  }, [t, transactionType]);

  const derivativeTokenSlug = useMemo((): string | undefined => {
    if (isMint) {
      if (additionalInfo) {
        return (additionalInfo as TransactionAdditionalInfo[ExtrinsicType.MINT_QDOT])?.derivativeTokenSlug;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }, [additionalInfo, isMint]);

  const amountDerivative = useMemo(() => {
    if (amount && derivativeTokenSlug && additionalInfo) {
      const rate = (additionalInfo as TransactionAdditionalInfo[ExtrinsicType.MINT_QDOT])?.exchangeRate;

      if (rate) {
        return new BigN(amount.value).div(BN_TEN.pow(amount.decimals)).div(rate);
      }
    }

    return undefined;
  }, [additionalInfo, amount, derivativeTokenSlug]);

  const derivativeSymbol = useMemo(() => {
    return derivativeTokenSlug ? assetRegistry[derivativeTokenSlug].symbol : '';
  }, [assetRegistry, derivativeTokenSlug]);

  const isHiddenValue = useMemo(() => {
    return data.type === ExtrinsicType.CHANGE_BITTENSOR_ROOT_CLAIM_TYPE;
  }, [data.type]);

  if (isLeavePool && data.additionalInfo) {
    return <PoolLeaveAmount data={data} />;
  }

  let amountValue = amount?.value;

  if (data.type === ExtrinsicType.CLAIM_BRIDGE) {
    const additionalInfo = data.additionalInfo as RequestClaimBridge;

    if (additionalInfo.notification.actionType === NotificationActionType.CLAIM_POLYGON_BRIDGE) {
      const metadata = additionalInfo.notification.metadata as ClaimPolygonBridgeNotificationMetadata;

      amountValue = metadata.amounts[0];
    }
  }

  let symbol = amount?.symbol;

  if (data.type === ExtrinsicType.STAKING_UNBOND || data.type === ExtrinsicType.CHANGE_EARNING_VALIDATOR) {
    const additionalInfo = data.additionalInfo as RequestClaimBridge;

    if (additionalInfo?.symbol) {
      symbol = additionalInfo.symbol;
    }
  }

  return (
    <>
      {
        !isHiddenValue && (isStaking || isCrowdloan || amount) &&
          (
            <MetaInfo.Number
              decimals={amount?.decimals || undefined}
              label={amountLabel}
              suffix={symbol || undefined}
              value={amountValue || '0'}
            />
          )
      }
      {isMint && amountDerivative && (
        <MetaInfo.Number
          decimals={0}
          label={t('ui.HISTORY.screen.HistoryDetail.Amount.estimatedReceivables')}
          suffix={derivativeSymbol}
          value={amountDerivative}
        />
      )}
      {data.additionalInfo && isNft && (
        <MetaInfo.Default
          label={t('ui.HISTORY.screen.HistoryDetail.Amount.collectionName')}
        >
          {(data.additionalInfo as TransactionAdditionalInfo[ExtrinsicType.SEND_NFT]).collectionName}
        </MetaInfo.Default>
      )}
    </>
  );
};

const HistoryDetailAmount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default HistoryDetailAmount;
