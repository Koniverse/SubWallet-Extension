// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SendRequest } from '@subwallet/extension-base/page/types';
import type { EvmProvider } from '@subwallet/extension-inject/types';
import type { JsonRpcRequest, JsonRpcResponse, JsonRpcSuccess } from 'json-rpc-engine';
import type { RequestArguments } from 'web3-core';

import SafeEventEmitter from '@metamask/safe-event-emitter';
import { EvmProviderError } from '@subwallet/extension-base/background/errors/EvmProviderError';

interface SendSyncJsonRpcRequest extends JsonRpcRequest<unknown> {
  method: 'net_version';
}

export interface SubWalletEvmProvider extends EvmProvider, SafeEventEmitter {
  enable(): Promise<string[]>;
  request<T>(args: RequestArguments): Promise<T>;
  send<T>(method: string, params?: T[]): Promise<JsonRpcResponse<T>>;
  send<T>(payload: JsonRpcRequest<unknown>, callback: (error: Error | null, result?: JsonRpcResponse<T>) => void): void;
  send<T>(payload: SendSyncJsonRpcRequest): JsonRpcResponse<T>;
  sendAsync<T>(
    payload: JsonRpcRequest<T>,
    callback: (error: Error | null, result?: JsonRpcResponse<T>) => void
  ): void;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  once(eventName: string | symbol, listener: (...args: any[]) => void): this;
}

export function createSubWalletEvmProvider (sendMessage: SendRequest, version: string): SubWalletEvmProvider {
  const emitter = new SafeEventEmitter();
  let connected = true;
  let subscribeFlag = false;
  const provider = Object.assign(emitter, {
    isSubWallet: true,
    isMetaMask: false,
    version
  }) as SubWalletEvmProvider;

  function subscribeExtensionEvents () {
    if (subscribeFlag) {
      return;
    }

    sendMessage('evm(events.subscribe)', null, ({ payload, type }) => {
      if ([
        'connect', 'disconnect', 'accountsChanged', 'chainChanged',
        'message', 'data', 'reconnect', 'error'
      ].includes(type)) {
        if (type === 'connect') {
          connected = true;
        } else if (type === 'disconnect') {
          connected = false;
        }

        const finalType = type === 'data' ? 'message' : type;

        emitter.emit(finalType, payload);
      } else {
        console.warn('Can not handle event', type, payload);
      }
    }).then(() => {
      subscribeFlag = true;
    }).catch(() => {
      subscribeFlag = false;
    });
  }

  const _sendSync = (payload: JsonRpcRequest<unknown>): JsonRpcResponse<unknown> => {
    let result: JsonRpcSuccess<unknown>['result'];

    switch (payload.method) {
      case 'net_version':
        result = version ? `SubWallet v${version}` : null;
        break;
      default:
        throw new Error(`Not support ${payload.method}`);
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result
    };
  };

  provider.isConnected = () => connected;

  provider.request = <T>(arg: RequestArguments): Promise<T> => {
    if (arg.method === 'eth_requestAccounts') {
      const origin = document.title || window.location.hostname;

      return sendMessage('pub(authorize.tabV2)', { origin, accountAuthTypes: ['evm'] })
        .then(() => provider.request<T>({ method: 'eth_accounts' }));
    }

    return sendMessage('evm(request)', arg) as Promise<T>;
  };

  provider.send = (methodOrPayload: unknown, callbackOrArgs?: unknown): any => {
    if (typeof methodOrPayload === 'string' && (!callbackOrArgs || Array.isArray(callbackOrArgs))) {
      return provider.request({ method: methodOrPayload, params: callbackOrArgs });
    } else if (typeof methodOrPayload === 'object' && typeof callbackOrArgs === 'function') {
      return provider.request(methodOrPayload as RequestArguments).then((result) => {
        callbackOrArgs(null, result);
      });
    }

    return _sendSync(methodOrPayload as JsonRpcRequest<unknown>);
  };

  provider.enable = async () => {
    const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' });

    connected = accounts.length > 0;

    return accounts;
  };

  provider.sendAsync = (payload, callback) => {
    provider.request(payload)
      .then((result) => {
        callback(null, {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          // @ts-ignore
          result
        });
      })
      .catch((e: EvmProviderError) => {
        callback(e);
      });
  };

  provider.on = (eventName, listener) => {
    subscribeExtensionEvents();
    SafeEventEmitter.prototype.on.call(emitter, eventName, listener);

    return provider;
  };

  provider.once = (eventName, listener) => {
    subscribeExtensionEvents();
    SafeEventEmitter.prototype.once.call(emitter, eventName, listener);

    return provider;
  };

  return provider;
}
