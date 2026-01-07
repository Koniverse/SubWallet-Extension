// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MULTISIG_SUPPORTED_CHAINS } from '@subwallet/extension-base/services/multisig-service';
import { AccountChainType, AccountSignMode, RequestGetSubstrateProxyAccountGroup } from '@subwallet/extension-base/types';
import { createPromiseHandler, isSameAddress } from '@subwallet/extension-base/utils';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getSignableProxies } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { getSubstrateProxyAccountGroup } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { SelectSignableAccountProxy, SelectSignableAccountProxyParams, SelectSignableAccountProxyResult, SignableAccountProxyItem } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { useCallback, useContext } from 'react';

type GetSignableAccountProxies = (params: SelectSignableAccountProxyParams) => Promise<SignableAccountProxyItem[]>;

/**
 * Hook that handles selecting a valid Substrate account to sign a transaction
 * on behalf of the original sender.
 *
 * This hook supports both:
 * - **Substrate proxy accounts** — where a proxy signs and the call is executed
 *   with the origin of the proxied account.
 * - **Multisig signatory accounts** — where an individual signatory signs a
 *   multisig extrinsic on behalf of a multisig account.
 *
 * It is used when the sender account:
 * - is a **proxied account** with one or more valid proxy accounts, or
 * - is a **multisig account** that requires a signatory to approve or execute
 *   a multisig transaction.
 *
 * ### Supported feature groups
 * - **Transfer**
 * - **Earning** (except when staking method = *Liquid staking*)
 * - **Governance**
 *
 * ⚠️ Requirements & limitations:
 * - Input address must be a **Substrate address**.
 *   (The wallet currently handles mixed network accounts; EVM-based accounts are
 *   explicitly excluded for safety.)
 *
 * - The returned signer is always the **extrinsic signer**, meaning:
 *   - a proxy account when using Substrate proxy, or
 *   - a signatory account when using multisig.
 *
 * - Not supported for:
 *   1. **dApps** — Substrate extrinsics vary by pallet and method, are often nested,
 *      and may be chain-dependent, making reliable parsing unsafe.
 *   2. **Liquid staking** and **Swap** — These features involve multi-step
 *      transactions and require the original account to sign directly.
 */

export function useCreateSelectSignableAccountProxyAccount (): SelectSignableAccountProxy {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { selectSignableProxyAccountModal } = useContext(WalletModalContext);

  const getSubstrateProxyAccount = useCallback<GetSignableAccountProxies>(async ({ address, chain, excludedSubstrateProxyAccounts, extrinsicType }) => {
    try {
      const chainInfo = chainInfoMap[chain];
      // Address is required to get proxy accounts
      // and chain must support proxy

      if (!address || !chainInfo?.substrateInfo?.supportProxy) {
        return [];
      }

      const request: RequestGetSubstrateProxyAccountGroup = {
        chain,
        address,
        type: extrinsicType,
        excludedSubstrateProxyAccounts
      };

      const substrateProxyAccountGroup = await getSubstrateProxyAccountGroup(request);

      if (!substrateProxyAccountGroup?.substrateProxyAccounts?.length) {
        return [];
      }

      // filter only valid accounts that can sign transactions
      const validAccounts = allAccounts.filter((acc) => {
        return acc.chainType === AccountChainType.SUBSTRATE && acc.signMode !== AccountSignMode.READ_ONLY;
      });

      // filter proxy accounts that are in valid accounts
      return substrateProxyAccountGroup.substrateProxyAccounts.filter((proxy) =>
        validAccounts.some((acc) => isSameAddress(acc.address, proxy.substrateProxyAddress))
      ).map<SignableAccountProxyItem>((proxy) => ({
        ...proxy,
        kind: 'substrate_proxy',
        address: proxy.substrateProxyAddress
      }));
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      return [];
    }
  }, [allAccounts, chainInfoMap]);

  const getSignatoryAccount = useCallback<GetSignableAccountProxies>(async ({ address, chain, extrinsicType }) => {
    try {
      // Address is required to get signer accounts
      // and chain must support multisig
      if (!address || MULTISIG_SUPPORTED_CHAINS.includes(chain) || !extrinsicType) {
        return [];
      }

      const account = findAccountByAddress(allAccounts, address);

      if (!account?.proxyId || !account.isMultisig) {
        return [];
      }

      const { signableProxies } = await getSignableProxies({
        extrinsicType,
        chain,
        multisigProxyId: account.proxyId
      });

      return signableProxies.map<SignableAccountProxyItem>((signer) => ({
        ...signer,
        kind: 'signatory'
      }));
    } catch (e) {
      console.error('Error fetching signatory accounts:', e);

      return [];
    }
  }, [allAccounts]);

  // function to select signable account to sign transaction
  // then open modal to let user select
  // return selected address or undefined
  return useCallback(async (params: SelectSignableAccountProxyParams): Promise<SelectSignableAccountProxyResult> => {
    if (!params.address) {
      return Promise.resolve({});
    }

    const signableAccountProxies = (await Promise.all([
      getSignatoryAccount(params),
      getSubstrateProxyAccount(params)
    ])).flat();

    if (signableAccountProxies.length === 0) {
      return Promise.resolve({});
    }

    const { promise, reject, resolve } = createPromiseHandler<SelectSignableAccountProxyResult>();

    const onApply = (selected: SignableAccountProxyItem) => {
      if (selected.kind === 'signatory') {
        resolve({ signerSubstrateMultisigAddress: selected.address });
      } else if (selected.kind === 'substrate_proxy' && !selected.isProxiedAccount) {
        // only return proxy address when it's not a proxied account
        resolve({ signerSubstrateProxyAddress: selected.address });
      } else {
        resolve({});
      }
    };

    selectSignableProxyAccountModal.open({
      chain: params.chain,
      address: params.address,
      accountItems: signableAccountProxies,
      onApply,
      onCancel: reject
    });

    return promise;
  }, [getSignatoryAccount, getSubstrateProxyAccount, selectSignableProxyAccountModal]);
}
