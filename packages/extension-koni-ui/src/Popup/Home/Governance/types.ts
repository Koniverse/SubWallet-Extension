// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';
import { SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';

export type ViewBaseType = {
  sdkInstant: SubsquareApiSdk | undefined;
  chainSlug: string;
}

export enum ReferendaCategory {
  ONGOING= 'ongoing',
  COMPLETED= 'completed',
  VOTED='voted'
}

export type GovernanceChainSelectorItemType = {
  chainSlug: string;
  chainName: string;
};

// machine
// ----------
export interface GovernanceViewContext {
  chainSlug: string;
  referendumId: string | null;
  view: GovernanceScreenView;
}

export type GovernanceViewEvent =
  | { type: 'GO_OVERVIEW' }
  | { type: 'GO_REFERENDUM_DETAIL'; referendumId: string }
  | { type: 'SET_CHAIN'; chainSlug: string }
  | { type: 'SET_REFERENDUM'; referendumId: string | null }

export interface GovernanceUrlParams {
  view?: GovernanceScreenView | null;
  referendumId?: string | null;
  chainSlug?: string | null;
}
// ----------
