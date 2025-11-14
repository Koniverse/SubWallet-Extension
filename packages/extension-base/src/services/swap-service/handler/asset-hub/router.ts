// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { buildSwapExtrinsic } from '@subwallet/extension-base/services/swap-service/handler/asset-hub/utils';

import { SubmittableExtrinsic } from '@polkadot/api/types';

export class AssetHubRouter {
  private readonly chain: string;
  public readonly chainService: ChainService;

  constructor (chain: string, chainService: ChainService) {
    this.chain = chain;
    this.chainService = chainService;
  }

  get substrateApi (): _SubstrateApi {
    return this.chainService.getSubstrateApi(this.chain);
  }

  get nativeToken (): _ChainAsset {
    return this.chainService.getNativeTokenInfo(this.chain);
  }

  async buildSwapExtrinsic (path: Array<_ChainAsset>, recipient: string, amountIn: string, amountOutMin: string): Promise<SubmittableExtrinsic<'promise'>> {
    const substrateApi = await this.substrateApi.isReady;

    const api = await substrateApi.api.isReady;

    return buildSwapExtrinsic(api, path, recipient, amountIn, amountOutMin);
  }
}
