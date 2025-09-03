// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';
import { SwapBaseTxData, SwapPair } from '@subwallet/extension-base/types';
import { MetaInfo } from '@subwallet/extension-koni-ui/components';
import { QuoteRateDisplay, SwapTransactionBlock } from '@subwallet/extension-koni-ui/components/Swap';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getCurrentCurrencyTotalFee } from '@subwallet/extension-koni-ui/utils';
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

  const originSwapPair = useMemo(() => {
    try {
      const result = getTokenPairFromStep(data.process.steps);

      if (result) {
        return result;
      }
    } catch (e) {
      console.log('getTokenPairFromStep error', e);
    }

    // try to fetch originSwapPair, hotfix for old data.

    try {
      const steps = processData.steps;

      const from = (() => {
        if (steps[0]?.metadata?.originTokenInfo) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          // @ts-ignore
          return steps[0]?.metadata?.originTokenInfo?.slug as string;
        } else if (steps[0]?.metadata?.pair) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          // @ts-ignore
          return steps[0]?.metadata?.pair?.from as string;
        }

        return undefined;
      })();

      const to = (() => {
        const lastStep = steps[steps.length - 1];

        if (lastStep?.metadata?.originTokenInfo) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          // @ts-ignore
          return lastStep?.metadata?.originTokenInfo?.slug as string;
        } else if (lastStep?.metadata?.pair) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          // @ts-ignore
          return lastStep?.metadata?.pair?.to as string;
        }

        return undefined;
      })();

      if (from && to) {
        return {
          from,
          to,
          slug: _parseAssetRefKey(from, to)
        } as SwapPair;
      }
    } catch (e) {
      console.log('try handling old data error', e);
    }

    return undefined;
  }, [data.process.steps, processData.steps]);

  return (
    <div
      className={className}
    >
      <SwapTransactionBlock
        className={'__swap-transaction-block'}
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
          label={t('ui.TRANSACTION.components.Modal.TxProcessDetail.InfoBlock.Swap.recipient')}
          name={recipient?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Default
          className={'__quote-rate-confirm'}
          label={t('ui.TRANSACTION.components.Modal.TxProcessDetail.InfoBlock.Swap.quoteRate')}
          valueColorSchema={'gray'}
        >
          <QuoteRateDisplay
            className={'__quote-estimate-swap-value'}
            fromAssetInfo={fromAssetInfo}
            rateValue={data.quote.rate}
            toAssetInfo={toAssetInfo}
          />
        </MetaInfo.Default>
        <MetaInfo.Number
          className={'__estimate-transaction-fee'}
          decimals={0}
          label={t('ui.TRANSACTION.components.Modal.TxProcessDetail.InfoBlock.Swap.estimatedFee')}
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
    '.__swap-transaction-block': {
      '.__summary-quote': {
        marginBottom: token.margin
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
