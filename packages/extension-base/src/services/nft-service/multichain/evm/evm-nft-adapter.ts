// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { baseParseIPFSUrl } from '@subwallet/extension-base/utils';
import { BlockscoutNftInstanceRaw } from '@subwallet-monorepos/subwallet-services-sdk/services/blockscout/types';

/**
 * Adapter: map SDK raw (blockscout) data -> internal NftItem / NftCollection
 * Keep all mapping logic in adapter so EvmNftService remains clean.
 */

export interface SdkToken {
  address_hash: string;
  name?: string | null;
  symbol?: string | null;
  type?: _AssetType.ERC721;
  icon_url?: string | null;
}

export interface SdkCollection {
  amount: string;
  token: SdkToken;
  token_instances: BlockscoutNftInstanceRaw[];
}

export type SdkCollectionsByChain = Record<string, SdkCollection[]>;

export function mapSdkToNftItem (
  rawInstance: BlockscoutNftInstanceRaw,
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
  const normalizedType = rawInstance.token_type?.replace('-', '')?.toUpperCase();

  return {
    id: rawInstance.id?.toString(),
    chain,
    collectionId,
    owner: rawInstance.owner || owner,

    originAsset: undefined,
    name: metadata.name || `#${rawInstance.id}`,
    image: baseParseIPFSUrl(image),
    externalUrl: rawInstance.external_app_url || undefined,
    rarity,
    description: metadata.description || undefined,
    properties: hasProperties ? properties : null,

    type: normalizedType === 'ERC721' ? _AssetType.ERC721 : _AssetType.ERC721, // currently only support ERC721
    rmrk_ver: undefined,
    onChainOption: undefined,
    assetHubType: undefined
  };
}

export function mapSdkToCollection (raw: SdkCollection, chain: string): NftCollection {
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
