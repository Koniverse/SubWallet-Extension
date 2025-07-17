// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { customFormatDate } from '@subwallet/extension-web-ui/utils';
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

function getEquallySpacedTicks (chartPoints: PriceChartPoint[], numTicks: number) {
  const total = chartPoints.length;

  if (total <= numTicks) {
    return chartPoints.map((item) => item.time);
  }

  return Array.from({ length: numTicks }, (_, i) => {
    const index = Math.round(i * (total - 1) / (numTicks - 1));

    return chartPoints[index].time;
  });
}

/**
 * Generates a list of tick positions by:
 * - Creating ideal tick positions evenly spaced by `spacingMs` starting from the first data point.
 * - For the final tick (the last of `numTicks`), if its ideal position exceeds the last data point,
 *   it uses `lastTime` instead to stay within the data range.
 * - Then for each ideal time, it finds the nearest actual data point time in `data`
 *   to ensure ticks align exactly with existing points (important for tooltips / crosshair).
 *
 * This ensures:
 * - Evenly spaced ticks visually.
 * - All ticks correspond to real data points, avoiding misleading positions.
 *
 * @param data Array of data points sorted by ascending time.
 * @param numTicks Total number of ticks desired (e.g. 5).
 * @param spacingMs Desired spacing between ticks in milliseconds (e.g. 6h for 1D, 2d for 7D).
 * @returns An array of timestamps corresponding to chosen tick positions.
 */
export function getTicksSnapNearest (
  data: PriceChartPoint[],
  numTicks: number,
  spacingMs: number
): number[] {
  if (!data.length) {
    return [];
  }

  const firstTime = data[0].time;
  const lastTime = data[data.length - 1].time;

  const idealTimes: number[] = [];

  for (let i = 0; i < numTicks; i++) {
    if (i === numTicks - 1) {
      const candidate = firstTime + i * spacingMs;

      idealTimes.push(candidate > lastTime ? lastTime : candidate);
    } else {
      idealTimes.push(firstTime + i * spacingMs);
    }
  }

  const ticks: number[] = [];
  let dataIdx = 0;

  for (const ideal of idealTimes) {
    let nearest = data[dataIdx].time;
    let minDiff = Math.abs(nearest - ideal);

    while (dataIdx + 1 < data.length) {
      const nextDiff = Math.abs(data[dataIdx + 1].time - ideal);

      if (nextDiff < minDiff) {
        dataIdx++;
        nearest = data[dataIdx].time;
        minDiff = nextDiff;
      } else {
        break;
      }
    }

    if (!ticks.includes(nearest)) {
      ticks.push(nearest);
    }
  }

  return ticks.slice(0, numTicks);
}

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

  const xAxisTickFormatter = useCallback(
    (tick: string | number) => {
      switch (timeframe) {
        case '1D':
          return customFormatDate(tick, '#hhhh#:#mm#');
        case '1W':
        case '1M':
        case '3M':
          return customFormatDate(tick, '#MMM# #D#');
        case 'YTD':
        case '1Y':
        case 'ALL':
          return customFormatDate(tick, '#MMM# #D#, #YYYY#');
        default:
          return tick.toString();
      }
    },
    [timeframe]
  );

  const xAxisTickValues = useMemo(() => {
    if (timeframe === '1D') {
      return getTicksSnapNearest(pricePoints, 5, 6 * 60 * 60 * 1000);
    }

    if (timeframe === '1W') {
      return getTicksSnapNearest(pricePoints, 8, 24 * 60 * 60 * 1000);
    }

    return getEquallySpacedTicks(pricePoints, 5);
  }, [pricePoints, timeframe]);

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
        height={278}
        width='100%'
      >
        <LineChart
          data={displayData}
          margin={{ top: 22, bottom: 0, left: 32, right: 32 }}
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
            axisLine={false}
            dataKey='time'
            interval={0}
            minTickGap={0}
            tick={{ fontSize: 12, fill: '#ccc' }}
            tickFormatter={xAxisTickFormatter}
            tickMargin={4}
            ticks={xAxisTickValues}
          />

          <YAxis
            domain={[
              (dataMin: number) => dataMin,
              (dataMax: number) => dataMax
            ]}
            hide
            padding={{ bottom: 28 }}
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
  marginLeft: -20,
  marginRight: -20,

  '.__tooltip-content': {
    fontSize: '10px',
    fontWeight: token.headingFontWeight,
    lineHeight: '18px',
    color: token.colorTextLight3
  }
}));
