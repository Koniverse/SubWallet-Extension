// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { swapNumberMetadata } from '@subwallet/extension-base/utils';
import { NumberDisplay, TransactionProcessPreview } from '@subwallet/extension-koni-ui/components';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-koni-ui/constants';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertHexColorToRGBA } from '@subwallet/extension-koni-ui/utils';
import { Icon, Logo } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  isRecommend?: boolean,
  quote: SwapQuote;
  selected?: boolean,
  onSelect?: (quote: SwapQuote) => void,
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, isRecommend, onSelect, quote, selected } = props;
  const { t } = useTranslation();
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);
  const _onSelect = useCallback(() => {
    onSelect?.(quote);
  }, [onSelect, quote]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[quote.pair.to] || undefined;
  }, [assetRegistryMap, quote.pair.to]);

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    quote.feeInfo.feeComponent.forEach((feeItem) => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, quote.feeInfo.feeComponent, priceMap]);

  return (
    <>
      <div
        className={CN(className, 'swap-quotes-container')}
        onClick={_onSelect}
      >
        <div className={'__left-part'}>
          <Logo
            className='__provider-logo'
            isShowSubLogo={false}
            network={quote.provider.id.toLowerCase()}
            shape='circle'
            size={24}
          />
        </div>

        <div className={'__right-part'}>
          <div className={'__title-area'}>
            <span className={'__provider-name-wrapper'}>
              <span className={'__provider-name'}>
                {quote.provider.name}
              </span>

              {isRecommend && (
                <div className='__best-tag'>
                  {t('Best')}
                </div>
              )}
            </span>

            {selected && (
              <Icon
                className='__check-icon'
                customSize={'20px'}
                phosphorIcon={CheckCircle}
                weight='fill'
              />
            )}
          </div>

          <div className={'__line-2 __line'}>
            <div className='__line-label'>
              <span className={'__est-receive-label'}>{t('Est. receive')}</span>
            </div>

            <div className='__line-value'>
              <NumberDisplay
                className={'__est-receive-value'}
                decimal={_getAssetDecimals(toAssetInfo)}
                metadata={swapNumberMetadata}
                suffix={_getAssetSymbol(toAssetInfo)}
                value={quote.toAmount || '0'}
              />
            </div>
          </div>

          <div className={'__line-3 __line'}>
            <div className='__line-label'>{t('Fee')}</div>
            <div className='__line-value'>
              <NumberDisplay
                decimal={0}
                metadata={swapNumberMetadata}
                prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                value={estimatedFeeValue}
              />
            </div>
          </div>

          <div className={'__line-4 __line hidden'}>
            <div className='__line-label'>{t('Process')}</div>
            <div className='__line-value'>
              <TransactionProcessPreview steps={[]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ChooseFeeItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    backgroundColor: token.colorBgSecondary,
    borderRadius: 8,
    padding: token.paddingSM,
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,

    '.ant-number, .ant-number .ant-typography': {
      color: 'inherit !important',
      fontSize: 'inherit !important',
      fontWeight: 'inherit !important',
      lineHeight: 'inherit'
    },

    '.__left-part': {
      minWidth: 32
    },

    '.__right-part': {
      flex: 1,
      overflow: 'hidden'
    },

    '.__provider-name-wrapper': {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      overflow: 'hidden'
    },

    '.__provider-name': {
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: token.fontSizeHeading5,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextLight4
    },

    '.__best-tag': {
      marginLeft: token.marginXS,
      backgroundColor: convertHexColorToRGBA(token.colorSuccess, 0.1),
      fontSize: 10,
      lineHeight: '20px',
      borderRadius: token.borderRadiusLG,
      color: token.colorSuccess,
      fontWeight: token.headingFontWeight,
      paddingLeft: 6,
      paddingRight: 6
    },

    '.__check-icon': {
      marginLeft: token.marginSM,
      color: token.colorSuccess
    },

    '.__title-area': {
      display: 'flex',
      alignItems: 'center',
      marginBottom: token.marginXS
    },

    '.__line': {
      display: 'flex',
      gap: token.sizeXS,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__line-label': {
      color: token.colorTextLight4,
      minWidth: 120
    },

    '.__line-value': {

    },

    '.__line + .__line': {
      marginTop: token.marginXS
    },

    '&:hover': {
      backgroundColor: token.colorBgInput
    }
  };
});

export default ChooseFeeItem;
