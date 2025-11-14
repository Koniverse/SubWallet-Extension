// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftFullListRequest } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { AbstractNftService } from '@subwallet/extension-base/services/nft-service/base/abstract-nft-service';

export class UniqueNftService extends AbstractNftService {
  constructor (state: KoniState) {
    super(state);
  }

  async detectPreview (addresses: string[]) {
    // const nftDetectionApi = subwalletApiSdk.uniqueNftDetectionApi;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async getFullNftInstances (request: NftFullListRequest): Promise<boolean> {
    // const nftDetectionApi = subwalletApiSdk.uniqueNftDetectionApi;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return true;
  }
}
