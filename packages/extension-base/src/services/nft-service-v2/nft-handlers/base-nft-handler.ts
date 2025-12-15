// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';

export interface NftHandlerResult {
  items: NftItem[];
  collections: NftCollection[];
}

export abstract class BaseNftHandler {
  protected readonly chain: string;

  constructor (chain: string) {
    this.chain = chain;
  }

  /** Mỗi handler phải implement fetch */
  // abstract fetchNfts(addresses: string[], options?: { fullData?: boolean }): Promise<NftHandlerResult>;

  // 1. Dùng cho cron + background refresh → nhẹ, nhanh
  abstract fetchPreview(addresses: string[]): Promise<NftHandlerResult>;

  // 2. Dùng khi user bấm "Load full" hoặc vào màn collection → đầy đủ
  abstract fetchFull(addresses: string[]): Promise<NftHandlerResult>;

  abstract filterAddresses(addresses: string[]): string[];

  /** Helper: chuẩn hóa item với chain */
  protected normalizeItems (items: NftItem[]): NftItem[] {
    return items.map((item) => ({
      ...item,
      chain: this.chain,
      id: item.id
    }));
  }

  protected normalizeCollections (collections: NftCollection[]): NftCollection[] {
    return collections.map((col) => ({
      ...col,
      chain: this.chain,
      collectionId: col.collectionId
    }));
  }
}
