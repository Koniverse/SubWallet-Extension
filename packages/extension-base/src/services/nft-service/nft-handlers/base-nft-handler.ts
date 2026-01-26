// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  NftCollection,
  NftDetailRequest,
  NftFullListRequest,
  NftItem
} from '@subwallet/extension-base/background/KoniTypes';

export interface NftHandlerResult {
  items: NftItem[];
  collections: NftCollection[];
}

const EMPTY_NFT_RESULT: NftHandlerResult = {
  items: [],
  collections: []
};

export abstract class BaseNftHandler {
  protected readonly chain: string;

  constructor (chain: string) {
    this.chain = chain;
  }

  abstract fetchPreview(addresses: string[]): Promise<NftHandlerResult>;
  abstract filterAddresses(addresses: string[]): string[];

  // Optional method - subclasses can choose to implement or not
  fetchFullListNftOfACollection (_request: NftFullListRequest): Promise<NftHandlerResult> {
    return Promise.resolve(EMPTY_NFT_RESULT);
  }

  // Optional method - subclasses can choose to implement or not
  fetchNftDetail (_request: NftDetailRequest): Promise<NftHandlerResult> {
    return Promise.resolve(EMPTY_NFT_RESULT);
  }
}
