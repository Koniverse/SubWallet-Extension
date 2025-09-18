// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Runs in the extension background, handling all keyring access
import '@subwallet/extension-inject/crossenv';

import { APP_ENV, APP_VER, EnvConfig } from '@subwallet/extension-base/constants';
import { SWHandler } from '@subwallet/extension-base/koni/background/handlers';
import { AccountsStore } from '@subwallet/extension-base/stores';
import KeyringStore from '@subwallet/extension-base/stores/Keyring';
import { browserName, browserVersion, osName, osVersion } from '@subwallet/extension-base/utils';
import { ActionHandler } from '@subwallet/extension-koni/helper/ActionHandler';
import { isProductionMode } from '@subwallet/extension-koni-ui/constants/environment';
import keyring from '@subwallet/ui-keyring';

import { cryptoWaitReady } from '@polkadot/util-crypto';

// Set handler
// Q&A: Why do we need to set handler here?
// A: So that ActionHandler can handle actions from UI, dApp.
// Note: ActionHandler is different from SWHandler. SWHandler will have states and continue to route these states to Tabs, Extension, Mobile Handler and actions will be forwarded down to state.
// SWHandler is the initialization point to ensure the application runs properly with different UI types
// Currently this architecture might be a bit messy => In the future there should only be one Handler and minimize unnecessary intermediaries through state
const actionHandler = ActionHandler.instance;

actionHandler.setHandler(SWHandler.instance);

globalThis.window = globalThis.self;

cryptoWaitReady()
  .then((): void => {
    const koniState = SWHandler.instance.state;

    // setTimeout(() => koniState.onCheckToRemindUser(), 4000);

    const envConfig: EnvConfig = {
      appConfig: {
        environment: APP_ENV,
        version: APP_VER
      },
      browserConfig: {
        type: browserName,
        version: browserVersion
      },
      osConfig: {
        type: osName,
        version: osVersion
      }
    };

    koniState.initEnvConfig(envConfig);

    // load all the keyring data
    // Q&A: How do Account Store and Password Store differ?
    /// A: Account Store will store accounts, while Password Store will store the keyring's master password.
    keyring.loadAll({ store: new AccountsStore(), type: 'sr25519', password_store: new KeyringStore() });

    // Q&A: What does restoring Keyring Password mean?
    // A: Restore the keyring's master password to be able to access accounts stored in the keyring.
    keyring.restoreKeyringPassword().finally(() => {
      koniState.updateKeyringState();
    });
    koniState.eventService.emit('crypto.ready', true);

    // Manual Init koniState
    // Q&A: Why do we need to call init() here?
    // A: Start state when receiving the first message from any source
    actionHandler.waitFirstActiveMessage.then(() => {
      koniState.init().catch(console.error);
    }).catch(console.error);
  })
  .catch((error): void => {
    console.error('Initialization fail', error);
  });

// Publish global variables for debugging purposes
declare global {
  // eslint-disable-next-line no-var
  var KoniState: typeof SWHandler.instance.state;

  // eslint-disable-next-line no-var
  var KoniHandler: typeof SWHandler.instance;
}

if (!isProductionMode) {
  globalThis.KoniState = SWHandler.instance.state;
  globalThis.KoniHandler = SWHandler.instance;
}
