// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';

import { GovernanceViewContext, GovernanceViewEvent, ScreenView } from '../../types';
import { safeView, transition } from './reduce';
import { isValidView, parseUrlParams } from './url';

const defaultChainSlug = 'polkadot';

export const useGovernanceView = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initial: GovernanceViewContext = useMemo(() => {
    const p = parseUrlParams(searchParams);
    const view: ScreenView = p.view && isValidView(p.view) ? p.view : ScreenView.OVERVIEW;

    return {
      chainSlug: p.chainSlug || defaultChainSlug,
      referendumId: p.referendumId || null,
      delegateId: p.delegateId || null,
      view
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, sendRaw] = useReducer(transition, initial);
  const send = useCallback((ev: GovernanceViewEvent) => sendRaw(ev), []);

  useEffect(() => {
    const v = safeView(state);
    const paramsObj: Record<string, string> = { view: v, chainSlug: state.chainSlug };

    if (v === ScreenView.REFERENDUM_DETAIL && state.referendumId) {
      paramsObj.referendumId = state.referendumId;
    }

    setSearchParams(paramsObj, { replace: true });
  }, [state, setSearchParams]);

  return useMemo(
    () => ({
      view: state.view,
      chainSlug: state.chainSlug,
      referendumId: state.referendumId || undefined,

      goOverview: () => send({ type: 'GO_OVERVIEW' }),
      goReferendumDetail: (referendumId: string) =>
        send({ type: 'GO_REFERENDUM_DETAIL', referendumId }),

      setChain: (chainSlug: string) => send({ type: 'SET_CHAIN', chainSlug }),
      setReferendumId: (id: string | null) => send({ type: 'SET_REFERENDUM', referendumId: id })
    }),
    [send, state]
  );
};
