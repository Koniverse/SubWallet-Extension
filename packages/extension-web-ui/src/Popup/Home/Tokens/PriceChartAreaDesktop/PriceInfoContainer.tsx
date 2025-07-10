// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { PriceInfoUI } from './PriceInfoUI';
import { TimeframeSelector } from './TimeframeSelector';
import { PriceInfoUIProps } from './types';

type Props = ThemeProps & {
  pricePoints: PriceChartPoint[];
  hoverPricePointIndex: number | null;
  selectedTimeframe: PriceChartTimeframe,
  onSelectTimeframe: (timeframe: PriceChartTimeframe) => void,
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, hoverPricePointIndex, onSelectTimeframe, pricePoints, selectedTimeframe } = props;

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
    <div className={className}>
      <PriceInfoUI
        className={'__price-info'}
        {...priceInfoUIProps}
      />

      <TimeframeSelector
        className={'__timeframe-selector'}
        onSelect={onSelectTimeframe}
        selectedTimeframe={selectedTimeframe}
      />
    </div>
  );
};

export const PriceInfoContainer = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  display: 'flex',
  gap: token.sizeSM,
  justifyContent: 'space-between',
}));
