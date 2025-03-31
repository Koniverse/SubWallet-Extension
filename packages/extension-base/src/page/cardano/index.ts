// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CardanoExtensionCIP, CardanoProvider } from '@subwallet/extension-inject/types';

import { CIP30Api, ExtensionCIPsSupported } from '@subwallet/extension-base/page/cardano/cips';
import { SendRequest } from '@subwallet/extension-base/page/types';

const WALLET_NAME = 'SubWallet';
const WALLET_VERSION = process.env.PKG_VERSION as string;
const WALLET_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNODAgNGM1Ny42MyAwIDc2IDE4LjM3IDc2IDc2IDAgNTcuNjMtMTguMzcgNzYtNzYgNzYtNTcuNjMgMC03Ni0xOC4zNy03Ni03NkM0IDIyLjM3IDIyLjM3IDQgODAgNFoiIGZpbGw9InVybCgjYSkiLz48ZyBjbGlwLXBhdGg9InVybCgjYikiPjxwYXRoIGQ9Ik0xMTIuNjE1IDY2LjcyVjUzLjM5OEw1OC43NiAzMiA0OCAzNy40MTJsLjA1NyA0MS40NjQgNDAuMjkyIDE2LjA3LTIxLjUyIDkuMDc1di03LjAxOEw1Ni45NSA5My4wM2wtOC44OTMgNC4xNjN2MjUuMzk1TDU4Ljc2OSAxMjhsNTMuODQ2LTI0LjA2MlY4Ni44NjlMNjQuMTU0IDY3LjY1N1Y1NmwzOC40NDkgMTUuMjE2IDEwLjAxMi00LjQ5NloiIGZpbGw9IiNmZmYiLz48L2c+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iODAiIHkxPSI0IiB4Mj0iODAiIHkyPSIxNTYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMDA0QkZGIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNENFQUFDIi8+PC9saW5lYXJHcmFkaWVudD48Y2xpcFBhdGggaWQ9ImIiPjxwYXRoIGZpbGw9IiNmZmYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ4IDMyKSIgZD0iTTAgMGg2NC42MTV2OTZIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4=';

export default class SubWalletCardanoProvider implements CardanoProvider {
  readonly apiVersion: string = WALLET_VERSION;
  readonly icon: string = WALLET_ICON;
  readonly name: string = WALLET_NAME;
  readonly supportedExtensions: CardanoExtensionCIP[] = [...ExtensionCIPsSupported];
  protected sendMessage: SendRequest;

  constructor (sendMessage: SendRequest) {
    this.icon = WALLET_ICON;
    this.sendMessage = sendMessage;
  }

  // protected subscribeExtensionEvents () {
  //   if (subscribeFlag) {
  //     return;
  //   }
  //
  //   this.sendMessage('evm(events.subscribe)', null, ({ payload, type }) => {
  //     if (['connect', 'disconnect', 'accountsChanged', 'chainChanged', 'message', 'data', 'reconnect', 'error'].includes(type)) {
  //       if (type === 'connect') {
  //         this._connected = true;
  //       } else if (type === 'disconnect') {
  //         this._connected = false;
  //       }
  //
  //       const finalType = type === 'data' ? 'message' : type;
  //
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //       this.emit(finalType, payload);
  //     } else {
  //       console.warn('Can not handle event', type, payload);
  //     }
  //   })
  //     .then((done) => {
  //       subscribeFlag = true;
  //     })
  //     .catch(() => {
  //       subscribeFlag = false;
  //     });
  //
  //   subscribeFlag = true;
  // }

  public async enable () {
    const isEnabled = await this.sendMessage('pub(authorize.tabV2)', { origin, accountAuthTypes: ['cardano'] });

    if (!isEnabled) {
      throw new Error('Access to the wallet is denied');
    }

    const CIP30 = new CIP30Api(this.sendMessage);

    return Object.freeze(CIP30);
  }

  // public override on (eventName: string | symbol, listener: (...args: any[]) => void): this {
  //   this.subscribeExtensionEvents();
  //   super.on(eventName, listener);
  //
  //   return this;
  // }
  //
  // public override once (eventName: string | symbol, listener: (...args: any[]) => void): this {
  //   this.subscribeExtensionEvents();
  //   super.once(eventName, listener);
  //
  //   return this;
  // }

  async isEnable (): Promise<boolean> {
    const accountList = await this.sendMessage('pub(accounts.list)', { accountAuthType: 'cardano' });

    return accountList.length > 0;
  }
}
