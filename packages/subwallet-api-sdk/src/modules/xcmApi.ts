// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWApiResponse } from '../types';

interface XcmRequest {
  address: string;
  from: string;
  to: string;
  recipient: string;
  value: string;
}

interface XcmApiResponse {
  sender: string;
  to: string;
  transferEncodedCall: string;
  value: string;
  metadata?: any;
}

export class XcmApi {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor (baseUrl: string, headers: Record<string, string>) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async fetchXcmData (address: string, from: string, to: string, recipient: string, value: string): Promise<XcmApiResponse> {
    const url = `${this.baseUrl}/xcm`;

    const xcmRequest: XcmRequest = {
      address,
      from,
      to,
      recipient,
      value
    };

    try {
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ XcmRequest: xcmRequest })
      });

      const response = await rawResponse.json() as SWApiResponse<XcmApiResponse>;

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Unable to perform this transaction at the moment. Try again later');
      }

      throw new Error((error as Error)?.message || 'Unable to perform this transaction at the moment. Try again later');
    }
  }
}
