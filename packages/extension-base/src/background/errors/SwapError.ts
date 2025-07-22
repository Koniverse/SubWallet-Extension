// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWError } from '@subwallet/extension-base/background/errors/SWError';
import { SwapErrorType } from '@subwallet/extension-base/types/swap';
import { detectTranslate } from '@subwallet/extension-base/utils';

const defaultErrorMap: Record<SwapErrorType, { message: string, code?: number }> = {
  ERROR_FETCHING_QUOTE: {
    message: detectTranslate('bg.SWAP.background.error.Swap.noSwapQuoteFound'),
    code: undefined
  },
  NOT_MEET_MIN_SWAP: {
    message: detectTranslate('bg.SWAP.background.error.Swap.amountTooLow'),
    code: undefined
  },
  QUOTE_TIMEOUT: {
    message: detectTranslate('bg.SWAP.background.error.Swap.quoteTimeout'),
    code: undefined
  },
  UNKNOWN: {
    message: detectTranslate('bg.SWAP.background.error.Swap.undefinedErrorCheckConnection'),
    code: undefined
  },
  ASSET_NOT_SUPPORTED: {
    message: detectTranslate('bg.SWAP.background.error.Swap.swapPairNotSupported'),
    code: undefined
  },
  INVALID_RECIPIENT: {
    message: detectTranslate('bg.SWAP.background.error.Swap.invalidRecipient'),
    code: undefined
  },
  SWAP_EXCEED_ALLOWANCE: {
    message: detectTranslate('bg.SWAP.background.error.Swap.cannotSwapAllBalance'),
    code: undefined
  },
  SWAP_NOT_ENOUGH_BALANCE: {
    message: detectTranslate('bg.SWAP.background.error.Swap.depositMoreFundsToSwap'),
    code: undefined
  },
  NOT_ENOUGH_LIQUIDITY: {
    message: detectTranslate('bg.SWAP.background.error.Swap.insufficientLiquidity'),
    code: undefined
  },
  AMOUNT_CANNOT_BE_ZERO: {
    message: detectTranslate('bg.SWAP.background.error.Swap.amountMustBeGreaterThanZero'),
    code: undefined
  },
  MAKE_POOL_NOT_ENOUGH_EXISTENTIAL_DEPOSIT: {
    message: detectTranslate('bg.SWAP.background.error.Swap.insufficientLiquidity'),
    code: undefined
  },
  NOT_MEET_MIN_EXPECTED: {
    // TODO: update message
    message: detectTranslate('bg.SWAP.background.error.Swap.unableToProcessSwap'),
    code: undefined
  }
};

export class SwapError extends SWError {
  override errorType: SwapErrorType;

  constructor (errorType: SwapErrorType, errMessage?: string, data?: unknown) {
    const { code, message } = defaultErrorMap[errorType];

    super(errorType, errMessage || message, code, data);

    this.errorType = errorType;
  }
}
