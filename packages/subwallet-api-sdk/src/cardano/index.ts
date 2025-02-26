// Copyright 2017-2022 @subwallet/subwallet-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BuildCardanoTxParams, getFirstNumberAfterSubstring, POPULAR_CARDANO_ERROR_PHRASE, toUnit } from '@subwallet/subwallet-api-sdk/cardano/utils';
import { SWApiResponse } from '@subwallet/subwallet-api-sdk/types';

export async function fetchUnsignedPayload (baseUrl: string, params: BuildCardanoTxParams) {
  const searchParams = new URLSearchParams({
    sender: params.from,
    receiver: params.to,
    unit: params.cardanoId,
    quantity: params.value
  });

  if (params.cardanoTtlOffset) {
    searchParams.append('ttl', params.cardanoTtlOffset.toString());
  }

  try {
    const rawResponse = await fetch(baseUrl + searchParams.toString(), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const response = await rawResponse.json() as SWApiResponse<string>;

    if (response.error && response.status === 'fail') {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes(POPULAR_CARDANO_ERROR_PHRASE.NOT_MATCH_MIN_AMOUNT)) {
      const minAdaRequiredRaw = getFirstNumberAfterSubstring(errorMessage, POPULAR_CARDANO_ERROR_PHRASE.NOT_MATCH_MIN_AMOUNT);
      const minAdaRequired = minAdaRequiredRaw ? toUnit(minAdaRequiredRaw, params.tokenDecimals) : 1;

      throw new Error(`Amount too low. Increase your amount above ${minAdaRequired} ${params.nativeTokenSymbol} and try again`);
    }

    if (errorMessage.includes(POPULAR_CARDANO_ERROR_PHRASE.INSUFFICIENT_INPUT)) {
      throw new Error(`Insufficient ${params.nativeTokenSymbol} balance to perform transaction. Top up ${params.nativeTokenSymbol} and try again`);
    }

    console.error(`Transaction is not built successfully: ${errorMessage}`);
    throw new Error('Unable to perform this transaction at the moment. Try again later');
  }
}
