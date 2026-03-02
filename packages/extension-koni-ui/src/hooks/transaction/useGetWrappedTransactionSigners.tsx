// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountChainType, AccountSignMode, RequestGetSubstrateProxyAccountGroup } from '@subwallet/extension-base/types';
import { isSameAddress, reformatAddress } from '@subwallet/extension-base/utils';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getSignableAccountInfos } from '@subwallet/extension-koni-ui/messaging/transaction/multisig';
import { getSubstrateProxyAccountGroup } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { GetWrappedTransactionSignersHookType, ResolveWrappedTransactionSigners, WrappedTransactionSigner } from '@subwallet/extension-koni-ui/types';
import { findAccountByAddress } from '@subwallet/extension-koni-ui/utils';
import { useCallback } from 'react';

/**
 * Hook that resolves all valid **signers** for a **wrapped transaction**.
 *
 * A wrapped transaction is a transaction whose original sender
 * cannot sign the extrinsic directly and must be wrapped by another mechanism:
 *
 * - **Substrate Proxy**
 *   A proxy account signs the extrinsic, while execution origin
 *   remains the proxied account.
 *
 * - **Multisig**
 *   A signatory account signs on behalf of a multisig account
 *   (approval, reject and execution).
 *
 * The returned accounts represent the **actual extrinsic signers**,
 * not the original sender.
 *
 * ---
 *
 * ### When this hook is used
 * - Sender account is a **proxied account**
 * - Sender account is a **multisig account**
 *
 * ### Supported feature groups
 * - Transfer
 * - Earning (except Liquid staking)
 * - Governance
 *
 * ---
 *
 * ### Limitations
 * - Only supports **Substrate-based** accounts
 * - Not used for:
 *   - dApps
 *   - Liquid staking
 *   - Swap
 *
 * ---
 *
 * ### UX recommendation
 * Persist the selected wrapped signer in higher-level state and
 * re-inject it when reopening the signer selector modal to avoid
 * forcing users to re-select the same signer repeatedly.
 */
export function useGetWrappedTransactionSigners (): GetWrappedTransactionSignersHookType {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);

  /**
   * Resolve Substrate proxy accounts that are allowed
   * to sign the wrapped transaction.
   */
  const getWrappedSubstrateProxySigners = useCallback<ResolveWrappedTransactionSigners>(
    async ({ chainSlug, excludedSubstrateProxyAccounts, extrinsicType, targetAddress }) => {
      try {
        const chainInfo = chainInfoMap[chainSlug];

        if (!targetAddress || !chainInfo?.substrateInfo?.supportProxy) {
          return [];
        }

        const request: RequestGetSubstrateProxyAccountGroup = {
          chain: chainSlug,
          address: targetAddress,
          type: extrinsicType,
          excludedSubstrateProxyAccounts
        };

        const proxyGroup = await getSubstrateProxyAccountGroup(request);

        if (!proxyGroup?.substrateProxyAccounts?.length) {
          return [];
        }

        const validAccounts = allAccounts.filter((acc) =>
          acc.chainType === AccountChainType.SUBSTRATE &&
          acc.signMode !== AccountSignMode.READ_ONLY
        );

        return proxyGroup.substrateProxyAccounts
          .filter((proxy) =>
            validAccounts.some((acc) =>
              isSameAddress(acc.address, proxy.substrateProxyAddress)
            )
          )
          .map<WrappedTransactionSigner>((proxy) => ({
          ...proxy,
          kind: 'substrate_proxy',
          address: reformatAddress(
            proxy.substrateProxyAddress,
            chainInfo.substrateInfo?.addressPrefix
          )
        }));
      } catch (e) {
        console.error('Error fetching wrapped substrate proxy signers:', e);

        return [];
      }
    },
    [allAccounts, chainInfoMap]
  );

  /**
   * Resolve multisig signatory accounts that can sign
   * the wrapped multisig transaction.
   */
  const getWrappedMultisigSigners = useCallback<ResolveWrappedTransactionSigners>(
    async ({ chainSlug, extrinsicType, targetAddress }) => {
      try {
        const chainInfo = chainInfoMap[chainSlug];

        if (!targetAddress || !chainInfo?.substrateInfo?.supportMultisig || !extrinsicType) {
          return [];
        }

        const account = findAccountByAddress(allAccounts, targetAddress);

        if (!account?.proxyId || !account.isMultisig) {
          return [];
        }

        const { signableProxies } = await getSignableAccountInfos({
          extrinsicType,
          chain: chainSlug,
          multisigProxyId: account.proxyId
        });

        return signableProxies.map<WrappedTransactionSigner>((signer) => ({
          ...signer,
          kind: 'signatory',
          address: reformatAddress(
            signer.address,
            chainInfo.substrateInfo?.addressPrefix
          )
        }));
      } catch (e) {
        console.error('Error fetching wrapped multisig signers:', e);

        return [];
      }
    },
    [allAccounts, chainInfoMap]
  );

  /**
   * Public resolver that merges all possible wrapped transaction signers.
   */
  return useCallback<GetWrappedTransactionSignersHookType>(
    async (params) => {
      const [multisigSigners, substrateProxySigners] = await Promise.all([
        getWrappedMultisigSigners(params),
        getWrappedSubstrateProxySigners(params)
      ]);

      return [...multisigSigners, ...substrateProxySigners];
    },
    [getWrappedMultisigSigners, getWrappedSubstrateProxySigners]
  );
}
