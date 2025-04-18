// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/PriceChartArea/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { PriceChart } from './PriceChart';
import { PriceInfoContainer } from './PriceInfoContainer';
import { PriceInfoUI } from './PriceInfoUI';
import { TimeframeSelector } from './TimeframeSelector';

type WrapperProps = ThemeProps & {
  priceId?: string;
};

type ComponentProps = {
  priceId: string;
};

interface TimeframeConfig {
  seconds: number;
  interval: number;
  direction: 'up' | 'down' | 'neutral';
}

interface LivePrice {
  time: number;
  value: number;
}

const TIMEFRAMES: Record<PriceChartTimeframe, TimeframeConfig> = {
  '1D': { seconds: 86400, interval: 300, direction: 'up' }, // 5p
  '1W': { seconds: 604800, interval: 3600, direction: 'neutral' },
  '1M': { seconds: 2592000, interval: 14400, direction: 'down' },
  '3M': { seconds: 7776000, interval: 43200, direction: 'down' },
  YTD: { seconds: 31536000, interval: 86400, direction: 'up' },
  ALL: { seconds: 315360000, interval: 604800, direction: 'neutral' }
};

function generateMockChartData (
  count: number,
  startPrice: number,
  direction: 'up' | 'down' | 'neutral' = 'neutral',
  intervalSec = 60
): PriceChartPoint[] {
  const data: PriceChartPoint[] = [];
  let price = startPrice;
  const timestamp = Date.now() - count * intervalSec * 1000;

  const bias = direction === 'up' ? 0.3 : direction === 'down' ? -0.3 : 0;

  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.5) * 2;
    const movement = noise + bias;

    price += movement;
    price = Math.max(price, 0);

    data.push({
      time: timestamp + i * intervalSec * 1000,
      value: parseFloat(price.toFixed(2))
    });
  }

  return data;
}

const fetchChartData = async (
  priceId: string,
  vsCurrency: string,
  from: number,
  to: number,
  direction: 'up' | 'down' | 'neutral',
  interval: number
): Promise<PriceChartPoint[]> => {
  const count = Math.floor((to - from) / interval);
  const startPrice = 100 + Math.random() * 50;
  const data = generateMockChartData(count, startPrice, direction, interval);

  return Promise.resolve(data);
};

const fetchLivePriceFactory = (basePrice: number) => {
  let current = basePrice;

  return async (): Promise<number> => {
    const noise = (Math.random() - 0.5) * 2;
    const movement = Math.max(Math.min(noise, 1.5), -1.5);

    current += movement;
    current = Math.max(current, 0);

    return Promise.resolve(parseFloat(current.toFixed(2)));
  };
};

const Component: React.FC<ComponentProps> = (props: ComponentProps) => {
  const { priceId } = props;
  const [selectedTimeframe, setSelectedTimeframe] = useState<PriceChartTimeframe>('1D');
  const { currency: vsCurrency } = useSelector((state) => state.price);

  const [rawPricePoints, setRawPricePoints] = useState<PriceChartPoint[]>([]);
  const [hoverPricePointIndex, setHoverPricePointIndex] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const lastFetchPriceHistoryTimeRef = useRef<Record<string, number>>({});
  const priceHistoryCacheRef = useRef<Record<string, PriceChartPoint[]>>({});

  const fetchLivePrice = useRef(fetchLivePriceFactory(120)).current;

  const { direction, interval, seconds } = TIMEFRAMES[selectedTimeframe];

  const mergedRawPricePoints = useMemo<PriceChartPoint[]>(() => {
    if (!livePrice || rawPricePoints.length === 0) {
      return rawPricePoints;
    }

    const last = rawPricePoints[rawPricePoints.length - 1];
    const intervalMs = interval * 1000;
    const diff = livePrice.time - last.time;

    if (diff < intervalMs * 0.5) {
      return [...rawPricePoints.slice(0, -1), { ...last, value: livePrice.value }];
    }

    return [...rawPricePoints, { time: livePrice.time, value: livePrice.value }];
  }, [rawPricePoints, livePrice, interval]);

  const onSelectTimeframe = useCallback((timeframe: PriceChartTimeframe) => {
    setSelectedTimeframe(timeframe);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadPriceHistory = async () => {
      const now = Math.floor(Date.now() / 1000);
      const from = now - seconds;
      const cache = priceHistoryCacheRef.current[selectedTimeframe];

      const nowTs = Date.now();
      const lastFetched = lastFetchPriceHistoryTimeRef.current[selectedTimeframe] || 0;
      const shouldRefetch = nowTs - lastFetched >= 10000;

      if (cache && !shouldRefetch) {
        setRawPricePoints(cache);

        return;
      }

      if (!shouldRefetch) {
        return;
      }

      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = nowTs;
      const history = await fetchChartData(priceId, vsCurrency, from, now, direction, interval);

      if (mounted) {
        priceHistoryCacheRef.current[selectedTimeframe] = history;
        setRawPricePoints(history);
      }
    };

    loadPriceHistory().catch(console.error);

    return () => {
      mounted = false;
    };
  }, [priceId, vsCurrency, direction, interval, seconds, selectedTimeframe]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      (async () => {
        const price = await fetchLivePrice();

        setLivePrice({
          time: Date.now(),
          value: price
        });
      })().catch(console.error);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchLivePrice]);

  return (
    <>
      <PriceInfoContainer
        className='__price-info-container'
        hoverPricePointIndex={hoverPricePointIndex}
        pricePoints={mergedRawPricePoints}
      />

      <PriceChart
        className='__price-chart-area'
        hoverPricePointIndex={hoverPricePointIndex}
        pricePoints={mergedRawPricePoints}
        setHoverPricePointIndex={setHoverPricePointIndex}
        timeframe={selectedTimeframe}
      />

      <TimeframeSelector
        className={'__timeframe-selector'}
        onSelect={onSelectTimeframe}
        selectedTimeframe={selectedTimeframe}
      />
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className, priceId = 'polkadot' } = props;

  return (
    <div className={className}>
      {
        priceId
          ? (
            <Component
              priceId={priceId}
            />
          )
          : (
            <>
              <PriceInfoUI
                change={0}
                className={'__price-info-container-empty'}
                percent={0}
                value={0}
              />
            </>
          )
      }
    </div>

  );
};

export const PriceChartArea = styled(Wrapper)<WrapperProps>(({ theme: { token } }: ThemeProps) => ({
  '.__price-info-container': {
    marginBottom: token.margin
  },

  '.__price-chart-area': {
    marginBottom: token.marginXS
  }
}));
