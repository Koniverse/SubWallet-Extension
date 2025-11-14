// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios, { AxiosInstance } from 'axios';

import { DemocracyReferendaResponse, DemocracyReferendum, MigrationBlockOffset, ReadableStreamReadResult, ReferendaQueryParams, ReferendaQueryParamsWithTrack, ReferendaResponse, Referendum, ReferendumDetail, ReferendumVoteDetail, TrackInfo, UserVotesParams } from './interface';
import { gov1ReferendumsApi, gov2ReferendumsApi, gov2TracksApi } from './url';
import { ALL_TRACK, castDemocracyReferendumToReferendum, reformatTrackName } from './utils';

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
  private chain: string;
  private constructor (chain: string) {
    const baseURL = specialBaseUrls[chain] || `https://${chain}-api.subsquare.io`;

    this.isLegacyGov = LegacyGovChains.includes(chain);
    this.client = axios.create({ baseURL });
    this.chain = chain;
  }

  static getInstance (chain: string): SubsquareApiSdk {
    if (!this.instances.has(chain)) {
      this.instances.set(chain, new SubsquareApiSdk(chain));
    }

    return this.instances.get(chain) as SubsquareApiSdk;
  }

  async getMigrationBlockOffset (blockTime: number): Promise<MigrationBlockOffset> {
    try {
      const urls = [
        `/stream/relay-chain-height?interval=${blockTime * 1000}`,
        `/stream/scan-height?interval=${blockTime * 1000}`
      ];

      const results = await Promise.allSettled(
        urls.map(async (url) => {
          const res = await fetch(new URL(url, this.client.defaults.baseURL));

          if (!res.body) {
            throw new Error('Response body is null');
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const readResult: ReadableStreamReadResult<Uint8Array> = await reader.read();
          const { done, value } = readResult;

          if (done || !value) {
            throw new Error('No data from stream');
          }

          const text = decoder.decode(value);
          const data = JSON.parse(text) as { value: number };

          return data.value;
        })
      );

      const [relayResult, scanResult] = results;

      const relayHeight = relayResult.status === 'fulfilled' ? relayResult.value : null;
      const scanHeight = scanResult.status === 'fulfilled' ? scanResult.value : null;

      let offset: number;

      if (relayHeight !== null && scanHeight !== null) {
        offset = relayHeight - scanHeight > 0 ? relayHeight - scanHeight : 0;
      } else {
        offset = scanHeight ?? 0;
      }

      return { offset, relayHeight, scanHeight };
    } catch (err) {
      console.error(`Failed to get migration block offset for ${this.chain}:`, err);

      return { offset: null, relayHeight: null, scanHeight: null };
    }
  }

  async getReferenda (params?: ReferendaQueryParams): Promise<ReferendaResponse> {
    const api = this.isLegacyGov ? gov1ReferendumsApi : gov2ReferendumsApi;
    const referendaRes = await this.client.get<ReferendaResponse | DemocracyReferendaResponse>(api, { params });

    const data = referendaRes.data;

    if (this.isLegacyGov) {
      return {
        ...data,
        items: (data as DemocracyReferendaResponse).items.map(castDemocracyReferendumToReferendum<Referendum>)
      };
    }

    return {
      ...data,
      items: (data as ReferendaResponse).items.map((ref) => ({
        ...ref,
        version: 2,
        trackInfo: {
          ...ref.trackInfo,
          name: reformatTrackName(ref.trackInfo?.name || '')
        }
      }))
    };
  }

  async getReferendaDetails (id: string): Promise<ReferendumDetail> {
    const api = this.isLegacyGov ? gov1ReferendumsApi : gov2ReferendumsApi;
    const referendaRes = await this.client.get<ReferendumDetail | DemocracyReferendum>(
      `${api}/${id}`
    );

    let ref = referendaRes.data;

    if (this.isLegacyGov) {
      return castDemocracyReferendumToReferendum<ReferendumDetail>(ref as DemocracyReferendum);
    }

    ref = ref as ReferendumDetail;

    return {
      ...ref,
      version: 2,
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

  async findReferendumByValue (text: string): Promise<{ govReferenda: Referendum[] }> {
    const referendaRes = await this.client.get<{ openGovReferenda: Referendum[], democracyReferenda?: DemocracyReferendum[]}>(
      '/search',
      { params: { text } }
    );

    if (referendaRes.data?.democracyReferenda?.length && this.isLegacyGov) {
      const democracyReferenda = referendaRes.data.democracyReferenda.map(castDemocracyReferendumToReferendum<Referendum>);

      return { govReferenda: [...democracyReferenda] };
    }

    return { govReferenda: referendaRes.data.openGovReferenda };
  }
}
