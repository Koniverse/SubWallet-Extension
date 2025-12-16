// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftFullListRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';

export interface NftHandlerResult {
  items: NftItem[];
  collections: NftCollection[];
}

export abstract class BaseNftHandler {
  protected readonly chain: string;

  constructor (chain: string) {
    this.chain = chain;
  }

  abstract fetchPreview(addresses: string[]): Promise<NftHandlerResult>;

  abstract fetchFullListNftOfaCollection(request: NftFullListRequest): Promise<NftHandlerResult>;

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
