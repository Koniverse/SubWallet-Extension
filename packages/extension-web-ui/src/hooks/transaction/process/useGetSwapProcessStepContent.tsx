// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetSymbol, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { BaseStepType, BaseSwapStepMetadata, BriefSwapStep, CommonStepDetail, CommonStepFeeInfo, CommonStepType, SwapQuote, SwapStepType } from '@subwallet/extension-base/types';
import { swapNumberMetadata } from '@subwallet/extension-base/utils';
import { NumberDisplay } from '@subwallet/extension-web-ui/components';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-web-ui/constants';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
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

  },

  '.__token-item': {
    display: 'inline-block',
    alignItems: 'center'
  },

  '.__token-item-logo': {
    display: 'inline-block',
    marginRight: 3,

    img: {
      position: 'relative',
      verticalAlign: 'top',
      top: 4
    }
  },

  '.__token-item-value': {
    color: token.colorTextLight1,
    display: 'inline-block'
  },

  '.__token-item-symbol': {
    color: token.colorTextLight1
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
  decimals?: number;
  value?: string;
}

const TokenDisplay = (props: TokenDisplayProps) => {
  const { decimals = 0,
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

      {
        typeof value !== 'undefined'
          ? (
            <NumberDisplay
              className='__token-item-value'
              decimal={decimals}
              suffix={symbol}
              value={value}
            />
          )
          : (
            <span className={'__token-item-symbol'}>
              {symbol}
            </span>
          )
      }
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

  return useCallback((processStep: CommonStepDetail, feeInfo: CommonStepFeeInfo | undefined, quote: SwapQuote, showFee = true) => {
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

            {showFee && (
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
            )}
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
            sendingValue, version } = processStep.metadata as unknown as BaseSwapStepMetadata;

          if (!version || !(version >= 2)) {
            return null;
          }

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

      const analysisMetadataForOldData = () => {
        try {
          const { fromAmount, pair, toAmount } = processStep.metadata as unknown as BriefSwapStep;
          const fromAsset = assetRegistry[pair.from];
          const toAsset = assetRegistry[pair.to];

          return {
            fromTokenSlug: pair.from,
            fromTokenValue: fromAmount,
            fromTokenSymbol: _getAssetSymbol(fromAsset),
            fromTokenDecimals: _getAssetDecimals(fromAsset),
            fromChainName: _getChainName(chainInfoMap[fromAsset.originChain]),
            toTokenSlug: pair.to,
            toTokenValue: toAmount,
            toTokenSymbol: _getAssetSymbol(toAsset),
            toTokenDecimals: _getAssetDecimals(toAsset),
            toChainName: _getChainName(chainInfoMap[toAsset.originChain]),
            providerName: quote.provider.name
          };
        } catch (e) {
          console.log('analysisMetadata error', processStep, e);

          return null;
        }
      };

      const analysisResult = analysisMetadata() || analysisMetadataForOldData();

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

            {
              showFee && (
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
              )
            }
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
            tokenSlug: tokenApprove,
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
        return (
          <StepContent>
            <div className='__brief'>
              Approve

              &nbsp;
              <TokenDisplay
                slug={analysisResult.tokenSlug}
                symbol={analysisResult.tokenSymbol}
              />
              &nbsp;

              {`on ${analysisResult.chainName} for swap`}
            </div>
          </StepContent>
        );
      }
    }

    if (processStep.type === SwapStepType.PERMIT) {
      return t('Sign message to authorize provider');
    }

    return '';
  }, [assetRegistry, chainInfoMap, currencyData.isPrefix, currencyData.symbol, getFeeValue, t]);
};

export default useGetSwapProcessStepContent;
