// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { useReformatAddress, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { AccountChainAddress } from '@subwallet/extension-koni-ui/types';
import { getChainsByAccountType } from '@subwallet/extension-koni-ui/utils';
import { useMemo } from 'react';

// todo:
//  - order the result
const useGetAccountChainAddresses = (accountProxy: AccountProxy): AccountChainAddress[] => {
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const getReformatAddress = useReformatAddress();

  return useMemo(() => {
    const result: AccountChainAddress[] = [];
    const chains: string[] = getChainsByAccountType(chainInfoMap, accountProxy.chainTypes, accountProxy.specialChain);

    accountProxy.accounts.forEach((a) => {
      for (const chain of chains) {
        const chainInfo = chainInfoMap[chain];
        const reformatedAddress = getReformatAddress(a, chainInfo);

        if (reformatedAddress) {
          result.push({
            name: chainInfo.name,
            slug: chainInfo.slug,
            address: reformatedAddress,
            accountType: a.type
          });
        }
      }
    });

    return result;
  }, [accountProxy, chainInfoMap, getReformatAddress]);
};

export default useGetAccountChainAddresses;
