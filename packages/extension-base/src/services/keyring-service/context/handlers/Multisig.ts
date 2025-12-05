// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { RequestAccountCreateMultisig } from '@subwallet/extension-base/background/KoniTypes';
import { AccountBaseHandler } from '@subwallet/extension-base/services/keyring-service/context/handlers/Base';

/**
 * @class AccountMultisigHandler
 * @extends AccountBaseHandler
 * @description Handler for multisig account
 * */
export class AccountMultisigHandler extends AccountBaseHandler {
  public accountsCreateMultisig (request: RequestAccountCreateMultisig) {
    const { name, signers, threshold } = request;

    console.log('name', name);
    console.log('signers', signers);
    console.log('threshold', threshold);

    // todo: a function to generate multisig address
    // todo: check exist address
    // todo: check exist account name

    // todo: add address, metadata. keyring.keyring.addFromAddress(address, meta, null, type)?
    // todo: update state modifyPair. this.state.upsertModifyPairs(modifiedPairs)?
    // todo: saveCurrentAccountProxyId?

    return Promise.resolve(true);
  }
}
