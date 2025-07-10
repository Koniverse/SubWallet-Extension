// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { cancelSubscription, getHistoryTokenPrice, subscribeCurrentTokenPrice } from '@subwallet/extension-web-ui/messaging';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { NotSupportedContent } from './NotSupportedContent';
import { PriceChart } from './PriceChart';
import { PriceInfoContainer } from './PriceInfoContainer';

type WrapperProps = ThemeProps & {
  priceId?: string;
  isChartSupported?: boolean;
};

type ComponentProps = {
  priceId: string;
};

interface TimeframeConfig {
  seconds: number;
  interval: number;
}

interface LivePrice {
  time: number;
  value: number;
}

const TIMEFRAMES: Record<PriceChartTimeframe, TimeframeConfig> = {
  '1D': { seconds: 86400, interval: 300 },
  '1W': { seconds: 604800, interval: 3600 },
  '1M': { seconds: 2592000, interval: 14400 },
  '3M': { seconds: 7776000, interval: 43200 },
  YTD: { seconds: 31536000, interval: 86400 },
  '1Y': { seconds: 31536000, interval: 86400 },
  ALL: { seconds: 315360000, interval: 604800 }
};

const Component: React.FC<ComponentProps> = (props: ComponentProps) => {
  const { priceId } = props;
  const [selectedTimeframe, setSelectedTimeframe] = useState<PriceChartTimeframe>('1D');

  const [rawPricePoints, setRawPricePoints] = useState<PriceChartPoint[]>([]);
  const [hoverPricePointIndex, setHoverPricePointIndex] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const lastFetchPriceHistoryTimeRef = useRef<Record<string, number>>({});
  const priceHistoryCacheRef = useRef<Record<string, PriceChartPoint[]>>({});

  const { interval } = TIMEFRAMES[selectedTimeframe];

  const mergedRawPricePoints = useMemo<PriceChartPoint[]>(() => {
    if (!livePrice || !rawPricePoints || rawPricePoints?.length === 0) {
      return [];
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
    priceHistoryCacheRef.current = {};
    lastFetchPriceHistoryTimeRef.current = {};
    setRawPricePoints([]);
  },
  [priceId]);

  useEffect(() => {
    let sync = true;

    const loadPriceHistory = async () => {
      const cache = priceHistoryCacheRef.current[selectedTimeframe];

      const nowTs = Date.now();
      const lastFetched = lastFetchPriceHistoryTimeRef.current[selectedTimeframe] || 0;
      const shouldRefetch = nowTs - lastFetched >= 30000;

      if (cache && !shouldRefetch) {
        setRawPricePoints(cache);

        return;
      }

      if (!shouldRefetch) {
        return;
      }

      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = nowTs;

      const { history } = await getHistoryTokenPrice(priceId, selectedTimeframe);

      if (sync) {
        priceHistoryCacheRef.current[selectedTimeframe] = history;
        setRawPricePoints(history);
      }
    };

    loadPriceHistory().catch((e) => {
      console.log('loadPriceHistory Error', e);
    });

    return () => {
      sync = false;
    };
  }, [priceId, selectedTimeframe]);

  useEffect(() => {
    let subscriptionId: string;
    let isSync = true;

    const cb = (price: LivePrice) => {
      if (isSync) {
        setLivePrice(price);
      }
    };

    subscribeCurrentTokenPrice(priceId, cb).then((rs) => {
      const { id, price } = rs;

      subscriptionId = id;

      if (isSync) {
        setLivePrice(price);
      }
    }).catch((e) => {
      console.log('subscribeCurrentTokenPrice Error', e);
    });

    return () => {
      isSync = false;

      if (subscriptionId) {
        cancelSubscription(subscriptionId).catch(console.error);
      }
    };
  }, [priceId]);

  return (
    <>
      <PriceInfoContainer
        className='__price-info-container'
        hoverPricePointIndex={hoverPricePointIndex}
        onSelectTimeframe={onSelectTimeframe}
        pricePoints={mergedRawPricePoints}
        selectedTimeframe={selectedTimeframe}
      />

      <PriceChart
        className='__price-chart-area'
        hoverPricePointIndex={hoverPricePointIndex}
        pricePoints={mergedRawPricePoints}
        setHoverPricePointIndex={setHoverPricePointIndex}
        timeframe={selectedTimeframe}
      />
    </>
  );
};

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
  const { className, isChartSupported, priceId } = props;

  return (
    <div className={className}>
      {
        priceId && isChartSupported
          ? (
            <Component
              priceId={priceId}
            />
          )
          : (
            <NotSupportedContent />
          )
      }
    </div>

  );
};

export const PriceChartAreaDesktop = styled(Wrapper)<WrapperProps>(({ theme: { token } }: ThemeProps) => ({
  backgroundColor: token.colorBgSecondary,
  borderRadius: 12,
  padding: '24px 32px',
  minHeight: 430,
  position: 'relative',

  '.__price-info-container': {
    marginBottom: 28
  }
}));
