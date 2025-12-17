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

  // Optional method - subclasses can choose to implement or not
  fetchFullListNftOfaCollection (_request: NftFullListRequest): Promise<NftHandlerResult> {
    return Promise.resolve({ items: [], collections: [] });
  }

  abstract filterAddresses(addresses: string[]): string[];
}
