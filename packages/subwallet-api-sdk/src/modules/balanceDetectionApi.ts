// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWApiResponse } from '@subwallet/subwallet-api-sdk/types';

export class BalanceDetectionApi {
  private baseUrl: string;

  constructor (baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getEvmTokenBalanceSlug (address: string): Promise<string[]> {
    const url = `${this.baseUrl}/balance-detection/get-token-slug?address=${address}`;

    try {
      const rawResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await rawResponse.json() as SWApiResponse<string[]>;

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get token slug : ${(error as Error).message}`);
    }
  }
}
