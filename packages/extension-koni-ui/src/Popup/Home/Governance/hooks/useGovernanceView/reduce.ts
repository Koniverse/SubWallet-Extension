// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovernanceScreenView } from '@subwallet/extension-koni-ui/types';

import { GovernanceViewContext, GovernanceViewEvent } from '../../types';

// Guards
function hasReferendumId (ev: GovernanceViewEvent): ev is { type: 'GO_REFERENDUM_DETAIL'; referendumId: string } {
  return ev.type === 'GO_REFERENDUM_DETAIL' && !!ev.referendumId;
}

export function transition (state: GovernanceViewContext, event: GovernanceViewEvent): GovernanceViewContext {
  switch (event.type) {
    case 'SET_CHAIN':
      return { ...state, chainSlug: event.chainSlug };

    case 'SET_REFERENDUM':
      return { ...state, referendumId: event.referendumId };

    case 'GO_OVERVIEW':
      return { ...state, view: GovernanceScreenView.OVERVIEW };

    case 'GO_REFERENDUM_DETAIL':
      if (!hasReferendumId(event)) {
        return state;
      }

      return {
        ...state,
        view: GovernanceScreenView.REFERENDUM_DETAIL,
        referendumId: event.referendumId || state.referendumId
      };

    case 'GO_UNLOCK_TOKEN':
      return { ...state, view: GovernanceScreenView.UNLOCK_TOKEN };

    default:
      return state;
  }
}

export function safeView (ctx: GovernanceViewContext): GovernanceScreenView {
  if (ctx.view === GovernanceScreenView.REFERENDUM_DETAIL && !ctx.referendumId) {
    return GovernanceScreenView.OVERVIEW;
  }

  return ctx.view;
}
