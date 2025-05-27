// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetLogoMap, ChainLogoMap } from '@subwallet/chain-list';
import { _AssetType, _ChainAsset, _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import { LATEST_CHAIN_PATCH_FETCHING_INTERVAL, md5HashChainAsset, md5HashChainInfo } from '@subwallet/extension-base/services/chain-online-service/constants';
import { ChainService, filterAssetInfoMap } from '@subwallet/extension-base/services/chain-service';
import { _ChainApiStatus, _ChainConnectionStatus, _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { _isCustomAsset, _isCustomChain, _isEqualSmartContractAsset, fetchPatchData, PatchInfo, randomizeProvider } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import SettingService from '@subwallet/extension-base/services/setting-service/SettingService';
import { IChain } from '@subwallet/extension-base/services/storage-service/databases';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';

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
      Object.values(latestChainInfoMap).forEach((chainInfo) => {
        if (chainInfo.substrateInfo && chainInfo.substrateInfo.genesisHash === genesisHash) {
          duplicatedSlug = chainInfo.slug;
        }
      });
    } else if (evmChainId) {
      Object.values(latestChainInfoMap).forEach((chainInfo) => {
        if (chainInfo.evmInfo && chainInfo.evmInfo.evmChainId === evmChainId) {
          duplicatedSlug = chainInfo.slug;
        }
      });
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
      let addedChain: string[] = [];
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
                const duplicatedDefaultSlug = this.checkExistedPredefinedChain(latestChainInfo, storedChainInfo.substrateInfo?.genesisHash, storedChainInfo.evmInfo?.evmChainId);

                if (duplicatedDefaultSlug.length > 0) {
                  deprecatedChainMap[storedSlug] = duplicatedDefaultSlug;
                  deprecatedChains.push(storedSlug);
                }
              }
            }
          }

          chainInfoMap = this.mergeChainList(oldChainInfoMap, latestChainInfo);

          const [currentChainStateKey, newChainKey] = [Object.keys(currentChainStateMap), Object.keys(chainInfoMap)];

          addedChain = newChainKey.filter((chain) => !currentChainStateKey.includes(chain));

          addedChain.forEach((key) => {
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
          });
        }

        if (latestAssetInfo && Object.keys(latestAssetInfo).length > 0) {
          const storedAssetRegistry = await this.dbService.getAllAssetStore();
          const availableChains = Object.values(oldChainInfoMap)
            .filter((info) => (info.chainStatus === _ChainStatus.ACTIVE))
            .map((chainInfo) => chainInfo.slug);

          let finalAssetRegistry: Record<string, _ChainAsset> = {};

          if (storedAssetRegistry.length === 0) {
            finalAssetRegistry = oldAssetRegistry;
          } else {
            const mergedAssetRegistry: Record<string, _ChainAsset> = oldAssetRegistry;
            const parsedStoredAssetRegistry: Record<string, _ChainAsset> = {};

            // Update custom assets of merged custom chains
            Object.values(storedAssetRegistry).forEach((storedAsset) => {
              if (_isCustomAsset(storedAsset.slug) && Object.keys(deprecatedChainMap).includes(storedAsset.originChain)) {
                const newOriginChain = deprecatedChainMap[storedAsset.originChain];
                const newSlug = this.generateSlugForSmartContractAsset(newOriginChain, storedAsset.assetType, storedAsset.symbol, storedAsset.metadata?.contractAddress as string);

                deprecatedAssets.push(storedAsset.slug);
                parsedStoredAssetRegistry[newSlug] = {
                  ...storedAsset,
                  originChain: newOriginChain,
                  slug: newSlug
                };
              } else {
                parsedStoredAssetRegistry[storedAsset.slug] = storedAsset;
              }
            });

            for (const storedAssetInfo of Object.values(parsedStoredAssetRegistry)) {
              let duplicated = false;
              let deprecated = false;

              for (const defaultChainAsset of Object.values(latestAssetInfo)) {
                // case merge custom asset with default asset
                if (_isEqualSmartContractAsset(storedAssetInfo, defaultChainAsset)) {
                  duplicated = true;
                  break;
                }

                if (availableChains.indexOf(storedAssetInfo.originChain) === -1) {
                  deprecated = true;
                  break;
                }
              }

              if (!duplicated && !deprecated) {
                mergedAssetRegistry[storedAssetInfo.slug] = storedAssetInfo;
              } else {
                deprecatedAssets.push(storedAssetInfo.slug);
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
          this.chainService.autoEnableTokens()
            .then(() => {
              this.eventService.emit('asset.updateState', '');
            })
            .catch(console.error);

          this.chainService.setChainStateMap(currentChainStateMap);
          this.chainService.subscribeChainStateMap().next(currentChainStateMap);

          this.chainService.subscribeChainStatusMap().next(currentChainStatusMap);

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
      console.error('Error fetching latest patch data');
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
                    console.error('Error update latest patch', e);
                  })
                  .finally(resolve);
              })
              .catch((e) => {
                console.error('Asset fail to ready', e);
                resolve();
              });
          } else {
            resolve();
          }
        });
      }).catch((e) => {
        console.error('Error get latest patch or data map is locking', e);
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
