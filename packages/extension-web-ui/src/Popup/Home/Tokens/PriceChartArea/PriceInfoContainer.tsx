// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint } from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { PriceInfoUI } from '@subwallet/extension-web-ui/Popup/Home/Tokens/PriceChartArea/PriceInfoUI';
import { PriceInfoUIProps } from '@subwallet/extension-web-ui/Popup/Home/Tokens/PriceChartArea/types';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  pricePoints: PriceChartPoint[];
  hoverPricePointIndex: number | null;
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, hoverPricePointIndex, pricePoints } = props;

  const priceInfoUIProps = useMemo<PriceInfoUIProps>(() => {
    if (!pricePoints.length) {
      return { value: BN_ZERO, change: BN_ZERO, percent: BN_ZERO };
    }

    const first = new BigN(pricePoints[0].value);
    const index = hoverPricePointIndex ?? pricePoints.length - 1;
    const target = pricePoints[index];

    if (!target) {
      return { value: BN_ZERO, change: BN_ZERO, percent: BN_ZERO };
    }

    const value = new BigN(target.value);
    const diff = value.minus(first);

    return {
      value,
      change: diff.abs(),
      percent: first.isZero() ? BN_ZERO : diff.abs().dividedBy(first).multipliedBy(100),
      ...(diff.isLessThan(0) && { isPriceDown: true })
    };
  }, [hoverPricePointIndex, pricePoints]);

  return (
    <PriceInfoUI
      className={className}
      {...priceInfoUIProps}
    />
  );
};

export const PriceInfoContainer = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({

}));
