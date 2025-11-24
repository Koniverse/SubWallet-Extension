// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { _getAssetDecimals, _getAssetPriceId, _getAssetSymbol, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import QuoteRateDisplay from '@subwallet/extension-koni-ui/components/Swap/QuoteRateDisplay';
import { BN_TEN } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
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

  const chainInfo = useMemo(
    () => chainInfoMap[transaction.chain],
    [chainInfoMap, transaction.chain]
  );

  const fromAccount = useGetAccountByAddress(data.from);
  const toAccount = useGetAccountByAddress(data.to);
  const fromAccountName = fromAccount?.name;
  const toAccountName = toAccount?.name;

  const { decimals: nativeTokenDecimals, symbol: nativeTokenSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const feeInfo = transaction.estimateFee;

  const nativeTokenSlug = `${transaction.chain}-NATIVE-${nativeTokenSymbol}`;
  const nativeTokenInfo = assetRegistryMap[nativeTokenSlug];

  const priceNativeId = _getAssetPriceId(nativeTokenInfo);
  const priceNativeValue = priceMap[priceNativeId] || 0;

  const transferTokenSymbol = _getAssetSymbol(tokenInfo);
  const transferTokenDecimals = _getAssetDecimals(tokenInfo);
  const transferTokenPriceId = _getAssetPriceId(tokenInfo);
  const transferTokenValue = priceMap[transferTokenPriceId] || 0;

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

  const renderParticipants = () => {
    if (transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM) {
      return (
        <MetaInfo.Transfer
          destinationChain={{
            slug: xcmData.destinationNetworkKey,
            name: _getChainName(chainInfoMap[xcmData.destinationNetworkKey])
          }}
          originChain={{
            slug: xcmData.originNetworkKey,
            name: _getChainName(chainInfoMap[xcmData.originNetworkKey])
          }}
          recipientAddress={data.to}
          recipientName={toAccountName}
          senderAddress={data.from}
          senderName={fromAccountName}
        />
      );
    }

    return (
      <>
        <MetaInfo.Account
          address={data.from}
          label={t('ui.TRANSACTION.Confirmations.TransferBlock.sendFrom')}
        />

        {chainInfo && (
          <MetaInfo.Chain
            chain={chainInfo.slug}
            label={t('ui.TRANSACTION.Confirmations.TransferBlock.network')}
          />
        )}

        <MetaInfo.Account
          address={data.to}
          label={t('ui.TRANSACTION.Confirmations.TransferBlock.sendTo')}
        />
      </>
    );
  };

  return (
    <>
      <MetaInfo hasBackgroundWrapper>
        {renderParticipants()}
      </MetaInfo>

      <MetaInfo hasBackgroundWrapper>
        {isAcrossBridge && xcmData.metadata
          ? <>
            <MetaInfo.Default
              label={t('ui.TRANSACTION.Confirmations.TransferBlock.quote')}
            >
              <QuoteRateDisplay
                className={'__quote-estimate-swap-value'}
                fromAssetInfo={tokenInfo}
                rateValue={Number(xcmData.metadata.rate)}
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

        <MetaInfo.Default label={t('Network fee')}>
          <div className='__fee-editor-area'>
            <Number
              decimal={feeInfo ? feeInfo.decimals : nativeTokenDecimals}
              suffix={feeInfo ? feeInfo.symbol : nativeTokenSymbol}
              value={feeInfo ? feeInfo.value : 0}
            />

            <Number
              decimal={0}
              prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
              suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              value={convertedFeeValueToUSD}
            />
          </div>
        </MetaInfo.Default>

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && feeInfo?.crossChainFee && (
          <MetaInfo.Default label={t('Cross-chain fee')}>
            <div className={'__value-col-wrapper'}>
              <Number
                decimal={transferTokenDecimals}
                suffix={transferTokenSymbol}
                value={feeInfo ? feeInfo.crossChainFee : 0}
              />

              <Number
                decimal={0}
                prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={convertedCrossChainFeeValueToUSD}
              />
            </div>
          </MetaInfo.Default>
        )}
      </MetaInfo>
      {
        transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM &&
        (
          <AlertBox
            className={CN(className, 'alert-area')}
            description={t('ui.TRANSACTION.Confirmations.TransferBlock.crossChainAdditionalFee')}
            title={t('ui.TRANSACTION.Confirmations.TransferBlock.payAttentionExclamation')}
            type='warning'
          />
        )
      }
    </>
  );
};

export const TransferBlock = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '&.alert-area': {
      marginTop: token.marginSM
    }
  };
});
