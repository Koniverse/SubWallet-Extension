// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SpendItem } from '@subwallet/subsquare-api-sdk/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  allSpend: SpendItem[];
};

const Component = ({ allSpend, className }: Props): React.ReactElement<Props> => {
  return (
    <div className={className}>
      <div>Requested Amount</div>
      <ul>
        {allSpend.map((item, index) => (
          <li key={index}>
            {Number(item.amount) / 1_000_000} {item.assetKind?.symbol}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const RequestedAmount = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});
