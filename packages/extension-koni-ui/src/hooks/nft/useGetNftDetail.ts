// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { useQuery } from '@tanstack/react-query';
import { getNftDetail } from '@subwallet/extension-koni-ui/messaging';

const useGetNftDetail = (chain: string, collectionId: string, nftId: string) => {
  return useQuery({
    // QueryKey là duy nhất cho mỗi NFT trên mỗi chain
    queryKey: ['nftDetail', chain, collectionId, nftId],

    // Hàm gọi API/Messaging xuống Background
    queryFn: async () => {
      const result = await getNftDetail({
        chainSlug: chain,
        collectionId,
        tokenId: nftId
      });
      return result;
    },

    // Các cấu hình tối ưu cho Extension
    enabled: !!chain && !!nftId, // Chỉ fetch khi có đủ ID
    staleTime: 60 * 1000,        // Dữ liệu "tươi" trong 1 phút
    gcTime: 5 * 60 * 1000,       // Giữ trong bộ nhớ đệm 5 phút sau khi đóng trang
    refetchOnWindowFocus: false, // Tránh fetch lại mỗi khi mở/đóng popup extension
  });
};


export default useGetNftDetail;
