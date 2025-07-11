// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate } from '@subwallet/extension-koni-ui/utils';
import React, { Context, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/types';
import { Props as DotProps } from 'recharts/types/shape/Dot';
import styled, { ThemeContext } from 'styled-components';

import { DisplayPriceChartPoint } from './types';

type Props = ThemeProps & {
  pricePoints: PriceChartPoint[];
  timeframe: PriceChartTimeframe;
  hoverPricePointIndex: number | null;
  setHoverPricePointIndex: (index: number | null) => void;
};

const CustomActiveDot = ({ cx, cy, fill }: DotProps) => (
  <>
    <circle
      cx={cx}
      cy={cy}
      fill={fill}
      fillOpacity={0.1}
      r={9}
    />
    <circle
      cx={cx}
      cy={cy}
      fill={fill}
      r={4}
      stroke='#000'
      strokeWidth={0}
    />
  </>
);

const Component: React.FC<Props> = (props: Props) => {
  const { className, hoverPricePointIndex, pricePoints, setHoverPricePointIndex,
    timeframe } = props;
  const themeToken = useContext<Theme>(ThemeContext as Context<Theme>).token;

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const displayData = useMemo<DisplayPriceChartPoint[]>(() => {
    return pricePoints.map((point, index) => ({
      ...point,
      hoverValue: hoverPricePointIndex === null || index <= hoverPricePointIndex ? point.value : null
    }));
  }, [pricePoints, hoverPricePointIndex]);

  const isUp = useMemo(() => {
    if (pricePoints.length < 2) {
      return true;
    }

    const first = pricePoints[0]?.value ?? 0;
    const last = pricePoints[pricePoints.length - 1]?.value ?? 0;

    return last >= first;
  }, [pricePoints]);

  const handleMouseMove = useCallback((e: CategoricalChartState) => {
    const i = e.activeTooltipIndex;

    if (typeof i === 'number') {
      setHoverPricePointIndex(i);
    }

    if (!e?.activePayload || !e.activeCoordinate) {
      return;
    }

    const chartX = e.activeCoordinate.x;
    const chartWidth = containerRef.current?.offsetWidth || 0;

    const tooltipWidth = (() => {
      return tooltipRef.current?.getBoundingClientRect?.()?.width || 0;
    })();

    const edgeSpace = 8;

    let x = chartX - tooltipWidth / 2;

    if (x <= edgeSpace) {
      x = edgeSpace;
    } else if (x + tooltipWidth + edgeSpace > chartWidth) {
      x = chartWidth - tooltipWidth - edgeSpace;
    }

    setTooltipPos({ x, y: 0 });
  }, [setHoverPricePointIndex]);

  const handleMouseLeave = useCallback(() => {
    setHoverPricePointIndex(null);
  }, [setHoverPricePointIndex]);

  const getTooltipContent = useCallback((_props: unknown) => {
    const label = (_props as { label: string })?.label;

    if (!label) {
      return null;
    }

    const datetimeFormat = (() => {
      if (['ALL', 'YTD', '1Y'].includes(timeframe)) {
        return '#MMM# #D# #YYYY#';
      }

      return '#MMM# #D# at #hhh#:#mm#';
    })();

    return (
      <div
        className={'__tooltip-content'}
        ref={tooltipRef}
      >
        {`${customFormatDate(label, datetimeFormat)}`}
      </div>
    );
  }, [timeframe]);

  return (
    <div
      className={className}
      ref={containerRef}
    >
      <ResponsiveContainer
        height={162}
        width='100%'
      >
        <LineChart
          data={displayData}
          margin={{ top: 22, bottom: 0, left: 0, right: 0 }}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <Tooltip
            content={getTooltipContent}
            cursor={{
              stroke: 'rgba(255, 255, 255, 0.12)'
            }}
            isAnimationActive={false}
            position={tooltipPos}
          />

          <XAxis
            dataKey='time'
            hide
            padding={{ right: 16 }}
          />

          <YAxis
            domain={[
              (dataMin: number) => dataMin,
              (dataMax: number) => dataMax
            ]}
            hide
            padding={{ bottom: 16 }}
          />

          {
            !!hoverPricePointIndex && (
              <ReferenceLine
                stroke='rgba(255, 255, 255, 0.12)'
                strokeDasharray='3 3'
                strokeWidth={1}
                y={displayData[0]?.value ?? 0}
              />
            )
          }

          <Line
            activeDot={false}
            dataKey='value'
            dot={false}
            isAnimationActive={false}
            stroke='rgba(255, 255, 255, 0.12)'
            strokeWidth={3}
            type='monotone'
          />

          <Line
            activeDot={<CustomActiveDot fill={isUp ? themeToken.colorSuccess : themeToken.colorError} />}
            dataKey='hoverValue'
            dot={false}
            isAnimationActive={false}
            stroke={isUp ? themeToken.colorSuccess : themeToken.colorError}
            strokeWidth={3}
            type='monotone'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PriceChart = styled(Component)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  '.__tooltip-content': {
    fontSize: '10px',
    fontWeight: token.headingFontWeight,
    lineHeight: '18px',
    color: token.colorTextLight3
  }
}));
