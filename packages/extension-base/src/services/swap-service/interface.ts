// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapPair } from '@subwallet/extension-base/types';

export enum DynamicSwapType {
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE'
}

export interface DynamicSwapAction {
  action: DynamicSwapType;
  pair: SwapPair;
}
