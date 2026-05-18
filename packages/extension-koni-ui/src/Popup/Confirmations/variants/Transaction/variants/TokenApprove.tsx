// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TokenSpendingApprovalParams } from '@subwallet/extension-base/types';
import { CommonTransactionInfo, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { BN_TEN } from '@subwallet/extension-koni-ui/constants';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, transaction } = props;
  const { t } = useTranslation();

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const { currencyData, priceMap } = useSelector((root: RootState) => root.price);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);

  const txParams = useMemo((): TokenSpendingApprovalParams => {
    return transaction.data as TokenSpendingApprovalParams;
  }, [transaction.data]);

  const convertedFeeValueToUSD = useMemo(() => {
    if (!transaction.estimateFee?.value) {
      return 0;
    }

    const nativeTokenSlug = `${transaction.chain}-NATIVE-${symbol}`;
    const nativeTokenInfo = assetRegistryMap[nativeTokenSlug];

    const priceId = nativeTokenInfo?.priceId;

    const tokenPrice = priceId ? (priceMap[priceId] || 0) : 0;

    return new BigN(transaction.estimateFee.value)
      .multipliedBy(tokenPrice)
      .dividedBy(BN_TEN.pow(decimals || 0))
      .toNumber();
  }, [
    assetRegistryMap,
    decimals,
    priceMap,
    symbol,
    transaction.chain,
    transaction.estimateFee?.value
  ]);

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
        <MetaInfo.Account
          address={txParams.contractAddress}
          label={t('ui.TRANSACTION.Confirmations.TokenApprove.contract')}
        />

        <MetaInfo.Account
          address={txParams.spenderAddress}
          label={t('ui.TRANSACTION.Confirmations.TokenApprove.spenderContract')}
        />
        <div className={'__row -type-default __fee-row'}>
          <div className={'__field-line-1'}>
            <div className={'__label'}>
              {t('ui.TRANSACTION.Confirmations.TokenApprove.networkFee')}
            </div>

            <div className={'__value'}>
              <Number
                decimal={decimals}
                suffix={symbol}
                value={transaction.estimateFee?.value || 0}
              />
            </div>
          </div>

          <div className={'__field-line-2'}>
            <Number
              className={'__fee-price-value'}
              decimal={0}
              prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
              suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              value={convertedFeeValueToUSD}
            />
          </div>
        </div>
      </MetaInfo>
    </div>
  );
};

const TokenApproveConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__fee-price-value': {
      fontSize: token.fontSizeSM,
      lineHeight: '20px',
      color: token.colorTextTertiary
    },
    '.__fee-row': {
      flexDirection: 'column',
      overflow: 'visible'
    },
    '.__field-line-1': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: token.sizeXXS,
      width: '100%'
    },
    '.__field-line-2': {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '100%'
    }
  };
});

export default TokenApproveConfirmation;
