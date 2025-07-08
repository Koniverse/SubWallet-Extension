// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWApiResponse } from '@subwallet/subwallet-api-sdk/types';

export class BalanceDetectionApi {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor (baseUrl: string, headers: Record<string, string>) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async getEvmTokenBalanceSlug (address: string): Promise<string[]> {
    const url = `${this.baseUrl}/balance-detection/get-token-slug?address=${address}`;

    try {
      const rawResponse = await fetch(url, {
        method: 'GET',
        headers: this.headers
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
