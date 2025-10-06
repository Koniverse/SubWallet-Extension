// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios, { AxiosInstance } from 'axios';

import { DemocracyReferendum, OpenGovReferendum, ReferendaQueryParams, ReferendaQueryParamsWithTrack, ReferendaResponse, Referendum, ReferendumDetail, ReferendumVoteDetail, TrackInfo, UserVotesParams } from './interface';
import { gov1ReferendumsApi, gov2ReferendumsApi, gov2TracksApi } from './url';
import { ALL_TRACK, reformatTrackName } from './utils';

const specialBaseUrls: Record<string, string> = {
  vara: 'https://vara.subsquare.io/api',
  acala: 'https://acala.subsquare.io/api',
  centrifuge: 'https://centrifuge.subsquare.io/api',
  laos: 'https://laos.subsquare.io/api/',
  interlay: 'https://interlay.subsquare.io/api',
  karura: 'https://karura.subsquare.io/api',
  kintsugi: 'https://kintsugi.subsquare.io/api'
};

const LegacyGovChains = [
  'ajuna',
  'astar',
  'phala',
  'heima',
  'acala',
  'centrifuge',
  'interlay',
  'laos',
  'karura',
  'kintsugi'
];

export class SubsquareApiSdk {
  private client: AxiosInstance;
  private static instances: Map<string, SubsquareApiSdk> = new Map();
  public isLegacyGov = false;

  private constructor (chain: string) {
    const baseURL = specialBaseUrls[chain] || `https://${chain}-api.subsquare.io`;

    this.isLegacyGov = LegacyGovChains.includes(chain);
    this.client = axios.create({ baseURL });
  }

  static getInstance (chain: string): SubsquareApiSdk {
    if (!this.instances.has(chain)) {
      this.instances.set(chain, new SubsquareApiSdk(chain));
    }

    return this.instances.get(chain) as SubsquareApiSdk;
  }

  async getReferenda (params?: ReferendaQueryParams): Promise<ReferendaResponse> {
    const api = this.isLegacyGov ? gov1ReferendumsApi : gov2ReferendumsApi;
    const referendaRes = await this.client.get<ReferendaResponse>(
      api,
      { params }
    );

    return {
      ...referendaRes.data,
      items: referendaRes.data.items.map((ref) => {
        if (this.isLegacyGov) {
          const democracyRef = ref as DemocracyReferendum;

          return { ...democracyRef, version: 1 };
        }

        const ref2 = ref as OpenGovReferendum;

        return {
          ...ref2,
          version: 2,
          trackInfo: {
            ...ref2.trackInfo,
            name: reformatTrackName(ref2.trackInfo.name)
          }
        };
      })
    };
  }

  async getReferendaDetails (id: string): Promise<ReferendumDetail> {
    const api = this.isLegacyGov ? gov1ReferendumsApi : gov2ReferendumsApi;
    const referendaRes = await this.client.get<ReferendumDetail>(
      `${api}/${id}`
    );

    const ref = referendaRes.data;

    return {
      ...ref,
      trackInfo: {
        ...ref.trackInfo,
        name: reformatTrackName(ref.trackInfo.name)
      }
    };
  }

  async getTracks (): Promise<TrackInfo[]> {
    const tracksRes = await this.client.get<TrackInfo[]>(gov2TracksApi);

    const formattedTracks = tracksRes.data.map((track) => ({
      ...track,
      name: reformatTrackName(track.name)
    }));

    return [ALL_TRACK, ...formattedTracks];
  }

  async getReferendaWithTrack (trackId: number, params?: ReferendaQueryParamsWithTrack): Promise<ReferendaResponse> {
    const referendaRes = await this.client.get<ReferendaResponse>(
      gov2TracksApi + `/${trackId}/referendums`,
      { params }
    );

    return {
      ...referendaRes.data,
      items: referendaRes.data.items.map((ref) => {
        if (ref.version === 1) {
          return { ...ref };
        }

        return {
          ...ref,
          trackInfo: {
            ...ref.trackInfo,
            name: reformatTrackName(ref.trackInfo.name)
          }
        };
      })
    };
  }

  async getReferendaVotes (id: string): Promise<ReferendumVoteDetail[]> {
    const api = this.isLegacyGov ? gov1ReferendumsApi : gov2ReferendumsApi;
    const referendaVoteRes = await this.client.get<ReferendumVoteDetail[]>(
      api + `/${id}/votes`
    );

    return referendaVoteRes.data;
  }

  async getUserVotes (address: string, params: UserVotesParams): Promise<ReferendumVoteDetail[]> {
    const userVoteRes = await this.client.get<ReferendumVoteDetail[]>(
      `/users/${address}/votes`,
      { params }
    );

    return userVoteRes.data;
  }

  async findReferendumByValue (text: string): Promise<{ openGovReferenda: Referendum[] }> {
    const referendaRes = await this.client.get<{ openGovReferenda: Referendum[] }>(
      '/search',
      { params: { text } }
    );

    return referendaRes.data;
  }
}
