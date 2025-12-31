// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@subwallet/extension-inject/types';
import type { SendRequest } from '../types';

import { createLogger } from '@subwallet/extension-base/utils/logger';

// External to class, this.# is not private enough (yet)
let sendRequest: SendRequest;
const substrateAccountsLogger = createLogger('SubstrateAccounts');

export default class Accounts implements InjectedAccounts {
  constructor (_sendRequest: SendRequest) {
    sendRequest = _sendRequest;
  }

  public get (anyType?: boolean): Promise<InjectedAccount[]> {
    return sendRequest('pub(accounts.listV2)', { anyType, isSubstrateConnector: true });
  }

  public subscribe (cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    let id: string | null = null;

    sendRequest('pub(accounts.subscribeV2)', {}, cb)
      .then((subId): void => {
        id = subId;
      })
      .catch((e) => substrateAccountsLogger.error('Error subscribing to accounts', e));

    return (): void => {
      id && sendRequest('pub(accounts.unsubscribe)', { id })
        .catch((e) => substrateAccountsLogger.error('Error unsubscribing from accounts', e));
    };
  }
}
