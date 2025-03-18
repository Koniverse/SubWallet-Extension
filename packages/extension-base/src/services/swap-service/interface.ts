// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ActionPair } from '@subwallet/extension-base/types';

export enum DynamicSwapType {
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE'
}

export interface DynamicSwapAction {
  action: DynamicSwapType;
  pair: ActionPair;
}

export const enum XcmStepPosition {
  FIRST = 0,
  AFTER_SWAP = 1,
  AFTER_XCM_SWAP = 2
}
