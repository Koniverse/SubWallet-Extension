// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PriceChartPoint } from '@subwallet/extension-base/background/KoniTypes';
import { SwNumberProps } from '@subwallet/react-ui/es/number';

export interface DisplayPriceChartPoint extends PriceChartPoint {
  time: number;
  hoverValue: number | null;
}

export type PriceInfoUIProps = {
  value: SwNumberProps['value'];
  change: SwNumberProps['value'];
  percent: SwNumberProps['value'];
  isPriceDown?: boolean;
}
