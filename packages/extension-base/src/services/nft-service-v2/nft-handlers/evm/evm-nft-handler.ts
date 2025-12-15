// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { baseParseIPFSUrl } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { BlockscoutNftInstanceRaw } from '@subwallet-monorepos/subwallet-services-sdk/services/blockscout/types';

import { BaseNftHandler, NftHandlerResult } from '../base-nft-handler';

interface SdkToken {
  address_hash: string;
  name?: string | null;
  symbol?: string | null;
  type?: _AssetType.ERC721;
  icon_url?: string | null;
}

interface SdkCollection {
  amount: string;
  token: SdkToken;
  token_instances: BlockscoutNftInstanceRaw[];
}

type SdkCollectionsByChain = Record<string, SdkCollection[]>;

export class EvmNftHandler extends BaseNftHandler {
  private readonly state: KoniState;

  constructor (chain: string, state: KoniState) {
    super(chain);
    this.state = state;
  }

  filterAddresses (addresses: string[]): string[] {
    return addresses;
  }

  // ==================== MAPPING HELPER (giữ nguyên từ code cũ) ====================
  private mapSdkToNftItem (
    rawInstance: BlockscoutNftInstanceRaw,
    collectionId: string,
    owner: string
  ): NftItem | null {
    const metadata = rawInstance.metadata || {};
    const image = metadata.image || rawInstance.image_url || rawInstance.media_url || '';
    const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

    let rarity: string | undefined;
    const properties: Record<string, string | number | boolean | null> = {};

    for (const attr of attributes) {
      try {
        const key = attr.trait_type?.trim();

        if (!key) {
          continue;
        }

        let value = attr.value as string | number | boolean | null;

        if (typeof value === 'string') {
          const lower = value.toLowerCase();

          if (lower === 'true') {
            value = true;
          }

          if (lower === 'false') {
            value = false;
          }
        }

        properties[key] = value;

        if (key.toLowerCase() === 'rarity') {
          rarity = String(value);
        }
      } catch {
        // ignore
      }
    }

    const normalizedType = rawInstance.token_type?.replace('-', '').toUpperCase();

    if (!['ERC721'].includes(normalizedType)) {
      return null;
    }

    return {
      id: rawInstance.id?.toString() || '',
      chain: this.chain,
      collectionId,
      owner: rawInstance.owner || owner,
      name: metadata.name || `#${rawInstance.id}`,
      image: baseParseIPFSUrl(image),
      externalUrl: rawInstance.external_app_url || undefined,
      rarity,
      description: metadata.description || undefined,
      properties: Object.keys(properties).length > 0 ? properties : null,
      type: normalizedType === 'ERC721' ? _AssetType.ERC721 : _AssetType.ERC721,
      originAsset: undefined,
      rmrk_ver: undefined,
      onChainOption: undefined,
      assetHubType: undefined
    };
  }

  private mapSdkToCollection (raw: SdkCollection): NftCollection {
    const token = raw.token || {};

    return {
      collectionId: token.address_hash,
      chain: this.chain,
      collectionName: token.name || token.symbol || 'Unknown Collection',
      image: token.icon_url || undefined,
      itemCount: Number(raw.amount) || raw.token_instances?.length || 0,
      externalUrl: undefined,
      originAsset: undefined
    };
  }

  // ==================== 1. PREVIEW – Dùng cho cron / background ====================
  async fetchPreview (addresses: string[]): Promise<NftHandlerResult> {
    const items: NftItem[] = [];
    const collections: NftCollection[] = [];

    const api = subwalletApiSdk.nftDetectionApi;

    if (!api?.getEvmNftCollectionsByAddress) {
      console.warn('[EvmNftHandler] Preview API not available');

      return { items, collections };
    }

    for (const address of addresses) {
      try {
        const rawData: SdkCollectionsByChain = await api.getEvmNftCollectionsByAddress(address);

        for (const [chain, sdkCollections] of Object.entries(rawData)) {
          if (chain !== this.chain || !Array.isArray(sdkCollections)) {
            continue;
          }

          for (const col of sdkCollections) {
            const collection = this.mapSdkToCollection(col);

            collections.push(collection);

            if (Array.isArray(col.token_instances)) {
              const mapped = col.token_instances
                .map((inst) => this.mapSdkToNftItem(inst, collection.collectionId, address))
                .filter((i): i is NftItem => i !== null);

              items.push(...mapped);
            }
          }
        }
      } catch (error) {
        console.error(`[EvmNftHandler] Preview failed for ${address}`, error);
      }
    }

    return {
      items: this.normalizeItems(items),
      collections: this.normalizeCollections(collections)
    };
  }

  // ==================== 2. FULL – Dùng khi user vào collection ====================
  async fetchFull (addresses: string[]): Promise<NftHandlerResult> {
    const items: NftItem[] = [];
    const collections: NftCollection[] = [];

    const api = subwalletApiSdk.nftDetectionApi;

    if (!api?.getAllNftInstances) {
      console.warn('[EvmNftHandler] Full API not available');

      return this.fetchPreview(addresses); // fallback về preview
    }

    // Lấy preview trước để biết collection nào cần fetch full
    const previewResult = await this.fetchPreview(addresses);

    collections.push(...previewResult.collections);

    for (const address of addresses) {
      for (const col of previewResult.collections) {
        try {
          const chainInfo = this.state.chainService.getChainInfoByKey(this.chain);
          const chainId = _getEvmChainId(chainInfo);

          if (!chainId) {
            continue;
          }

          const instances = await api.getAllNftInstances(
            col.collectionId,
            address,
            chainId.toString()
          );

          if (Array.isArray(instances)) {
            const fullItems = instances
              .map((inst) => this.mapSdkToNftItem(inst, col.collectionId, address))
              .filter((i): i is NftItem => i !== null);

            items.push(...fullItems);
          }
        } catch (error) {
          console.warn(`[EvmNftHandler] Full fetch failed for ${col.collectionId}`, error);
        }
      }
    }

    return {
      items: this.normalizeItems([...previewResult.items, ...items]),
      collections: this.normalizeCollections(collections)
    };
  }
}
