// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const GOV_QUERY_KEYS = {
  referendaList: (chainSlug: string) =>
    ['subsquare', 'referendaList', chainSlug] as const,

  referendumDetail: (chainSlug: string, referendumId: string | number) =>
    ['subsquare', 'referendumDetail', chainSlug, referendumId] as const,

  referendumVotes: (chain: string, referendumId: string | number) =>
    ['subsquare', 'referendumDetail', 'votes', chain, referendumId] as const,

  tracks: (chain: string) =>
    ['subsquare', 'referendumDetail', 'votes', chain] as const
};

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
