// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { OptimalSwapPathParamsV2, SwapRequest, SwapRequestV2, SwapSubmitParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types/swap';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

// deprecated
export async function getOptimalProcessOnSelectQuote (request: OptimalSwapPathParamsV2) {
  return sendMessage('pri(swapService.getOptimalProcessOnSelectQuote)', request);
}

export async function handleSwapRequestV2 (request: SwapRequestV2) {
  return sendMessage('pri(swapService.handleSwapRequestV2)', request);
}

// deprecated
export async function getLatestSwapQuote (request: SwapRequest) {
  return sendMessage('pri(swapService.getLatestQuote)', request);
}

export async function handleSwapStep (request: SwapSubmitParams) {
  return sendMessage('pri(swapService.handleSwapStep)', request);
}

export async function validateSwapProcess (request: ValidateSwapProcessParams) {
  return sendMessage('pri(swapService.validateSwapProcess)', request);
}
