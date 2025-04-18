// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { timeframes } from './shared';

type Props = ThemeProps & {
  selectedTimeframe: PriceChartTimeframe,
  onSelect: (timeframe: PriceChartTimeframe) => void,
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, onSelect, selectedTimeframe } = props;

  const timeframeLabelMap = useMemo<Record<PriceChartTimeframe, string>>(() => ({
    '1D': '24h',
    '1W': '7d',
    '1M': '1m',
    '3M': '3m',
    YTD: 'YTD',
    ALL: 'Max'
  }), []);

  const onClickItem = useCallback((timeframe: PriceChartTimeframe) => {
    return () => {
      onSelect(timeframe);
    };
  }, [onSelect]);

  return (
    <div className={className}>
      {timeframes.map((timeframe) => (
        <div
          className={CN('__timeframe-item', {
            '-selected': selectedTimeframe === timeframe
          })}
          key={timeframe}
          onClick={onClickItem(timeframe)}
        >
          {timeframeLabelMap[timeframe]}
        </div>
      ))}
    </div>
  );
};

export const TimeframeSelector = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  display: 'flex',
  paddingLeft: token.paddingXXS,
  paddingRight: token.paddingXXS,

  '.__timeframe-item': {
    cursor: 'pointer',
    height: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 50,
    flex: 1
  },

  '.__timeframe-item.-selected': {
    backgroundColor: token.colorBgInput
  }
}));
