// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionUnspentOutput } from '@emurgo/cardano-serialization-lib-nodejs';
import { AssetLogoMap, AssetRefMap, ChainAssetMap, ChainInfoMap, ChainLogoMap, MultiChainAssetMap } from '@subwallet/chain-list';
import { _AssetRef, _AssetRefPath, _AssetType, _CardanoInfo, _ChainAsset, _ChainInfo, _ChainStatus, _EvmInfo, _MultiChainAsset, _SubstrateChainType, _SubstrateInfo, _TonInfo } from '@subwallet/chain-list/types';
import { AssetSetting, CardanoPaginate, MetadataItem, SufficientChainsDetails, TokenPriorityDetails, ValidateNetworkResponse } from '@subwallet/extension-base/background/KoniTypes';
import { CardanoUtxosItem } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/cardano/types';
import { _DEFAULT_ACTIVE_CHAINS, _ZK_ASSET_PREFIX, LATEST_CHAIN_DATA_FETCHING_INTERVAL } from '@subwallet/extension-base/services/chain-service/constants';
import { BitcoinChainHandler } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/BitcoinChainHandler';
import { CardanoChainHandler } from '@subwallet/extension-base/services/chain-service/handler/CardanoChainHandler';
import { EvmChainHandler } from '@subwallet/extension-base/services/chain-service/handler/EvmChainHandler';
import { MantaPrivateHandler } from '@subwallet/extension-base/services/chain-service/handler/manta/MantaPrivateHandler';
import { SubstrateChainHandler } from '@subwallet/extension-base/services/chain-service/handler/SubstrateChainHandler';
import { TonChainHandler } from '@subwallet/extension-base/services/chain-service/handler/TonChainHandler';
import { _CHAIN_VALIDATION_ERROR } from '@subwallet/extension-base/services/chain-service/handler/types';
import { _ChainApiStatus, _ChainConnectionStatus, _ChainState, _CUSTOM_PREFIX, _DataMap, _EvmApi, _NetworkUpsertParams, _NFT_CONTRACT_STANDARDS, _SMART_CONTRACT_STANDARDS, _SmartContractTokenInfo, _SubstrateApi, _ValidateCustomAssetRequest, _ValidateCustomAssetResponse } from '@subwallet/extension-base/services/chain-service/types';
import { _getAssetOriginChain, _getTokenOnChainAssetId, _isAssetAutoEnable, _isAssetCanPayTxFee, _isAssetFungibleToken, _isChainBitcoinCompatible, _isChainEnabled, _isCustomAsset, _isCustomChain, _isCustomProvider, _isEqualContractAddress, _isEqualSmartContractAsset, _isLocalToken, _isMantaZkAsset, _isNativeToken, _isPureBitcoinChain, _isPureEvmChain, _isPureSubstrateChain, _parseAssetRefKey, randomizeProvider, updateLatestChainInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { MYTHOS_MIGRATION_KEY } from '@subwallet/extension-base/services/migration-service/scripts';
import { convertUtxoRawToUtxo } from '@subwallet/extension-base/services/request-service/helper';
import { IChain, IMetadataItem, IMetadataV15Item } from '@subwallet/extension-base/services/storage-service/databases';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import AssetSettingStore from '@subwallet/extension-base/stores/AssetSetting';
import { addLazy, calculateMetadataHash, fetchStaticData, filterAssetsByChainAndType, getShortMetadata, MODULE_SUPPORT, reformatAddress } from '@subwallet/extension-base/utils';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';

import { isArray } from '@polkadot/util';
import { logger as createLogger } from '@polkadot/util/logger';
import { HexString, Logger } from '@polkadot/util/types';
import { ExtraInfo } from '@polkadot-api/merkleize-metadata';

const filterChainInfoMap = (data: Record<string, _ChainInfo>, ignoredChains: string[]): Record<string, _ChainInfo> => {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([slug, info]) => !ignoredChains.includes(slug))
  );
};
// .filter(([slug, info]) => !info.bitcoinInfo && !ignoredChains.includes(slug))

const ignoredList = [
  'bevm',
  'bevmTest',
  'bevm_testnet',
  'layerEdge_testnet',
  'merlinEvm',
  'botanixEvmTest',
  'syscoin_evm',
  'syscoin_evm_testnet',
  'rollux_evm',
  'rollux_testnet',
  'boolAlpha',
  'boolBeta_testnet',
  'core',
  'satoshivm',
  'satoshivm_testnet',
  'storyPartner_testnet'
];

export const filterAssetInfoMap = (chainInfo: Record<string, _ChainInfo>, assets: Record<string, _ChainAsset>, addedChains?: string[]): Record<string, _ChainAsset> => {
  return Object.fromEntries(
    Object.entries(assets)
      .filter(([, info]) => {
        const isBitcoinChain = chainInfo?.[info.originChain] && _isChainBitcoinCompatible(chainInfo[info.originChain]);

        if (isBitcoinChain) {
          return ![_AssetType.RUNE, _AssetType.BRC20].includes(info.assetType);
        }

        return chainInfo[info.originChain] || addedChains?.includes(info.originChain);
      })
  );
};

export class ChainService {
  private dataMap: _DataMap = {
    chainInfoMap: {},
    chainStateMap: {},
    assetRegistry: {},
    assetRefMap: {}
  };

  private dbService: DatabaseService; // to save chain, token settings from user
  private eventService: EventService;

  private lockChainInfoMap = false; // prevent unwanted changes (edit, enable, disable) to chainInfoMap

  private substrateChainHandler: SubstrateChainHandler;
  private evmChainHandler: EvmChainHandler;
  private bitcoinChainHandler: BitcoinChainHandler;
  private tonChainHandler: TonChainHandler;
  private cardanoChainHandler: CardanoChainHandler;
  private mantaChainHandler: MantaPrivateHandler | undefined;

  refreshLatestChainDataTimeOut: NodeJS.Timer | undefined;

  public get mantaPay () {
    return this.mantaChainHandler;
  }

  // TODO: consider BehaviorSubject
  private chainInfoMapSubject = new Subject<Record<string, _ChainInfo>>();
  private chainStateMapSubject = new Subject<Record<string, _ChainState>>();
  private chainStatusMapSubject = new BehaviorSubject<Record<string, _ChainApiStatus>>({});
  private assetRegistrySubject = new Subject<Record<string, _ChainAsset>>();
  private multiChainAssetMapSubject = new Subject<Record<string, _MultiChainAsset>>();
  private xcmRefMapSubject = new Subject<Record<string, _AssetRef>>();
  private swapRefMapSubject = new Subject<Record<string, _AssetRef>>();
  private assetLogoMapSubject = new BehaviorSubject<Record<string, string>>(AssetLogoMap);
  private chainLogoMapSubject = new BehaviorSubject<Record<string, string>>(ChainLogoMap);
  private ledgerGenericAllowChainsSubject = new BehaviorSubject<string[]>([]);
  private priorityTokensSubject = new BehaviorSubject({} as TokenPriorityDetails);
  private sufficientChainsSubject = new BehaviorSubject({} as SufficientChainsDetails);

  // Todo: Update to new store indexed DB
  private store: AssetSettingStore = new AssetSettingStore();
  private assetSettingSubject = new BehaviorSubject({} as Record<string, AssetSetting>);

  private logger: Logger;

  constructor (dbService: DatabaseService, eventService: EventService) {
    this.dbService = dbService;
    this.eventService = eventService;

    this.chainInfoMapSubject.next(this.dataMap.chainInfoMap);
    this.chainStateMapSubject.next(this.dataMap.chainStateMap);
    this.assetRegistrySubject.next(this.dataMap.assetRegistry);
    this.xcmRefMapSubject.next(this.xcmRefMap);
    this.swapRefMapSubject.next(this.swapRefMap);

    if (MODULE_SUPPORT.MANTA_ZK) {
      console.log('Init Manta ZK');
      this.mantaChainHandler = new MantaPrivateHandler(dbService);
    }

    this.substrateChainHandler = new SubstrateChainHandler(this);
    this.evmChainHandler = new EvmChainHandler(this);
    this.tonChainHandler = new TonChainHandler(this);
    this.cardanoChainHandler = new CardanoChainHandler(this);
    this.bitcoinChainHandler = new BitcoinChainHandler(this);

    this.logger = createLogger('chain-service');
  }

  public get value () {
    const ledgerGenericAllowChains = this.ledgerGenericAllowChainsSubject;
    const priorityTokens = this.priorityTokensSubject;
    const sufficientChains = this.sufficientChainsSubject;

    return {
      get ledgerGenericAllowChains () {
        return ledgerGenericAllowChains.value;
      },
      get priorityTokens () {
        return priorityTokens.value;
      },
      get sufficientChains () {
        return sufficientChains.value;
      }
    };
  }

  public get observable () {
    const ledgerGenericAllowChains = this.ledgerGenericAllowChainsSubject;
    const priorityTokens = this.priorityTokensSubject;
    const sufficientChains = this.sufficientChainsSubject;

    return {
      get ledgerGenericAllowChains () {
        return ledgerGenericAllowChains.asObservable();
      },
      get priorityTokens () {
        return priorityTokens.asObservable();
      },
      get sufficientChains () {
        return sufficientChains.asObservable();
      }
    };
  }

  public subscribeSwapRefMap () {
    return this.swapRefMapSubject;
  }

  // Getter
  get xcmRefMap () {
    const result: Record<string, _AssetRef> = {};

    Object.entries(this.dataMap.assetRefMap).forEach(([key, assetRef]) => {
      if (assetRef.path === _AssetRefPath.XCM) {
        result[key] = assetRef;
      }
    });

    return result;
  }

  get swapRefMap () {
    const result: Record<string, _AssetRef> = {};

    Object.entries(this.dataMap.assetRefMap).forEach(([key, assetRef]) => {
      if (assetRef.path === _AssetRefPath.SWAP) {
        result[key] = assetRef;
      }
    });

    return result;
  }

  public getlockChainInfoMap () {
    return this.lockChainInfoMap;
  }

  public setLockChainInfoMap (isLock: boolean) {
    this.lockChainInfoMap = isLock;
  }

  public getEvmApi (slug: string) {
    return this.evmChainHandler.getEvmApiByChain(slug);
  }

  public getEvmApiMap () {
    return this.evmChainHandler.getEvmApiMap();
  }

  public getSubstrateApi (slug: string) {
    return this.substrateChainHandler.getSubstrateApiByChain(slug);
  }

  public getSubstrateApiMap () {
    return this.substrateChainHandler.getSubstrateApiMap();
  }

  public getBitcoinApi (slug: string) {
    return this.bitcoinChainHandler.getApiByChain(slug);
  }

  public getBitcoinApiMap () {
    return this.bitcoinChainHandler.getApiMap();
  }

  public getTonApi (slug: string) {
    return this.tonChainHandler.getTonApiByChain(slug);
  }

  public getTonApiMap () {
    return this.tonChainHandler.getTonApiMap();
  }

  public getCardanoApi (slug: string) {
    return this.cardanoChainHandler.getCardanoApiByChain(slug);
  }

  public async getUtxosByAddress (address: string, slug: string, paginate?: CardanoPaginate): Promise<TransactionUnspentOutput[]> {
    const cardanoApi = this.getCardanoApi(slug);

    const isTestnet = slug === 'cardano_preproduction';

    const formattedAddress = isTestnet ? reformatAddress(address, 0) : address;
    const limit = paginate?.limit || 100;
    const utxos: CardanoUtxosItem[] = [];
    let needStop = false;
    let page = (paginate?.page || 0) + 1;

    while (!needStop) {
      const utxoRaw = await cardanoApi.getUtxos(formattedAddress, page, limit);

      if (utxoRaw.length === 0 || !isArray(utxoRaw)) {
        needStop = true;
      } else {
        utxos.push(...utxoRaw);
        page++;
      }
    }

    return convertUtxoRawToUtxo(utxos);
  }

  public getSpecificUtxo (slug: string) {
    const cardanoApi = this.getCardanoApi(slug);

    return async (txHash: string, txId: number): Promise<CardanoUtxosItem | undefined> => {
      const utxoRaw = await cardanoApi.getSpecificUtxo(txHash);

      if (!utxoRaw?.outputs) {
        return undefined;
      }

      return utxoRaw.outputs[txId];
    };
  }

  public getCardanoApiMap () {
    return this.cardanoChainHandler.getCardanoApiMap();
  }

  public getChainCurrentProviderByKey (slug: string) {
    const providerName = this.getChainStateByKey(slug).currentProvider;
    const providerMap = this.getChainInfoByKey(slug).providers;
    const endpoint = providerMap[providerName];

    return {
      endpoint,
      providerName
    };
  }

  public subscribeChainInfoMap () {
    return this.chainInfoMapSubject;
  }

  public subscribeAssetRegistry () {
    return this.assetRegistrySubject;
  }

  public subscribeMultiChainAssetMap () {
    return this.multiChainAssetMapSubject;
  }

  public subscribeXcmRefMap () {
    return this.xcmRefMapSubject;
  }

  public subscribeChainStateMap () {
    return this.chainStateMapSubject;
  }

  public subscribeChainStatusMap () {
    return this.chainStatusMapSubject;
  }

  public getAssetRegistry () {
    return this.dataMap.assetRegistry;
  }

  public setAssetRegistry (assetRegistry: Record<string, _ChainAsset>) {
    this.dataMap.assetRegistry = assetRegistry;
  }

  public getMultiChainAssetMap () {
    return MultiChainAssetMap;
  }

  public getSmartContractTokens () {
    const filteredAssetRegistry: Record<string, _ChainAsset> = {};

    Object.values(this.getAssetRegistry()).forEach((asset) => {
      if (_SMART_CONTRACT_STANDARDS.includes(asset.assetType)) {
        filteredAssetRegistry[asset.slug] = asset;
      }
    });

    return filteredAssetRegistry;
  }

  public getAssetHubToken () {
    const assetHubToken: Record<string, _ChainAsset> = {};

    Object.values(this.getAssetRegistry()).forEach((asset) => {
      if (['statemint', 'statemine'].includes(asset.originChain)) {
        assetHubToken[asset.slug] = asset;
      }
    });

    return assetHubToken;
  }

  public getHydrationAssetIdMap (chain: string): Record<string, string> {
    const hydrationAssetIdMap: Record<string, string> = {};

    Object.values(this.getAssetRegistry()).forEach((asset) => {
      const originChain = _getAssetOriginChain(asset);
      const assetId = _getTokenOnChainAssetId(asset);

      if (originChain === chain && assetId !== '-1') {
        hydrationAssetIdMap[asset.slug] = assetId;
      }
    });

    return hydrationAssetIdMap;
  }

  public getChainInfoMap (): Record<string, _ChainInfo> {
    return this.dataMap.chainInfoMap;
  }

  public setChainInfoMap (chainInfoMap: Record<string, _ChainInfo>) {
    this.dataMap.chainInfoMap = chainInfoMap;
  }

  public getEvmChainInfoMap (): Record<string, _ChainInfo> {
    const result: Record<string, _ChainInfo> = {};

    Object.values(this.getChainInfoMap()).forEach((chainInfo) => {
      if (_isPureEvmChain(chainInfo)) {
        result[chainInfo.slug] = chainInfo;
      }
    });

    return result;
  }

  public getSubstrateChainInfoMap (): Record<string, _ChainInfo> {
    const result: Record<string, _ChainInfo> = {};

    Object.values(this.getChainInfoMap()).forEach((chainInfo) => {
      if (_isPureSubstrateChain(chainInfo)) {
        result[chainInfo.slug] = chainInfo;
      }
    });

    return result;
  }

  public getAllPriceIds () {
    const result: string[] = [];

    Object.values(this.getAssetRegistry()).forEach((assetInfo) => {
      if (assetInfo.priceId !== null) {
        result.push(assetInfo.priceId);
      }
    });

    return result;
  }

  public getNativeTokenInfo (chainSlug: string) {
    let nativeTokenInfo: _ChainAsset = {
      assetType: _AssetType.NATIVE,
      decimals: 0,
      metadata: null,
      minAmount: '',
      multiChainAsset: '',
      name: '',
      originChain: '',
      priceId: '',
      slug: '',
      symbol: '',
      hasValue: true,
      icon: ''
    };

    for (const assetInfo of Object.values(this.getAssetRegistry())) {
      if (assetInfo.assetType === _AssetType.NATIVE && assetInfo.originChain === chainSlug) {
        nativeTokenInfo = assetInfo;
        break;
      }
    }

    return nativeTokenInfo;
  }

  public getAssetRefMap () {
    return this.dataMap.assetRefMap;
  }

  public getChainStateMap () {
    return this.dataMap.chainStateMap;
  }

  public setChainStateMap (chainStateMap: Record<string, _ChainState>) {
    this.dataMap.chainStateMap = chainStateMap;
  }

  public getChainStateByKey (key: string) {
    return this.dataMap.chainStateMap[key];
  }

  public getChainStatusMap () {
    return this.chainStatusMapSubject.getValue();
  }

  public getChainStatusByKey (key: string) {
    return this.getChainStatusMap()[key];
  }

  public getActiveChains () {
    return Object.entries(this.dataMap.chainStateMap)
      .filter(([, chainState]) => _isChainEnabled(chainState))
      .map(([key]) => key);
  }

  public getSupportedSmartContractTypes () {
    return [_AssetType.ERC20, _AssetType.ERC721, _AssetType.PSP22, _AssetType.PSP34, _AssetType.GRC20, _AssetType.GRC721, _AssetType.VFT];
  }

  public getActiveChainInfoMap () {
    const result: Record<string, _ChainInfo> = {};

    Object.values(this.getChainInfoMap()).forEach((chainInfo) => {
      const chainState = this.getChainStateByKey(chainInfo.slug);

      if (_isChainEnabled(chainState)) {
        result[chainInfo.slug] = chainInfo;
      }
    });

    return result;
  }

  public getActiveChainSlugs () {
    const result: string[] = [];

    Object.values(this.getChainInfoMap()).forEach((chainInfo) => {
      const chainState = this.getChainStateByKey(chainInfo.slug);

      if (_isChainEnabled(chainState)) {
        result.push(chainInfo.slug);
      }
    });

    return result;
  }

  public getChainInfoByKey (key: string): _ChainInfo {
    return this.dataMap.chainInfoMap[key];
  }

  public getActiveChainInfos () {
    const result: Record<string, _ChainInfo> = {};

    Object.values(this.getChainStateMap()).forEach((chainState) => {
      const chainInfo = this.getChainInfoByKey(chainState.slug);

      if (chainState.active && chainInfo && chainInfo.chainStatus === _ChainStatus.ACTIVE) {
        result[chainState.slug] = chainInfo;
      }
    });

    return result;
  }

  public getAssetBySlug (slug: string): _ChainAsset {
    return this.getAssetRegistry()[slug];
  }

  public getMantaZkAssets (chain: string): Record<string, _ChainAsset> {
    const result: Record<string, _ChainAsset> = {};

    Object.values(this.getAssetRegistry()).forEach((chainAsset) => {
      if (chainAsset.originChain === chain && _isAssetFungibleToken(chainAsset) && chainAsset.symbol.startsWith(_ZK_ASSET_PREFIX)) {
        result[chainAsset.slug] = chainAsset;
      }
    });

    return result;
  }

  public getFungibleTokensByChain (chainSlug: string, checkActive = false): Record<string, _ChainAsset> {
    const result: Record<string, _ChainAsset> = {};
    const assetSettings = this.assetSettingSubject.value;

    Object.values(this.getAssetRegistry()).forEach((chainAsset) => {
      const _filterActive = !checkActive || assetSettings[chainAsset.slug]?.visible;

      if (chainAsset.originChain === chainSlug && _isAssetFungibleToken(chainAsset) && _filterActive) {
        result[chainAsset.slug] = chainAsset;
      }
    });

    return result;
  }

  public getXcmEqualAssetByChain (destinationChainSlug: string, originTokenSlug: string) {
    let destinationTokenInfo: _ChainAsset | undefined;

    for (const asset of Object.values(this.getAssetRegistry())) {
      if (asset.originChain === destinationChainSlug) { // check
        const assetRefKey = _parseAssetRefKey(originTokenSlug, asset.slug);
        const assetRef = this.xcmRefMap[assetRefKey];

        if (assetRef && assetRef.path === _AssetRefPath.XCM) { // there's only 1 corresponding token on 1 chain
          destinationTokenInfo = asset;
          break;
        }
      }
    }

    return destinationTokenInfo;
  }

  public getAssetByChainAndType (chainSlug: string, assetTypes: _AssetType[]) {
    return filterAssetsByChainAndType(this.getAssetRegistry(), chainSlug, assetTypes);
  }

  public getSmartContractNfts () {
    const result: _ChainAsset[] = [];

    Object.values(this.getAssetRegistry()).forEach((assetInfo) => {
      if (_NFT_CONTRACT_STANDARDS.includes(assetInfo.assetType)) {
        result.push(assetInfo);
      }
    });

    return result;
  }

  // Setter
  public forceRemoveChain (slug: string) {
    if (this.lockChainInfoMap) {
      return false;
    }

    const chainInfoMap = this.getChainInfoMap();
    const chainStateMap = this.getChainStateMap();

    if (!(slug in chainInfoMap)) {
      return false;
    }

    this.lockChainInfoMap = true;

    delete chainStateMap[slug];
    delete chainInfoMap[slug];
    this.deleteAssetsByChain(slug);
    this.dbService.removeFromChainStore([slug]).catch(console.error);

    this.updateChainSubscription();

    this.lockChainInfoMap = false;

    this.eventService.emit('chain.updateState', slug);

    return true;
  }

  public removeCustomChain (slug: string) {
    if (this.lockChainInfoMap) {
      return false;
    }

    const chainInfoMap = this.getChainInfoMap();
    const chainStateMap = this.getChainStateMap();

    if (!(slug in chainInfoMap)) {
      return false;
    }

    if (!_isCustomChain(slug)) {
      return false;
    }

    if (chainStateMap[slug].active) {
      return false;
    }

    this.lockChainInfoMap = true;

    delete chainStateMap[slug];
    delete chainInfoMap[slug];
    this.deleteAssetsByChain(slug);
    this.dbService.removeFromChainStore([slug]).catch(console.error);

    this.updateChainSubscription();

    this.lockChainInfoMap = false;

    this.eventService.emit('chain.updateState', slug);

    return true;
  }

  public resetChainInfoMap (excludedChains?: string[]) {
    if (this.lockChainInfoMap) {
      return false;
    }

    this.lockChainInfoMap = true;

    const chainStateMap = this.getChainStateMap();

    for (const [slug, chainState] of Object.entries(chainStateMap)) {
      if (!_DEFAULT_ACTIVE_CHAINS.includes(slug) && !excludedChains?.includes(slug)) {
        chainState.active = false;
      }
    }

    this.updateChainStateMapSubscription();

    this.lockChainInfoMap = false;

    return true;
  }

  private connectionStatusQueueMap = {} as Record<string, _ChainConnectionStatus>;

  public updateChainConnectionStatus (slug: string, connectionStatus: _ChainConnectionStatus) {
    this.connectionStatusQueueMap[slug] = connectionStatus;

    addLazy('updateChainConnectionStatus', () => {
      const chainStatusMap = this.getChainStatusMap();
      let update = false;

      Object.entries(this.connectionStatusQueueMap).forEach(([slug, status]) => {
        if (chainStatusMap[slug]) {
          if (chainStatusMap[slug].connectionStatus !== status) {
            chainStatusMap[slug].connectionStatus = status;
            chainStatusMap[slug].lastUpdated = Date.now();
            update = true;
          }
        } else {
          chainStatusMap[slug] = {
            slug,
            connectionStatus: status,
            lastUpdated: Date.now()
          };
          update = true;
        }
      });

      this.connectionStatusQueueMap = {};
      update && this.chainStatusMapSubject.next(chainStatusMap);
    });
  }

  public upsertCustomToken (token: _ChainAsset) {
    if (token.slug.length === 0) { // new token
      if (token.assetType === _AssetType.NATIVE || token.assetType === _AssetType.LOCAL) {
        const defaultSlug = this.generateSlugForNativeToken(token.originChain, token.assetType, token.symbol);

        token.slug = `${_CUSTOM_PREFIX}${defaultSlug}`;
      } else {
        const defaultSlug = this.generateSlugForSmartContractAsset(token.originChain, token.assetType, token.symbol, token.metadata?.contractAddress as string);

        token.slug = `${_CUSTOM_PREFIX}${defaultSlug}`;
      }
    }

    if (token.originChain && (_isAssetFungibleToken(token) || _isLocalToken(token))) {
      token.hasValue = !(this.getChainInfoByKey(token.originChain)?.isTestnet);
    }

    const assetRegistry = this.getAssetRegistry();

    assetRegistry[token.slug] = token;

    this.dbService.updateAssetStore(token).catch((e) => this.logger.error(e));

    this.assetRegistrySubject.next(assetRegistry);

    return token.slug;
  }

  public deleteAssetsByChain (chainSlug: string) {
    if (!_isCustomChain(chainSlug)) {
      return;
    }

    const targetAssets: string[] = [];
    const assetRegistry = this.getAssetRegistry();

    Object.values(assetRegistry).forEach((targetToken) => {
      if (targetToken.originChain === chainSlug) {
        targetAssets.push(targetToken.slug);
      }
    });

    this.deleteCustomAssets(targetAssets);
  }

  public deleteCustomAssets (targetAssets: string[]) {
    const assetRegistry = this.getAssetRegistry();

    targetAssets.forEach((targetToken) => {
      delete assetRegistry[targetToken];
    });

    this.dbService.removeFromBalanceStore(targetAssets).catch((e) => this.logger.error(e));
    this.dbService.removeFromAssetStore(targetAssets).catch((e) => this.logger.error(e));

    this.assetRegistrySubject.next(assetRegistry);
    targetAssets.forEach((assetSlug) => {
      this.eventService.emit('asset.updateState', assetSlug);
    });
  }

  // Business logic
  public async init () {
    await this.eventService.waitDatabaseReady;

    // TODO: reconsider the flow of initiation
    this.multiChainAssetMapSubject.next(MultiChainAssetMap);

    await this.initChains();
    this.chainInfoMapSubject.next(this.getChainInfoMap());
    this.assetRegistrySubject.next(this.getAssetRegistry());
    this.initAssetRefMap();
    this.xcmRefMapSubject.next(this.xcmRefMap);

    await this.initApis();
    this.initAssetSettings();
    await this.autoEnableTokens();
  }

  initAssetRefMap () {
    this.dataMap.assetRefMap = AssetRefMap;
  }

  checkLatestData () {
    clearInterval(this.refreshLatestChainDataTimeOut);
    this.handleLatestData();

    this.refreshLatestChainDataTimeOut = setInterval(this.handleLatestData.bind(this), LATEST_CHAIN_DATA_FETCHING_INTERVAL);
  }

  stopCheckLatestChainData () {
    clearInterval(this.refreshLatestChainDataTimeOut);
  }

  handleLatestChainData (latestChainInfo: _ChainInfo[]) {
    try {
      if (latestChainInfo && latestChainInfo.length > 0) {
        const { needUpdateChainApiList, storedChainInfoList } = updateLatestChainInfo(this.dataMap, latestChainInfo);

        this.dbService.bulkUpdateChainStore(storedChainInfoList).catch(console.error);
        this.updateChainSubscription();

        needUpdateChainApiList.forEach((chainInfo) => {
          console.log('Updating chain API for', chainInfo.slug);
          this.initApiForChain(chainInfo).catch(console.error);
        });

        this.logger.log('Finished updating latest RPC providers');
      }
    } catch (e) {
      console.error('Error fetching latest chain data');
    }
  }

  // handleLatestPriceId (latestPriceIds: Record<string, string | null>) {
  //   let isUpdated = false;
  //
  //   Object.entries(latestPriceIds).forEach(([slug, priceId]) => {
  //     if (this.dataMap.assetRegistry[slug] && this.dataMap.assetRegistry[slug].priceId !== priceId) {
  //       isUpdated = true;
  //       this.dataMap.assetRegistry[slug].priceId = priceId;
  //     }
  //   });
  //
  //   if (isUpdated) {
  //     this.assetRegistrySubject.next(this.dataMap.assetRegistry);
  //     this.eventService.emit('asset.updateState', '');
  //   }
  //
  //   this.logger.log('Finished updating latest price IDs');
  // }

  async autoEnableTokens () {
    const autoEnableTokens = Object.values(this.dataMap.assetRegistry).filter((asset) => _isAssetAutoEnable(asset));

    const assetSettings = this.assetSettingSubject.value;
    const chainStateMap = this.getChainStateMap();

    for (const asset of autoEnableTokens) {
      const { originChain, slug: assetSlug } = asset;
      const assetState = assetSettings[assetSlug];
      const chainState = chainStateMap[originChain];

      if (!assetState) { // If this asset not has asset setting, this token is not enabled before (not turned off before)
        if (!chainState || !chainState.manualTurnOff) {
          await this.updateAssetSetting(assetSlug, { visible: true });
        }
      } else {
        if (originChain === 'avail_mainnet') {
          await this.updateAssetSetting(assetSlug, { visible: true });
        }
      }
    }
  }

  async enablePopularTokens () {
    const assetSettings = this.assetSettingSubject.value;
    const chainStateMap = this.getChainStateMap();
    const priorityTokensMap = this.priorityTokensSubject.value || {};

    const priorityTokensList = priorityTokensMap.token && typeof priorityTokensMap.token === 'object'
      ? Object.keys(priorityTokensMap.token)
      : [];

    for (const assetSlug of priorityTokensList) {
      const assetInfo = this.getAssetBySlug(assetSlug);

      // This can occur if the assetSlug is not present in the current chainlist version
      if (!assetInfo) {
        continue;
      }

      const assetState = assetSettings[assetSlug];
      const chainState = chainStateMap[assetInfo.originChain];

      if (!assetState) { // If this asset not has asset setting, this token is not enabled before (not turned off before)
        if (!chainState || !chainState.manualTurnOff) {
          await this.updateAssetSetting(assetSlug, { visible: true }, false);
        }
      }
    }
  }

  handleLatestLedgerGenericAllowChains (latestledgerGenericAllowChains: string[]) {
    this.ledgerGenericAllowChainsSubject.next(latestledgerGenericAllowChains);
    this.eventService.emit('ledger.ready', true);
    this.logger.log('Finished updating latest ledger generic allow chains');
  }

  handleLatestPriorityTokens (latestPriorityTokens: TokenPriorityDetails) {
    const currentTokens = this.priorityTokensSubject.value || {};

    this.priorityTokensSubject.next(latestPriorityTokens);
    this.logger.log('Finished updating latest popular tokens');

    const currentTokenKeys = Object.keys(currentTokens.token || {}); // Extract keys from current tokens
    const newTokenKeys = Object.keys(latestPriorityTokens.token || {}); // Extract keys from new tokens

    if (JSON.stringify(currentTokenKeys) !== JSON.stringify(newTokenKeys)) { // Check if token keys have changed
      this.enablePopularTokens()
        .then(() => this.logger.log('Popular tokens enabled due to priority tokens change')) // Log success after enabling tokens
        .catch((e) => console.error('Error enabling popular tokens:', e)); // Log error if enabling fails
    }
  }

  handleLatestSufficientChains (latestSufficientChains: SufficientChainsDetails) {
    this.sufficientChainsSubject.next(latestSufficientChains);
    this.logger.log('Finished updating latest supported sufficient chains');
  }

  handleLatestData () {
    this.fetchLatestChainData().then((latestChainInfo) => {
      this.lockChainInfoMap = true; // do not need to check current lockChainInfoMap because all remains action is fast enough and don't affect this feature.
      this.handleLatestChainData(latestChainInfo);
      this.lockChainInfoMap = false;
    }).catch((e) => {
      this.lockChainInfoMap = false;
      console.error('Error update latest chain data', e);
    });

    // this.fetchLatestPriceIdsData().then((latestPriceIds) => {
    //   this.handleLatestPriceId(latestPriceIds);
    // }).catch(console.error);

    this.fetchLatestLedgerGenericAllowChains()
      .then((latestledgerGenericAllowChains) => {
        this.handleLatestLedgerGenericAllowChains(latestledgerGenericAllowChains);
      })
      .catch(console.error);

    this.fetchLatestPriorityTokens()
      .then((latestPriorityTokens) => {
        this.handleLatestPriorityTokens(latestPriorityTokens);
      })
      .catch(console.error);

    this.fetchLatestSufficientChains()
      .then((latestSufficientChains) => {
        this.handleLatestSufficientChains(latestSufficientChains);
      })
      .catch(console.error);
  }

  private async initApis () {
    const chainInfoMap = this.getChainInfoMap();
    const chainStateMap = this.getChainStateMap();

    await Promise.all(Object.entries(chainInfoMap)
      .filter(([slug]) => chainStateMap[slug]?.active)
      .map(([, chainInfo]) => {
        try {
          return this.initApiForChain(chainInfo);
        } catch (e) {
          console.error(e);

          return Promise.resolve();
        }
      }));
  }

  public async initSingleApi (slug: string) {
    const chainInfoMap = this.getChainInfoMap();
    const chainStateMap = this.getChainStateMap();

    if (!chainStateMap[slug].active) {
      return false;
    }

    await this.initApiForChain(chainInfoMap[slug]);

    return true;
  }

  private async initApiForChain (chainInfo: _ChainInfo) {
    const { endpoint, providerName } = this.getChainCurrentProviderByKey(chainInfo.slug);

    /**
     * Disable chain if not found provider
     * */
    if (!endpoint || !providerName) {
      this.disableChain(chainInfo.slug);

      return;
    }

    const onUpdateStatus = (status: _ChainConnectionStatus) => {
      const slug = chainInfo.slug;
      const isActive = this.getChainStateByKey(slug).active;
      const isConnectProblem = status !== _ChainConnectionStatus.CONNECTING && status !== _ChainConnectionStatus.CONNECTED;
      const isLightRpc = endpoint.startsWith('light');

      if (isActive && isConnectProblem && !isLightRpc) {
        const reportApiUrl = 'https://api-cache.subwallet.app/api/health-check/report-rpc';
        const requestBody = {
          chainSlug: slug,
          chainStatus: status,
          rpcReport: {
            [providerName]: endpoint
          },
          configStatus: {
            countUnstable: 10,
            countDie: 20
          }
        };

        fetch(reportApiUrl, { // can get status from this response
          method: 'POST',
          headers: {
            'X-API-KEY': '9b1c94a5e1f3a2d9f8b2a4d6e1f3a2d9',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .then(() => {
          })
          .catch((error) => console.error('Error connecting to the report API:', error));
      }

      this.updateChainConnectionStatus(slug, status);
    };

    if (chainInfo.substrateInfo !== null && chainInfo.substrateInfo !== undefined) {
      // if (_MANTA_ZK_CHAIN_GROUP.includes(chainInfo.slug) && MODULE_SUPPORT.MANTA_ZK && this.mantaChainHandler) {
      //   const apiPromise = await this.mantaChainHandler?.initMantaPay(endpoint, chainInfo.slug);
      //   const chainApi = await this.substrateChainHandler.initApi(chainInfo.slug, endpoint, { providerName, externalApiPromise: apiPromise, onUpdateStatus });
      //
      //   this.substrateChainHandler.setSubstrateApi(chainInfo.slug, chainApi);
      // } else {

      const chainApi = await this.substrateChainHandler.initApi(chainInfo.slug, endpoint, { providerName, onUpdateStatus });

      this.substrateChainHandler.setSubstrateApi(chainInfo.slug, chainApi);
      // }
    }

    /**
     * To check if the chain is EVM chain, we need to check if the chain has evmInfo and evmChainId is not -1
     * (fake evm chain to connect to substrate chain)
     * */
    if (chainInfo.evmInfo !== null && chainInfo.evmInfo !== undefined && chainInfo.evmInfo.evmChainId !== -1) {
      const chainApi = await this.evmChainHandler.initApi(chainInfo.slug, endpoint, { providerName, onUpdateStatus });

      this.evmChainHandler.setEvmApi(chainInfo.slug, chainApi);
    }

    if (chainInfo.tonInfo !== null && chainInfo.tonInfo !== undefined) {
      const chainApi = await this.tonChainHandler.initApi(chainInfo.slug, endpoint, { providerName, onUpdateStatus });

      this.tonChainHandler.setTonApi(chainInfo.slug, chainApi);
    }

    if (chainInfo.cardanoInfo !== null && chainInfo.cardanoInfo !== undefined) {
      const isTestnet = chainInfo.isTestnet;

      const chainApi = await this.cardanoChainHandler.initApi(chainInfo.slug, endpoint, { isTestnet, providerName, onUpdateStatus });

      this.cardanoChainHandler.setCardanoApi(chainInfo.slug, chainApi);
    }

    if (chainInfo.bitcoinInfo !== null && chainInfo.bitcoinInfo !== undefined) {
      const chainApi = await this.bitcoinChainHandler.initApi(chainInfo.slug, endpoint, { providerName, onUpdateStatus });

      this.bitcoinChainHandler.setApi(chainInfo.slug, chainApi);
    }
  }

  private destroyApiForChain (chainInfo: _ChainInfo) {
    if (chainInfo.substrateInfo !== null) {
      this.substrateChainHandler.destroySubstrateApi(chainInfo.slug);
    }

    if (chainInfo.evmInfo !== null) {
      this.evmChainHandler.destroyEvmApi(chainInfo.slug);
    }

    if (chainInfo.tonInfo !== null) {
      this.tonChainHandler.destroyTonApi(chainInfo.slug);
    }

    if (chainInfo.cardanoInfo !== null) {
      this.cardanoChainHandler.destroyCardanoApi(chainInfo.slug);
    }

    if (chainInfo.bitcoinInfo !== null && chainInfo.bitcoinInfo !== undefined) {
      this.bitcoinChainHandler.destroyApi(chainInfo.slug);
    }
  }

  public async enableChain (chainSlug: string) {
    const chainInfo = this.getChainInfoByKey(chainSlug);
    const chainStateMap = this.getChainStateMap();

    if (chainStateMap[chainSlug].active || this.lockChainInfoMap) {
      return false;
    }

    this.lockChainInfoMap = true;
    this.dbService.updateChainStore({
      ...chainInfo,
      active: true,
      currentProvider: chainStateMap[chainSlug].currentProvider,
      manualTurnOff: !!chainStateMap[chainSlug].manualTurnOff
    }).catch(console.error);
    chainStateMap[chainSlug].active = true;

    await this.initApiForChain(chainInfo);

    this.lockChainInfoMap = false;

    this.eventService.emit('chain.updateState', chainSlug);

    this.updateChainStateMapSubscription();

    return true;
  }

  public async enableChains (chainSlugs: string[]): Promise<boolean> {
    const chainInfoMap = this.getChainInfoMap();
    const chainStateMap = this.getChainStateMap();
    let needUpdate = false;

    if (this.lockChainInfoMap) {
      return false;
    }

    this.lockChainInfoMap = true;

    const initPromises = chainSlugs.map(async (chainSlug) => {
      // Add try catch to prevent one chain error stop the whole process
      try {
        const chainInfo = chainInfoMap[chainSlug];
        const currentState = chainStateMap[chainSlug]?.active;

        if (!currentState) {
          // Enable chain success then update chain state
          await this.initApiForChain(chainInfo);
          this.dbService.updateChainStore({
            ...chainInfo,
            active: true,
            currentProvider: chainStateMap[chainSlug].currentProvider,
            manualTurnOff: !!chainStateMap[chainSlug].manualTurnOff
          }).catch(console.error);

          chainStateMap[chainSlug].active = true;

          this.eventService.emit('chain.updateState', chainSlug);
          needUpdate = true;
        }
      } catch (e) {}
    });

    await Promise.all(initPromises);

    this.lockChainInfoMap = false;
    needUpdate && this.updateChainStateMapSubscription();

    return needUpdate;
  }

  public async reconnectChain (chain: string) {
    await this.getSubstrateApi(chain)?.recoverConnect();
    await this.getEvmApi(chain)?.recoverConnect();

    return true;
  }

  public disableChain (chainSlug: string, preventManualTurnOff = false): boolean {
    const chainInfo = this.getChainInfoByKey(chainSlug);
    const chainStateMap = this.getChainStateMap();

    if (!chainStateMap[chainSlug].active || this.lockChainInfoMap) {
      return false;
    }

    this.lockChainInfoMap = true;
    chainStateMap[chainSlug].active = false;
    chainStateMap[chainSlug].manualTurnOff = !preventManualTurnOff;
    // Set disconnect state for inactive chain
    this.updateChainConnectionStatus(chainSlug, _ChainConnectionStatus.DISCONNECTED);
    this.destroyApiForChain(chainInfo);
    this.dbService.updateChainStore({
      ...chainInfo,
      active: false,
      currentProvider: chainStateMap[chainSlug].currentProvider,
      manualTurnOff: !preventManualTurnOff
    }).catch(console.error);

    this.updateChainStateMapSubscription();
    this.lockChainInfoMap = false;

    this.eventService.emit('chain.updateState', chainSlug);

    return true;
  }

  private checkExistedPredefinedChain (latestChainInfoMap: Record<string, _ChainInfo>, genesisHash?: string, evmChainId?: number) {
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

  private async fetchLatestChainData () {
    return await fetchStaticData<_ChainInfo[]>('chains');
    // try {
    //   const timeout = new Promise((resolve) => {
    //     const id = setTimeout(() => {
    //       clearTimeout(id);
    //       resolve(null);
    //     }, 1500);
    //   });
    //   let result = defaultValue;
    //   const resp = await Promise.race([
    //     timeout,
    //     fetch(src)
    //   ]) as Response || null;
    //
    //   if (!resp) {
    //     console.warn('Error fetching latest data', src);
    //
    //     return result;
    //   }
    //
    //   if (resp.ok) {
    //     try {
    //       result = await resp.json();
    //       console.log('Fetched latest data', src);
    //     } catch (err) {
    //       console.warn('Error parsing latest data', src, err);
    //     }
    //   }
    //
    //   return result;
    // } catch (e) {
    //   console.warn('Error fetching latest data', src, e);
    //
    //   return defaultValue;
    // }
  }

  // @ts-ignore
  private async fetchLatestPriceIdsData () {
    return await fetchStaticData<Record<string, string | null>>('chain-assets/price-map');
  }

  private async fetchLatestLedgerGenericAllowChains () {
    return await fetchStaticData<string[]>('chains/ledger-generic-allow-chains') || [];
  }

  private async fetchLatestPriorityTokens () {
    return await fetchStaticData<TokenPriorityDetails>('chain-assets/priority-tokens') || {
      tokenGroup: {},
      token: {}
    };
  }

  private async fetchLatestSufficientChains () {
    return await fetchStaticData<SufficientChainsDetails>('chains/supported-sufficient-chains') || [];
  }

  public async fetchAhMapChain () {
    return await fetchStaticData<Record<string, string>>('asset-hub-staking-map');
  }

  private async initChains () {
    const storedChainSettings = await this.dbService.getAllChainStore();
    const defaultChainInfoMap = filterChainInfoMap(ChainInfoMap, ignoredList);
    const storedChainSettingMap: Record<string, IChain> = {};

    storedChainSettings.forEach((chainStoredSetting) => {
      storedChainSettingMap[chainStoredSetting.slug] = chainStoredSetting;
    });

    const newStorageData: IChain[] = [];
    const deprecatedChains: string[] = [];
    const deprecatedChainMap: Record<string, string> = {};

    if (storedChainSettings.length === 0) {
      this.dataMap.chainInfoMap = defaultChainInfoMap;
      Object.values(defaultChainInfoMap).forEach((chainInfo) => {
        const { providerKey } = randomizeProvider(chainInfo.providers);

        this.dataMap.chainStateMap[chainInfo.slug] = {
          currentProvider: providerKey,
          slug: chainInfo.slug,
          active: _DEFAULT_ACTIVE_CHAINS.includes(chainInfo.slug),
          manualTurnOff: false
        };

        this.updateChainConnectionStatus(chainInfo.slug, _ChainConnectionStatus.DISCONNECTED);

        // create data for storage
        newStorageData.push({
          ...chainInfo,
          active: _DEFAULT_ACTIVE_CHAINS.includes(chainInfo.slug),
          currentProvider: providerKey,
          manualTurnOff: false
        });
      });
    } else {
      const mergedChainInfoMap: Record<string, _ChainInfo> = defaultChainInfoMap;

      // Reselect provider for chain
      const updateCurrentProvider = (providers: Record<string, string>, storedChainInfo: IChain, storeSlug: string, active: boolean, forceFistProvider = false): string => {
        const manualTurnOff = !!storedChainInfo.manualTurnOff;
        // For case only custom providers in list, randomize function will infinite loop, so force select first provider
        const { providerKey } = forceFistProvider ? { providerKey: Object.keys(providers)[0] } : randomizeProvider(providers);
        let selectedProvider = providerKey;

        const storedProviderKey = storedChainInfo.currentProvider;
        const storedProviderValue = storedChainInfo.providers[storedProviderKey] || '';

        if (storedProviderValue?.startsWith('light') || storedProviderKey?.startsWith(_CUSTOM_PREFIX)) {
          const savedProviderKey = Object.keys(providers).find((key) => providers[key] === storedProviderValue);

          if (savedProviderKey) {
            selectedProvider = savedProviderKey;
          }
        }

        newStorageData.push({
          ...mergedChainInfoMap[storeSlug],
          active,
          currentProvider: selectedProvider,
          manualTurnOff
        });

        return selectedProvider;
      };

      for (const [storedSlug, storedChainInfo] of Object.entries(storedChainSettingMap)) {
        const chainInfo = defaultChainInfoMap[storedSlug];
        const manualTurnOff = !!storedChainInfo.manualTurnOff;

        // Network existed on change list
        // check predefined chains first, keep setting for providers and currentProvider
        if (chainInfo) {
          // Keep customer provider only
          const providers: Record<string, string> = { ...mergedChainInfoMap[storedSlug].providers };

          for (const [key, value] of Object.entries(storedChainInfo.providers)) {
            if (_isCustomProvider(key)) {
              if (!Object.values(providers).includes(value)) {
                providers[key] = value;
              }
            }
          }

          mergedChainInfoMap[storedSlug].providers = providers;

          // Merge current provider
          // let currentProvider = storedChainInfo.currentProvider;
          // const providerValue = storedChainInfo.providers[selectedProvider] || '';

          const hasProvider = Object.values(providers).length > 0;
          const canActive = hasProvider && chainInfo.chainStatus === _ChainStatus.ACTIVE;

          const selectedProvider = updateCurrentProvider(providers, storedChainInfo, storedSlug, canActive && storedChainInfo.active);

          this.dataMap.chainStateMap[storedSlug] = {
            currentProvider: selectedProvider,
            slug: storedSlug,
            active: canActive && storedChainInfo.active,
            manualTurnOff
          };

          this.updateChainConnectionStatus(storedSlug, _ChainConnectionStatus.DISCONNECTED);
        } else if (_isCustomChain(storedSlug)) {
          // only custom chains are left
          // check custom chain duplicated with predefined chain => merge into predefined chain
          const duplicatedDefaultSlug = this.checkExistedPredefinedChain(defaultChainInfoMap, storedChainInfo.substrateInfo?.genesisHash, storedChainInfo.evmInfo?.evmChainId);

          if (duplicatedDefaultSlug.length > 0) { // merge custom chain with existed chain
            const providers = { ...storedChainInfo.providers, ...mergedChainInfoMap[duplicatedDefaultSlug].providers };

            mergedChainInfoMap[duplicatedDefaultSlug].providers = providers;
            const selectedProvider = updateCurrentProvider(providers, storedChainInfo, duplicatedDefaultSlug, storedChainInfo.active);

            this.dataMap.chainStateMap[duplicatedDefaultSlug] = {
              currentProvider: selectedProvider,
              slug: duplicatedDefaultSlug,
              active: storedChainInfo.active,
              manualTurnOff
            };

            this.updateChainConnectionStatus(duplicatedDefaultSlug, _ChainConnectionStatus.DISCONNECTED);

            deprecatedChainMap[storedSlug] = duplicatedDefaultSlug;

            deprecatedChains.push(storedSlug);
          } else {
            mergedChainInfoMap[storedSlug] = {
              slug: storedSlug,
              name: storedChainInfo.name,
              providers: storedChainInfo.providers, // TODO: review
              evmInfo: storedChainInfo.evmInfo,
              substrateInfo: storedChainInfo.substrateInfo,
              bitcoinInfo: storedChainInfo.bitcoinInfo ?? null,
              tonInfo: storedChainInfo.tonInfo,
              cardanoInfo: storedChainInfo.cardanoInfo ?? null,
              isTestnet: storedChainInfo.isTestnet,
              chainStatus: storedChainInfo.chainStatus,
              icon: storedChainInfo.icon,
              extraInfo: storedChainInfo.extraInfo
            };

            const providers = storedChainInfo.providers;
            // This case, providers are all custom providers, need force select first provider
            const selectedProvider = updateCurrentProvider(providers, storedChainInfo, storedSlug, storedChainInfo.active, true);

            this.dataMap.chainStateMap[storedSlug] = {
              currentProvider: selectedProvider, // TODO: review
              slug: storedSlug,
              active: storedChainInfo.active,
              manualTurnOff
            };

            this.updateChainConnectionStatus(storedSlug, _ChainConnectionStatus.DISCONNECTED);
          }
        } else { // added chain from patch
          mergedChainInfoMap[storedSlug] = {
            slug: storedSlug,
            name: storedChainInfo.name,
            providers: storedChainInfo.providers,
            evmInfo: storedChainInfo.evmInfo,
            substrateInfo: storedChainInfo.substrateInfo,
            bitcoinInfo: storedChainInfo.bitcoinInfo ?? null,
            tonInfo: storedChainInfo.tonInfo,
            cardanoInfo: storedChainInfo.cardanoInfo ?? null,
            isTestnet: storedChainInfo.isTestnet,
            chainStatus: storedChainInfo.chainStatus,
            icon: storedChainInfo.icon,
            extraInfo: storedChainInfo.extraInfo
          };

          const providers = storedChainInfo.providers;
          const selectedProvider = updateCurrentProvider(providers, storedChainInfo, storedSlug, storedChainInfo.active);

          this.dataMap.chainStateMap[storedSlug] = {
            currentProvider: selectedProvider,
            slug: storedSlug,
            active: storedChainInfo.active,
            manualTurnOff
          };

          this.updateChainConnectionStatus(storedSlug, _ChainConnectionStatus.DISCONNECTED);

          deprecatedChainMap[storedSlug] = storedSlug; // todo: set a better name
        }
      }

      // Fill in the missing chainState and storageData (new chains never before seen)
      Object.entries(mergedChainInfoMap).forEach(([slug, chainInfo]) => {
        if (!(slug in this.dataMap.chainStateMap)) {
          this.dataMap.chainStateMap[slug] = {
            currentProvider: Object.keys(chainInfo.providers)[0],
            slug,
            active: _DEFAULT_ACTIVE_CHAINS.includes(slug),
            manualTurnOff: false
          };
          this.updateChainConnectionStatus(slug, _ChainConnectionStatus.DISCONNECTED);

          newStorageData.push({
            ...mergedChainInfoMap[slug],
            active: _DEFAULT_ACTIVE_CHAINS.includes(slug),
            currentProvider: Object.keys(chainInfo.providers)[0],
            manualTurnOff: false
          });
        }
      });

      this.dataMap.chainInfoMap = mergedChainInfoMap;
    }

    await this.dbService.bulkUpdateChainStore(newStorageData);
    await this.dbService.removeFromChainStore(deprecatedChains); // remove outdated records
    await this.initAssetRegistry(deprecatedChainMap);
  }

  private async initAssetRegistry (deprecatedCustomChainMap: Record<string, string>) {
    const storedAssetRegistry = await this.dbService.getAllAssetStore();
    const latestAssetRegistry = filterAssetInfoMap(this.getChainInfoMap(), ChainAssetMap);
    const availableChains = Object.values(this.dataMap.chainInfoMap)
      .filter((info) => (info.chainStatus === _ChainStatus.ACTIVE))
      .map((chainInfo) => chainInfo.slug);

    let finalAssetRegistry: Record<string, _ChainAsset> = {};

    if (storedAssetRegistry.length === 0) {
      finalAssetRegistry = latestAssetRegistry;
    } else {
      const mergedAssetRegistry: Record<string, _ChainAsset> = latestAssetRegistry;

      const parsedStoredAssetRegistry: Record<string, _ChainAsset> = {};
      const deprecatedAssets: string[] = [];

      // Update custom assets of merged custom chains
      Object.values(storedAssetRegistry).forEach((storedAsset) => {
        if (_isCustomAsset(storedAsset.slug) && Object.keys(deprecatedCustomChainMap).includes(storedAsset.originChain)) {
          const newOriginChain = deprecatedCustomChainMap[storedAsset.originChain];
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

        for (const defaultChainAsset of Object.values(latestAssetRegistry)) {
          // case merge custom asset with default asset
          if (_isEqualSmartContractAsset(storedAssetInfo, defaultChainAsset)) {
            duplicated = true;
            break;
          }

          if (availableChains.indexOf(storedAssetInfo.originChain) === -1) {
            deprecated = true;
            break;
          }

          if (defaultChainAsset.slug === storedAssetInfo.slug) {
            duplicated = true;
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

      await this.dbService.removeFromAssetStore(deprecatedAssets);
    }

    // Fill out zk assets from finalAssetRegistry if not supported
    if (!MODULE_SUPPORT.MANTA_ZK) {
      const zkAssets: string[] = [];

      Object.entries(finalAssetRegistry).forEach(([slug, assets]) => {
        if (_isMantaZkAsset(assets)) {
          zkAssets.push(slug);
          delete finalAssetRegistry[slug];
        }
      });

      await this.dbService.removeFromAssetStore(zkAssets);
    }

    this.dataMap.assetRegistry = finalAssetRegistry;
  }

  private updateChainStateMapSubscription () {
    this.chainStateMapSubject.next(this.getChainStateMap());
  }

  private updateChainInfoMapSubscription () {
    this.chainInfoMapSubject.next(this.getChainInfoMap());
  }

  private updateChainSubscription () {
    this.updateChainInfoMapSubscription();
    this.updateChainStateMapSubscription();
  }

  // Can only update providers or block explorer, crowdloan url
  private async updateChain (params: _NetworkUpsertParams) {
    const chainSlug = params.chainEditInfo.slug;
    const targetChainInfo = this.getChainInfoByKey(chainSlug);
    const targetChainState = this.getChainStateByKey(chainSlug);
    const changedProvider = params.chainEditInfo.currentProvider !== targetChainState.currentProvider;

    if (changedProvider) {
      targetChainInfo.providers = params.chainEditInfo.providers;
      targetChainState.currentProvider = params.chainEditInfo.currentProvider;

      // Enable chain if not before
      if (!targetChainState.active) {
        targetChainState.active = true;
      }

      // It auto detects the change of api url to create new instance or reuse existed one
      await this.initApiForChain(targetChainInfo);
      this.updateChainStateMapSubscription();
    }

    if (targetChainInfo.substrateInfo) {
      if (params.chainEditInfo.blockExplorer !== undefined) {
        targetChainInfo.substrateInfo.blockExplorer = params.chainEditInfo.blockExplorer;
      }

      if (params.chainEditInfo.crowdloanUrl !== undefined) {
        targetChainInfo.substrateInfo.crowdloanUrl = params.chainEditInfo.crowdloanUrl;
      }
    }

    if (targetChainInfo.evmInfo) {
      if (params.chainEditInfo.blockExplorer !== undefined) {
        targetChainInfo.evmInfo.blockExplorer = params.chainEditInfo.blockExplorer;
      }
    }

    this.updateChainInfoMapSubscription();

    this.dbService.updateChainStore({
      ...targetChainInfo,
      active: targetChainState.active,
      currentProvider: targetChainState.currentProvider,
      manualTurnOff: !targetChainState.active || !!targetChainState.manualTurnOff
    }).then(() => {
      this.eventService.emit('chain.updateState', chainSlug);
    }).catch((e) => this.logger.error(e));
  }

  private async insertChain (params: _NetworkUpsertParams) {
    const chainInfoMap = this.getChainInfoMap();

    if (!params.chainSpec) {
      return;
    }

    const newChainSlug = this.generateSlugForCustomChain(params.chainEditInfo.chainType as string, params.chainEditInfo.name as string, params.chainSpec.paraId, params.chainSpec.evmChainId);

    let substrateInfo: _SubstrateInfo | null = null;
    let evmInfo: _EvmInfo | null = null;
    const tonInfo: _TonInfo | null = null;
    const cardanoInfo: _CardanoInfo | null = null;

    if (params.chainSpec.genesisHash !== '') {
      substrateInfo = {
        crowdloanFunds: params.chainSpec.crowdloanFunds || null,
        crowdloanParaId: params.chainSpec.crowdloanParaId || null,
        addressPrefix: params.chainSpec.addressPrefix,
        blockExplorer: params.chainEditInfo.blockExplorer || null,
        chainType: params.chainSpec.paraId !== null ? _SubstrateChainType.PARACHAIN : _SubstrateChainType.RELAYCHAIN,
        crowdloanUrl: params.chainEditInfo.crowdloanUrl || null,
        decimals: params.chainSpec.decimals,
        existentialDeposit: params.chainSpec.existentialDeposit,
        paraId: params.chainSpec.paraId,
        symbol: params.chainEditInfo.symbol as string,
        genesisHash: params.chainSpec.genesisHash,
        relaySlug: null,
        hasNativeNft: false,
        supportStaking: params.chainSpec.paraId === null,
        supportSmartContract: null
      };
    } else if (params.chainSpec.evmChainId !== null) {
      evmInfo = {
        supportSmartContract: [_AssetType.ERC20, _AssetType.ERC721], // set support for ERC token by default
        blockExplorer: params.chainEditInfo.blockExplorer || null,
        decimals: params.chainSpec.decimals,
        evmChainId: params.chainSpec.evmChainId,
        existentialDeposit: params.chainSpec.existentialDeposit,
        symbol: params.chainEditInfo.symbol as string,
        abiExplorer: null
      };
    }

    const chainInfo: _ChainInfo = {
      slug: newChainSlug,
      name: params.chainEditInfo.name as string,
      providers: params.chainEditInfo.providers,
      substrateInfo,
      evmInfo,
      bitcoinInfo: null,
      tonInfo,
      cardanoInfo,
      isTestnet: false,
      chainStatus: _ChainStatus.ACTIVE,
      icon: '', // Todo: Allow update with custom chain,
      extraInfo: null
    };

    // insert new chainInfo
    chainInfoMap[newChainSlug] = chainInfo;

    // insert new chainState
    const chainStateMap = this.getChainStateMap();

    chainStateMap[newChainSlug] = {
      active: true,
      currentProvider: params.chainEditInfo.currentProvider,
      slug: newChainSlug,
      manualTurnOff: false
    };

    // const chainStatusMap = this.getChainStatusMap();
    // const chainStatusMap[newChainSlug] = {
    //   slug: newChainSlug,
    //   connectionStatus: _ChainConnectionStatus.DISCONNECTED,
    //   lastUpdated: Date.now()
    // };

    await this.initApiForChain(chainInfo);

    // create a record in assetRegistry for native token and update store/subscription
    const nativeTokenSlug = this.upsertCustomToken({
      assetType: _AssetType.NATIVE,
      decimals: params.chainSpec.decimals,
      metadata: null,
      minAmount: params.chainSpec.existentialDeposit,
      multiChainAsset: null,
      name: params.chainEditInfo.name as string,
      originChain: newChainSlug,
      priceId: params.chainEditInfo.priceId || null,
      slug: '',
      symbol: params.chainEditInfo.symbol as string,
      hasValue: true,
      icon: ''
    });

    // update subscription
    this.updateChainSubscription();

    // TODO: add try, catch, move storage update and subject update to somewhere else
    this.dbService.updateChainStore({
      active: true,
      currentProvider: params.chainEditInfo.currentProvider,
      manualTurnOff: false,
      ...chainInfo
    })
      .then(() => {
        this.eventService.emit('chain.add', newChainSlug);
      })
      .catch((e) => this.logger.error(e));

    return nativeTokenSlug;
  }

  public async upsertChain (params: _NetworkUpsertParams) {
    if (this.lockChainInfoMap) {
      return;
    }

    this.lockChainInfoMap = true;

    let result;

    if (params.mode === 'update') { // update existing chainInfo
      await this.updateChain(params);
    } else { // insert custom network
      result = await this.insertChain(params);
    }

    this.lockChainInfoMap = false;

    return result;
  }

  private generateSlugForCustomChain (chainType: string, name: string, paraId: number | null, evmChainId: number | null) {
    const parsedName = name.replaceAll(' ', '').toLowerCase();

    if (evmChainId !== null && evmChainId !== undefined) {
      return `${_CUSTOM_PREFIX}${chainType}-${parsedName}-${evmChainId}`;
    } else {
      let slug = `${_CUSTOM_PREFIX}${chainType}-${parsedName}`;

      if (paraId !== null && paraId !== undefined) {
        slug = slug.concat(`-${paraId}`);
      }

      return slug;
    }
  }

  public async validateCustomChain (provider: string, existingChainSlug?: string): Promise<ValidateNetworkResponse> {
    // currently only supports WS provider for Substrate and HTTP provider for EVM
    let result: ValidateNetworkResponse = {
      decimals: 0,
      existentialDeposit: '',
      paraId: null,
      symbol: '',
      success: false,
      genesisHash: '',
      addressPrefix: '',
      name: '',
      evmChainId: null
    };

    try {
      const { conflictChainName: providerConflictChainName, conflictChainSlug: providerConflictChainSlug, error: providerError } = this.validateProvider(provider, existingChainSlug);

      if (providerError === _CHAIN_VALIDATION_ERROR.NONE) {
        let api: _EvmApi | _SubstrateApi;

        // TODO: EVM chain might have WS provider
        if (provider.startsWith('http')) {
          // todo: handle validate ton provider
          // todo: handle validate cardano provider

          // HTTP provider is EVM by default
          api = await this.evmChainHandler.initApi('custom', provider);
        } else {
          api = await this.substrateChainHandler.initApi('custom', provider);
        }

        const connectionTimeout = new Promise((resolve) => {
          const id = setTimeout(() => {
            clearTimeout(id);
            resolve(null);
          }, 5000);
        });

        const connectionTrial = await Promise.race([
          connectionTimeout,
          api.isReady
        ]); // check connection

        if (connectionTrial !== null) {
          let _api = connectionTrial as _SubstrateApi | _EvmApi | null;

          const chainSpec = await this.getChainSpecByProvider(_api as _SubstrateApi | _EvmApi);

          result = Object.assign(result, chainSpec);

          // TODO: disconnect and destroy API
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          // _api?.api?.disconnect && await _api?.api?.disconnect();
          _api = null;

          if (existingChainSlug) {
            // check if same network (with existingChainSlug)
            const existedChainInfo = this.getChainInfoByKey(existingChainSlug);

            if (existedChainInfo.evmInfo !== null) {
              if (result.evmChainId !== existedChainInfo.evmInfo.evmChainId) {
                result.error = _CHAIN_VALIDATION_ERROR.PROVIDER_NOT_SAME_CHAIN;
              }
            } else if (existedChainInfo.substrateInfo !== null) {
              if (result.genesisHash !== existedChainInfo.substrateInfo.genesisHash) {
                result.error = _CHAIN_VALIDATION_ERROR.PROVIDER_NOT_SAME_CHAIN;
              }
            }
          } else {
            // check if network existed
            if (result.evmChainId !== null) {
              for (const chainInfo of Object.values(this.getEvmChainInfoMap())) {
                if (chainInfo?.evmInfo?.evmChainId === result.evmChainId) {
                  result.error = _CHAIN_VALIDATION_ERROR.EXISTED_CHAIN;
                  result.conflictChain = chainInfo.name;
                  result.conflictKey = chainInfo.slug;

                  break;
                }
              }
            } else if (result.genesisHash !== '') {
              for (const chainInfo of Object.values(this.getSubstrateChainInfoMap())) {
                if (chainInfo?.substrateInfo?.genesisHash === result.genesisHash) {
                  result.error = _CHAIN_VALIDATION_ERROR.EXISTED_CHAIN;
                  result.conflictChain = chainInfo.name;
                  result.conflictKey = chainInfo.slug;

                  break;
                }
              }
            }
          }
        } else {
          result.error = _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE;
          result.success = false;
        }
      } else {
        result.success = false;
        result.error = providerError;
        result.conflictChain = providerConflictChainName;
        result.conflictKey = providerConflictChainSlug;
      }

      if (!result.error && (result.evmChainId !== null || result.genesisHash !== '')) {
        result.success = true;
      }

      return result;
    } catch (e) {
      console.error('Error connecting to provider', e);

      result.success = false;
      result.error = _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE;

      return result;
    }
  }

  private async getChainSpecByProvider (api: _EvmApi | _SubstrateApi) {
    if (api.api instanceof Web3) {
      return await this.evmChainHandler.getChainSpec(api as _EvmApi);
    }

    return await this.substrateChainHandler.getChainSpec(api as _SubstrateApi);
  }

  private validateProvider (targetProvider: string, existingChainSlug?: string) {
    let error: _CHAIN_VALIDATION_ERROR = _CHAIN_VALIDATION_ERROR.NONE;
    const chainInfoMap = this.getChainInfoMap();
    const allExistedProviders: Record<string, string | boolean>[] = [];
    let conflictChainSlug = '';
    let conflictChainName = '';

    if (existingChainSlug) {
      const chainInfo = chainInfoMap[existingChainSlug];

      if (Object.values(chainInfo.providers).includes(targetProvider)) {
        error = _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER;
        conflictChainSlug = chainInfo.slug;
        conflictChainName = chainInfo.name;
      }

      return { error, conflictChainSlug, conflictChainName };
    }

    // get all providers
    for (const [key, value] of Object.entries(chainInfoMap)) {
      Object.values(value.providers).forEach((provider) => {
        allExistedProviders.push({ key, provider });
      });
    }

    for (const { key, provider } of allExistedProviders) {
      if (provider === targetProvider) {
        error = _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER;
        conflictChainSlug = key as string;
        conflictChainName = chainInfoMap[key as string].name;
        break;
      }
    }

    return { error, conflictChainSlug, conflictChainName };
  }

  private async getSmartContractTokenInfo (contractAddress: string, tokenType: _AssetType, originChain: string, contractCaller?: string): Promise<_SmartContractTokenInfo> {
    if ([_AssetType.ERC721, _AssetType.ERC20].includes(tokenType)) {
      return await this.evmChainHandler.getEvmContractTokenInfo(contractAddress, tokenType, originChain);
    } else if ([_AssetType.PSP34, _AssetType.PSP22, _AssetType.GRC20, _AssetType.VFT].includes(tokenType)) {
      return await this.substrateChainHandler.getSubstrateContractTokenInfo(contractAddress, tokenType, originChain, contractCaller);
    }

    return {
      decimals: -1,
      name: '',
      symbol: '',
      contractError: false
    };
  }

  private async getAssetIdTokenInfo (assetId: string | undefined, tokenType: _AssetType, chain: string): Promise<_SmartContractTokenInfo> {
    if ([_AssetType.LOCAL].includes(tokenType) && assetId) {
      return await this.substrateChainHandler.getSubstrateAssetIdTokenInfo(assetId, chain);
    }

    return {
      decimals: -1,
      name: '',
      symbol: '',
      contractError: false
    };
  }

  public async validateCustomToken (data: _ValidateCustomAssetRequest): Promise<_ValidateCustomAssetResponse> {
    const assetRegistry = this.getSmartContractTokens();
    const asset = this.getAssetHubToken();
    let existedToken: _ChainAsset | undefined;

    for (const token of Object.values(assetRegistry)) {
      const contractAddress = token?.metadata?.contractAddress as string;

      if (data.contractAddress) {
        if (_isEqualContractAddress(contractAddress, data.contractAddress) && token.assetType === data.type && token.originChain === data.originChain) {
          existedToken = token;
          break;
        }
      }
    }

    for (const token of Object.values(asset)) {
      const assetId = token?.metadata?.assetId as string;

      if (assetId === data.assetId && token.assetType === data.type && token.originChain === data.originChain) {
        existedToken = token;
        break;
      }
    }

    if (existedToken) {
      return {
        decimals: existedToken.decimals || 0,
        name: existedToken.name,
        symbol: existedToken.symbol,
        isExist: !!existedToken,
        existedSlug: existedToken?.slug,
        contractError: false
      };
    }

    let info: _SmartContractTokenInfo;

    if (data.contractAddress) {
      info = await this.getSmartContractTokenInfo(data.contractAddress, data.type, data.originChain, data.contractCaller);
    } else {
      info = await this.getAssetIdTokenInfo(data.assetId, data.type, data.originChain);
    }

    return {
      name: info.name,
      decimals: info.decimals,
      symbol: info.symbol,
      isExist: !!existedToken,
      contractError: info.contractError
    };
  }

  private generateSlugForSmartContractAsset (originChain: string, assetType: _AssetType, symbol: string, contractAddress: string) {
    return `${originChain}-${assetType}-${symbol}-${contractAddress}`;
  }

  private generateSlugForNativeToken (originChain: string, assetType: _AssetType, symbol: string) {
    return `${originChain}-${assetType}-${symbol}`;
  }

  public refreshSubstrateApi (slug: string) {
    this.substrateChainHandler.recoverApi(slug).catch(console.error);
  }

  public refreshEvmApi (slug: string) {
    this.evmChainHandler.recoverApi(slug).catch(console.error);
  }

  public async stopAllChainApis () {
    await Promise.all([
      this.substrateChainHandler.sleep(),
      this.evmChainHandler.sleep(),
      this.tonChainHandler.sleep(),
      this.cardanoChainHandler.sleep(),
      this.bitcoinChainHandler.sleep()
    ]);

    this.stopCheckLatestChainData();
  }

  public async resumeAllChainApis () {
    await Promise.all([
      this.substrateChainHandler.wakeUp(),
      this.evmChainHandler.wakeUp(),
      this.tonChainHandler.wakeUp(),
      this.cardanoChainHandler.wakeUp(),
      this.bitcoinChainHandler.wakeUp()
    ]);

    this.checkLatestData();
  }

  public initAssetSettings () {
    this.eventService.emit('asset.ready', true);
  }

  public setAssetSettings (assetSettings: Record<string, AssetSetting>, emitEvent = true): void {
    const updateAssets: string[] = [];

    if (emitEvent) {
      Object.keys(assetSettings).forEach((slug) => {
        if (this.assetSettingSubject.value[slug]?.visible !== assetSettings[slug].visible) {
          updateAssets.push(slug);
        }
      });
    }

    this.assetSettingSubject.next(assetSettings);

    updateAssets.forEach((slug) => {
      this.eventService.emit('asset.updateState', slug);
    });

    this.store.set('AssetSetting', assetSettings);
  }

  public setMantaZkAssetSettings (visible: boolean) {
    const zkAssetSettings: Record<string, AssetSetting> = {};

    Object.values(this.dataMap.assetRegistry).forEach((asset) => {
      if (_isMantaZkAsset(asset)) {
        zkAssetSettings[asset.slug] = {
          visible
        };
      }
    });

    this.store.get('AssetSetting', (storedAssetSettings) => {
      const newAssetSettings = {
        ...storedAssetSettings,
        ...zkAssetSettings
      };

      this.store.set('AssetSetting', newAssetSettings);

      this.assetSettingSubject.next(newAssetSettings);

      Object.keys(zkAssetSettings).forEach((slug) => {
        this.eventService.emit('asset.updateState', slug);
      });
    });
  }

  public async getStoreAssetSettings (): Promise<Record<string, AssetSetting>> {
    return new Promise((resolve) => {
      this.store.get('AssetSetting', resolve);
    });
  }

  public async getAssetSettings (): Promise<Record<string, AssetSetting>> {
    if (Object.keys(this.assetSettingSubject.value).length === 0) {
      const assetSettings = (await this.getStoreAssetSettings() || {});

      this.assetSettingSubject.next(assetSettings);
    }

    return this.assetSettingSubject.value;
  }

  public async updateAssetSetting (assetSlug: string, assetSetting: AssetSetting, autoEnableNativeToken?: boolean): Promise<boolean | undefined> {
    const currentAssetSettings = await this.getAssetSettings();

    let needUpdateSubject: boolean | undefined;

    // Update settings
    currentAssetSettings[assetSlug] = assetSetting;

    if (assetSetting.visible) {
      const assetInfo = this.getAssetBySlug(assetSlug);
      const chainState = this.getChainStateByKey(assetInfo.originChain);

      // if chain not enabled, then automatically enable
      if (chainState && !chainState.active) {
        await this.enableChain(chainState.slug);
        needUpdateSubject = true;

        if (autoEnableNativeToken) {
          const nativeAsset = this.getNativeTokenInfo(assetInfo.originChain);

          currentAssetSettings[nativeAsset.slug] = { visible: true };
        }
      }
    }

    this.setAssetSettings(currentAssetSettings);

    return needUpdateSubject;
  }

  public async updateAssetSettingByChain (chainSlug: string, visible: boolean) {
    const storedAssetSettings = await this.getAssetSettings();
    const assetsByChain = this.getFungibleTokensByChain(chainSlug);
    const assetSettings: Record<string, AssetSetting> = storedAssetSettings || {};

    Object.values(assetsByChain).forEach((assetInfo) => {
      assetSettings[assetInfo.slug] = { visible };
    });

    this.setAssetSettings(assetSettings);
  }

  public async updatePriorityAssetsByChain (chainSlug: string, visible: boolean) {
    const currentAssetSettings = await this.getAssetSettings();
    const assetsByChain = this.getFungibleTokensByChain(chainSlug);
    const priorityTokensMap = this.priorityTokensSubject.value || {};

    const priorityTokensList = priorityTokensMap.token && typeof priorityTokensMap.token === 'object'
      ? Object.keys(priorityTokensMap.token)
      : [];

    for (const asset of Object.values(assetsByChain)) {
      if (visible) {
        const isPriorityToken = priorityTokensList.includes(asset.slug);

        if (isPriorityToken || _isNativeToken(asset)) {
          currentAssetSettings[asset.slug] = { visible: true };
        }
      } else {
        currentAssetSettings[asset.slug] = { visible: false };
      }
    }

    this.setAssetSettings(currentAssetSettings);
  }

  public subscribeAssetSettings () {
    return this.assetSettingSubject;
  }

  public getAssetLogoMap (): Record<string, string> {
    return this.assetLogoMapSubject.value;
  }

  public subscribeAssetLogoMap () {
    return this.assetLogoMapSubject;
  }

  public getChainLogoMap (): Record<string, string> {
    return this.chainLogoMapSubject.value;
  }

  public subscribeChainLogoMap () {
    return this.chainLogoMapSubject;
  }

  public resetWallet (resetAll: boolean) {
    if (resetAll) {
      this.setAssetSettings({});

      // Disconnect chain
      const activeChains = this.getActiveChainInfos();

      for (const chain of Object.keys(activeChains)) {
        if (!_DEFAULT_ACTIVE_CHAINS.includes(chain)) {
          this.disableChain(chain, true);
        }
      }

      // Remove custom chain
      const allChains = this.getChainInfoMap();

      for (const chain of Object.keys(allChains)) {
        if (_isCustomChain(chain)) {
          this.removeCustomChain(chain);
        }
      }

      // Remove custom asset
      const assetSettings = this.getAssetSettings();

      const customToken: string[] = [];

      for (const asset of Object.keys(assetSettings)) {
        if (_isCustomAsset(asset)) {
          customToken.push(asset);
        }
      }

      this.deleteCustomAssets(customToken);
    }
  }

  /* Metadata */

  getMetadata (chain: string) {
    return this.dbService.stores.metadata.getMetadata(chain);
  }

  upsertMetadata (chain: string, metadata: IMetadataItem) {
    return this.dbService.stores.metadata.upsertMetadata(chain, metadata);
  }

  getMetadataV15 (chain: string) {
    return this.dbService.stores.metadataV15.getMetadata(chain);
  }

  upsertMetadataV15 (chain: string, metadata: IMetadataV15Item) {
    return this.dbService.stores.metadataV15.upsertMetadata(chain, metadata);
  }

  getMetadataByHash (hash: string) {
    return this.dbService.stores.metadata.getMetadataByGenesisHash(hash);
  }

  getExtraInfo (metadata: MetadataItem): Omit<ExtraInfo, 'specVersion' | 'specName'> {
    const tokenInfo = metadata.tokenInfo;

    return {
      decimals: tokenInfo?.tokenDecimals ?? 0,
      tokenSymbol: tokenInfo?.tokenSymbol ?? 'Unit',
      base58Prefix: tokenInfo?.ss58Format ?? 42
    };
  }

  async calculateMetadataHash (chain: string): Promise<string | undefined> {
    const metadata = await this.getMetadata(chain);
    const metadataV15 = await this.getMetadataV15(chain);

    if (!metadata || !metadataV15 || !metadataV15.hexV15) {
      return undefined;
    }

    const extraInfo = this.getExtraInfo(metadata);
    const specVersion = parseInt(metadata.specVersion);
    const specName = metadata.specName;
    const hexV15 = metadataV15.hexV15;

    return calculateMetadataHash({ ...extraInfo, specVersion, specName }, hexV15);
  }

  async shortenMetadata (chain: string, txBlob: string): Promise<string | undefined> {
    const metadata = await this.getMetadata(chain);
    const metadataV15 = await this.getMetadataV15(chain);

    if (!metadata || !metadataV15 || !metadataV15.hexV15) {
      return undefined;
    }

    const extraInfo = this.getExtraInfo(metadata);
    const specVersion = parseInt(metadata.specVersion);
    const specName = metadata.specName;
    const hexV15 = metadataV15.hexV15;

    return getShortMetadata(txBlob as HexString, { ...extraInfo, specVersion, specName }, hexV15);
  }

  /* Metadata */

  getSubscanChainMap (reverse?: boolean): Record<string, string> {
    const result: Record<string, string> = {};
    const chainInfoMap = this.getChainInfoMap();

    Object.values(chainInfoMap).forEach((i) => {
      const subscanSlug = i.extraInfo?.subscanSlug;

      if (!subscanSlug) {
        return;
      }

      if (!reverse) {
        result[i.slug] = subscanSlug;
      } else {
        result[subscanSlug] = i.slug;
      }
    });

    return result;
  }

  public get detectBalanceChainSlugMap () {
    const result: Record<string, string> = {};
    const chainInfoMap = this.getChainInfoMap();

    for (const [key, chainInfo] of Object.entries(chainInfoMap)) {
      const chainBalanceSlug = chainInfo.extraInfo?.chainBalanceSlug || '';

      if (chainBalanceSlug) {
        result[chainBalanceSlug] = key;
      }
    }

    return result;
  }

  public getFeeTokensByChain (chainSlug: string): string[] {
    return Object.values(this.getAssetRegistry()).filter((chainAsset) => {
      return chainAsset.originChain === chainSlug && (chainAsset.assetType === _AssetType.NATIVE || _isAssetCanPayTxFee(chainAsset));
    }).map((chainAsset) => chainAsset.slug);
  }

  public async isUseMetadataToCreateApi (chain: string): Promise<boolean> {
    const isMythos = ['mythos', 'muse_testnet'].includes(chain);

    if (isMythos) {
      return this.dbService.hasRunScript(MYTHOS_MIGRATION_KEY);
    } else {
      return true;
    }
  }
}
