// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetType } from '@subwallet/chain-list/types';
import { NftCollection, NftFullListRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { baseParseIPFSUrl } from '@subwallet/extension-base/utils';
import { getKeypairTypeByAddress } from '@subwallet/keyring';
import { EthereumKeypairTypes } from '@subwallet/keyring/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';
import { BlockscoutNftInstanceRaw } from '@subwallet-monorepos/subwallet-services-sdk/services/blockscout/types';

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

interface SdkCollection {
  amount: string;
  token: SdkToken;
  token_instances: BlockscoutNftInstanceRaw[];
}

type SdkCollectionsByChain = Record<string, SdkCollection[]>;

function mapSdkToNftItem (
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

export default class NftService {
  private inProgress = new Set<string>();
  private state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  async fetchEvmCollectionsWithPreview (addresses: string[]) {
    for (const address of addresses) {
      const type = getKeypairTypeByAddress(address);
      const typeValid = [...EthereumKeypairTypes].includes(type);

      if (typeValid) {
        if (this.inProgress.has(address)) {
          console.log(`[NftService] ${address} already running`);

          continue;
        }

        this.inProgress.add(address);

        try {
          const nftDetectionApi = subwalletApiSdk.nftDetectionApi;

          if (!nftDetectionApi?.getEvmNftCollectionsByAddress) {
            console.warn('[NftService] NftDetectionApi not available');

            continue;
          }

          const rawData: SdkCollectionsByChain = await nftDetectionApi.getEvmNftCollectionsByAddress(address);

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
          console.warn(`[NftService] detect error for ${address}`, err);
        } finally {
          this.inProgress.delete(address);
        }
      }
    }
  }

  async getFullNftInstancesByCollection (request: NftFullListRequest): Promise<boolean> {
    const { chainInfo, contractAddress, owners } = request;
    const chainId = _getEvmChainId(chainInfo);

    if (!contractAddress || !owners || !chainId) {
      console.warn('[NftService] missing params for getFullNftInstancesByCollection');

      return false;
    }

    try {
      const nftDetectionApi = subwalletApiSdk.nftDetectionApi;

      if (!nftDetectionApi?.getAllNftInstances) {
        console.warn('[NftService] getAllNftInstances not available');

        return false;
      }

      const ownerList = Array.isArray(owners) ? owners : [owners];

      for (const eachOwner of ownerList) {
        try {
          const instances = await nftDetectionApi.getAllNftInstances(
            contractAddress,
            eachOwner,
            chainId.toString()
          );

          if (!Array.isArray(instances)) {
            continue;
          }

          const nftList = instances.map((inst) =>
            mapSdkToNftItem(inst, chainInfo.slug, contractAddress, eachOwner)
          );

          await this.state.handleDetectedNfts(eachOwner, nftList);
        } catch (innerErr) {
          console.warn(`[NftService] getAllNftInstances failed for ${eachOwner}`, innerErr);
        }
      }

      return true;
    } catch (err) {
      console.error(
        `[NftDetectionService] getFullNftInstancesByCollection error for ${contractAddress}`,
        err
      );

      return false;
    }
  }
}
