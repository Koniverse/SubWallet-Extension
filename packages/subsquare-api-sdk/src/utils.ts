// Copyright 2019-2022 @subwallet/subsquare-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Track } from './interface';

export const ALL_TRACK_ID = 'All';

export const ALL_TRACK: Track = { id: ALL_TRACK_ID, name: 'All tracks' };

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
