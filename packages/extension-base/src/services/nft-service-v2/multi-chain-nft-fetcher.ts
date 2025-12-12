// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _isChainSupportEvmNft } from '@subwallet/extension-base/services/chain-service/utils';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { BaseNftHandler, NftHandlerResult } from './nft-handlers/base-nft-handler';
import { EvmNftHandler } from './nft-handlers/evm/evm-nft-handler';

interface FetchOptions {
  mode: 'preview' | 'full';
}

export class MultiChainNftFetcher {
  private readonly state: KoniState;
  private readonly handlers = new Map<string, BaseNftHandler>(); // handler instance

  constructor (state: KoniState) {
    this.state = state;
    this.registerAllHandlers();
  }

  private registerAllHandlers () {
    // EVM chains – tự động tất cả chain có evmInfo
    console.log('this.state.getActiveChainInfoMap()', this.state.getActiveChainInfoMap());
    console.log('this.state.getChainInfoMap()', this.state.getActiveChainInfoMap());
    Object.values(this.state.getActiveChainInfoMap())
      .filter((chainInfo) => _isChainSupportEvmNft(chainInfo))
      .forEach((chainInfo) => {
        console.log('chainInfo', chainInfo);
        this.handlers.set(chainInfo.slug, new EvmNftHandler(chainInfo.slug, this.state));
      });

    // Unique Network
    // this.handlers.set('unique_network', new UniqueNftHandler(this.state));

    // Thêm chain mới = 1 dòng
    // this.handlers.set('moonbeam', new EvmNftHandler('moonbeam', this.state));
  }

  /** DUY NHẤT 1 HÀM PUBLIC – đúng thiết kế "gọi đúng 1 hàm" */
  public async fetch (
    addresses: string[],
    chainSlugs: string[],
    options: FetchOptions = { mode: 'preview' }
  ): Promise<NftHandlerResult> {
    const allItems: NftItem[] = [];
    const allCollections: NftCollection[] = [];
    const tasks: Promise<void>[] = [];

    for (const chain of chainSlugs) {
      const handler = this.handlers.get(chain);

      if (!handler) {
        console.warn(`[NftFetcher] No handler for chain: ${chain}`);
        continue;
      }

      // LỌC ĐÚNG ADDRESS THEO CHAIN (EVM vs Substrate) – BẮT BUỘC!
      const isEvmChain = !!this.state.chainService.getChainInfoByKey(chain)?.evmInfo;
      const chainAddresses = addresses.filter((addr) =>
        isEvmChain ? isEthereumAddress(addr) : !isEthereumAddress(addr)
      );

      if (chainAddresses.length === 0) {
        continue;
      }

      const task = (options.mode === 'full'
        ? handler.fetchFull(chainAddresses)
        : handler.fetchPreview(chainAddresses)
      )
        .then((result: NftHandlerResult) => {
          allItems.push(...result.items);
          allCollections.push(...result.collections);
        })
        .catch((err) => {
          console.error(`[NftFetcher] Handler failed on ${chain}:`, err);
          // Không throw → graceful degradation
        });

      tasks.push(task);
    }

    await Promise.all(tasks);

    // DEDUPLICATE – BẮT BUỘC, nếu không NFT bị nhân 2-10 lần
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
}
