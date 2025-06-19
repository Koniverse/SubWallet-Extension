// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDown, CaretUp } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import { timeframes } from './shared';

type Props = ThemeProps & {
  selectedTimeframe: PriceChartTimeframe,
  onSelect: (timeframe: PriceChartTimeframe) => void,
};

const Component: React.FC<Props> = (props: Props) => {
  const { isWebUI } = useContext(ScreenContext);
  const { className, onSelect, selectedTimeframe } = props;
  const [isOpen, setIsOpen] = useState(false);

  const timeframeLabelMap = useMemo<Record<PriceChartTimeframe, string>>(() => ({
    '1D': '24h',
    '1W': '7d',
    '1M': '1m',
    '3M': '3m',
    '1Y': '1y',
    YTD: 'YTD',
    ALL: 'Max'
  }), []);

  const onClickItem = useCallback((timeframe: PriceChartTimeframe) => {
    return () => {
      onSelect(timeframe);

      if (isWebUI) {
        setIsOpen(false);
      }
    };
  }, [isWebUI, onSelect]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (isWebUI) {
    return (
      <div className={className}>
        <div
          className={'__panel-header'}
          onClick={toggleDropdown}
        >
          <div className='__panel-title'>{timeframeLabelMap[selectedTimeframe]}</div>
          <div className='__panel-icon'>
            <Icon
              phosphorIcon={isOpen ? CaretUp : CaretDown}
              size='sm'
            />
          </div>

          {isOpen && (
            <div className='__'>
              <div className='__'>
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
            </div>
          )}

        </div>
      </div>
    );
  }

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
  paddingLeft: token.padding,
  paddingRight: token.padding,

  '.__timeframe-item': {
    cursor: 'pointer',
    height: 32,
    display: 'flex',
    fontSize: token.fontSizeSM,
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
