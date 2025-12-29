// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftFullListRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { NFT_HANDLER_REGISTRY, NftHandlerDescriptor } from '@subwallet/extension-base/services/nft-service/nft-handlers/registry';

import { BaseNftHandler, NftHandlerResult } from './nft-handlers/base-nft-handler';

export class MultiChainNftFetcher {
  private readonly state: KoniState;
  constructor (state: KoniState) {
    this.state = state;
  }

  private handlerCache = new Map<string, BaseNftHandler>();

  private getOrCreate (chain: string, desc: NftHandlerDescriptor): BaseNftHandler {
    const key = `${chain}:${desc.id}`;

    let handler = this.handlerCache.get(key);

    if (!handler) {
      handler = desc.create(chain, this.state);
      this.handlerCache.set(key, handler);
    }

    return handler;
  }

  private getHandlersForChain (chainSlug: string): BaseNftHandler[] {
    const chainInfo = this.state.chainService.getChainInfoByKey(chainSlug);

    if (!chainInfo) {
      return [];
    }

    return NFT_HANDLER_REGISTRY
      .filter((d) => d.supports(chainInfo))
      .map((d) => this.getOrCreate(chainSlug, d));
  }

  public async fetch (
    addresses: string[],
    chainSlugs: string[]
  ): Promise<NftHandlerResult> {
    const allItems: NftItem[] = [];
    const allCollections: NftCollection[] = [];
    const tasks: Promise<void>[] = [];

    for (const chain of chainSlugs) {
      const handlers = this.getHandlersForChain(chain);

      if (handlers.length === 0) {
        console.warn(`[NftFetcher] No handler for chain: ${chain}`);
        continue;
      }

      for (const handler of handlers) {
        const handlerAddresses = handler.filterAddresses(addresses);
        const task = handler.fetchPreview(handlerAddresses)
          .then((result: NftHandlerResult) => {
            allItems.push(...result.items);
            allCollections.push(...result.collections);
          })
          .catch((err) => {
            console.error(`[NftFetcher] Handler failed on ${chain}: handler.id`, err);
          });

        tasks.push(task);
      }
    }

    await Promise.all(tasks);

    // DEDUPLICATE
    // Todo: Move logic DEDUPLICATE to each handler
    const seenItemIds = new Set<string>();
    const seenCollectionKeys = new Set<string>();
    const uniqueItems: NftItem[] = [];
    const uniqueCollections: NftCollection[] = [];

    for (const item of allItems) {
      if (!seenItemIds.has(item.id)) {
        seenItemIds.add(item.id);
        uniqueItems.push(item);
      }
    }

    for (const col of allCollections) {
      const key = `${col.chain}:${col.collectionId}`;

      if (!seenCollectionKeys.has(key)) {
        seenCollectionKeys.add(key);
        uniqueCollections.push(col);
      }
    }

    return {
      items: uniqueItems,
      collections: uniqueCollections
    };
  }

  public async fetchFullListNftOfACollection (request: NftFullListRequest): Promise<NftHandlerResult> {
    const { chainInfo, contractAddress, owners } = request;
    const items: NftItem[] = [];
    const collections: NftCollection[] = [];

    const handlers = this.getHandlersForChain(chainInfo.slug);

    for (const handler of handlers) {
      // Todo: Improve the full-list fetch feature
      // if (!handler.supportsFetchFullNftList) {
      //   continue;
      // }

      const handlerOwners = handler.filterAddresses(owners);

      try {
        const result = await handler.fetchFullListNftOfACollection(
          {
            contractAddress: contractAddress,
            owners: handlerOwners,
            chainInfo
          }
        );

        items.push(...result.items);
        collections.push(...result.collections);
      } catch (e) {
        console.error('[NftFetcher] fetchCollection failed', e);
      }
    }

    return { items, collections };
  }
}
