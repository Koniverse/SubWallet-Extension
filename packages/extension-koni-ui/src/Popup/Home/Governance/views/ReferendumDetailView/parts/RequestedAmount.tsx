// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NumberDisplay } from '@subwallet/extension-koni-ui/components';
import { useGetNativeTokenBasicInfo } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SpendItem } from '@subwallet/subsquare-api-sdk';
import BigNumber from 'bignumber.js';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  chain: string;
  allSpend: SpendItem[];
};

const Component = ({ allSpend, chain, className }: Props): React.ReactElement<Props> => {
  const { decimals: nativeDecimals } = useGetNativeTokenBasicInfo(chain);

  return (
    <div className={className}>
      <div>Requested Amount</div>
      <ul>
        {allSpend.map((item, index) => {
          let symbol = '';
          let decimals = 6;

          if (item.isSpendLocal) {
            symbol = item.symbol;
            decimals = item.type === 'native' ? nativeDecimals : 6;
          } else {
            symbol = item.assetKind.symbol;
            decimals = item.assetKind.type === 'native' ? nativeDecimals : 6;
          }

          return (
            <li key={index}>
              <NumberDisplay
                decimal={decimals}
                value={new BigNumber(item.amount).toString()}
              />
              &nbsp;{symbol}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const RequestedAmount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
