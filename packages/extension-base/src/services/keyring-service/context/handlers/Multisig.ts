// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { AccountMultisigError, AccountMultisigErrorCode, RequestAccountCreateMultisig } from '@subwallet/extension-base/background/KoniTypes';
import { AccountBaseHandler } from '@subwallet/extension-base/services/keyring-service/context/handlers/Base';
import { MULTISIG_SUPPORTED_CHAINS } from '@subwallet/extension-base/services/multisig-service';
import { AccountChainType } from '@subwallet/extension-base/types';
import { RequestGetSignableAccountInfos, ResponseGetSignableAccountInfos, SignableAccountInfo } from '@subwallet/extension-base/types/multisig';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { encodeAddress } from '@subwallet/keyring';
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
  public async accountsCreateMultisig (request: RequestAccountCreateMultisig): Promise<AccountMultisigError[]> {
    const { name, signers: _signer, threshold } = request;

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

  /**
   * Get 1-level signatories
   * Ignore multisig accounts that are also signatories
   */
  public getSignableAccountInfos (request: RequestGetSignableAccountInfos): ResponseGetSignableAccountInfos {
    const { chain, extrinsicType, multisigProxyId } = request;

    if (!MULTISIG_SUPPORTED_CHAINS.includes(chain)) {
      return { signableProxies: [] };
    }

    const allMultisigAccounts = this.state.getMultisigAccounts();
    const allAccounts = this.state.accounts;
    const targetMultisigAccount = allMultisigAccounts.find((acc) => acc.id === multisigProxyId);

    if (!targetMultisigAccount) {
      return { signableProxies: [] };
    }

    const signableAccountInfo: SignableAccountInfo[] = [];
    const signers = targetMultisigAccount.accounts[0].signers as string[];

    const allMultisigAccountAddress = allMultisigAccounts.map((acc) => acc.id);

    for (const signer of signers) {
      if (allMultisigAccountAddress.includes(signer)) {
        continue;
      }

      const proxyId = this.state.belongUnifiedAccount(signer) || reformatAddress(signer);
      const accountProxy = allAccounts[proxyId];
      const substrateAccount = accountProxy?.accounts.find((acc) => acc.chainType === AccountChainType.SUBSTRATE);

      if (substrateAccount) {
        if (substrateAccount.transactionActions.includes(extrinsicType)) {
          signableAccountInfo.push({
            proxyId,
            address: signer
          });
        }
      }
    }

    return { signableProxies: signableAccountInfo };
  }
}
