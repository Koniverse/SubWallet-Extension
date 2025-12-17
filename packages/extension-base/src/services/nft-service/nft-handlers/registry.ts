// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { NFT_CHAIN_GROUPS_MIGRATED } from '@subwallet/extension-base/services/chain-service/constants';
import { _isChainSupportEvmNft } from '@subwallet/extension-base/services/chain-service/utils';
import { BaseNftHandler } from '@subwallet/extension-base/services/nft-service/nft-handlers/base-nft-handler';
import { EvmNftHandler } from '@subwallet/extension-base/services/nft-service/nft-handlers/evm/evm-nft-handler';
import { UniqueNftHandler } from '@subwallet/extension-base/services/nft-service/nft-handlers/unique/unique-nft-handler';

export interface NftHandlerDescriptor {
  id: string;
  supports(chainInfo: _ChainInfo): boolean;
  supportFechFullList: boolean;
  create(chainSlug: string, state: KoniState): BaseNftHandler;
}

const NFT_V2_DOMAINS = new Set<string>([
  'ethereum',
  'unique_network'
]);

export function isV2ChainSource (
  chainInfo: _ChainInfo,
  registry: NftHandlerDescriptor[]
): boolean {
  return registry.some((desc) =>
    NFT_V2_DOMAINS.has(desc.id) && desc.supports(chainInfo)
  );
}

// todo list: only update into when migration
export const NFT_HANDLER_REGISTRY: NftHandlerDescriptor[] = [
  {
    id: 'evm',
    supports: (chainInfo) => _isChainSupportEvmNft(chainInfo),
    supportFechFullList: true,
    create: (chain) => new EvmNftHandler(chain)
  },
  {
    id: 'unique_network',
    supports: (chainInfo) => NFT_CHAIN_GROUPS_MIGRATED.unique_network[0].includes(chainInfo.slug),
    supportFechFullList: true,
    create: (chain) => new UniqueNftHandler(chain)
  }
  // {
  //   id: 'ordinal',
  //   supports: (chainInfo) => _isSupportOrdinal(chainInfo.slug),
  //   create: (chain, state) => new OrdinalNftHandler(chain, state)
  // }
];
