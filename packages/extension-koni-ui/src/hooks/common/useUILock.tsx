// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { keyringLock } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { updateUIViewState } from '@subwallet/extension-koni-ui/stores/base/UIViewState';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Set synchronously by lock() so it is already true by the time the login screen mounts. Root
// redirects there off the isUILocked dispatch, which lands before lock() gets to navigate itself,
// so carrying this in navigation state would lose the race.
let manualLockRequested = false;

export function isManualLockRequested (): boolean {
  return manualLockRequested;
}

export interface UILockInterface {
  isUILocked: boolean;
  lock: () => Promise<void>;
  unlock: () => void;
}

export default function useUILock (): UILockInterface {
  const navigate = useNavigate();
  const isUILocked = useSelector((state: RootState) => state.uiViewState.isUILocked);
  const dispatch = useDispatch();

  const lock = useCallback(async () => {
    // Locking from inside the wallet leaves the user looking at the unlock screen on purpose, so
    // it is flagged to keep that screen in place instead of jumping to the passkey window.
    manualLockRequested = true;
    dispatch(updateUIViewState({ isUILocked: true }));
    await keyringLock();
    navigate('/keyring/login');
  }, [dispatch, navigate]);

  const unlock = useCallback(() => {
    manualLockRequested = false;
    dispatch(updateUIViewState({ isUILocked: false }));
  }, [dispatch]);

  return { isUILocked, lock, unlock };
}
