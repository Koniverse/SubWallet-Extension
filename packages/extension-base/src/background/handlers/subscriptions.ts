// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageTypesWithSubscriptions, SubscriptionMessageTypes } from '../types';

import { createLogger } from '@subwallet/extension-base/utils/logger';

type Subscriptions = Record<string, chrome.runtime.Port>;

const subscriptions: Subscriptions = {};
const subscriptionsLogger = createLogger('Subscriptions');

// return a subscription callback, that will send the data to the caller via the port
export function createSubscription<TMessageType extends MessageTypesWithSubscriptions> (id: string, port: chrome.runtime.Port): (data: SubscriptionMessageTypes[TMessageType]) => void {
  subscriptions[id] = port;

  return (subscription: unknown): void => {
    if (subscriptions[id]) {
      port.postMessage({ id, subscription });
    }
  };
}

export function isSubscriptionRunning (id: string): boolean {
  return !!subscriptions[id];
}

// clear a previous subscriber
export function unsubscribe (id: string): void {
  if (subscriptions[id]) {
    delete subscriptions[id];
  } else {
    subscriptionsLogger.error(`Unable to unsubscribe from ${id}`);
  }
}
