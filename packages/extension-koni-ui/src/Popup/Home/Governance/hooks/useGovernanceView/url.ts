// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';

import { GovernanceUrlParams } from '../../types';

const VIEW_PARAM = 'view';
const REF_PARAM = 'referendumId';
const CHAIN_PARAM = 'chainSlug';

export function parseUrlParams (sp: URLSearchParams): GovernanceUrlParams {
  const view = sp.get(VIEW_PARAM) as GovernanceScreenView | null;
  const referendumId = sp.get(REF_PARAM);
  const chainSlug = sp.get(CHAIN_PARAM);

  return {
    view: view || null,
    referendumId: referendumId || null,
    chainSlug: chainSlug || null
  };
}

export function buildSearchParams (p: GovernanceUrlParams) {
  const sp = new URLSearchParams();

  if (p.view) {
    sp.set(VIEW_PARAM, p.view);
  }

  if (p.chainSlug) {
    sp.set(CHAIN_PARAM, p.chainSlug);
  }

  if (p.view === GovernanceScreenView.REFERENDUM_DETAIL && p.referendumId) {
    sp.set(REF_PARAM, p.referendumId);
  }

  return '?' + sp.toString();
}

export function isValidView (v: any): v is GovernanceScreenView {
  return (
    v === GovernanceScreenView.OVERVIEW ||
    v === GovernanceScreenView.REFERENDUM_DETAIL ||
    v === GovernanceScreenView.UNLOCK_TOKEN
  );
}
