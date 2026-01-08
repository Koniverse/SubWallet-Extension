// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainType, NftCollection, NftFullListRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { getAddressesByChainType } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { UniqueBundleTree, UniqueNftInstance } from '@subwallet-monorepos/subwallet-services-sdk/services';
import { UniqueCollectionByTokenOwnerRaw } from '@subwallet-monorepos/subwallet-services-sdk/services/nft/unique-nft';

import { BaseNftHandler, NftHandlerResult } from '../base-nft-handler';

export class UniqueNftHandler extends BaseNftHandler {
  override filterAddresses (addresses: string[]): string[] {
    return getAddressesByChainType(addresses, [ChainType.SUBSTRATE]);
  }

  private mapUniqueCollections (raws: UniqueCollectionByTokenOwnerRaw): NftCollection {
    return {
      collectionId: raws.collectionId.toString(),
      chain: this.chain,
      collectionName: raws.collectionName || 'Unknown Collection',
      image: raws.collectionCover?.url || undefined,
      externalUrl: undefined,
      originAsset: undefined
    };
  }

  private mapUniqueRootNftToItem (raw: UniqueNftInstance, owner: string): NftItem {
    return {
      id: raw.tokenId.toString(),
      chain: this.chain,
      collectionId: raw.collectionId.toString(),
      name: raw.name || `#${raw.tokenId}`,
      image: raw.image || undefined,
      description: '',
      owner: owner,
      isBundle: raw.isBundle,
      properties: null
    };
  }

  private mapBundleTreeToNftItem (
    node: UniqueBundleTree,
    topmostOwner: string,
    level = 0,
    parentId?: string
  ): NftItem {
    const item: NftItem = {
      id: node.tokenId.toString(),
      chain: this.chain,
      collectionId: node.collectionId.toString(),
      name: node.name || `#${node.tokenId}`,
      image: node.image || undefined,
      description: '',

      owner: topmostOwner,
      isBundle: node.nested && node.nested.length > 0,
      properties: null,

      nestingLevel: level,
      parent: parentId
    };

    if (node.nested && node.nested.length > 0) {
      item.nestingTokens = node.nested.map((child) =>
        this.mapBundleTreeToNftItem(child, topmostOwner, level + 1, item.id)
      );
    }

    return item;
  }

  async fetchNftBundle (collectionId: number | string, tokenId: string, topmostOwner: string): Promise<NftItem | null> {
    const api = subwalletApiSdk.uniqueNftDetectionApi;

    if (!api) {
      return null;
    }

    try {
      const treeData = await api.getNftBundleTree(collectionId, tokenId);

      if (!treeData) {
        return null;
      }

      return this.mapBundleTreeToNftItem(treeData, topmostOwner);
    } catch (e) {
      console.error('[UniqueNftHandler] Failed to fetch bundle tree', e);

      return null;
    }
  }

  // ==================== MAIN HANDLER ====================

  override async fetchPreview (addresses: string[]): Promise<NftHandlerResult> {
    const items: NftItem[] = [];
    const collectionsMap = new Map<string, NftCollection>();
    const api = subwalletApiSdk.uniqueNftDetectionApi;

    if (!api) {
      return { items: [], collections: [] };
    }

    try {
      await Promise.all(addresses.map(async (address) => {
        // 1. Collections
        const sdkCollections = await api.getUniqueCollectionsByTokenOwner(address);

        for (const col of sdkCollections) {
          const collection = this.mapUniqueCollections(col);

          if (!collectionsMap.has(collection.collectionId)) {
            collectionsMap.set(collection.collectionId, collection);
          }
        }

        // 2. Root NFTs
        const sdkNfts = await api.getAllUniqueRootNfts({ owner: address });

        for (const rootNft of sdkNfts) {
          items.push(this.mapUniqueRootNftToItem(rootNft, address));
        }
      }));
    } catch (e) {
      console.error(`[UniqueNftHandler] Failed to fetch for ${this.chain}`, e);
    }

    return { items, collections: Array.from(collectionsMap.values()) };
  }

  override async fetchFullListNftOfACollection (request: NftFullListRequest): Promise<NftHandlerResult> {
    const items: NftItem[] = [];
    const collections: NftCollection[] = [];
    const { collectionId, owners, tokenIds } = request;

    if (!collectionId || !owners || !tokenIds) {
      console.warn('[NftService] missing params for getFullNftInstancesByCollection');

      return { items, collections };
    }

    for (const id of tokenIds) {
      const fullTree = await this.fetchNftBundle(collectionId, id, owners[0]);

      if (fullTree) {
        items.push(fullTree);
      }
    }

    return {
      items: items,
      collections: collections
    };
  }
}
