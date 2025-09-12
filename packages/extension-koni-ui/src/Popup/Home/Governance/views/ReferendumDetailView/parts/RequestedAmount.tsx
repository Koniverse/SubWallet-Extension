// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Logo } from '@subwallet/react-ui';
import { SpendItem } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';
import React, { Context, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled, { ThemeContext } from 'styled-components';

type Props = ThemeProps & {
  chain: string;
  allSpend: SpendItem[];
};

const getTokenLogoSlugBySymbol = (assetRegistry: _ChainAsset[], symbol: string): string | undefined => {
  const asset = assetRegistry.find((item) => item.symbol === symbol);

  return asset?.slug;
};

const Component = ({ allSpend, chain, className }: Props): React.ReactElement<Props> => {
  const { decimals: nativeDecimals } = useGetNativeTokenBasicInfo(chain);
  const { assetRegistry } = useSelector((root: RootState) => root.assetRegistry);
  const assetList = useMemo(() => Object.values(assetRegistry), [assetRegistry]);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;

  return (
    <div className={className}>
      <div className={'__requested-label'}>Requested Amount</div>
      <>
        {allSpend.map((item, index) => {
          const { symbol, type } = item.isSpendLocal
            ? { symbol: item.symbol, type: item.type }
            : { symbol: item.assetKind.symbol, type: item.assetKind.type };

          const tokenSlug = getTokenLogoSlugBySymbol(assetList, symbol) || '';
          const decimals = type === 'native' ? nativeDecimals : 6;

          return (
            <div
              className={'__requested-item'}
              key={index}
            >
              <NumberDisplay
                className={'__requested-item__value'}
                decimal={decimals}
                decimalOpacity={0.45}
                prefix={'~'}
                size={token.fontSize}
                value={new BigNumber(item.amount).toString()}
                weight={token.fontWeightStrong}
              />

              <div className={'__requested-item__symbol-group'}>
                <div className={'__requested-item__symbol'}>
                  {symbol}
                </div>

                <Logo
                  shape={'circle'}
                  size={token.sizeMD}
                  token={tokenSlug.toLowerCase()}
                />
              </div>
            </div>
          );
        })}
      </>
    </div>
  );
};

export const RequestedAmount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeSM,
    padding: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingSM}px ${token.paddingSM}px`,
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    marginTop: token.marginXS,

    '.__requested-label': {
      color: token.colorTextLight4,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeight
    },

    '.__requested-item': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    '.__requested-item__symbol-group': {
      display: 'flex',
      gap: token.sizeXS,

      '.__requested-item__symbol': {
        color: token.colorTextLight4,
        fontWeight: token.bodyFontWeight,
        lineHeight: token.lineHeight
      }
    }
  };
});
