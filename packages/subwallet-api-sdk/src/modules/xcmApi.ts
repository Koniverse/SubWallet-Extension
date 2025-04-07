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
}

export class XcmApi {
  private baseUrl: string;

  constructor (baseUrl: string) {
    this.baseUrl = baseUrl;
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
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ XcmRequest: xcmRequest })
      });

      const response = await rawResponse.json() as SWApiResponse<XcmApiResponse>;

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error((error as Error)?.message || 'Unable to perform this transaction at the moment. Try again later');
    }
  }
}
