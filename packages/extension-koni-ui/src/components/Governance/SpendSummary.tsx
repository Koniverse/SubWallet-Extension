// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SpendItem } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';
import React from 'react';
import styled from 'styled-components';

import NumberDisplay from '../NumberDisplay';

type Props = ThemeProps & {
  spends?: SpendItem[];
  chain: string;
}

const Component = ({ chain, className, spends }: Props): React.ReactElement<Props> | null => {
  const { decimals: nativeDecimals } = useGetNativeTokenBasicInfo(chain);

  if (!spends || spends.length === 0) {
    return null;
  }

  const symbols = [...new Set(spends.map((s) => s.isSpendLocal ? s.symbol : s.assetKind.symbol))];

  if (symbols.length > 1) {
    return (
      <div className={'__i-requested-amount-icons'}>
        {symbols.map((sym) => (
          <span
            className='__token-icon'
            key={sym}
          >
            {/* <Logo
              network={chain}
              shape='circle'
              size={20}
            /> */}
          </span>
        ))}
      </div>
    );
  }

  const symbol = symbols[0];
  const totalRaw = spends.reduce((acc, s) => acc.plus(s.amount), new BigNumber(0));

  const first = spends[0];
  const decimals = first.isSpendLocal
    ? (first.type === 'native' ? nativeDecimals : 6)
    : (first.assetKind.type === 'native' ? nativeDecimals : 6);

  return (
    <div className={className}>
      <NumberDisplay
        className='__i-requested-amount-value'
        decimal={decimals}
        value={totalRaw.toString()}
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
    }
  };
});

export default SpendSummary;
