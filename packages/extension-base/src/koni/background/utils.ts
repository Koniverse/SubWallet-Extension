// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { MetadataItem } from '@subwallet/extension-base/background/KoniTypes';
import { wait } from '@subwallet/extension-base/utils';
import { metadataExpand } from '@subwallet/extension-chains/bundle';
import { MetadataDef } from '@subwallet/extension-inject/types';

import { Metadata, TypeRegistry } from '@polkadot/types';
import { ChainProperties } from '@polkadot/types/interfaces';
import { Registry, SignerPayloadJSON } from '@polkadot/types/types';

import KoniState from './handlers/State';

export interface RegistrySource{
  registry: Registry,
  specVersion: string | number,
}

export function getSuitableRegistry (registries: RegistrySource[], payload: SignerPayloadJSON) {
  const payloadSpecVersion = parseInt(payload.specVersion);
  const sortedRegistries = registries
    .filter((registrySource): registrySource is RegistrySource => registrySource.registry !== undefined)
    .map((registrySource) => {
      const specVersion = Number(registrySource.specVersion);
      const distance = Math.abs(specVersion - payloadSpecVersion);
      const isHigher = specVersion >= payloadSpecVersion;

      return {
        registry: registrySource.registry,
        specVersion,
        distance,
        isHigher
      };
    })
    .sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }

      return b.specVersion - a.specVersion;
    });

  return sortedRegistries[0].registry;
}

export async function setupApiRegistry (chainInfo: _ChainInfo | undefined, koniState: KoniState): Promise<RegistrySource | null> {
  if (!chainInfo) {
    return null;
  }

  try {
    const api = koniState.getSubstrateApi(chainInfo.slug).api;

    if (!api) {
      return null;
    }

    // Wait for the API to be ready or timeout after 1 second
    await Promise.race([
      wait(1000).then(() => {
        throw new Error('Timeout waiting for API to be ready');
      }),
      api.isReady
    ]);

    // Extract the spec version and registry
    const apiSpecVersion = api.runtimeVersion.specVersion.toString();
    const registry = api.registry as TypeRegistry;

    return {
      registry,
      specVersion: apiSpecVersion
    };
  } catch (e) {
    console.error('Error in setupApiRegistry:', e);

    return null;
  }
}

export async function setupDatabaseRegistry (chainInfo: _ChainInfo | undefined, payload: SignerPayloadJSON, koniState: KoniState): Promise<RegistrySource | null> {
  if (!chainInfo) {
    console.warn('setupDatabaseRegistry: Missing chainInfo');

    return null;
  }

  try {
    const metadata = await koniState.chainService.getMetadataByHash(payload.genesisHash) as MetadataItem;

    if (!metadata?.genesisHash) {
      console.warn('setupDatabaseRegistry: Metadata not found or invalid for genesisHash:', payload.genesisHash);

      return null;
    }

    const registry = new TypeRegistry();
    const _metadata = new Metadata(registry, metadata.hexValue);

    registry.register(metadata.types);
    registry.setChainProperties(registry.createType('ChainProperties', metadata.tokenInfo) as unknown as ChainProperties);
    registry.setMetadata(_metadata, payload.signedExtensions, metadata.userExtensions);

    return {
      registry,
      specVersion: metadata.specVersion
    };
  } catch (e) {
    console.error('setupDatabaseRegistry: Error setting up database registry:', e);

    return null;
  }
}

export function setupDappRegistry (payload: SignerPayloadJSON, koniState: KoniState): Promise<RegistrySource | null> {
  return new Promise((resolve) => {
    const metadata = koniState.knownMetadata.find((meta: MetadataDef) => meta.genesisHash === payload.genesisHash);

    if (!metadata?.genesisHash) {
      return resolve(null);
    }

    try {
      const expanded = metadataExpand(metadata, false);
      const registry = expanded.registry;

      registry.setSignedExtensions(payload.signedExtensions, expanded.definition.userExtensions);

      resolve({
        registry,
        specVersion: metadata.specVersion
      });
    } catch (e) {
      console.error('setupDappRegistry: Error setting up DApp registry:', e);

      resolve(null);
    }
  });
}
