// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import KoniState from '@subwallet/extension-base/koni/background/handlers/State';

import { _ReferendumInfo } from './type';

interface Referendums {
  items: _ReferendumInfo[];
}

export default class OpenGovService {
  protected readonly state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  public async fetchReferendums (request: string): Promise<_ReferendumInfo[]> {
    const substrateApi = this.state.getSubstrateApi(request);

    const api = await substrateApi.isReady;

    console.log('api', api);
    const url = `https://${request}.subsquare.io/api/gov2/referendums?page=1&page_size=100`;

    const res = await fetch(url);
    const json = await res.json() as Referendums;

    return json.items;
  }
}
