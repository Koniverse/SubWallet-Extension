// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountChainType, AccountSignMode, ExcludedSubstrateProxyAccounts, RequestGetSubstrateProxyAccountGroup, SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { createPromiseHandler, isSameAddress } from '@subwallet/extension-base/utils';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getSubstrateProxyAccountGroup } from '@subwallet/extension-koni-ui/messaging/transaction/substrateProxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { useCallback, useContext } from 'react';

export type SelectSubstrateProxyAccountsToSignParams = {
  chain: string;
  address?: string;
  type?: ExtrinsicType;
  excludedSubstrateProxyAccounts?: ExcludedSubstrateProxyAccounts[];
};

export type SelectSubstrateProxyAccountsToSign = (params: SelectSubstrateProxyAccountsToSignParams) => Promise<string | undefined>;

type GetSubstrateProxyAccountsToSign = (params: SelectSubstrateProxyAccountsToSignParams) => Promise<SubstrateProxyAccountItem[]>;

/**
 * Hook that handles selecting a valid Substrate proxy account to sign transactions.
 *
 * This is used when the sender account is a proxied account that has one or more valid proxy accounts
 * capable of signing on its behalf.
 *
 * ### Supported feature groups
 * - **Transfer**
 * - **Earning** (except when staking method = *Liquid staking*)
 * - **Governance**
 *
 * ⚠️ Requirements & limitations:
 * - Input address must be a **Substrate address**.
 *   (The wallet currently handles mixed network accounts, and EVM-based accounts are excluded for safety.)
 * - Not supported for:
 *   1. **dApps** — Substrate extrinsics vary by pallet/method, often nested and chain-dependent, making reliable parsing unsafe.
 *   2. **Liquid staking** and **Swap** — These features involve multi-step transactions and require the original account to sign directly.
 *
 * ⚠️ Suggested approach:
 * Store selected proxy address in a higher-level state
 * Pass the stored proxy address back into the selector modal when opening it again
 * This ensures better UX and avoids forcing users to re-select the same proxy account after back from confirmation screen.
 */

export function useCreateSelectSubstrateProxyAccountsToSign (): SelectSubstrateProxyAccountsToSign {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const { selectSubstrateProxyAccountModal } = useContext(WalletModalContext);

  const getSubstrateProxyAccount = useCallback<GetSubstrateProxyAccountsToSign>(async ({ address, chain, excludedSubstrateProxyAccounts, type }) => {
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
        type,
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
      );
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      return [];
    }
  }, [allAccounts, chainInfoMap]);

  // function to select proxy account to sign transaction
  // then open modal to let user select
  // return selected proxy address or undefined
  return useCallback(async (params: SelectSubstrateProxyAccountsToSignParams): Promise<string | undefined> => {
    if (!params.address) {
      return Promise.resolve(undefined);
    }

    const substrateProxyAccounts = await getSubstrateProxyAccount(params);

    if (substrateProxyAccounts.length === 0) {
      return Promise.resolve(undefined);
    }

    const { promise, reject, resolve } = createPromiseHandler<string>();

    selectSubstrateProxyAccountModal.open({
      chain: params.chain,
      address: params.address,
      substrateProxyAccountItems: substrateProxyAccounts,
      onApply: resolve,
      onCancel: reject
    });

    return promise;
  }, [getSubstrateProxyAccount, selectSubstrateProxyAccountModal]);
}
