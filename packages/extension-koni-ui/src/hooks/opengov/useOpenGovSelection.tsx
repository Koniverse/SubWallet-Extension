// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { govChainSupportItems } from '@subwallet/extension-base/services/open-gov/utils';
import { AccountProxy } from '@subwallet/extension-base/types';
import { useChainInfoWithState, useGetChainSlugsByAccount, useReformatAddress, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { AccountAddressItemType, ChainItemType } from '@subwallet/extension-koni-ui/types';
import { isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function useOpenGovSelection () {
  const { address: propAddress, chain: propChain } = useParams<{address: string, chain: string}>();
  const { chainInfoMap } = useSelector((root) => root.chainStore);
  const chainInfoList = useChainInfoWithState();
  const allowedChains = useGetChainSlugsByAccount();
  const getReformatAddress = useReformatAddress();
  const { accountProxies, currentAccountProxy } = useSelector((root) => root.accountState);

  const [selectedAddress, setSelectedAddress] = useState<string>(propAddress || '');
  const [selectedChain, setSelectedChain] = useState<string>(propChain || '');

  const supportedChains = useMemo(() => govChainSupportItems.map((item) => item.slug), []);

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
        // TODO: This is a temporary validation method.
        //  Find a more efficient way to get isValid.
        const isValid = getReformatAddress(a, chainInfo);

        if (isValid) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address: a.address
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
        console.log('Checking', [prevChain, supportedChains]);

        if (!prevChain || !supportedChains.includes(prevChain)) {
          return supportedChains[0];
        }

        return prevChain;
      });
    } else {
      setSelectedChain('');
    }
  }, [chainInfoMap, chainItems, supportedChains]);

  useEffect(() => {
    setSelectedAddress((prevResult) => {
      if (accountAddressItems.length) {
        if (!prevResult) {
          return accountAddressItems[0].address;
        }

        if (!accountAddressItems.some((a) => a.address === prevResult)) {
          return accountAddressItems[0].address;
        }
      }

      return prevResult;
    });
  }, [accountAddressItems, propAddress]);

  return {
    chainItems,
    accountAddressItems,
    selectedAddress,
    setSelectedAddress,
    selectedChain,
    setSelectedChain
  };
}
