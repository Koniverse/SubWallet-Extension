// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_CHAIN_GOV } from '@subwallet/extension-koni-ui/constants';
import { enableChain } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { GovernanceParam, GovernanceScreenView } from '@subwallet/extension-koni-ui/types';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import { GovernanceViewContext, GovernanceViewEvent } from '../../types';
import { safeView, transition } from './reduce';
import { isValidView, parseUrlParams } from './url';

const defaultChainSlug = 'polkadot';

export const useGovernanceView = () => {
  const locationState = useLocation().state as GovernanceParam | undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const { chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const [currentChain, setCurrentChain] = useLocalStorage<string>(CURRENT_CHAIN_GOV, defaultChainSlug);

  const initial: GovernanceViewContext = useMemo(() => {
    const p = parseUrlParams(searchParams);
    const initView = locationState?.view || p.view;
    const view: GovernanceScreenView = initView && isValidView(initView) ? initView : GovernanceScreenView.OVERVIEW;

    if (currentChain && chainStateMap[currentChain]) {
      !chainStateMap[currentChain].active && enableChain(currentChain)
        .catch(console.error);
    }

    return {
      chainSlug: locationState?.chainSlug || p.chainSlug || currentChain,
      referendumId: locationState?.referendumId || p.referendumId || null,
      view
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, sendRaw] = useReducer(transition, initial);
  const send = useCallback((ev: GovernanceViewEvent) => sendRaw(ev), []);

  const onSetChain = useCallback((chainSlug: string) => {
    const chainState = chainStateMap[chainSlug];

    !chainState.active && enableChain(chainSlug, true)
      .catch(console.error);

    send({ type: 'SET_CHAIN', chainSlug });
    setCurrentChain(chainSlug);
  }, [chainStateMap, send, setCurrentChain]);

  useEffect(() => {
    const v = safeView(state);
    const paramsObj: Record<string, string> = { view: v, chainSlug: state.chainSlug };

    if (v === GovernanceScreenView.REFERENDUM_DETAIL && state.referendumId) {
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
      goUnlockToken: () => send({ type: 'GO_UNLOCK_TOKEN' }),
      goReferendumDetail: (referendumId: string) =>
        send({ type: 'GO_REFERENDUM_DETAIL', referendumId }),

      setChain: onSetChain,
      setReferendumId: (id: string | null) => send({ type: 'SET_REFERENDUM', referendumId: id })
    }),
    [onSetChain, send, state.chainSlug, state.referendumId, state.view]
  );
};
