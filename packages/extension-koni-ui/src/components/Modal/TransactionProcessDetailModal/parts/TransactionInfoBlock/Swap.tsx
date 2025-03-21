// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';
import { SwapBaseTxData } from '@subwallet/extension-base/types';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { SwapTransactionBlock } from '@subwallet/extension-koni-ui/components/Swap';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getCurrentCurrencyTotalFee } from '@subwallet/extension-koni-ui/utils';
import { Number } from '@subwallet/react-ui';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TransactionInfoBlockProps } from './types';

type Props = TransactionInfoBlockProps;

const Component: FC<Props> = (props: Props) => {
  const { className, processData } = props;

  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const { t } = useTranslation();
  const data = processData.combineInfo as SwapBaseTxData;

  const recipientAddress = data.recipient || data.address;
  const recipient = useGetAccountByAddress(recipientAddress);
  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.to] || undefined;
  }, [assetRegistryMap, data.quote.pair.to]);
  const networkPrefix = useGetChainPrefixBySlug(toAssetInfo?.originChain);
  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.from] || undefined;
  }, [assetRegistryMap, data.quote.pair.from]);

  const estimatedFeeValue = useMemo(() => {
    return getCurrentCurrencyTotalFee(data.quote.feeInfo.feeComponent, assetRegistryMap, priceMap);
  }, [assetRegistryMap, data.quote.feeInfo.feeComponent, priceMap]);

  const renderRateConfirmInfo = () => {
    return (
      <div className={'__quote-rate-wrapper'}>
        <Number
          decimal={0}
          suffix={_getAssetSymbol(fromAssetInfo)}
          value={1}
        />
        <span>&nbsp;~&nbsp;</span>
        <Number
          decimal={0}
          suffix={_getAssetSymbol(toAssetInfo)}
          value={data.quote.rate}
        />
      </div>
    );
  };

  const originSwapPair = useMemo(() => {
    return getTokenPairFromStep(data.process.steps);
  }, [data.process.steps]);

  return (
    <div
      className={className}
    >
      <SwapTransactionBlock
        fromAmount={data.quote.fromAmount}
        fromAssetSlug={originSwapPair?.from}
        logoSize={36}
        toAmount={data.quote.toAmount}
        toAssetSlug={originSwapPair?.to}
      />
      <MetaInfo
        className={'__swap-confirmation-wrapper'}
        hasBackgroundWrapper={false}
        spaceSize={'xs'}
      >
        <MetaInfo.Account
          address={recipientAddress}
          className={'__recipient-item'}
          label={t('Recipient')}
          name={recipient?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Default
          className={'__quote-rate-confirm'}
          label={t('Quote rate')}
          valueColorSchema={'gray'}
        >
          {renderRateConfirmInfo()}
        </MetaInfo.Default>
        <MetaInfo.Number
          className={'__estimate-transaction-fee'}
          decimals={0}
          label={'Estimated fee'}
          prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          value={estimatedFeeValue}
        />
      </MetaInfo>
    </div>
  );
};

export const Swap = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    paddingBottom: token.padding,

    '.swap-confirmation-container': {
      '.__summary-quote': {
        marginBottom: token.marginXS
      },

      '.token-logo': {
        marginBottom: 10
      },

      '.__amount-destination': {
        marginBottom: token.marginXXS
      }
    },

    '.__quote-rate-wrapper': {
      display: 'flex'
    },
    '.__swap-arrival-time': {
      marginTop: 12
    },
    '.__swap-quote-expired': {
      marginTop: 12
    },
    '.__swap-confirmation-wrapper': {
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingSM
    },
    '.__summary-to, .__summary-from': {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      flex: 1
    },
    '.__quote-rate-confirm .__label-col': {
      flex: '0 1 auto'
    },
    '.__quote-footer-label': {
      color: token.colorTextTertiary,
      fontSize: 12,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM
    },
    '.__amount-destination': {
      color: token.colorTextLight2,
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeightLG
    },
    '.__recipient-item .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeight
    },
    '.__recipient-item .__account-name': {
      fontSize: 14,
      color: token.colorWhite,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__quote-rate-confirm .__value': {
      fontSize: 14,
      color: token.colorWhite,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__estimate-transaction-fee .__value': {
      fontSize: 14,
      color: token.colorWhite,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__quote-rate-confirm.__quote-rate-confirm, .__estimate-transaction-fee.__estimate-transaction-fee, .-d-column.-d-column': {
      marginTop: 12
    },
    '.__swap-route-container': {
      marginBottom: 20
    },
    '.__quote-rate-confirm .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.__estimate-transaction-fee .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },
    '.-d-column .__label': {
      fontSize: 14,
      color: token.colorTextTertiary,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    }
  });
});
