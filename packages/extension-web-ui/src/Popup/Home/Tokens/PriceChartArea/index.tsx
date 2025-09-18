// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { cancelSubscription, getHistoryTokenPrice, subscribeCurrentTokenPrice } from '@subwallet/extension-web-ui/messaging';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { PriceChart } from './PriceChart';
import { PriceInfoContainer } from './PriceInfoContainer';
import { PriceInfoUI } from './PriceInfoUI';
import { TimeframeSelector } from './TimeframeSelector';

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
  const { currency } = useSelector((state: RootState) => state.price);
  const [rawPricePoints, setRawPricePoints] = useState<PriceChartPoint[]>([]);
  const [hoverPricePointIndex, setHoverPricePointIndex] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const lastFetchPriceHistoryTimeRef = useRef<Record<string, number>>({});
  const prevCurrencyRef = useRef<string>(currency);
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

    loadPriceHistory().catch(console.error);

    return () => {
      sync = false;
    };
  }, [priceId, selectedTimeframe]);

  useEffect(() => {
    let sync = true;

    if (currency !== prevCurrencyRef.current) {
      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = Date.now();

      getHistoryTokenPrice(priceId, selectedTimeframe).then(({ history }) => {
        if (sync) {
          priceHistoryCacheRef.current[selectedTimeframe] = history;
          setRawPricePoints(history);
        }
      }).catch(console.error);

      prevCurrencyRef.current = currency;
    }

    return () => {
      sync = false;
    };
  }, [currency, priceId, selectedTimeframe]);

  useEffect(() => {
    let subscriptionId: string;
    let isSync = true;

    const cb = (price: LivePrice) => {
      setLivePrice(price);
    };

    subscribeCurrentTokenPrice(priceId, cb).then((rs) => {
      const { id, price } = rs;

      subscriptionId = id;

      if (isSync) {
        setLivePrice(price);
      }
    }).catch(console.error);

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
  const { className, isChartSupported, priceId } = props;
  const priceMap = useSelector((state) => state.price.priceMap);

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
            <>
              <PriceInfoUI
                change={0}
                className={'__price-info-container-empty'}
                percent={0}
                value={priceId ? priceMap[priceId] || 0 : 0}
              />
            </>
          )
      }
    </div>

  );
};

export const PriceChartArea = styled(Wrapper)<WrapperProps>(({ theme: { token } }: ThemeProps) => ({
  '.__price-info-container, .__price-info-container-empty': {
    paddingBottom: token.paddingXXS
  },

  '.__price-info-container': {
    marginBottom: token.marginSM
  },

  '.__price-chart-area': {
    marginBottom: token.marginXS
  }
}));
