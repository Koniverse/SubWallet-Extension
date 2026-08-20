// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { withErrorLog } from '@subwallet/extension-base/background/handlers/helpers';
import { getPasskeyUnlockContext } from '@subwallet/extension-base/services/keyring-service/passkeyUnlock';
import { openPasskeyUnlockWindow } from '@subwallet/extension-base/services/request-service/handler/PopupHandler';
import { ActionHandler } from '@subwallet/extension-koni/helper/ActionHandler';

import { xglobal } from '@polkadot/x-global';

const actionHandler = ActionHandler.instance;

xglobal.addEventListener('fetch', function (event: FetchEvent) {
  if (event.request.url.endsWith('popup.html')) {
    console.log('Open popup tab');
    event.respondWith(new Response('OKs'));
  }
});

withErrorLog(() => chrome.action?.setBadgeBackgroundColor({ color: '#d90000' }));

// The action popup falls back to the manifest value whenever the browser restarts or the
// extension is reloaded, so the override has to be re-applied every time the worker boots.
const syncPasskeyUnlockAction = () => {
  getPasskeyUnlockContext()
    .then((context) => chrome.action?.setPopup({ popup: context ? '' : 'index.html' }))
    .catch(console.error);
};

syncPasskeyUnlockAction();
chrome.runtime.onStartup.addListener(syncPasskeyUnlockAction);

chrome.action?.onClicked.addListener(() => {
  getPasskeyUnlockContext()
    .then((context) => context && openPasskeyUnlockWindow())
    .catch(console.error);
});

chrome.runtime.onConnect.addListener((port): void => {
  actionHandler.handlePort(port);
});

// Open expand page after install
chrome.runtime.onInstalled.addListener(function (details) {
  // Reloading or updating the extension resets the action back to the manifest popup as well.
  syncPasskeyUnlockAction();
  actionHandler.onInstalled(details);
});

// Setup uninstall URL every background start
chrome.runtime.setUninstallURL('https://slink.subwallet.app/uninstall-feedback');
