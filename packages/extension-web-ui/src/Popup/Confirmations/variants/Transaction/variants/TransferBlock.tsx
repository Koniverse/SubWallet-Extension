// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { AlertBox, QuoteRateDisplay } from '@subwallet/extension-web-ui/components';
import MetaInfo from '@subwallet/extension-web-ui/components/MetaInfo/MetaInfo';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
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

  const chainInfo = useMemo(
    () => chainInfoMap[transaction.chain],
    [chainInfoMap, transaction.chain]
  );

  const { decimals: nativeTokenDecimals, symbol: nativeTokenSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const feeInfo = transaction.estimateFee;

  return (
    <>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account
          address={data.from}
          label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.sendFrom')}
        />

        {
          transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo &&
          (
            <MetaInfo.Chain
              chain={chainInfo.slug}
              label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.senderNetwork')}
            />
          )
        }

        <MetaInfo.Account
          address={data.to}
          label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.sendTo')}
        />

        {
          transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo &&
          (
            <MetaInfo.Chain
              chain={xcmData.destinationNetworkKey}
              label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.destinationNetwork')}
            />
          )
        }

        {
          transaction.extrinsicType !== ExtrinsicType.TRANSFER_XCM && chainInfo &&
          (
            <MetaInfo.Chain
              chain={chainInfo.slug}
              label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.network')}
            />
          )
        }
        {data.orderId && (
          <MetaInfo.Default
            label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.orderId')}
          >
            {data.orderId}
          </MetaInfo.Default>
        )}
      </MetaInfo>

      <MetaInfo hasBackgroundWrapper>
        {isAcrossBridge && xcmData.metadata
          ? <>
            <MetaInfo.Default
              label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.quote')}
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
              label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.expectedAmount')}
              suffix={destTokenInfo.symbol}
              value={xcmData.metadata.amountOut}
            />
          </>
          : (
            <MetaInfo.Number
              decimals={tokenInfo.decimals || 0}
              label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.amount')}
              suffix={tokenInfo.symbol}
              value={data.value || 0}
            />
          )}

        <MetaInfo.Number
          decimals={feeInfo ? feeInfo.decimals : nativeTokenDecimals}
          label={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.estimatedFee')}
          suffix={feeInfo ? feeInfo.symbol : nativeTokenSymbol}
          value={feeInfo ? feeInfo.value : 0}
        />
      </MetaInfo>
      {
        transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM &&
        (
          <AlertBox
            className={CN(className, 'alert-area')}
            description={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.youLlNeedToPayAnAdditionalFeeForTheDestinationNetworkInACrossChainTransferThisFeeCannotBeCalculatedInAdvance')}
            title={t('ui.TRANSFER_BLOCK.Popup.Confirmations.variants.Transaction.variants.TransferBlock.payAttention')}
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
