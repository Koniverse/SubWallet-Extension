// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DemocracyReferendum, OnchainData, Proposal, Referendum, ReferendumDetail, TrackInfo } from './interface';

export const ALL_TRACK_ID = 'All';

export const ALL_TRACK: TrackInfo = { id: ALL_TRACK_ID, name: 'All tracks', decisionPeriod: 0, confirmPeriod: 0 };

export function reformatTrackName (input: string): string {
  if (!input) {
    return '';
  }

  let str = input.replace(/[_-]/g, ' ');

  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');

  return str
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const castDemocracyReferendumToReferendum = <T extends (Referendum | ReferendumDetail)>(ref: DemocracyReferendum): T => {
  const { call, hash, info, meta, state } = ref.onchainData;
  const enactmentAfter = (meta?.delay || 0) + (meta?.end || 0);
  const enactment = {
    after: enactmentAfter.toString()
  };

  const proposal = ref.onchainData.preImage ? ref.onchainData.preImage : { call } as Proposal;

  const onChainData: OnchainData = {
    ...ref.onchainData,
    proposalHash: hash,
    proposal,
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
    proposalCall: proposal.call,
    state: {
      ...state,
      name: ref.state
    },
    onchainData: onChainData
  }) as unknown as T;
};
