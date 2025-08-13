// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovernanceViewContext, GovernanceViewEvent, ScreenView } from '../../types';

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
      return { ...state, view: ScreenView.OVERVIEW };

    case 'GO_REFERENDUM_DETAIL':
      if (!hasReferendumId(event)) {
        return state;
      }

      return {
        ...state,
        view: ScreenView.REFERENDUM_DETAIL,
        referendumId: event.referendumId || state.referendumId
      };

    default:
      return state;
  }
}

export function safeView (ctx: GovernanceViewContext): ScreenView {
  if (ctx.view === ScreenView.REFERENDUM_DETAIL && !ctx.referendumId) {
    return ScreenView.OVERVIEW;
  }

  return ctx.view;
}
