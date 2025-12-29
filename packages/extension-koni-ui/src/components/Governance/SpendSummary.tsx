// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@subwallet/extension-base/utils';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getGovTokenLogoSlugBySymbol } from '@subwallet/extension-koni-ui/utils/gov';
import { Logo } from '@subwallet/react-ui';
import { SpendItem } from '@subwallet/subsquare-api-sdk';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import NumberDisplay from '../NumberDisplay';

type Props = ThemeProps & {
  spends?: SpendItem[];
  chain: string;
}

const Component = ({ chain, className, spends }: Props): React.ReactElement<Props> | null => {
  const { decimals: nativeDecimals } = useGetNativeTokenBasicInfo(chain);
  const { assetRegistry } = useSelector((root: RootState) => root.assetRegistry);
  const assetList = useMemo(() => Object.values(assetRegistry), [assetRegistry]);
  const totalRaw = useMemo(() => spends?.reduce((acc, s) => acc.plus(s.amount), BN_ZERO) || BN_ZERO, [spends]);

  const symbols = useMemo<string[]>(() => {
    if (!spends || spends.length === 0) {
      return [];
    }

    const symbolSetCollection = new Set<string>();

    for (const s of spends) {
      symbolSetCollection.add(s.isSpendLocal ? s.symbol : s.assetKind.symbol);
    }

    return [...symbolSetCollection];
  }, [spends]);

  if (!spends || symbols.length === 0) {
    return null;
  }

  if (symbols.length > 1) {
    return (
      <div className={CN(className, '__i-requested-amount-icons')}>
        {symbols.map((sym) => {
          const tokenSlug = getGovTokenLogoSlugBySymbol(sym, assetList) || '';

          return (
            <span
              className='__chain-type-logo'
              key={sym}
            >
              <Logo
                shape='circle'
                size={20}
                token={tokenSlug}
              />
            </span>
          );
        })}
      </div>
    );
  }

  const symbol = symbols[0];
  const first = spends[0];
  const isNative = first.isSpendLocal
    ? first.type === 'native'
    : first.assetKind.type === 'native';

  const decimals = isNative ? nativeDecimals : 6;

  return (
    <div className={className}>
      <NumberDisplay
        className='__i-requested-amount-value'
        decimal={decimals}
        value={totalRaw}
      />
      <span className='__i-requested-amount-symbol'>{symbol}</span>
    </div>
  );
};

const SpendSummary = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__i-requested-amount-value': {
      color: token.colorTextLight1
    },

    '.__i-requested-amount-symbol': {
      color: token.colorTextLight4
    },

    '&.__i-requested-amount-icons': {
      display: 'flex',
      alignItems: 'center',

      '.__chain-type-logo': {
        display: 'block',
        boxShadow: '-4px 0px 4px 0px rgba(0, 0, 0, 0.40)',
        width: token.size,
        height: token.size,
        borderRadius: '100%'
      },

      '.__chain-type-logo + .__chain-type-logo': {
        marginLeft: -10
      }
    }
  };
});

export default SpendSummary;
