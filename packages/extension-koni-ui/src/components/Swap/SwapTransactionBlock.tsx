// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetOriginChain, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Logo, Number } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowRight } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps{
  quote: SwapQuote,
  logoSize?: number
}
const numberMetadata = { maxNumberFormat: 8 };

const Component: React.FC<Props> = (props: Props) => {
  const { className, logoSize = 24, quote } = props;
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[quote.pair.to] || undefined;
  }, [assetRegistryMap, quote.pair.to]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[quote.pair.from] || undefined;
  }, [assetRegistryMap, quote.pair.from]);

  return (
    <div className={CN(className, 'swap-confirmation-container')}>
      <div className={'__summary-quote'}>
        <div className={'__summary-from'}>
          <Logo
            className='token-logo'
            isShowSubLogo={true}
            shape='circle'
            size={logoSize}
            subNetwork={_getAssetOriginChain(fromAssetInfo)}
            token={quote.pair.from.toLowerCase()}
          />
          <Number
            className={'__amount-destination'}
            customFormatter={swapCustomFormatter}
            decimal={_getAssetDecimals(fromAssetInfo)}
            formatType={'custom'}
            metadata={numberMetadata}
            value={quote.fromAmount}
          />
          <span className={'__quote-footer-label'}>{_getAssetSymbol(fromAssetInfo)}</span>
        </div>
        <Icon
          className={'middle-icon'}
          phosphorIcon={ArrowRight}
          size={'md'}
        />
        <div className={'__summary-to'}>
          <Logo
            className='token-logo'
            isShowSubLogo={true}
            shape='circle'
            size={logoSize}
            subNetwork={_getAssetOriginChain(toAssetInfo)}
            token={quote.pair.to.toLowerCase()}
          />
          <Number
            className={'__amount-destination'}
            customFormatter={swapCustomFormatter}
            decimal={_getAssetDecimals(toAssetInfo)}
            formatType={'custom'}
            metadata={numberMetadata}
            value={quote.toAmount || 0}
          />
          <span className={'__quote-footer-label'}>{_getAssetSymbol(toAssetInfo)}</span>
        </div>
      </div>
    </div>
  );
};

const SwapTransactionBlock = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__quote-estimate-swap-confirm-value': {
      display: 'flex'
    },
    '.__summary-quote': {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: token.colorBgSecondary,
      gap: 12,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: 8,
      marginBottom: 16
    },
    '.__summary-quote .-sub-logo': {
      bottom: 0,
      right: 0
    },
    '.__summary-quote .ant-image': {
      fontSize: 0
    },
    '.__summary-to, .__summary-from': {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      flex: 1
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
    '&.swap-confirmation-container .__swap-route-container': {
      marginBottom: 20
    }
  };
});

export default SwapTransactionBlock;
