// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import EvmNftService from '@subwallet/extension-base/services/nft-service/multichain/evm/evm-nft-service';
import { UniqueNftService } from '@subwallet/extension-base/services/nft-service/multichain/unique';
import { NftServiceRegistry } from '@subwallet/extension-base/services/nft-service/registry/nft-service-registry';

export class NftService {
  private registry: NftServiceRegistry;
  constructor (private state: KoniState) {
    this.registry = new NftServiceRegistry();
    this.registerDefaultServices();
  }

  private registerDefaultServices (): void {
    this.registry.register('evm', new EvmNftService(this.state));
    this.registry.register('unique', new UniqueNftService(this.state));
  }

  // Cron trigger (detect collection and preview nft)
  async syncPreview (address: string) {
    const chains = this.registry.getAllSupportedChains();

    for (const chain of chains) {
      const service = this.registry.getService(chain);

      const { collections, items } = await service.detectPreview(address);

      await this.state.handleDetectedNftCollections(collections);
      await this.state.handleDetectedNfts(address, items);
    }
  }

  // UI trigger gọi hàm này (fetch full list nft)
  async syncFull (addresses: string[]) {
    const address = addresses[0];
    const chains = this.registry.getAllSupportedChains();

    for (const chain of chains) {
      const service = this.registry.getService(chain);

      const { collections, items } = await service.getFullNftInstances(address);

      await this.state.handleDetectedNftCollections(collections);
      await this.state.handleDetectedNfts(address, items);
    }
  }
}
