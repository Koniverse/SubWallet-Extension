// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios, { AxiosInstance } from 'axios';

import { ReferendaQueryParams, ReferendaResponse, ReferendumDetail } from './types';
import { gov2ReferendumsApi } from './url';

export class SubsquareApiSdk {
  private client: AxiosInstance;
  private static instances: Map<string, SubsquareApiSdk> = new Map();

  private constructor (chain: string) {
    this.client = axios.create({
      baseURL: `https://${chain}-api.subsquare.io/` || 'https://polkadot-api.subsquare.io/'
    });
  }

  static getInstance (chain: string): SubsquareApiSdk {
    if (!this.instances.has(chain)) {
      this.instances.set(chain, new SubsquareApiSdk(chain));
    }

    return this.instances.get(chain) as SubsquareApiSdk;
  }

  async getReferenda (params?: ReferendaQueryParams): Promise<ReferendaResponse> {
    const referendaRes = await this.client.get<ReferendaResponse>(
      gov2ReferendumsApi,
      { params }
    );

    return referendaRes.data;
  }

  async getReferendaDetails (id: string): Promise<ReferendumDetail> {
    const referendaRes = await this.client.get<ReferendumDetail>(
      gov2ReferendumsApi + `/${id}`
    );

    return referendaRes.data;
  }
}
