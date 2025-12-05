// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionBase } from '@subwallet/extension-base/services/transaction-service/types';
import { CurrentAccountInfo } from '@subwallet/extension-base/types';

export interface EventRegistry {
  'general.init': [boolean];
  'general.start': [boolean];
  'general.start_full': [boolean];
  'general.sleep': [boolean];
  'general.wakeup': [boolean];
  'crypto.ready': [boolean];
  'database.ready': [boolean];

  /* Keyring */
  /** Password state ready  */
  'keyring.ready': [boolean];
  /** Update current account  */
  'account.updateCurrent': [CurrentAccountInfo];
  /** Account list loaded  */
  'account.ready': [boolean];
  /** Add a new account  */
  'account.add': [string]; // address
  /** Update account */
  'account.update': [string]; // address
  /** Remove a account  */
  'account.remove': [string]; // address
  /** Inject account done  */
  'inject.ready': [boolean];
  /** Remove an account proxy */
  'accountProxy.remove': [string]; // proxy id
  /* Keyring */

  'chain.ready': [boolean]; // chain is ready and migration done
  'chain.add': [string]; // chain slug
  'chain.updateState': [string]; // chain slug

  'asset.ready': [boolean]; // Init asset ready
  'asset.online.ready': [boolean]; // Update latest asset done
  'asset.updateState': [string]; // token slug

  'transaction.done': [SWTransactionBase];
  'transaction.failed': [SWTransactionBase | undefined];
  'transaction.timeout': [SWTransactionBase | undefined];
  'transaction.submitStaking': [string];
  'transaction.transferNft': [SWTransactionBase | undefined];
  'mantaPay.initSync': [string | undefined]; // zkAddress
  'mantaPay.submitTransaction': [SWTransactionBase | undefined];
  'mantaPay.enable': [string];

  'migration.done': [boolean];
  'campaign.ready': [boolean];

  // Buy token
  'buy.tokens.ready': [boolean];
  'buy.services.ready': [boolean];

  // Earning
  'earning.ready': [boolean];

  // Swap
  'swap.ready': [boolean];

  // Ledger
  'ledger.ready': [boolean];

  // Open Gov
  'open-gov.ready': [boolean];
}

export type EventType = keyof EventRegistry;

export const COMMON_RELOAD_EVENTS: EventType[] = [
  'account.updateCurrent',
  'account.add',
  'account.remove',
  'asset.updateState',
  'chain.updateState',
  'chain.add',
  'mantaPay.initSync', // TODO: re-check this
  'mantaPay.enable'
];

export interface EventItem<T extends EventType> {
  type: T;
  data: EventRegistry[T];
}

export interface EventEmitterRegistry extends EventRegistry {
  lazy: EventItem<EventType>[];
}
