// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@subwallet/keyring/types';

import { _ChainInfo } from '@subwallet/chain-list/types';
import { _BITCOIN_CHAIN_SLUG, _BITCOIN_TESTNET_CHAIN_SLUG } from '@subwallet/extension-base/services/chain-service/constants';
import { AccountProxy } from '@subwallet/extension-base/types';
import { useCoreReformatAddress, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { AccountChainAddress } from '@subwallet/extension-koni-ui/types';
import { getBitcoinAccountDetails, getChainsByAccountType } from '@subwallet/extension-koni-ui/utils';
import { useMemo } from 'react';

// todo:
//  - order the result

// Helper function to create an AccountChainAddress object
const createChainAddressItem = (
  accountType: KeypairType,
  chainInfo: _ChainInfo,
  address: string
): AccountChainAddress => {
  const isBitcoin = [_BITCOIN_CHAIN_SLUG, _BITCOIN_TESTNET_CHAIN_SLUG].includes(chainInfo.slug);

  if (isBitcoin) {
    const bitcoinInfo = getBitcoinAccountDetails(accountType);

    return {
      name: bitcoinInfo.network,
      logoKey: bitcoinInfo.logoKey,
      slug: chainInfo.slug,
      address,
      accountType
    };
  }

  return {
    name: chainInfo.name,
    slug: chainInfo.slug,
    address,
    accountType
  };
};

const useGetAccountChainAddresses = (accountProxy: AccountProxy): AccountChainAddress[] => {
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const getReformatAddress = useCoreReformatAddress();

  return useMemo(() => {
    const result: AccountChainAddress[] = [];
    const chains: string[] = getChainsByAccountType(chainInfoMap, accountProxy.chainTypes, undefined, accountProxy.specialChain);

    accountProxy.accounts.forEach((a) => {
      for (const chain of chains) {
        const chainInfo = chainInfoMap[chain];
        const reformatedAddress = getReformatAddress(a, chainInfo);

        if (reformatedAddress) {
          const chainAddressItem = createChainAddressItem(
            a.type,
            chainInfo,
            reformatedAddress
          );

          result.push(chainAddressItem);
        }
      }
    });

    return result;
  }, [accountProxy, chainInfoMap, getReformatAddress]);
};

export default useGetAccountChainAddresses;
