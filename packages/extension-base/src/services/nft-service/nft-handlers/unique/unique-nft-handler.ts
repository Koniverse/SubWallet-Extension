// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainType, NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { getAddressesByChainType } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { UniqueCollectionInstance, UniqueNftInstance } from '@subwallet-monorepos/subwallet-services-sdk/services';

import { BaseNftHandler, NftHandlerResult } from '../base-nft-handler';

type IndexedNft = NftItem & {
  __tokenAddress: string;
  __rawOwner: string;
};

export class UniqueNftHandler extends BaseNftHandler {
  override filterAddresses (addresses: string[]): string[] {
    return getAddressesByChainType(addresses, [ChainType.SUBSTRATE]);
  }

  private mapUniqueCollections (raws: UniqueCollectionInstance): NftCollection {
    return {
      collectionId: raws.collectionId.toString(),
      chain: this.chain,
      collectionName: raws.collectionName || 'Unknown Collection',
      image: raws.image || undefined,
      externalUrl: undefined,
      originAsset: undefined
    };
  }

  private mapUniqueSdkToNftItem (
    raw: UniqueNftInstance,
    topmostOwner: string
  ): IndexedNft {
    return {
      id: raw.tokenId.toString(),
      chain: this.chain,
      collectionId: String(raw.collectionId),
      name: raw.name,
      image: raw.image || undefined,
      description: raw.description,

      owner: topmostOwner,

      isBundle: false,
      properties: null,

      nestingTokens: [],
      nestingLevel: 0,

      // Internal fields for Tree Logic
      __tokenAddress: raw.tokenAddress,
      __rawOwner: raw.owner
    };
  }

  private sanitizeNft (item: IndexedNft): NftItem {
    const { __rawOwner, __tokenAddress, nestingTokens, ...rest } = item;

    const cleanChildren = (nestingTokens as IndexedNft[] || []).map((child) =>
      this.sanitizeNft(child)
    );

    return {
      ...rest,
      nestingTokens: cleanChildren.length > 0 ? cleanChildren : undefined
    } as NftItem;
  }

  private buildUniqueNftTree (
    raws: UniqueNftInstance[],
    topmostOwner: string
  ): { roots: IndexedNft[] } {
    const index = new Map<string, IndexedNft>();
    const allItems: IndexedNft[] = [];

    for (const raw of raws) {
      if (!raw.tokenAddress) {
        continue;
      }

      const nft = this.mapUniqueSdkToNftItem(raw, topmostOwner);

      index.set(nft.__tokenAddress, nft);
      allItems.push(nft);
    }

    const roots: IndexedNft[] = [];

    // Step 2: (Linking)
    for (const nft of allItems) {
      const parent = index.get(nft.__rawOwner);

      if (parent) {
        // nft.parent = parent; // (Optional)

        // 2. Increase level
        nft.nestingLevel = (parent.nestingLevel ?? 0) + 1;

        parent.nestingTokens = parent.nestingTokens || [];
        parent.nestingTokens.push(nft);
        parent.isBundle = true;
      } else {
        roots.push(nft);
      }
    }

    return { roots };
  }

  // ==================== MAIN HANDLER ====================

  override async fetchPreview (addresses: string[]): Promise<NftHandlerResult> {
    const items: NftItem[] = [];
    const collections: NftCollection[] = [];
    const api = subwalletApiSdk.uniqueNftDetectionApi;

    if (!api) {
      return { items, collections };
    }

    try {
      await Promise.all(addresses.map(async (address) => {
        // 1. Collections
        const sdkCollections = await api.getUniqueCollectionsByOwnerIn(address);

        sdkCollections.forEach((col) => collections.push(this.mapUniqueCollections(col)));

        // 2. NFTs
        const sdkNfts = await api.getAllUniqueNftsByTopmostOwnerIn(address);

        // 3. Build Tree
        const { roots } = this.buildUniqueNftTree(sdkNfts, address);

        // 4. Sanitize data
        const cleanRoots = roots.map((root) => this.sanitizeNft(root));

        // Output like this: [Root1 { nestingTokens: [Child1, Child2] }, Root2...]
        items.push(...cleanRoots);
      }));
    } catch (e) {
      console.error(`[UniqueNftHandler] Failed to fetch for ${this.chain}`, e);
    }

    return { items, collections };
  }
}
