// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetLogoMap, ChainLogoMap } from '@subwallet/chain-list';
import { _AssetType, _ChainAsset, _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { createLogger } from '@subwallet/extension-base/utils/logger';
import { LATEST_CHAIN_PATCH_FETCHING_INTERVAL, md5HashChainAsset, md5HashChainInfo } from '@subwallet/extension-base/services/chain-online-service/constants';
import { ChainService, filterAssetInfoMap } from '@subwallet/extension-base/services/chain-service';
import { _ChainApiStatus, _ChainConnectionStatus, _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _isCustomAsset, _isCustomChain, _isEqualSmartContractAsset, _isNativeToken, fetchPatchData, PatchInfo, randomizeProvider } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import SettingService from '@subwallet/extension-base/services/setting-service/SettingService';
import { IChain } from '@subwallet/extension-base/services/storage-service/databases';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';

const chainOnlineServiceLogger = createLogger('ChainOnlineService');

export class ChainOnlineService {
  private chainService: ChainService;
  private settingService: SettingService;
  private eventService: EventService;
  private dbService: DatabaseService;
  private firstApplied: boolean;

  refreshLatestChainDataTimeOut: NodeJS.Timer | undefined;

  constructor (chainService: ChainService, settingService: SettingService, eventService: EventService, dbService: DatabaseService) {
    this.chainService = chainService;
    this.settingService = settingService;
    this.eventService = eventService;
    this.dbService = dbService;
    this.firstApplied = false;
  }

  public resetFirstApplied (): void {
    this.firstApplied = false;
  }

  validatePatchWithHash (latestPatch: PatchInfo) {
    const { ChainAsset, ChainAssetHashMap, ChainInfo, ChainInfoHashMap } = latestPatch;

    for (const [chainSlug, chain] of Object.entries(ChainInfo)) {
      if (md5HashChainInfo(chain) !== ChainInfoHashMap[chainSlug]) {
        return false;
      }
    }

    for (const [assetSlug, asset] of Object.entries(ChainAsset)) {
      if (md5HashChainAsset(asset) !== ChainAssetHashMap[assetSlug]) {
        return false;
      }
    }

    return true;
  }

  validatePatchBeforeStore (candidateChainInfoMap: Record<string, _ChainInfo>, candidateAssetRegistry: Record<string, _ChainAsset>, latestPatch: PatchInfo) {
    for (const [chainSlug, chainHash] of Object.entries(latestPatch.ChainInfoHashMap)) {
      if (md5HashChainInfo(candidateChainInfoMap[chainSlug]) !== chainHash) {
        return false;
      }
    }

    for (const [assetSlug, assetHash] of Object.entries(latestPatch.ChainAssetHashMap)) {
      if (!candidateAssetRegistry[assetSlug]) {
        if (!latestPatch.ChainInfo[assetSlug]) { // assets are not existed in case chain is removed
          continue;
        }

        return false;
      }

      if (md5HashChainAsset(candidateAssetRegistry[assetSlug]) !== assetHash) {
        return false;
      }
    }

    return true;
  }

  mergeChainList (oldChainInfoMap: Record<string, _ChainInfo>, latestChainInfo: Record<string, _ChainInfo>) {
    const rs: Record<string, _ChainInfo> = structuredClone(oldChainInfoMap);

    for (const [slug, _info] of Object.entries(latestChainInfo)) {
      const { providers: _providers, ...info } = _info;
      const providers = rs[slug] ? rs[slug]?.providers : _providers;

      rs[slug] = {
        ...info,
        providers
      };
    }

    return rs;
  }

  checkExistedPredefinedChain (latestChainInfoMap: Record<string, _ChainInfo>, genesisHash?: string, evmChainId?: number) {
    let duplicatedSlug = '';

    if (genesisHash) {
      for (const chainInfo of Object.values(latestChainInfoMap)) {
        if (chainInfo.substrateInfo && chainInfo.substrateInfo.genesisHash === genesisHash) {
          duplicatedSlug = chainInfo.slug;
        }
      }
    } else if (evmChainId) {
      for (const chainInfo of Object.values(latestChainInfoMap)) {
        if (chainInfo.evmInfo && chainInfo.evmInfo.evmChainId === evmChainId) {
          duplicatedSlug = chainInfo.slug;
        }
      }
    }

    return duplicatedSlug;
  }

  generateSlugForSmartContractAsset (originChain: string, assetType: _AssetType, symbol: string, contractAddress: string) {
    return `${originChain}-${assetType}-${symbol}-${contractAddress}`;
  }

  async handleLatestPatch (latestPatch: PatchInfo) {
    try {
      // 1. validate fetch data with its hash
      const isSafePatch = this.validatePatchWithHash(latestPatch);
      const { AssetLogoMap: latestAssetLogoMap,
        ChainAsset: latestAssetInfo,
        ChainInfo: latestChainInfo,
        ChainLogoMap: latestChainLogoMap,
        patchVersion: latestPatchVersion } = latestPatch;
      const currentPatchVersion = (await this.settingService.getChainlistSetting())?.patchVersion || '';

      const oldChainInfoMap: Record<string, _ChainInfo> = structuredClone(this.chainService.getChainInfoMap());
      const oldAssetRegistry: Record<string, _ChainAsset> = structuredClone(this.chainService.getAssetRegistry());
      let chainInfoMap: Record<string, _ChainInfo> = structuredClone(this.chainService.getChainInfoMap());
      let assetRegistry: Record<string, _ChainAsset> = structuredClone(this.chainService.getAssetRegistry());
      const currentChainStateMap: Record<string, _ChainState> = structuredClone(this.chainService.getChainStateMap());
      const currentChainStatusMap: Record<string, _ChainApiStatus> = structuredClone(this.chainService.getChainStatusMap());
      const assetSetting: Record<string, AssetSetting> = structuredClone(await this.chainService.getAssetSettings());
      const migratedAssetSetting: Record<string, AssetSetting> = {};
      let addedChain: string[] = [];
      const customChains: string[] = [];
      const deprecatedChains: string[] = [];
      const deprecatedChainMap: Record<string, string> = {};
      const deprecatedAssets: string[] = [];

      if (isSafePatch && (!this.firstApplied || currentPatchVersion !== latestPatchVersion)) {
        this.firstApplied = true;

        // 2. merge data map
        if (latestChainInfo && Object.keys(latestChainInfo).length > 0) {
          const storedChainSettings = await this.dbService.getAllChainStore();
          const storedChainSettingMap: Record<string, IChain> = {};

          storedChainSettings.forEach((chainStoredSetting) => {
            storedChainSettingMap[chainStoredSetting.slug] = chainStoredSetting;
          });

          if (storedChainSettings.length > 0) {
            for (const [storedSlug, storedChainInfo] of Object.entries(storedChainSettingMap)) {
              if (_isCustomChain(storedSlug)) {
                // Check if this custom chain duplicates any of the latest chainInfo from patch based on genesisHash (for Substrate) or EVM chain ID.
                const duplicatedDefaultSlug = this.checkExistedPredefinedChain(latestChainInfo, storedChainInfo.substrateInfo?.genesisHash, storedChainInfo.evmInfo?.evmChainId);

                if (duplicatedDefaultSlug.length > 0) {
                  // Add the old custom chain slug to the list of deprecated chains.
                  deprecatedChainMap[storedSlug] = duplicatedDefaultSlug;
                  deprecatedChains.push(storedSlug);

                  const storedChainState = currentChainStateMap[storedSlug];
                  const storedChainStatus = currentChainStatusMap[storedSlug];

                  // Update the current chain state to use the new chain slug, inheriting the active/inactive status from custom chain and randomly assigning a provider
                  currentChainStateMap[duplicatedDefaultSlug] = {
                    slug: duplicatedDefaultSlug,
                    active: storedChainState.active,
                    currentProvider: randomizeProvider(latestChainInfo[duplicatedDefaultSlug].providers).providerKey,
                    manualTurnOff: storedChainState.manualTurnOff
                  };

                  // Update the current chain status to use the new chain slug, inheriting the connection status from custom chain and updating the last updated timestamp
                  currentChainStatusMap[duplicatedDefaultSlug] = {
                    slug: duplicatedDefaultSlug,
                    connectionStatus: storedChainStatus.connectionStatus,
                    lastUpdated: Date.now()
                  };

                  customChains.push(duplicatedDefaultSlug);

                  // Remove the deprecated custom chain's info from the old chain info map and the current state/status maps.
                  delete oldChainInfoMap[storedSlug];
                  delete currentChainStateMap[storedSlug];
                  delete currentChainStatusMap[storedSlug];
                }
              }
            }
          }

          chainInfoMap = this.mergeChainList(oldChainInfoMap, latestChainInfo);

          const [currentChainStateKey, newChainKey] = [Object.keys(currentChainStateMap), Object.keys(chainInfoMap)];

          addedChain = newChainKey.filter((chain) => !currentChainStateKey.includes(chain) || customChains.includes(chain));

          addedChain.forEach((key) => {
            if (!currentChainStateMap[key] && !currentChainStatusMap[key]) {
              currentChainStateMap[key] = {
                active: false,
                currentProvider: randomizeProvider(chainInfoMap[key].providers).providerKey,
                manualTurnOff: false,
                slug: key
              };

              currentChainStatusMap[key] = {
                slug: key,
                connectionStatus: _ChainConnectionStatus.DISCONNECTED,
                lastUpdated: Date.now()
              };
            }
          });
        }

        if (latestAssetInfo && Object.keys(latestAssetInfo).length > 0) {
          // Get all previously stored asset registry entries from the database.
          const storedAssetRegistry = await this.dbService.getAllAssetStore();
          const availableChains = Object.values(chainInfoMap)
            .filter((info) => (info.chainStatus === _ChainStatus.ACTIVE))
            .map((chainInfo) => chainInfo.slug);

          let finalAssetRegistry: Record<string, _ChainAsset>;

          if (storedAssetRegistry.length === 0) {
            finalAssetRegistry = oldAssetRegistry;
          } else {
            const mergedAssetRegistry: Record<string, _ChainAsset> = oldAssetRegistry;
            const parsedStoredAssetRegistry: Record<string, _ChainAsset> = {};

            // Update custom assets of merged custom chains
            for (const storedAsset of Object.values(storedAssetRegistry)) {
              // If the stored asset is a custom asset and its origin chain is marked as deprecated, and its assetType is ERC20
              if (_isCustomAsset(storedAsset.slug) && Object.keys(deprecatedChainMap).includes(storedAsset.originChain) && storedAsset.metadata?.contractAddress) {
                const newOriginChain = deprecatedChainMap[storedAsset.originChain];
                // const newSlug = this.generateSlugForSmartContractAsset(newOriginChain, storedAsset.assetType, storedAsset.symbol, storedAsset.metadata?.contractAddress);

                // Mark the old custom asset slug as deprecated.
                deprecatedAssets.push(storedAsset.slug);
                parsedStoredAssetRegistry[storedAsset.slug] = {
                  ...storedAsset,
                  originChain: newOriginChain
                };
              } else {
                parsedStoredAssetRegistry[storedAsset.slug] = storedAsset;
              }
            }

            for (const storedAssetInfo of Object.values(parsedStoredAssetRegistry)) {
              let duplicated = false;
              let deprecated = false;
              let defaultSlugForMigration: string | undefined;

              for (const defaultChainAsset of Object.values(latestAssetInfo)) {
                // case: the stored asset is the same to a smart contract asset from patch
                if (_isEqualSmartContractAsset(storedAssetInfo, defaultChainAsset)) {
                  duplicated = true;
                  defaultSlugForMigration = defaultChainAsset.slug;
                  break;
                }

                // case: the origin chain of the stored asset is no longer active (Exp: custom chain is deprecated)
                if (availableChains.indexOf(storedAssetInfo.originChain) === -1) {
                  deprecated = true;
                  defaultSlugForMigration = defaultChainAsset.slug;
                  break;
                }
              }

              // If the stored asset is a duplicate of a default asset or its origin chain is deprecated.
              if (duplicated || deprecated) {
                if (Object.keys(assetSetting).includes(storedAssetInfo.slug)) {
                  const isVisible = assetSetting[storedAssetInfo.slug].visible;

                  // Migrate assetSetting from custom token to token from patch
                  if (defaultSlugForMigration) {
                    migratedAssetSetting[defaultSlugForMigration] = { visible: isVisible };
                    delete assetSetting[storedAssetInfo.slug];
                  }
                }

                delete mergedAssetRegistry[storedAssetInfo.slug];

                deprecatedAssets.push(storedAssetInfo.slug);
              } else {
                // If the stored asset is not a duplicate and its origin chain is active, keep it in the merged registry.
                mergedAssetRegistry[storedAssetInfo.slug] = storedAssetInfo;
              }
            }

            finalAssetRegistry = mergedAssetRegistry;
          }

          assetRegistry = filterAssetInfoMap(oldChainInfoMap, Object.assign({}, finalAssetRegistry, latestAssetInfo), addedChain);
        }

        // 3. validate data before write
        const isCorrectPatch = this.validatePatchBeforeStore(chainInfoMap, assetRegistry, latestPatch);

        // 4. write to subject
        if (isCorrectPatch) {
          this.chainService.setChainInfoMap(chainInfoMap);
          this.chainService.subscribeChainInfoMap().next(chainInfoMap);

          this.chainService.setAssetRegistry(assetRegistry);
          this.chainService.subscribeAssetRegistry().next(assetRegistry);

          this.chainService.setChainStateMap(currentChainStateMap);
          this.chainService.subscribeChainStateMap().next(currentChainStateMap);

          this.chainService.subscribeChainStatusMap().next(currentChainStatusMap);
          // Migrate assetSetting
          this.chainService.setAssetSettings({
            ...assetSetting,
            ...migratedAssetSetting
          });

          // Remove all custom chains and custom tokens that is duplicated from chains or tokens in patch
          await this.dbService.removeFromChainStore(deprecatedChains);
          await this.dbService.removeFromAssetStore(deprecatedAssets);

          const storedChainInfoList: IChain[] = Object.keys(chainInfoMap).map((chainSlug) => {
            return {
              ...chainInfoMap[chainSlug],
              ...currentChainStateMap[chainSlug]
            };
          });

          await this.dbService.bulkUpdateChainStore(storedChainInfoList);

          const addedAssets: _ChainAsset[] = [];

          // todo: the stored asset is lack of adding new assets and edited assets of old chain, update to tracking exactly updated assets from patch online.
          Object.entries(assetRegistry).forEach(([slug, asset]) => {
            if (addedChain.includes(asset.originChain)) {
              addedAssets.push(asset);
            }
          });

          await this.dbService.bulkUpdateAssetsStore(addedAssets);

          if (latestChainLogoMap) {
            const logoMap = Object.assign({}, ChainLogoMap, latestChainLogoMap);

            this.chainService.subscribeChainLogoMap().next(logoMap);
          }

          if (latestAssetLogoMap) {
            const logoMap = Object.assign({}, AssetLogoMap, latestAssetLogoMap);

            this.chainService.subscribeAssetLogoMap().next(logoMap);
          }

          this.settingService.setChainlist({ patchVersion: latestPatchVersion });
        }
      }
    } catch (e) {
      chainOnlineServiceLogger.error('Error fetching latest patch data');
    }
  }

  private async fetchLatestPatchData () {
    return await fetchPatchData<PatchInfo>();
  }

  handleLatestPatchData () {
    this.fetchLatestPatchData()
      .then((latestPatch) => {
        return new Promise<void>((resolve) => {
          if (latestPatch && !this.chainService.getlockChainInfoMap()) {
            this.eventService.waitAssetReady
              .then(() => {
                this.chainService.setLockChainInfoMap(true);
                this.handleLatestPatch(latestPatch)
                  .then(() => this.chainService.setLockChainInfoMap(false))
                  .catch((e) => {
                    this.chainService.setLockChainInfoMap(false);
                    chainOnlineServiceLogger.error('Error update latest patch', e);
                  })
                  .finally(resolve);
              })
              .catch((e) => {
                chainOnlineServiceLogger.error('Asset fail to ready', e);
                resolve();
              });
          } else {
            resolve();
          }
        });
      }).catch((e) => {
        chainOnlineServiceLogger.error('Error get latest patch or data map is locking', e);
      }).finally(() => {
        this.eventService.emit('asset.online.ready', true);
      });
  }

  checkLatestData () {
    clearInterval(this.refreshLatestChainDataTimeOut);
    this.handleLatestPatchData();

    this.refreshLatestChainDataTimeOut = setInterval(this.handleLatestPatchData.bind(this), LATEST_CHAIN_PATCH_FETCHING_INTERVAL);
  }
}
