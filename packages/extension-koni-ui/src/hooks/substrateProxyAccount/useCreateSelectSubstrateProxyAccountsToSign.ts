// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountChainType, AccountSignMode, RequestGetSubstrateProxyAccountInfo, SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { createPromiseHandler, isSameAddress } from '@subwallet/extension-base/utils';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { getSubstrateProxyAccountInfo } from '@subwallet/extension-koni-ui/messaging/transaction/proxy';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useCallback, useContext } from 'react';

export type SelectSubstrateProxyAccountsToSignParams = {
  chain: string;
  address?: string;
  type?: ExtrinsicType;
  selectedSubstrateProxyAddresses?: string[];
};

export type SelectSubstrateProxyAccountsToSign = (params: SelectSubstrateProxyAccountsToSignParams) => Promise<string | undefined>;

type GetSubstrateProxyAccountsToSign = (params: SelectSubstrateProxyAccountsToSignParams) => Promise<SubstrateProxyAccountItem[]>;

export function useCreateSelectSubstrateProxyAccountsToSign (): SelectSubstrateProxyAccountsToSign {
  const allAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const { selectSubstrateProxyAccountModal } = useContext(WalletModalContext);

  const getSubstrateProxyAccount = useCallback<GetSubstrateProxyAccountsToSign>(async ({ address, chain, selectedSubstrateProxyAddresses, type }) => {
    try {
      if (!address || !isSubstrateAddress(address)) {
        return [];
      }

      const request: RequestGetSubstrateProxyAccountInfo = {
        chain,
        address,
        type,
        selectedSubstrateProxyAddresses
      };

      const proxyAccounts = await getSubstrateProxyAccountInfo(request);

      if (!proxyAccounts?.substrateProxyAccounts?.length) {
        return [];
      }

      const validAccounts = allAccounts.filter(
        (acc) => acc.chainType === AccountChainType.SUBSTRATE && acc.signMode !== AccountSignMode.READ_ONLY
      );

      return proxyAccounts.substrateProxyAccounts.filter((proxy) =>
        validAccounts.some((acc) => isSameAddress(acc.address, proxy.substrateProxyAddress))
      );
    } catch (e) {
      console.error('Error fetching proxy accounts:', e);

      return [];
    }
  }, [allAccounts]);

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
      substrateProxyItems: substrateProxyAccounts,
      onApply: resolve,
      onCancel: reject
    });

    return promise;
  }, [getSubstrateProxyAccount, selectSubstrateProxyAccountModal]);
}
