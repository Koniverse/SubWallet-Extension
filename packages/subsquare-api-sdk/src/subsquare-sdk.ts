// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios, { AxiosInstance } from 'axios';

import { DemocracyReferendaResponse, DemocracyReferendum, OnchainData, Proposal, ReferendaQueryParams, ReferendaQueryParamsWithTrack, ReferendaResponse, Referendum, ReferendumDetail, ReferendumVoteDetail, TrackInfo, UserVotesParams } from './interface';
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

const castDemocracyReferendumToReferendum = <T extends (Referendum | ReferendumDetail)>(ref: DemocracyReferendum): T => {
  const { call, hash, info, meta, state } = ref.onchainData;
  const enactmentAfter = (meta?.delay || 0) + (meta?.end || 0);
  const enactment = {
    after: enactmentAfter.toString()
  };

  const onChainData: OnchainData = {
    ...ref.onchainData,
    proposalHash: hash,
    proposal: { call } as Proposal,
    meta,
    info: {
      decisionDeposit: {
        who: '',
        amount: '0'
      },
      submissionDeposit: {
        who: '',
        amount: '0'
      },
      enactment,
      alarm: [],
      democracy: info
    }
  };

  return ({
    ...ref,
    version: 1,
    trackInfo: {
      id: '-1',
      name: 'Democracy',
      decisionPeriod: 0,
      confirmPeriod: 0
    },
    decisionDeposit: {
      who: ''
    },
    enactment,
    proposalHash: hash,
    proposalCall: call,
    state: {
      ...state,
      name: ref.state
    },
    onchainData: onChainData
  }) as unknown as T;
};

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

  async findReferendumByValue (text: string): Promise<{ openGovReferenda: Referendum[] }> {
    const referendaRes = await this.client.get<{ openGovReferenda: Referendum[] }>(
      '/search',
      { params: { text } }
    );

    return referendaRes.data;
  }
}
