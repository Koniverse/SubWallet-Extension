// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftCollection, NftFullListRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { AbstractNftService } from '@subwallet/extension-base/services/nft-service/base/abstract-nft-service';
import { mapSdkToCollection, mapSdkToNftItem, SdkCollectionsByChain } from '@subwallet/extension-base/services/nft-service/multichain/evm/evm-nft-adapter';
import { getKeypairTypeByAddress } from '@subwallet/keyring';
import { EthereumKeypairTypes } from '@subwallet/keyring/types';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

/**
 * EvmNftService
 * - Uses SDK's nftDetectionApi for detection and detailed instance fetching
 * - Keeps only orchestration and state update logic
 * - Delegates mapping to adapter
 */

export default class EvmNftService extends AbstractNftService {
  private inProgress = new Set<string>();

  constructor (state: KoniState) {
    super(state);
  }

  async detectPreview (addresses: string[]) {
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

  async getFullNftInstances (request: NftFullListRequest): Promise<boolean> {
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
