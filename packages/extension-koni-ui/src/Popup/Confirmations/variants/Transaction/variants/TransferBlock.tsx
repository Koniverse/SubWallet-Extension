// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { AlertBox } from '@subwallet/extension-koni-ui/components';
import MetaInfo from '@subwallet/extension-koni-ui/components/MetaInfo/MetaInfo';
import QuoteRateDisplay from '@subwallet/extension-koni-ui/components/Swap/QuoteRateDisplay';
import { useGetAccountByAddress, useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
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
  const fromAccountName = useMemo(() => fromAccount?.name, [fromAccount]);
  const toAccountName = useMemo(() => toAccount?.name, [toAccount]);
  const destinationChainSlug = useMemo(() => xcmData?.destinationNetworkKey || transaction.chain, [xcmData?.destinationNetworkKey, transaction.chain]);
  const originChainSlug = useMemo(() => xcmData?.originNetworkKey || transaction.chain, [xcmData?.originNetworkKey, transaction.chain]);
  const senderLabel = useMemo(() => fromAccount?.isMultisig ? t('ui.TRANSACTION.Confirmations.TransferBlock.multisig') : t('ui.TRANSACTION.Confirmations.TransferBlock.sender'), [fromAccount?.isMultisig, t]);
  const { decimals: nativeTokenDecimals, symbol: nativeTokenSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const feeInfo = transaction.estimateFee;

  return (
    <>
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
          recipientLabel={t('ui.TRANSACTION.Confirmations.TransferBlock.recipient')}
          recipientName={toAccountName}
          senderAddress={data.from}
          senderLabel={senderLabel}
          senderName={fromAccountName}
        />
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
              decimals={tokenInfo.decimals || 0}
              label={t('ui.TRANSACTION.Confirmations.TransferBlock.amount')}
              suffix={tokenInfo.symbol}
              value={data.value || 0}
            />
          )}

        {!transaction.wrappingStatus && <MetaInfo.Number
          decimals={feeInfo ? feeInfo.decimals : nativeTokenDecimals}
          label={t('ui.TRANSACTION.Confirmations.TransferBlock.estimatedFee')}
          suffix={feeInfo ? feeInfo.symbol : nativeTokenSymbol}
          value={feeInfo ? feeInfo.value : 0}
        />}
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
