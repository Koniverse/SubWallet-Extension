// Copyright 2019-2022 @subwallet/webapp authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestSignatures, TransportRequestMessage, TransportResponseMessage } from '@subwallet/extension-base/background/types';
import { ID_PREFIX, PORT_CONTENT, PORT_EXTENSION, PORT_MOBILE } from '@subwallet/extension-base/defaults';
import { SWHandler } from '@subwallet/extension-base/koni/background/handlers';

const handlers = SWHandler.instance;

export interface CustomResponse<T> {
  id: string,
  response: T,
  error?: string
}

export type PageStatus = CustomResponse<{ status: 'init' | 'load' | 'crypto_ready' }>

export function responseMessage (response: TransportResponseMessage<keyof RequestSignatures> | PageStatus) {
  console.log(response);
}

export function setupHandlers () {
  onconnect = (ev) => {
    const wport = ev.ports[0];

    wport.onmessage = (ev) => {
      const data = ev.data as TransportRequestMessage<keyof RequestSignatures>;
      const port = {
        ...wport,
        name: PORT_EXTENSION,
        postMessage: (message: any) => {
          wport.postMessage(message, {});
        },
        onDisconnect: {
          addListener: () => undefined
        }
      } as unknown as chrome.runtime.Port;

      if (data.id?.startsWith(ID_PREFIX) && data.id && data.message) {
        console.log('===LOG: setupHandlers data.message', data.message);

        if (data.message.startsWith('mobile')) {
          port.name = PORT_MOBILE;
        } else if (data.message.startsWith('pri')) {
          port.name = PORT_EXTENSION;
        } else {
          port.name = PORT_CONTENT;
        }

        // @ts-ignore
        handlers.handle(data, port);
      }
    };
  };
}

bgMessage.setReady();
