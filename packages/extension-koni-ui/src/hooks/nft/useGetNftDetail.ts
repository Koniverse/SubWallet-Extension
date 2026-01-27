// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getNftDetail } from '@subwallet/extension-koni-ui/messaging';
import { useQuery } from '@tanstack/react-query';

const useGetNftDetail = (chain: string, collectionId: string, nftId: string) => {
  return useQuery({
    queryKey: ['nftDetail', chain, collectionId, nftId],

    queryFn: async () => {
      const result = await getNftDetail({
        chainSlug: chain,
        collectionId,
        tokenId: nftId
      });

      return result;
    },

    enabled: !!chain && !!nftId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export default useGetNftDetail;
