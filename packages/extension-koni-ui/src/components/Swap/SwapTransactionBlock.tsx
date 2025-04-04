// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetOriginChain, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { swapNumberMetadata } from '@subwallet/extension-base/utils';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Logo } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowRight } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps{
  fromAssetSlug: string | undefined;
  fromAmount: string | undefined;
  toAssetSlug: string | undefined;
  toAmount: string | undefined;
  logoSize?: number
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, fromAmount,
    fromAssetSlug,
    logoSize = 24,
    toAmount,
    toAssetSlug } = props;
  const assetRegistryMap = useSelector((state) => state.assetRegistry.assetRegistry);

  const fromAssetInfo = useMemo(() => {
    return fromAssetSlug ? assetRegistryMap[fromAssetSlug] : undefined;
  }, [assetRegistryMap, fromAssetSlug]);

  const toAssetInfo = useMemo(() => {
    return toAssetSlug ? assetRegistryMap[toAssetSlug] : undefined;
  }, [assetRegistryMap, toAssetSlug]);

  return (
    <div className={CN(className)}>
      <div className={'__summary-quote'}>
        <div className={'__summary-from'}>
          <Logo
            className='token-logo'
            isShowSubLogo={true}
            shape='circle'
            size={logoSize}
            subNetwork={_getAssetOriginChain(fromAssetInfo)}
            token={fromAssetSlug?.toLowerCase()}
          />
          <NumberDisplay
            className={'__amount-destination'}
            decimal={_getAssetDecimals(fromAssetInfo)}
            metadata={swapNumberMetadata}
            value={fromAmount || 0}
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
            token={toAssetSlug?.toLowerCase()}
          />
          <NumberDisplay
            className={'__amount-destination'}
            decimal={_getAssetDecimals(toAssetInfo)}
            metadata={swapNumberMetadata}
            value={toAmount || 0}
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
      lineHeight: token.lineHeightLG,

      '.ant-number, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    }
  };
});

export default SwapTransactionBlock;
