// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftFullListRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';

export interface FetchCollectionsResult {
  items: NftItem[];
  collections: NftCollection[];
}

export abstract class AbstractNftService {
  protected state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  abstract detectPreview(addresses: string[]): Promise<void>;
  // abstract fetchFull(address: string): Promise<FetchCollectionsResult>;
  abstract getFullNftInstances(request: NftFullListRequest): Promise<boolean>;
}
