// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { _getAssetDecimals, _getAssetPriceId, _getAssetSymbol, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import QuoteRateDisplay from '@subwallet/extension-koni-ui/components/Swap/QuoteRateDisplay';
import { BN_TEN } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const Component: React.FC<Props> = ({ className, transaction }: Props) => {
  const { t } = useTranslation();
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_BALANCE];
  const xcmData = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_XCM];
  const priceMap = useSelector((root: RootState) => root.price.priceMap);
  const { currencyData } = useSelector((root: RootState) => root.price);
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const tokenInfo = assetRegistryMap[transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM ? xcmData.tokenSlug : data.tokenSlug];

  const isAcrossBridge = useMemo(() => {
    return _isAcrossChainBridge(xcmData.originNetworkKey, xcmData.destinationNetworkKey);
  }, [xcmData.originNetworkKey, xcmData.destinationNetworkKey]);

  const destTokenInfo = useMemo(() => {
    if (isAcrossBridge && xcmData.metadata?.destChainSlug) {
      return assetRegistryMap[xcmData.metadata?.destChainSlug];
    }

    return tokenInfo;
  }, [isAcrossBridge, xcmData.metadata?.destChainSlug, tokenInfo, assetRegistryMap]);

  const fromAccount = useGetAccountByAddress(data.from);
  const toAccount = useGetAccountByAddress(data.to);
  const fromAccountName = fromAccount?.name;
  const toAccountName = toAccount?.name;

  const { decimals: nativeTokenDecimals, symbol: nativeTokenSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const feeInfo = transaction.estimateFee;

  const priceNativeValue = useMemo(() => {
    const nativeTokenSlug = `${transaction.chain}-NATIVE-${nativeTokenSymbol}`;
    const nativeTokenInfo = assetRegistryMap[nativeTokenSlug];

    const priceNativeId = _getAssetPriceId(nativeTokenInfo);

    return priceMap[priceNativeId] || 0;
  }, [assetRegistryMap, nativeTokenSymbol, priceMap, transaction.chain]);

  const transferTokenSymbol = _getAssetSymbol(tokenInfo);
  const transferTokenDecimals = _getAssetDecimals(tokenInfo);

  const transferTokenValue = useMemo(() => {
    const transferTokenPriceId = _getAssetPriceId(tokenInfo);

    return priceMap[transferTokenPriceId] || 0;
  }, [priceMap, tokenInfo]);

  const convertedFeeValueToUSD = useMemo(() => {
    if (!feeInfo?.value) {
      return 0;
    }

    return new BigN(feeInfo?.value)
      .multipliedBy(priceNativeValue)
      .dividedBy(BN_TEN.pow(nativeTokenDecimals || 0))
      .toNumber();
  }, [feeInfo, nativeTokenDecimals, priceNativeValue]);

  const convertedCrossChainFeeValueToUSD = useMemo(() => {
    if (!feeInfo?.crossChainFee) {
      return 0;
    }

    return new BigN(feeInfo?.crossChainFee)
      .multipliedBy(transferTokenValue)
      .dividedBy(BN_TEN.pow(tokenInfo.decimals || 0))
      .toNumber();
  }, [feeInfo, tokenInfo, transferTokenValue]);

  const destinationChainSlug = xcmData?.destinationNetworkKey || transaction.chain;
  const originChainSlug = xcmData?.originNetworkKey || transaction.chain;

  return (
    <div className={className}>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Transfer
          alwaysShowChain
          destinationChain={{
            slug: destinationChainSlug,
            name: _getChainName(chainInfoMap[destinationChainSlug])
          }}
          originChain={{
            slug: originChainSlug,
            name: _getChainName(chainInfoMap[originChainSlug])
          }}
          recipientAddress={data.to}
          recipientLabel={t('ui.TRANSACTION.Confirmations.TransferBlock.sendTo')}
          recipientName={toAccountName}
          senderAddress={data.from}
          senderLabel={t('ui.TRANSACTION.Confirmations.TransferBlock.sendFrom')}
          senderName={fromAccountName}
        />
      </MetaInfo>

      <MetaInfo
        hasBackgroundWrapper
        labelColorScheme={'gray'}
        valueColorScheme={'light'}
      >
        {isAcrossBridge && xcmData.metadata
          ? <>
            <MetaInfo.Default
              label={t('ui.TRANSACTION.Confirmations.TransferBlock.quote')}
            >
              <QuoteRateDisplay
                className={'__quote-estimate-swap-value'}
                fromAssetInfo={tokenInfo}
                rateValue={parseFloat(xcmData.metadata.rate)}
                toAssetInfo={destTokenInfo}
              />
            </MetaInfo.Default>
            <MetaInfo.Number
              decimals={destTokenInfo.decimals || 0}
              label={t('ui.TRANSACTION.Confirmations.TransferBlock.expectedAmount')}
              suffix={destTokenInfo.symbol}
              value={xcmData.metadata.amountOut}
            />
          </>
          : (
            <MetaInfo.Number
              className={'__transfer-block-amount'}
              decimals={tokenInfo.decimals || 0}
              label={t('ui.TRANSACTION.Confirmations.TransferBlock.amount')}
              suffix={tokenInfo.symbol}
              value={data.value || 0}
            />
          )}

        <MetaInfo.Default
          label={t('ui.TRANSACTION.Confirmations.TransferBlock.networkFee')}
        >
          <div className='__fee-editor-area'>
            <Number
              decimal={feeInfo ? feeInfo.decimals : nativeTokenDecimals}
              suffix={feeInfo ? feeInfo.symbol : nativeTokenSymbol}
              value={feeInfo ? feeInfo.value : 0}
            />

            <Number
              className={'__fee-price-value'}
              decimal={0}
              prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
              suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              value={convertedFeeValueToUSD}
            />
          </div>
        </MetaInfo.Default>

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && feeInfo?.crossChainFee && (
          <MetaInfo.Default label={t('ui.TRANSACTION.Confirmations.TransferBlock.crossChainFee')}>
            <div className={'__value-col-wrapper'}>
              <Number
                decimal={transferTokenDecimals}
                suffix={transferTokenSymbol}
                value={feeInfo ? feeInfo.crossChainFee : 0}
              />

              <Number
                className={'__fee-price-value'}
                decimal={0}
                prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={convertedCrossChainFeeValueToUSD}
              />
            </div>
          </MetaInfo.Default>
        )}
      </MetaInfo>
    </div>
  );
};

export const TransferBlock = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__fee-price-value': {
      fontSize: `${token.fontSizeSM}px !important`,
      lineHeight: '20px !important',
      color: `${token.colorTextTertiary} !important`
    }
  };
});
