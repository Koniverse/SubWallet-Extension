// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { AccountMultisigError, AccountMultisigErrorCode, RequestAccountCreateMultisig } from '@subwallet/extension-base/background/KoniTypes';
import { AccountBaseHandler } from '@subwallet/extension-base/services/keyring-service/context/handlers/Base';
import { KeyringPair$Meta } from '@subwallet/keyring/types';
import { keyring } from '@subwallet/ui-keyring';
import { t } from 'i18next';

/**
 * @class AccountMultisigHandler
 * @extends AccountBaseHandler
 * @description Handler for multisig account
 * */
export class AccountMultisigHandler extends AccountBaseHandler {
  public async accountsCreateMultisig (request: RequestAccountCreateMultisig): Promise<AccountMultisigError[]> {
    const { name, signers, threshold } = request;

    // todo: a function to generate multisig address
    const multisigAddress = '1627ti7gKnn5aTp7a7SUVsgnM9wE6BCNw6CgCzKiVeJz5DDA';

    try {
      try {
        if (keyring.getPair(multisigAddress).address === multisigAddress) { // todo: check this condition
          return [{ code: AccountMultisigErrorCode.INVALID_ADDRESS, message: t('bg.ACCOUNT.services.keyring.handler.Secret.accountExists') }];
        }
      } catch (e) {
        console.log('Error get keyring pair', e);
      }

      if (this.state.checkNameExists(name)) {
        return [{ code: AccountMultisigErrorCode.INVALID_NAME, message: t('bg.ACCOUNT.services.keyring.handler.Secret.accountNameAlreadyExists') }]; // todo: create INVALID_NAME code
      }

      const meta: KeyringPair$Meta = {
        name,
        threshold,
        signers,
        isExternal: true,
        isMultisig: true,
        genesisHash: ''
      };

      const multisigPair = keyring.keyring.addFromAddress(multisigAddress, meta);

      keyring.saveAccount(multisigPair);

      const address = multisigPair.address;
      const modifiedPairs = this.state.modifyPairs;

      modifiedPairs[address] = { migrated: true, key: address };

      this.state.upsertModifyPairs(modifiedPairs);

      await new Promise<void>((resolve) => {
        this.state.saveCurrentAccountProxyId(address, () => {
          this.state._addAddressToAuthList(address, true);
          resolve();
        });
      });

      return [];
    } catch (e) {
      return [{ code: AccountMultisigErrorCode.KEYRING_ERROR, message: (e as Error).message }];
    }
  }
}
