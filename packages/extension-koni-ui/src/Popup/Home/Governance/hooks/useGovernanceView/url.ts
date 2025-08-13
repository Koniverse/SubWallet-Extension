// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovernanceUrlParams, ScreenView } from '../../types';

const VIEW_PARAM = 'view';
const REF_PARAM = 'referendumId';
const DEL_PARAM = 'delegateId';
const CHAIN_PARAM = 'chainSlug';

export function parseUrlParams (sp: URLSearchParams): GovernanceUrlParams {
  const view = sp.get(VIEW_PARAM) as ScreenView | null;
  const referendumId = sp.get(REF_PARAM);
  const delegateId = sp.get(DEL_PARAM);
  const chainSlug = sp.get(CHAIN_PARAM);

  return {
    view: view || null,
    referendumId: referendumId || null,
    delegateId: delegateId || null,
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

  if (p.view === ScreenView.REFERENDUM_DETAIL && p.referendumId) {
    sp.set(REF_PARAM, p.referendumId);
  }

  return '?' + sp.toString();
}

export function isValidView (v: any): v is ScreenView {
  return (
    v === ScreenView.OVERVIEW ||
    v === ScreenView.REFERENDUM_DETAIL
  );
}
