// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubWalletResponse } from '../sdk';

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

      const response = await rawResponse.json() as SubWalletResponse<XcmApiResponse>;

      if (response.statusCode !== 200) {
        throw new Error(response.message);
      }

      return response.result;
    } catch (error) {
      throw new Error(`${(error as Error).message}`);
    }
  }
}
