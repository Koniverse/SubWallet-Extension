// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TrackInfo } from './interface';

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
