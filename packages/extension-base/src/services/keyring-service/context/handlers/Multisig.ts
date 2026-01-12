// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { AccountMultisigError, AccountMultisigErrorCode, RequestAccountCreateMultisig } from '@subwallet/extension-base/background/KoniTypes';
import { AccountBaseHandler } from '@subwallet/extension-base/services/keyring-service/context/handlers/Base';
import { AccountChainType } from '@subwallet/extension-base/types';
import { RequestGetSignableProxyIds, ResponseGetSignableProxyIds } from '@subwallet/extension-base/types/multisig';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { encodeAddress, isSubstrateAddress } from '@subwallet/keyring';
import { KeyringPair$Meta } from '@subwallet/keyring/types';
import { keyring } from '@subwallet/ui-keyring';
import { t } from 'i18next';

import { createKeyMulti } from '@polkadot/util-crypto';

/**
 * @class AccountMultisigHandler
 * @extends AccountBaseHandler
 * @description Handler for multisig account
 * */
export class AccountMultisigHandler extends AccountBaseHandler {
  private validateSigners (signers: string[], threshold: number): AccountMultisigError[] {
    const errors: AccountMultisigError[] = [];

    if (!signers || signers.length === 0) {
      errors.push({ code: AccountMultisigErrorCode.INVALID_FILLED_ADDRESS, message: t('Signers must be provided') });
    }

    if (!signers || signers.length < 2) {
      errors.push({ code: AccountMultisigErrorCode.INVALID_FILLED_ADDRESS, message: t('Only support for multiple signers multisig account creation') });
    }

    if (!threshold || threshold < 2 || threshold > signers.length) {
      errors.push({ code: AccountMultisigErrorCode.INVALID_FILLED_THRESHOLD, message: t('Invalid threshold') });
    }

    for (const signer of signers) {
      if (!signer || !isSubstrateAddress(signer)) {
        errors.push({ code: AccountMultisigErrorCode.INVALID_FILLED_ADDRESS, message: t('Address must be a substrate address') });

        break;
      }
    }

    const distinctAddress = new Set<string>();

    for (const signer of signers) {
      const rAddress = reformatAddress(signer);

      if (distinctAddress.has(rAddress)) {
        errors.push({ code: AccountMultisigErrorCode.DUPLICATE_FILLED_ADDRESS, message: t('Duplicate address found') });

        break;
      } else {
        distinctAddress.add(rAddress);
      }
    }

    return errors;
  }

  public async accountsCreateMultisig (request: RequestAccountCreateMultisig): Promise<AccountMultisigError[]> {
    const { name, signers: _signer, threshold } = request;

    // process signers
    const signerError = this.validateSigners(_signer, threshold);

    if (signerError.length > 0) {
      return signerError;
    }

    const signers = _signer.map((address) => reformatAddress(address));
    const multisigKey = createKeyMulti(signers, threshold);
    const multisigAddress = encodeAddress(multisigKey);

    try {
      try {
        const exists = keyring.getPair(multisigAddress);

        if (exists?.address === reformatAddress(multisigAddress)) {
          return [{ code: AccountMultisigErrorCode.INVALID_ADDRESS, message: t('bg.ACCOUNT.services.keyring.handler.Secret.accountExists') }];
        }
      } catch (e) {

      }

      if (this.state.checkNameExists(name)) {
        return [{ code: AccountMultisigErrorCode.INVALID_NAME, message: t('bg.ACCOUNT.services.keyring.handler.Secret.accountNameAlreadyExists') }];
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

  public getSignableProxyIds (request: RequestGetSignableProxyIds): ResponseGetSignableProxyIds {
    const { extrinsicType, multisigProxyId } = request;

    const allMultisigAccounts = this.state.getMultisigAccounts();
    const allAccounts = this.state.accounts;
    const targetMultisigAccount = allMultisigAccounts.find((acc) => acc.id === multisigProxyId);
    const signers = targetMultisigAccount?.accounts[0]?.signers as string[];
    const signableProxyIds: string[] = [];

    if (!signers) {
      return { signableProxyIds };
    }

    for (const signer of signers) {
      const proxyId = this.state.belongUnifiedAccount(signer) || reformatAddress(signer);
      const accountProxy = allAccounts[proxyId]; // todo: recheck with case the signatory account is unified account
      const substrateAccount = accountProxy?.accounts.find((acc) => acc.chainType === AccountChainType.SUBSTRATE);

      if (substrateAccount) {
        if (substrateAccount.transactionActions.includes(extrinsicType)) {
          signableProxyIds.push(proxyId);
        }
      }
    }

    return { signableProxyIds };
  }
}
