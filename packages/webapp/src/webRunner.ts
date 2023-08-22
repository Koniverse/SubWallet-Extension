// Copyright 2019-2022 @subwallet/webapp authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@subwallet/extension-inject/crossenv';

import { state as koniState } from '@subwallet/extension-base/koni/background/handlers';
import { AccountsStore } from '@subwallet/extension-base/stores';
import KeyringStore from '@subwallet/extension-base/stores/Keyring';
import { web3Accounts, web3Enable } from '@subwallet/extension-dapp';
import { noop } from '@subwallet/extension-koni-ui/utils';
import keyring from '@subwallet/ui-keyring';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PageStatus, responseMessage, setupHandlers } from './messageHandle';

responseMessage({ id: '0', response: { status: 'load' } } as PageStatus);

setupHandlers();

// initial setup
cryptoWaitReady()
  .then((): void => {
    console.log('[Mobile] crypto initialized');

    // load all the keyring data
    keyring.loadAll({ store: new AccountsStore(), type: 'sr25519', password_store: new KeyringStore() });

    keyring.restoreKeyringPassword()
      .finally(() => {
        koniState.updateKeyringState();
      })
      .then(() => web3Enable('subwallet-webapp'))
      .then(() => web3Accounts())
      .then((value) => {
        koniState.injectAccounts(value);
      })
      // .then(() => {
      //   web3AccountsSubscribe((accounts) => {
      //     console.log(accounts);
      //   }).catch(noop);
      // })
      .finally(noop)
    ;
    koniState.eventService.emit('crypto.ready', true);

    responseMessage({ id: '0', response: { status: 'crypto_ready' } } as PageStatus);

    // wake webapp up
    koniState.wakeup().catch((err) => console.warn(err));

    console.log('[Mobile] initialization completed');
  })
  .catch((error): void => {
    console.error('[Mobile] initialization failed', error);
  });
