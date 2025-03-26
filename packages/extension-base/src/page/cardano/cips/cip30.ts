// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SendRequest } from '@subwallet/extension-base/page/types';

export class CIP30Api {
  private sendMessage: SendRequest;

  constructor (sendMessage: SendRequest) {
    this.sendMessage = sendMessage;
  }

  getExtension () {
    // Implementation here
  }

  getNetworkId () {
    return 0;
  }

  getUtxos () {
    console.log('getUtxos');
  }

  getUsedAddresses () {
    console.log('getUsedAddresses');
  }

  getUnusedAddresses () {
    console.log('getUnusedAddresses');
  }

  signTx () {
    // Implementation here
  }

  signData () {
    // Implementation here
  }

  submitTx () {
    // Implementation here
  }
}
