// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountProxy } from '@subwallet/extension-base/types';
import { useChainInfoWithState, useCoreCreateReformatAddress, useGetChainAndExcludedTokenByCurrentAccountProxy, useSelector } from '@subwallet/extension-web-ui/hooks';
import { AccountAddressItemType, ChainItemType } from '@subwallet/extension-web-ui/types';
import { isAccountAll } from '@subwallet/extension-web-ui/utils';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function useHistorySelection () {
  const { address: propAddress, chain: propChain } = useParams<{address: string, chain: string}>();
  const { chainInfoMap } = useSelector((root) => root.chainStore);
  const chainInfoList = useChainInfoWithState();
  const { allowedChains } = useGetChainAndExcludedTokenByCurrentAccountProxy();
  const getReformatAddress = useCoreCreateReformatAddress();
  const { accountProxies, currentAccountProxy } = useSelector((root) => root.accountState);

  const [selectedAddress, setSelectedAddress] = useState<string>(propAddress || '');
  const [selectedChain, setSelectedChain] = useState<string>(propChain || '');

  const chainItems = useMemo<ChainItemType[]>(() => {
    const result: ChainItemType[] = [];

    chainInfoList.forEach((c) => {
      if (allowedChains.includes(c.slug)) {
        result.push({
          name: c.name,
          slug: c.slug
        });
      }
    });

    return result;
  }, [allowedChains, chainInfoList]);

  const accountAddressItems = useMemo(() => {
    if (!currentAccountProxy) {
      return [];
    }

    const chainInfo = selectedChain ? chainInfoMap[selectedChain] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach((a) => {
        const formatedAddress = getReformatAddress(a, chainInfo);

        if (formatedAddress) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address: a.address,
            displayAddress: formatedAddress
          });
        }
      });
    };

    if (isAccountAll(currentAccountProxy.id)) {
      accountProxies.forEach((ap) => {
        if (isAccountAll(ap.id)) {
          return;
        }

        updateResult(ap);
      });
    } else {
      updateResult(currentAccountProxy);
    }

    return result;
  }, [accountProxies, chainInfoMap, currentAccountProxy, getReformatAddress, selectedChain]);

  useEffect(() => {
    if (chainItems.length) {
      setSelectedChain((prevChain) => {
        if (!prevChain) {
          return chainItems[0].slug;
        }

        if (!chainItems.some((c) => c.slug === prevChain)) {
          return chainItems[0].slug;
        }

        return prevChain;
      });
    } else {
      setSelectedChain('');
    }
  }, [chainInfoMap, chainItems]);

  // NOTE: This hook doesn't handle selected address manually,
  // because it's now controlled via the `autoSelectFirstItem` prop
  // in the AccountAddressSelector component. This is the best approach for now;
  // can be revised if a better solution arises in the future.

  return {
    chainItems,
    accountAddressItems,
    selectedAddress,
    setSelectedAddress,
    selectedChain,
    setSelectedChain
  };
}
