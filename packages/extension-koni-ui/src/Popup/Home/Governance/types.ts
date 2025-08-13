// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubsquareApiSdk } from '@subwallet/subsquare-api-sdk';

export enum ScreenView {
  OVERVIEW= 'overview',
  REFERENDUM_DETAIL= 'referendum-detail'
}

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
