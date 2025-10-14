// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { baseParseIPFSUrl } from '@subwallet/extension-base/utils';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

/**
 * NFT detection service
 * Responsible for managing NFT detection jobs per address
 */

interface SdkToken {
  address_hash: string;
  name?: string | null;
  symbol?: string | null;
  type?: _AssetType.ERC721;
  icon_url?: string | null;
}

interface SdkTokenInstance {
  id: string | number;
  image_url?: string | null;
  media_url?: string | null;
  animation_url?: string | null;
  external_app_url?: string | null;
  is_unique?: boolean | null;
  owner?: string | null;
  token_type?: _AssetType.ERC721;
  value?: string | null;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    external_url?: string;
    attributes?: Array<{ trait_type: string; value: any }>;
  };
}

interface SdkCollection {
  amount: string;
  token: SdkToken;
  token_instances: SdkTokenInstance[];
}

type SdkCollectionsByChain = Record<string, SdkCollection[]>;

function mapSdkToNftItem (
  rawInstance: SdkTokenInstance,
  chain: string,
  collectionId: string,
  owner: string
): NftItem {
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

      let value = attr.value as unknown as string | number | boolean | null;

      if (typeof value === 'string') {
        const lower = value.toLowerCase();

        if (lower === 'true') {
          value = true;
        } else if (lower === 'false') {
          value = false;
        }
      }

      properties[key] = value;

      if (key.toLowerCase() === 'rarity') {
        rarity = String(value);
      }
    } catch {
    }
  }

  const hasProperties = Object.keys(properties).length > 0;

  return {
    id: rawInstance.id?.toString(),
    chain,
    collectionId,
    owner: rawInstance.owner || owner,

    originAsset: undefined,
    name: metadata.name || `#${rawInstance.id}`,
    image: baseParseIPFSUrl(image),
    externalUrl: metadata.external_url || rawInstance.external_app_url || undefined,
    rarity,
    description: metadata.description || undefined,
    properties: hasProperties ? properties : null,

    type: rawInstance.token_type,
    rmrk_ver: undefined,
    onChainOption: undefined,
    assetHubType: undefined
  };
}

function mapSdkToCollection (raw: SdkCollection, chain: string): NftCollection {
  const token = raw.token || {};

  return {
    // must-have
    collectionId: token.address_hash,
    chain,
    originAsset: undefined,

    // optional
    collectionName: token.name || token.symbol || 'Unknown Collection',
    image: token.icon_url || undefined,
    itemCount: Number(raw.amount) || raw.token_instances?.length || 0,
    externalUrl: undefined
  };
}

export default class NftDetectionService {
  private inProgress = new Set<string>();
  private state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  async detectNft (address: string) {
    if (this.inProgress.has(address)) {
      console.log(`[NftDetectionService] ${address} already running`);

      return;
    }

    this.inProgress.add(address);

    try {
      const nftDetectionApi = subwalletApiSdk.nftDetectionApi;

      if (!nftDetectionApi?.getEvmNftData) {
        console.warn('[NftDetectionService] NftDetectionApi not available');

        return;
      }

      const rawData: SdkCollectionsByChain = await nftDetectionApi.getEvmNftData(address);

      const allItems: NftItem[] = [];
      const allCollections: NftCollection[] = [];

      for (const [chain, collections] of Object.entries(rawData)) {
        if (!Array.isArray(collections)) {
          continue;
        }

        for (const col of collections) {
          const mappedCollection = mapSdkToCollection(col, chain);

          allCollections.push(mappedCollection);

          if (Array.isArray(col.token_instances)) {
            const items = col.token_instances.map((inst) =>
              mapSdkToNftItem(inst, chain, mappedCollection.collectionId, address)
            );

            allItems.push(...items);
          }
        }
      }

      await this.state.handleDetectedNftCollections(allCollections);
      await this.state.handleDetectedNfts(address, allItems);
    } catch (err) {
      console.warn(`[NftDetectionService] detect error for ${address}`, err);
    } finally {
      this.inProgress.delete(address);
    }
  }
}
