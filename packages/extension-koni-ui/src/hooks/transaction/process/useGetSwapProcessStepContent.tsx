// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetSymbol, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { BaseStepType, BaseSwapStepMetadata, CommonStepDetail, CommonStepFeeInfo, CommonStepType, SwapQuote, SwapStepType } from '@subwallet/extension-base/types';
import { swapNumberMetadata } from '@subwallet/extension-base/utils';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Logo } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StepContent = styled('div')<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  '.ant-number, .ant-number .ant-typography': {
    fontSize: 'inherit !important',
    lineHeight: 'inherit'
  },

  '.ant-number .ant-typography': {
    color: 'inherit !important'
  },

  '.__brief': {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    color: token.colorTextLight3
  },

  '.__token-item': {
    display: 'inline-block',
    alignItems: 'center'
  },

  '.__token-item-logo': {
    display: 'inline-block',
    marginRight: 3
  },

  '.__token-item-value': {
    color: token.colorTextLight1,
    display: 'inline-block'
  },

  '.__fee-info': {
    display: 'flex',
    gap: token.sizeXXS,
    color: token.colorTextLight4,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM
  },

  '.__fee-value': {
    display: 'inline-block'
  }
}));

type TokenDisplayProps = {
  slug: string;
  symbol: string;
  decimals: number;
  value: string;
}

const TokenDisplay = (props: TokenDisplayProps) => {
  const { decimals,
    slug,
    symbol,
    value } = props;

  return (
    <span className='__token-item'>
      <Logo
        className={'__token-item-logo'}
        size={16}
        token={slug.toLowerCase()}
      />

      <NumberDisplay
        className='__token-item-value'
        decimal={decimals}
        suffix={symbol}
        value={value}
      />
    </span>
  );
};

const useGetSwapProcessStepContent = () => {
  const { t } = useTranslation();
  const chainInfoMap = useSelector((root) => root.chainStore.chainInfoMap);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state) => state.price);

  const getFeeValue = useCallback((feeInfo: CommonStepFeeInfo | undefined) => {
    if (!feeInfo) {
      return BN_ZERO;
    }

    let result = BN_ZERO;

    feeInfo.feeComponent.forEach((feeItem) => {
      const asset = assetRegistry[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        result = result.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return result;
  }, [assetRegistry, priceMap]);

  return useCallback((processStep: CommonStepDetail, feeInfo: CommonStepFeeInfo | undefined, quote: SwapQuote) => {
    if (([
      CommonStepType.XCM
    ] as BaseStepType[]).includes(processStep.type)) {
      const analysisMetadata = () => {
        try {
          const { destinationTokenInfo, originTokenInfo, sendingValue } = processStep.metadata as unknown as BaseSwapStepMetadata;

          return {
            tokenDecimals: _getAssetDecimals(originTokenInfo),
            tokenValue: sendingValue,
            tokenSlug: originTokenInfo.slug,
            tokenSymbol: _getAssetSymbol(originTokenInfo),
            chainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
            destChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain])
          };
        } catch (e) {
          console.log('analysisMetadata error', processStep, e);

          return null;
        }
      };

      const analysisResult = analysisMetadata();

      if (analysisResult) {
        return (
          <StepContent>
            <div className='__brief'>
              Transfer

              &nbsp;
              <TokenDisplay
                decimals={analysisResult.tokenDecimals}
                slug={analysisResult.tokenSlug}
                symbol={analysisResult.tokenSymbol}
                value={analysisResult.tokenValue}
              />
              &nbsp;

              {`from ${analysisResult.chainName} to ${analysisResult.destChainName}`}
            </div>

            <div className='__fee-info'>
              <span className='__fee-label'>Fee:</span>

              <NumberDisplay
                className={'__fee-value'}
                decimal={0}
                metadata={swapNumberMetadata}
                prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={getFeeValue(feeInfo)}
              />
            </div>
          </StepContent>
        );
      }
    }

    if (processStep.type === SwapStepType.SWAP) {
      const analysisMetadata = () => {
        try {
          const { destinationTokenInfo,
            expectedReceive,
            originTokenInfo,
            sendingValue } = processStep.metadata as unknown as BaseSwapStepMetadata;

          return {
            fromTokenSlug: originTokenInfo.slug,
            fromTokenValue: sendingValue,
            fromTokenSymbol: _getAssetSymbol(originTokenInfo),
            fromTokenDecimals: _getAssetDecimals(originTokenInfo),
            fromChainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
            toTokenSlug: destinationTokenInfo.slug,
            toTokenValue: expectedReceive,
            toTokenSymbol: _getAssetSymbol(destinationTokenInfo),
            toTokenDecimals: _getAssetDecimals(destinationTokenInfo),
            toChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain]),
            providerName: quote.provider.name
          };
        } catch (e) {
          console.log('analysisMetadata error', processStep, e);

          return null;
        }
      };

      const analysisResult = analysisMetadata();

      if (analysisResult) {
        return (
          <StepContent>
            <div className='__brief'>
              Swap

              &nbsp;
              <TokenDisplay
                decimals={analysisResult.fromTokenDecimals}
                slug={analysisResult.fromTokenSlug}
                symbol={analysisResult.fromTokenSymbol}
                value={analysisResult.fromTokenValue}
              />
              &nbsp;

              {`on ${analysisResult.fromChainName} for`}

              &nbsp;
              <TokenDisplay
                decimals={analysisResult.toTokenDecimals}
                slug={analysisResult.toTokenSlug}
                symbol={analysisResult.toTokenSymbol}
                value={analysisResult.toTokenValue}
              />
              &nbsp;

              {`on ${analysisResult.toChainName} via ${analysisResult.providerName}`}
            </div>

            <div className='__fee-info'>
              <span className='__fee-label'>Fee:</span>

              <NumberDisplay
                className={'__fee-value'}
                decimal={0}
                metadata={swapNumberMetadata}
                prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={getFeeValue(feeInfo)}
              />
            </div>
          </StepContent>
        );
      }
    }

    if (([
      CommonStepType.TOKEN_APPROVAL
    ] as BaseStepType[]).includes(processStep.type)) {
      const analysisMetadata = () => {
        try {
          const { tokenApprove } = processStep.metadata as unknown as {
            tokenApprove: string,
          };

          const asset = assetRegistry[tokenApprove];

          return {
            tokenSymbol: _getAssetSymbol(asset),
            chainName: _getChainName(chainInfoMap[asset.originChain])
          };
        } catch (e) {
          console.log('analysisMetadata error', e);

          return null;
        }
      };

      const analysisResult = analysisMetadata();

      if (analysisResult) {
        return t('Approve {{tokenSymbol}} on {{chainName}} for swap', {
          replace: {
            ...analysisResult
          }
        });
      }
    }

    if (processStep.type === SwapStepType.PERMIT) {
      return t('Sign message to authorize provider');
    }

    return '';
  }, [assetRegistry, chainInfoMap, currencyData.isPrefix, currencyData.symbol, getFeeValue, t]);
};

export default useGetSwapProcessStepContent;
