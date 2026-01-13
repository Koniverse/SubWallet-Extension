// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MULTISIG_SUPPORTED_CHAINS } from '@subwallet/extension-base/services/multisig-service';
import { AccountChainType, AccountSignMode, RequestGetSubstrateProxyAccountGroup } from '@subwallet/extension-base/types';
import { isSameAddress, reformatAddress } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getSignableAccountInfos } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { getSubstrateProxyAccountGroup } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { SelectSignableAccountProxy, SelectSignableAccountProxyParams, SignableAccountProxyItem } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { useCallback } from 'react';

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
 *
 * ⚠️ Suggested approach:
 *  Store selected proxy address in a higher-level state
 *  Pass the stored proxy address back into the selector modal when opening it again
 *  This ensures better UX and avoids forcing users to re-select the same proxy account after back from confirmation screen.
 *
 */

export function useCreateGetSignableAccountProxy (): SelectSignableAccountProxy {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

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
        address: reformatAddress(proxy.substrateProxyAddress, chainInfo.substrateInfo?.addressPrefix)
      }));
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      return [];
    }
  }, [allAccounts, chainInfoMap]);

  const getSignatoryAccount = useCallback<GetSignableAccountProxies>(async ({ address, chain, extrinsicType }) => {
    try {
      const chainInfo = chainInfoMap[chain];

      // Address is required to get signer accounts
      // and chain must support multisig
      if (!address || !MULTISIG_SUPPORTED_CHAINS.includes(chain) || !extrinsicType) {
        return [];
      }

      const account = findAccountByAddress(allAccounts, address);

      if (!account?.proxyId || !account.isMultisig) {
        return [];
      }

      const { signableProxies } = await getSignableAccountInfos({
        extrinsicType,
        chain,
        multisigProxyId: account.proxyId
      });

      return signableProxies.map<SignableAccountProxyItem>((signer) => ({
        ...signer,
        kind: 'signatory',
        address: reformatAddress(signer.address, chainInfo.substrateInfo?.addressPrefix)
      }));
    } catch (e) {
      console.error('Error fetching signatory accounts:', e);

      return [];
    }
  }, [allAccounts, chainInfoMap]);

  return useCallback<GetSignableAccountProxies>(async (params) => {
    const [signatoryAccounts, substrateProxyAccounts] = await Promise.all([
      getSignatoryAccount(params),
      getSubstrateProxyAccount(params)
    ]);

    return [...signatoryAccounts, ...substrateProxyAccounts];
  }, [getSignatoryAccount, getSubstrateProxyAccount]);
}
