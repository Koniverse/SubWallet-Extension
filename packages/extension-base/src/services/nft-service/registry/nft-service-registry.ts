// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { AbstractNftService } from '@subwallet/extension-base/services/nft-service/base/abstract-nft-service';
import { getPreferredNftServiceKey } from '@subwallet/extension-base/services/nft-service/registry/nft-detector-service';

export class NftServiceRegistry {
  private services = new Map<string, AbstractNftService>();

  register (key: string, service: AbstractNftService) {
    this.services.set(key, service);
  }

  getService (chainInfo: _ChainInfo): AbstractNftService {
    const key = getPreferredNftServiceKey(chainInfo);
    const service = this.services.get(key);

    if (!service) {
      throw new Error(`No NFT service registered for chain type: ${key}`);
    }

    return service;
  }

  getAllSupportedChains (): string[] {
    // Cần lấy từ chain service hoặc state
    // Ví dụ:
    // return this.state.getNftSupportedChains();

    // Hoặc hardcode tạm:
    return ['ethereum', 'polygon', 'binance', 'polkadot', 'kusama'];
  }
}
