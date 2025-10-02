// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios, { AxiosInstance } from 'axios';

import { ReferendaQueryParams, ReferendaQueryParamsWithTrack, ReferendaResponse, Referendum, ReferendumDetail, ReferendumVoteDetail, TrackInfo, UserVotesParams } from './interface';
import { gov2ReferendumsApi, gov2TracksApi } from './url';
import { ALL_TRACK, reformatTrackName } from './utils';

const specialBaseUrls: Record<string, string> = {
  vara: 'https://vara.subsquare.io/api'
};

export class SubsquareApiSdk {
  private client: AxiosInstance;
  private static instances: Map<string, SubsquareApiSdk> = new Map();

  private constructor (chain: string) {
    const baseURL = specialBaseUrls[chain] || `https://${chain}-api.subsquare.io`;

    this.client = axios.create({ baseURL });
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

    const formattedData = {
      ...referendaRes.data,
      items: referendaRes.data.items.map((ref) => ({
        ...ref,
        trackInfo: {
          ...ref.trackInfo,
          name: reformatTrackName(ref.trackInfo.name)
        }
      }))
    };

    return formattedData;
  }

  async getReferendaDetails (id: string): Promise<ReferendumDetail> {
    const referendaRes = await this.client.get<ReferendumDetail>(
      `${gov2ReferendumsApi}/${id}`
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

    const formattedData = {
      ...referendaRes.data,
      items: referendaRes.data.items.map((ref) => ({
        ...ref,
        trackInfo: {
          ...ref.trackInfo,
          name: reformatTrackName(ref.trackInfo.name)
        }
      }))
    };

    return formattedData;
  }

  async getReferendaVotes (id: string): Promise<ReferendumVoteDetail[]> {
    const referendaVoteRes = await this.client.get<ReferendumVoteDetail[]>(
      gov2ReferendumsApi + `/${id}/votes`
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
