// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { useGetNftByAccount } from '@subwallet/extension-koni-ui/hooks';
import { useMemo } from 'react';

const findNftDeep = (items: NftItem[], targetId: string, chain: string, collectionId: string): NftItem | undefined => {
  for (const item of items) {
    if (item.id === targetId && item.chain === chain && item.collectionId === collectionId) {
      return item;
    }

    if (item.nestingTokens && item.nestingTokens.length > 0) {
      const foundChild = findNftDeep(item.nestingTokens, targetId, chain, collectionId);

      if (foundChild) {
        return foundChild;
      }
    }
  }

  return undefined;
};

const useGetNftParent = (childItem?: NftItem): NftItem | undefined => {
  const { nftItems } = useGetNftByAccount();

  return useMemo(() => {
    const parentId = childItem?.parentId;

    if (!childItem || !parentId) {
      return undefined;
    }

    return findNftDeep(nftItems, parentId, childItem.chain, childItem.collectionId);
  }, [childItem, nftItems]);
};

export default useGetNftParent;
