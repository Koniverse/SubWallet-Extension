// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getSwapChainsFromPath, getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';
import { ProcessType } from '@subwallet/extension-base/types';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import { AlertBox, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { QuoteRateDisplay, SwapTransactionBlock } from '@subwallet/extension-koni-ui/components/Swap';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetChainPrefixBySlug, useGetSwapProcessSteps, useGetTransactionProcessSteps, useSelector } from '@subwallet/extension-koni-ui/hooks';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseProcessConfirmationProps } from './Base';

type Props = BaseProcessConfirmationProps;

const Component: React.FC<Props> = (props: Props) => {
  const { className, process } = props;
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const { t } = useTranslation();
  const data = process.combineInfo as SwapBaseTxData;

  const recipientAddress = data.recipient || data.address;
  const recipient = useGetAccountByAddress(recipientAddress);
  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.to] || undefined;
  }, [assetRegistryMap, data.quote.pair.to]);
  const networkPrefix = useGetChainPrefixBySlug(toAssetInfo.originChain);
  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.from] || undefined;
  }, [assetRegistryMap, data.quote.pair.from]);

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    data.quote.feeInfo.feeComponent.forEach((feeItem) => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, data.quote.feeInfo.feeComponent, priceMap]);

  // const isSwapXCM = useMemo(() => {
  //   return data.process.steps.some((item) => item.type === CommonStepType.XCM);
  // }, [data.process.steps]);
  //

  const getWaitingTime = useMemo(() => {
    return Math.ceil((data.quote.estimatedArrivalTime || 0) / 60);
  }, [data.quote.estimatedArrivalTime]);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();
  const getSwapProcessSteps = useGetSwapProcessSteps();

  const stepItems = useMemo(() => {
    if (process.type === ProcessType.SWAP) {
      return getSwapProcessSteps(data.process, data.quote);
    }

    return getTransactionProcessSteps(process.steps, data, false);
  }, [process.type, process.steps, getTransactionProcessSteps, data, getSwapProcessSteps]);

  const processChains = useMemo(() => {
    return getSwapChainsFromPath(data.process.path);
  }, [data.process.path]);

  const originSwapPair = useMemo(() => {
    return getTokenPairFromStep(data.process.steps);
  }, [data.process.steps]);

  useEffect(() => {
    let timer: NodeJS.Timer;

    if (data.quote.aliveUntil) {
      timer = setInterval(() => {
        if (Date.now() > data.quote.aliveUntil) {
          setShowQuoteExpired(true);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [data.quote.aliveUntil]);

  return (
    <div className={CN(className)}>
      <SwapTransactionBlock
        fromAmount={data.quote.fromAmount}
        fromAssetSlug={originSwapPair?.from}
        toAmount={data.quote.toAmount}
        toAssetSlug={originSwapPair?.to}
      />
      <MetaInfo
        className={'__swap-confirmation-wrapper'}
        hasBackgroundWrapper={false}
        labelColorScheme={'gray'}
        labelFontWeight={'regular'}
        spaceSize={'sm'}
      >
        <MetaInfo.Account
          address={recipientAddress}
          className={'__recipient-item'}
          label={t('ui.Confirmations.Process.Swap.recipient')}
          name={recipient?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Default
          className={'__quote-rate-confirm'}
          label={t('ui.Confirmations.Process.Swap.quoteRate')}
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
          label={'Estimated fee'}
          prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          value={estimatedFeeValue}
        />

        <MetaInfo.TransactionProcess
          items={stepItems}
          processChains={processChains}
          type={process.type}
        />

        {!showQuoteExpired && getWaitingTime > 0 && <AlertBox
          className={'__swap-arrival-time'}
          description={t(`Swapping via ${data.provider.name} can take up to ${getWaitingTime} minutes. Make sure you review all information carefully before submitting.`)}
          title={t('ui.Confirmations.Process.Swap.payAttentionExclamation')}
          type='warning'
        />}
        {/* {!showQuoteExpired && isSwapXCM && ( */}
        {/*   <AlertBox */}
        {/*     className={'__swap-quote-expired'} */}
        {/*     description={t('The swap quote has been updated. Make sure to double-check all information before confirming the transaction.')} */}
        {/*     title={t('ui.Confirmations.Process.Swap.payAttentionExclamation')} */}
        {/*     type='warning' */}
        {/*   /> */}
        {/* )} */}
      </MetaInfo>

      {showQuoteExpired &&
        (
          <AlertBox
            className={'__swap-quote-expired'}
            description={t('ui.Confirmations.Process.Swap.swapQuoteExpired')}
            title={t('ui.Confirmations.Process.Swap.payAttentionExclamation')}
            type='warning'
          />)
      }
    </div>
  );
};

const SwapProcessConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
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
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
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
  };
});

export default SwapProcessConfirmation;
