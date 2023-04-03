// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { withErrorLog } from '@subwallet/extension-base/background/handlers/helpers';
import State, { AuthUrls, Resolver } from '@subwallet/extension-base/background/handlers/State';
import { isSubscriptionRunning, unsubscribe } from '@subwallet/extension-base/background/handlers/subscriptions';
import { AccountRefMap, APIItemState, ApiMap, AuthRequestV2, BalanceItem, BalanceJson, ChainRegistry, ConfirmationDefinitions, ConfirmationsQueue, ConfirmationsQueueItemOptions, ConfirmationType, CrowdloanItem, CrowdloanJson, CurrentAccountInfo, CustomToken, CustomTokenJson, CustomTokenType, DeleteCustomTokenParams, EvmSendTransactionParams, EvmSendTransactionRequestExternal, EvmSignatureRequestExternal, ExternalRequestPromise, ExternalRequestPromiseStatus, NETWORK_STATUS, NetworkJson, NftCollection, NftItem, NftJson, NftTransferExtra, PriceJson, RequestAccountExportPrivateKey, RequestCheckPublicAndSecretKey, RequestConfirmationComplete, RequestSettingsType, ResponseAccountExportPrivateKey, ResponseCheckPublicAndSecretKey, ResponseSettingsType, ResultResolver, ServiceInfo, SingleModeJson, StakeUnlockingJson, StakingItem, StakingJson, StakingRewardItem, StakingRewardJson, ThemeTypes, TokenInfo, TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { AuthorizeRequest, RequestAuthorizeTab } from '@subwallet/extension-base/background/types';
import { Web3Transaction } from '@subwallet/extension-base/signers/types';
import { getId } from '@subwallet/extension-base/utils/getId';
import { getTokenPrice } from '@subwallet/extension-koni-base/api/coingecko';
import { initApi } from '@subwallet/extension-koni-base/api/dotsama';
import { cacheRegistryMap, getRegistry } from '@subwallet/extension-koni-base/api/dotsama/registry';
import { parseTxAndSignature } from '@subwallet/extension-koni-base/api/evm/external/shared';
import { PREDEFINED_GENESIS_HASHES, PREDEFINED_NETWORKS } from '@subwallet/extension-koni-base/api/predefinedNetworks';
import { PREDEFINED_SINGLE_MODES } from '@subwallet/extension-koni-base/api/predefinedSingleMode';
// eslint-disable-next-line camelcase
import { deleteCustomTokens, FUNGIBLE_TOKEN_STANDARDS, getTokensForChainRegistry, upsertCustomToken } from '@subwallet/extension-koni-base/api/tokens';
import { DEFAULT_SUPPORTED_TOKENS } from '@subwallet/extension-koni-base/api/tokens/defaultSupportedTokens';
import { initEvmTokenState } from '@subwallet/extension-koni-base/api/tokens/evm/utils';
import { initWeb3Api } from '@subwallet/extension-koni-base/api/tokens/evm/web3';
import { initWasmTokenState } from '@subwallet/extension-koni-base/api/tokens/wasm/utils';
import { EvmRpcError } from '@subwallet/extension-koni-base/background/errors/EvmRpcError';
import { state } from '@subwallet/extension-koni-base/background/handlers/index';
import { ALL_ACCOUNT_KEY, ALL_GENESIS_HASH } from '@subwallet/extension-koni-base/constants';
import DatabaseService from '@subwallet/extension-koni-base/services/DatabaseService';
import { CurrentAccountStore, NetworkMapStore, PriceStore } from '@subwallet/extension-koni-base/stores';
import AccountRefStore from '@subwallet/extension-koni-base/stores/AccountRef';
import AuthorizeStore from '@subwallet/extension-koni-base/stores/Authorize';
import CustomTokenStore from '@subwallet/extension-koni-base/stores/CustomEvmToken';
import SettingsStore from '@subwallet/extension-koni-base/stores/Settings';
import { getCurrentProvider, mergeNetworkProviders } from '@subwallet/extension-koni-base/utils';
import { anyNumberToBN } from '@subwallet/extension-koni-base/utils/eth';
import SimpleKeyring from 'eth-simple-keyring';
import RLP, { Input } from 'rlp';
import { BehaviorSubject, Subject } from 'rxjs';
import Web3 from 'web3';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

import { decodePair } from '@polkadot/keyring/pair/decode';
import { KeyringPair$Meta } from '@polkadot/keyring/types';
import { keyring } from '@polkadot/ui-keyring';
import { accounts } from '@polkadot/ui-keyring/observable/accounts';
import { assert, BN, hexStripPrefix, hexToU8a, isHex, logger as createLogger, u8aToHex } from '@polkadot/util';
import { Logger } from '@polkadot/util/types';
import { base64Decode, isEthereumAddress, keyExtractSuri } from '@polkadot/util-crypto';
import { KeypairType } from '@polkadot/util-crypto/types';

import { KoniCron } from '../cron';
import { KoniSubscription } from '../subscription';

const ETH_DERIVE_DEFAULT = '/m/44\'/60\'/0\'/0/0';

function getSuri (seed: string, type?: KeypairType): string {
  return type === 'ethereum'
    ? `${seed}${ETH_DERIVE_DEFAULT}`
    : seed;
}

// function generateDefaultStakingMap () {
//   const stakingMap: Record<string, StakingItem> = {};
//
//   Object.keys(DEFAULT_STAKING_NETWORKS).forEach((networkKey) => {
//     stakingMap[parseStakingItemKey(networkKey)] = {
//       name: PREDEFINED_NETWORKS[networkKey].chain,
//       chain: networkKey,
//       nativeToken: PREDEFINED_NETWORKS[networkKey].nativeToken,
//       state: APIItemState.PENDING
//     } as StakingItem;
//   });
//
//   return stakingMap;
// }

function generateDefaultCrowdloanMap () {
  const crowdloanMap: Record<string, CrowdloanItem> = {};

  Object.keys(PREDEFINED_NETWORKS).forEach((networkKey) => {
    crowdloanMap[networkKey] = {
      state: APIItemState.PENDING,
      contribute: '0'
    };
  });

  return crowdloanMap;
}

export default class KoniState extends State {
  private readonly unsubscriptionMap: Record<string, () => void> = {};

  public readonly authSubjectV2: BehaviorSubject<AuthorizeRequest[]> = new BehaviorSubject<AuthorizeRequest[]>([]);

  private readonly networkMapStore = new NetworkMapStore(); // persist custom networkMap by user
  private readonly customTokenStore = new CustomTokenStore();
  private readonly priceStore = new PriceStore();
  private readonly currentAccountStore = new CurrentAccountStore();
  private readonly settingsStore = new SettingsStore();
  private readonly accountRefStore = new AccountRefStore();
  private readonly authorizeStore = new AuthorizeStore();
  readonly #authRequestsV2: Record<string, AuthRequestV2> = {};
  private readonly evmChainSubject = new Subject<AuthUrls>();
  private readonly authorizeUrlSubject = new Subject<AuthUrls>();
  private authorizeCached: AuthUrls | undefined = undefined;

  private priceStoreReady = false;
  private externalRequest: Record<string, ExternalRequestPromise> = {};

  private readonly confirmationsQueueSubject = new BehaviorSubject<ConfirmationsQueue>({
    addNetworkRequest: {},
    addTokenRequest: {},
    switchNetworkRequest: {},
    evmSignatureRequest: {},
    evmSignatureRequestExternal: {},
    evmSendTransactionRequest: {},
    evmSendTransactionRequestExternal: {}
  });

  private readonly confirmationsPromiseMap: Record<string, { resolver: Resolver<any>, validator?: (rs: any) => Error | undefined }> = {};

  private networkMap: Record<string, NetworkJson> = {}; // mapping to networkMapStore, for uses in background
  private networkMapSubject = new Subject<Record<string, NetworkJson>>();
  private lockNetworkMap = false;

  private apiMap: ApiMap = { dotSama: {}, web3: {} };

  private serviceInfoSubject = new Subject<ServiceInfo>();

  private customTokenState: CustomTokenJson = { erc20: [], erc721: [], psp22: [], psp34: [] };
  private customTokenSubject = new Subject<CustomTokenJson>();

  private balanceMap: Record<string, BalanceItem> = this.generateDefaultBalanceMap();
  private balanceSubject = new Subject<BalanceJson>();

  private crowdloanMap: Record<string, CrowdloanItem> = generateDefaultCrowdloanMap();
  private crowdloanSubject = new Subject<CrowdloanJson>();

  private nftTransferSubject = new Subject<NftTransferExtra>();
  // Only for rendering nft after transfer
  private nftTransferState: NftTransferExtra = {
    cronUpdate: false,
    forceUpdate: false
  };

  private nftSubject = new Subject<NftJson>();
  private stakingSubject = new Subject<StakingJson>();

  private stakingRewardSubject = new Subject<StakingRewardJson>();
  private stakingRewardState: StakingRewardJson = { ready: false, slowInterval: [], fastInterval: [] } as StakingRewardJson;

  private stakeUnlockingInfoSubject = new Subject<StakeUnlockingJson>();
  private stakeUnlockingInfo: StakeUnlockingJson = { timestamp: -1, details: [] };

  private historyMap: Record<string, TransactionHistoryItemType[]> = {};
  private historySubject = new Subject<Record<string, TransactionHistoryItemType[]>>();

  private chainRegistryMap: Record<string, ChainRegistry> = {};
  private chainRegistrySubject = new Subject<Record<string, ChainRegistry>>();

  private lazyMap: Record<string, unknown> = {};
  public dbService: DatabaseService;
  private cron: KoniCron;
  private subscription: KoniSubscription;
  private logger: Logger;
  private ready = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (...args: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(args);
    this.dbService = new DatabaseService();
    this.subscription = new KoniSubscription(this, this.dbService);
    this.cron = new KoniCron(this, this.subscription, this.dbService);
    this.logger = createLogger('State');
    this.init();
  }

  public generateDefaultBalanceMap () {
    const balanceMap: Record<string, BalanceItem> = {};

    Object.values(this.networkMap).forEach((networkJson) => {
      if (networkJson.active) {
        balanceMap[networkJson.key] = {
          state: APIItemState.PENDING
        };
      }
    });

    return balanceMap;
  }

  public init () {
    this.initNetworkStates();
    this.updateServiceInfo();
  }

  private onReady () {
    this.subscription.start();
    this.cron.start();

    this.ready = true;
  }

  public isReady () {
    return this.ready;
  }

  // init networkMap, apiMap and chainRegistry (first time only)
  // TODO: merge transactionHistory when custom network -> predefined network
  public initNetworkStates () {
    this.networkMapStore.get('NetworkMap', (storedNetworkMap) => {
      if (!storedNetworkMap) { // first time init extension
        this.networkMapStore.set('NetworkMap', PREDEFINED_NETWORKS);
        this.networkMap = PREDEFINED_NETWORKS;
      } else { // merge custom providers in stored data with predefined data
        const mergedNetworkMap: Record<string, NetworkJson> = PREDEFINED_NETWORKS;

        for (const [key, storedNetwork] of Object.entries(storedNetworkMap)) {
          if (key in PREDEFINED_NETWORKS) {
            // check change and override custom providers if exist
            if ('customProviders' in storedNetwork) {
              mergedNetworkMap[key].customProviders = storedNetwork.customProviders;
              mergedNetworkMap[key].currentProvider = storedNetwork.currentProvider;
            }

            if (key !== 'polkadot' && key !== 'kusama') {
              mergedNetworkMap[key].active = storedNetwork.active;
            }

            mergedNetworkMap[key].crowdloanUrl = storedNetwork.crowdloanUrl;
            mergedNetworkMap[key].currentProviderMode = (mergedNetworkMap[key].currentProvider || '').startsWith('http') ? 'http' : 'ws';
          } else {
            if (Object.keys(PREDEFINED_GENESIS_HASHES).includes(storedNetwork.genesisHash)) { // merge networks with same genesis hash
              // @ts-ignore
              const targetKey = PREDEFINED_GENESIS_HASHES[storedNetwork.genesisHash];

              const { currentProviderMethod, parsedCustomProviders, parsedProviderKey } = mergeNetworkProviders(storedNetwork, PREDEFINED_NETWORKS[targetKey]);

              mergedNetworkMap[targetKey].customProviders = parsedCustomProviders;
              mergedNetworkMap[targetKey].currentProvider = parsedProviderKey;
              mergedNetworkMap[targetKey].active = storedNetwork.active;
              // @ts-ignore
              mergedNetworkMap[targetKey].currentProviderMode = currentProviderMethod;
            } else {
              if (key.startsWith('custom')) { // in case a predefined network is removed, it will be discarded
                mergedNetworkMap[key] = storedNetwork;
              }
            }
          }
        }

        this.networkMapStore.set('NetworkMap', mergedNetworkMap);
        this.networkMap = mergedNetworkMap; // init networkMap state
      }

      for (const [key, network] of Object.entries(this.networkMap)) {
        const currentProvider = getCurrentProvider(network);

        if (!currentProvider) {
          continue;
        }

        if (network.active) {
          this.apiMap.dotSama[key] = initApi(key, currentProvider, network.isEthereum);

          if (network.isEthereum && network.isEthereum) {
            this.apiMap.web3[key] = initWeb3Api(currentProvider);
          }
        }
      }

      this.initCustomTokenState();
    });
  }

  public initCustomTokenState () {
    this.customTokenStore.get('EvmToken', (storedCustomTokens) => {
      if (!storedCustomTokens) {
        this.customTokenState = DEFAULT_SUPPORTED_TOKENS;
      } else {
        const processedEvmTokens = initEvmTokenState(storedCustomTokens, this.networkMap);

        const processedWasmTokens = initWasmTokenState(storedCustomTokens, this.networkMap);

        this.customTokenState = { ...processedEvmTokens, ...processedWasmTokens };
      }

      this.customTokenStore.set('EvmToken', this.customTokenState);
      this.customTokenSubject.next(this.customTokenState);

      this.initChainRegistry();
    });
  }

  private lazyNext = (key: string, callback: () => void) => {
    if (this.lazyMap[key]) {
      // @ts-ignore
      clearTimeout(this.lazyMap[key]);
    }

    const lazy = setTimeout(() => {
      callback();
      clearTimeout(lazy);
    }, 300);

    this.lazyMap[key] = lazy;
  };

  public getAuthRequestV2 (id: string): AuthRequestV2 {
    return this.#authRequestsV2[id];
  }

  public get numAuthRequestsV2 (): number {
    return Object.keys(this.#authRequestsV2).length;
  }

  public get allAuthRequestsV2 (): AuthorizeRequest[] {
    return Object
      .values(this.#authRequestsV2)
      .map(({ id, request, url }): AuthorizeRequest => ({ id, request, url }));
  }

  public setAuthorize (data: AuthUrls, callback?: () => void): void {
    this.authorizeStore.set('authUrls', data, () => {
      this.authorizeCached = data;
      this.evmChainSubject.next(this.authorizeCached);
      this.authorizeUrlSubject.next(this.authorizeCached);
      callback && callback();
    });
  }

  public getAuthorize (update: (value: AuthUrls) => void): void {
    // This action can be use many by DApp interaction => caching it in memory
    if (this.authorizeCached) {
      update(this.authorizeCached);
    } else {
      this.authorizeStore.get('authUrls', (data) => {
        this.authorizeCached = data;
        update(this.authorizeCached);
      });
    }
  }

  public subscribeEvmChainChange (): Subject<AuthUrls> {
    return this.evmChainSubject;
  }

  public subscribeAuthorizeUrlSubject (): Subject<AuthUrls> {
    return this.authorizeUrlSubject;
  }

  private updateIconV2 (shouldClose?: boolean): void {
    const authCount = this.numAuthRequestsV2;
    const confirmCount = this.countConfirmationNumber();
    const text = (
      authCount
        ? 'Auth'
        : confirmCount > 0 ? confirmCount.toString() : ''
    );

    withErrorLog(() => chrome.browserAction.setBadgeText({ text }));

    if (shouldClose && text === '') {
      this.popupClose();
    }
  }

  public getAuthList (): Promise<AuthUrls> {
    return new Promise<AuthUrls>((resolve, reject) => {
      this.getAuthorize((rs: AuthUrls) => {
        resolve(rs);
      });
    });
  }

  getAddressList (value = false): Record<string, boolean> {
    const addressList = Object.keys(accounts.subject.value);

    return addressList.reduce((addressList, v) => ({ ...addressList, [v]: value }), {});
  }

  private updateIconAuthV2 (shouldClose?: boolean): void {
    this.authSubjectV2.next(this.allAuthRequestsV2);
    this.updateIconV2(shouldClose);
  }

  private authCompleteV2 = (id: string, resolve: (result: boolean) => void, reject: (error: Error) => void): Resolver<ResultResolver> => {
    const isAllowedMap = this.getAddressList();

    const complete = (result: boolean | Error, cb: () => void, accounts?: string[]) => {
      const isAllowed = result === true;
      let isCancelled = false;

      if (!isAllowed && typeof result === 'object' && result.message === 'Cancelled') {
        isCancelled = true;
      }

      if (accounts && accounts.length) {
        accounts.forEach((acc) => {
          isAllowedMap[acc] = true;
        });
      } else {
        // eslint-disable-next-line no-return-assign
        Object.keys(isAllowedMap).forEach((address) => isAllowedMap[address] = false);
      }

      const { accountAuthType, idStr, request: { allowedAccounts, origin }, url } = this.#authRequestsV2[id];

      if (accountAuthType !== 'both') {
        const isEvmType = accountAuthType === 'evm';

        const backupAllowed = [...(allowedAccounts || [])].filter((a) => {
          const isEth = isEthereumAddress(a);

          return isEvmType ? !isEth : isEth;
        });

        backupAllowed.forEach((acc) => {
          isAllowedMap[acc] = true;
        });
      }

      let defaultEvmNetworkKey: string | undefined;

      if (accountAuthType === 'both' || accountAuthType === 'evm') {
        const defaultNetworkJson = Object.values(this.getNetworkMap()).find((network) => (network.isEthereum && network.active));

        if (defaultNetworkJson) {
          defaultEvmNetworkKey = defaultNetworkJson.key;
        }
      }

      this.getAuthorize((value) => {
        let authorizeList = {} as AuthUrls;

        if (value) {
          authorizeList = value;
        }

        const existed = authorizeList[this.stripUrl(url)];

        // On cancel don't save anything
        if (isCancelled) {
          delete this.#authRequestsV2[id];
          this.updateIconAuthV2(true);
          cb();

          return;
        }

        authorizeList[this.stripUrl(url)] = {
          count: 0,
          id: idStr,
          isAllowed,
          isAllowedMap,
          origin,
          url,
          accountAuthType: (existed && existed.accountAuthType !== accountAuthType) ? 'both' : accountAuthType,
          currentEvmNetworkKey: existed ? existed.currentEvmNetworkKey : defaultEvmNetworkKey
        };

        this.setAuthorize(authorizeList, () => {
          cb();
          delete this.#authRequestsV2[id];
          this.updateIconAuthV2(true);
        });
      });
    };

    return {
      reject: (error: Error): void => {
        complete(error, () => {
          reject(error);
        });
      },
      resolve: ({ accounts, result }: ResultResolver): void => {
        complete(result, () => {
          resolve(result);
        }, accounts);
      }
    };
  };

  public async authorizeUrlV2 (url: string, request: RequestAuthorizeTab): Promise<boolean> {
    let authList = await this.getAuthList();
    const accountAuthType = request.accountAuthType || 'substrate';

    request.accountAuthType = accountAuthType;

    if (!authList) {
      authList = {};
    }

    const idStr = this.stripUrl(url);
    // Do not enqueue duplicate authorization requests.
    const isDuplicate = Object.values(this.#authRequestsV2)
      .some((request) => request.idStr === idStr);

    assert(!isDuplicate, `The source ${url} has a pending authorization request`);

    const existedAuth = authList[idStr];
    const existedAccountAuthType = existedAuth?.accountAuthType;
    const confirmAnotherType = existedAccountAuthType !== 'both' && existedAccountAuthType !== request.accountAuthType;

    if (request.reConfirm && existedAuth) {
      request.origin = existedAuth.origin;
    }

    // Reconfirm if check auth for empty list
    if (existedAuth) {
      const inBlackList = existedAuth && !existedAuth.isAllowed;

      if (inBlackList) {
        throw new Error(`The source ${url} is not allowed to interact with this extension`);
      }

      request.allowedAccounts = Object.entries(existedAuth.isAllowedMap)
        .map(([address, allowed]) => (allowed ? address : ''))
        .filter((item) => (item !== ''));

      let allowedListByRequestType = [...request.allowedAccounts];

      if (accountAuthType === 'evm') {
        allowedListByRequestType = allowedListByRequestType.filter((a) => isEthereumAddress(a));
      } else if (accountAuthType === 'substrate') {
        allowedListByRequestType = allowedListByRequestType.filter((a) => !isEthereumAddress(a));
      }

      if (!confirmAnotherType && !request.reConfirm && allowedListByRequestType.length !== 0) {
        // Prevent appear confirmation popup
        return false;
      }
    }

    return new Promise((resolve, reject): void => {
      const id = getId();

      this.#authRequestsV2[id] = {
        ...this.authCompleteV2(id, resolve, reject),
        id,
        idStr,
        request,
        url,
        accountAuthType: accountAuthType
      };

      this.updateIconAuthV2();

      if (Object.keys(this.#authRequestsV2).length < 2) {
        this.popupOpen();
      }
    });
  }

  public async getStaking (): Promise<StakingJson> {
    const addresses = await this.getDecodedAddresses();

    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);

    const stakings = await this.dbService.getStakings(addresses, activeNetworkHashes);

    return { ready: true, details: stakings } as StakingJson;
  }

  public async getStakingRecordsByAddress (address: string): Promise<StakingItem[]> {
    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);

    return await this.dbService.getStakings([address], activeNetworkHashes);
  }

  public async getPooledStakingRecordsByAddress (addresses: string[]): Promise<StakingItem[]> {
    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);

    return await this.dbService.getPooledStakings(addresses, activeNetworkHashes);
  }

  public async getStoredStaking (address: string) {
    const items = await this.dbService.stores.staking.getDataByAddressAsObject(address);

    return items || {};
  }

  public getStakeUnlockingInfo () {
    return this.stakeUnlockingInfo;
  }

  public setStakeUnlockingInfo (data: StakeUnlockingJson) {
    this.stakeUnlockingInfo = data;

    this.stakeUnlockingInfoSubject.next(this.stakeUnlockingInfo);
  }

  public subscribeStakeUnlockingInfo () {
    return this.stakeUnlockingInfoSubject;
  }

  public subscribeStaking () {
    return this.stakingSubject;
  }

  public ensureUrlAuthorizedV2 (url: string): Promise<boolean> {
    const idStr = this.stripUrl(url);

    return new Promise((resolve, reject) => {
      this.getAuthorize((value) => {
        if (!value) {
          value = {};
        }

        const entry = Object.keys(value).includes(idStr);

        if (!entry) {
          reject(new Error(`The source ${url} has not been enabled yet`));
        }

        const isConnected = value[idStr] && Object.keys(value[idStr].isAllowedMap)
          .some((address) => value[idStr].isAllowedMap[address]);

        if (!isConnected) {
          reject(new Error(`The source ${url} is not allowed to interact with this extension`));
        }

        resolve(true);
      });
    });
  }

  public setStakingItem (networkKey: string, item: StakingItem): void {
    this.dbService.updateStaking(networkKey, this.getNetworkGenesisHashByKey(networkKey), item.address, item).catch((e) => this.logger.warn(e));
  }

  public setNftTransfer (data: NftTransferExtra, callback?: (data: NftTransferExtra) => void): void {
    this.nftTransferState = data;

    if (callback) {
      callback(data);
    }

    this.nftTransferSubject.next(data);
  }

  public getNftTransfer (): NftTransferExtra {
    return this.nftTransferState;
  }

  public getNftTransferSubscription (update: (value: NftTransferExtra) => void): void {
    update(this.nftTransferState);
  }

  public subscribeNftTransfer () {
    return this.nftTransferSubject;
  }

  public setNftCollection (network: string, data: NftCollection, callback?: (data: NftCollection) => void): void {
    this.dbService.addNftCollection(network, this.getNetworkGenesisHashByKey(network), data).catch((e) => this.logger.warn(e));
    callback && callback(data);
  }

  public getNftCollection () {
    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);

    return this.dbService.getAllNftCollection(activeNetworkHashes);
  }

  public subscribeNftCollection () {
    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);

    return this.dbService.stores.nftCollection.subscribeNftCollection(activeNetworkHashes);
  }

  public async resetNft (newAddress: string): Promise<void> {
    this.getNft().then((data) => this.nftSubject.next(data || { nftList: [], total: 0 })).catch((e) => this.logger.warn(e));

    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);
    const addresses = await this.getDecodedAddresses(newAddress);

    this.dbService.subscribeNft(addresses, activeNetworkHashes, (nfts) => {
      this.nftSubject.next({
        nftList: nfts,
        total: nfts.length
      });
    });
  }

  public updateNftData (network: string, nftData: NftItem, address: string, callback?: (nftData: NftItem) => void): void {
    this.dbService.addNft(network, this.getNetworkGenesisHashByKey(network), address, nftData).catch((e) => this.logger.warn(e));

    callback && callback(nftData);
  }

  public updateNftIds (chain: string, address: string, collectionId?: string, nftIds?: string[]): void {
    this.dbService.deleteRemovedNftsFromCollection(this.getNetworkGenesisHashByKey(chain), address, collectionId, nftIds).catch((e) => this.logger.warn(e));
  }

  public removeNfts (chain: string, address: string, collectionId: string, nftIds: string[]) {
    return this.dbService.removeNfts(this.getNetworkGenesisHashByKey(chain), address, collectionId, nftIds);
  }

  public updateCollectionIds (chain: string, address: string, collectionIds: string[] = []): void {
    this.dbService.deleteNftsFromRemovedCollection(this.getNetworkGenesisHashByKey(chain), address, collectionIds);
  }

  public async getNft (): Promise<NftJson | undefined> {
    const addresses = await this.getDecodedAddresses();

    if (!addresses.length) {
      return;
    }

    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);

    const nfts = await this.dbService.getNft(addresses, activeNetworkHashes);

    return {
      nftList: nfts,
      total: nfts.length
    };
  }

  public subscribeNft () {
    return this.nftSubject;
  }

  public resetStakingReward () {
    this.stakingRewardState.slowInterval = [];

    this.stakingRewardSubject.next(this.stakingRewardState);
  }

  public updateStakingReward (stakingRewardData: StakingRewardItem[], type: 'slowInterval' | 'fastInterval', callback?: (stakingRewardData: StakingRewardJson) => void): void {
    this.stakingRewardState.ready = true;
    this.stakingRewardState[type] = stakingRewardData;

    if (callback) {
      callback(this.stakingRewardState);
    }

    this.stakingRewardSubject.next(this.stakingRewardState);
  }

  public updateStakingRewardReady (ready: boolean) {
    this.stakingRewardState.ready = ready;
    this.stakingRewardSubject.next(this.stakingRewardState);
  }

  public getAccountRefMap (callback: (refMap: Record<string, Array<string>>) => void) {
    const refMap: AccountRefMap = {};

    this.accountRefStore.get('refList', (refList) => {
      if (refList) {
        refList.forEach((accRef) => {
          accRef.forEach((acc) => {
            refMap[acc] = [...accRef].filter((r) => !(r === acc));
          });
        });
      }

      callback(refMap);
    });
  }

  public addAccountRef (addresses: string[], callback: () => void) {
    this.accountRefStore.get('refList', (refList) => {
      const newList = refList ? [...refList] : [];

      newList.push(addresses);

      this.accountRefStore.set('refList', newList, callback);
    });
  }

  public removeAccountRef (address: string, callback: () => void) {
    this.accountRefStore.get('refList', (refList) => {
      if (refList) {
        refList.forEach((accRef) => {
          if (accRef.indexOf(address) > -1) {
            accRef.splice(accRef.indexOf(address), 1);
          }

          if (accRef.length < 2) {
            refList.splice(refList.indexOf(accRef), 1);
          }
        });

        this.accountRefStore.set('refList', refList, () => {
          callback();
        });
      } else {
        callback();
      }
    });
  }

  public getStakingReward (update: (value: StakingRewardJson) => void): void {
    update(this.stakingRewardState);
  }

  public subscribeStakingReward () {
    return this.stakingRewardSubject;
  }

  public setHistory (address: string, network: string, item: TransactionHistoryItemType | TransactionHistoryItemType[], callback?: (items: TransactionHistoryItemType[]) => void): void {
    let items: TransactionHistoryItemType[];
    const networkInfo = this.getNetworkMap()[network];

    if (!networkInfo) {
      return;
    }

    if (item && !Array.isArray(item)) {
      item.origin = 'app';
      items = [item];
    } else {
      items = item;
    }

    items.forEach((item) => {
      item.feeSymbol = networkInfo.nativeToken;

      if (!item.changeSymbol) {
        item.changeSymbol = networkInfo.nativeToken;
      }
    });

    if (items.length) {
      this.getAccountAddress().then((currentAddress) => {
        if (currentAddress === address) {
          const oldItems = this.historyMap[network] || [];

          this.historyMap[network] = this.combineHistories(oldItems, items);
          this.saveHistoryToStorage(address, network, this.historyMap[network]);
          callback && callback(this.historyMap[network]);

          this.lazyNext('setHistory', () => {
            this.publishHistory();
          });
        } else {
          this.saveHistoryToStorage(address, network, items);
          callback && callback(this.historyMap[network]);
        }
      }).catch((e) => this.logger.warn(e));
    }
  }

  public getCurrentAccount (update: (value: CurrentAccountInfo) => void): void {
    this.currentAccountStore.get('CurrentAccountInfo', update);
  }

  public setCurrentAccount (data: CurrentAccountInfo, callback?: () => void): void {
    const { address, currentGenesisHash } = data;

    if (address === ALL_ACCOUNT_KEY) {
      data.allGenesisHash = currentGenesisHash || undefined;
    }

    this.currentAccountStore.set('CurrentAccountInfo', data, () => {
      this.updateServiceInfo();
      callback && callback();
    });
  }

  public setAccountTie (address: string, genesisHash: string | null): boolean {
    if (address !== ALL_ACCOUNT_KEY) {
      const pair = keyring.getPair(address);

      assert(pair, 'Unable to find pair');

      keyring.saveAccountMeta(pair, { ...pair.meta, genesisHash });
    }

    this.getCurrentAccount((accountInfo) => {
      if (address === accountInfo.address) {
        accountInfo.currentGenesisHash = genesisHash as string || ALL_GENESIS_HASH;

        this.setCurrentAccount(accountInfo);
      }
    });

    return true;
  }

  public async switchEvmNetworkByUrl (shortenUrl: string, networkKey: string): Promise<void> {
    const authUrls = await this.getAuthList();

    if (authUrls[shortenUrl]) {
      if (this.networkMap[networkKey] && !this.networkMap[networkKey].active) {
        this.enableNetworkMap(networkKey);
      }

      authUrls[shortenUrl].currentEvmNetworkKey = networkKey;
      this.setAuthorize(authUrls);
    } else {
      throw new EvmRpcError('INTERNAL_ERROR', `Not found ${shortenUrl} in auth list`);
    }
  }

  public async switchNetworkAccount (id: string, url: string, networkKey: string, changeAddress?: string): Promise<boolean> {
    const selectNetwork = this.getNetworkMap()[networkKey];

    const { address, currentGenesisHash } = await new Promise<CurrentAccountInfo>((resolve) => {
      this.getCurrentAccount(resolve);
    });

    return this.addConfirmation(id, url, 'switchNetworkRequest', { networkKey, address: changeAddress }, { address: changeAddress })
      .then(({ isApproved }) => {
        if (isApproved) {
          const useAddress = changeAddress || address;

          if (this.networkMap[networkKey] && !this.networkMap[networkKey].active) {
            this.enableNetworkMap(networkKey);
          }

          if (useAddress !== ALL_ACCOUNT_KEY) {
            const pair = keyring.getPair(useAddress);

            assert(pair, 'Unable to find pair');

            keyring.saveAccountMeta(pair, { ...pair.meta, genesisHash: selectNetwork?.genesisHash });
          }

          if (address !== changeAddress || selectNetwork?.genesisHash !== currentGenesisHash || isApproved) {
            this.setCurrentAccount({
              address: useAddress,
              currentGenesisHash: selectNetwork?.genesisHash
            });
          }
        }

        return isApproved;
      });
  }

  public async addNetworkConfirm (id: string, url: string, networkData: NetworkJson) {
    networkData.requestId = id;

    return this.addConfirmation(id, url, 'addNetworkRequest', networkData)
      .then(({ isApproved }) => {
        return isApproved;
      });
  }

  public async addTokenConfirm (id: string, url: string, tokenInfo: CustomToken) {
    return this.addConfirmation(id, url, 'addTokenRequest', tokenInfo)
      .then(({ isApproved }) => {
        return isApproved;
      });
  }

  public getSettings (update: (value: RequestSettingsType) => void): void {
    this.settingsStore.get('Settings', (value) => {
      if (!value) {
        update({ isShowBalance: false, accountAllLogo: '', theme: 'dark' });
      } else {
        update(value);
      }
    });
  }

  public setSettings (data: RequestSettingsType, callback?: () => void): void {
    this.settingsStore.set('Settings', data, callback);
  }

  public setTheme (theme: ThemeTypes, callback?: (settingData: ResponseSettingsType) => void): void {
    this.getSettings((settings) => {
      const newSettings = {
        ...settings,
        theme
      };

      this.setSettings(newSettings, () => {
        callback && callback(newSettings);
      });
    });
  }

  public subscribeSettingsSubject (): Subject<RequestSettingsType> {
    return this.settingsStore.getSubject();
  }

  public subscribeCurrentAccount (): Subject<CurrentAccountInfo> {
    return this.currentAccountStore.getSubject();
  }

  public getAccountAddress (): Promise<string | null | undefined> {
    return new Promise((resolve, reject) => {
      this.getCurrentAccount((account) => {
        if (account) {
          resolve(account.address);
        } else {
          resolve(null);
        }
      });
    });
  }

  public async getDecodedAddresses (address?: string): Promise<string[]> {
    let checkingAddress: string | null | undefined = address;

    if (!address) {
      checkingAddress = await this.getAccountAddress();
    }

    if (!checkingAddress) {
      return [];
    }

    if (checkingAddress === ALL_ACCOUNT_KEY) {
      return Object.keys(accounts.subject.value);
    }

    return [checkingAddress];
  }

  public getAllAddresses (): string[] {
    return Object.keys(accounts.subject.value);
  }

  public getBalance (reset?: boolean): BalanceJson {
    const activeData = this.removeInactiveNetworkData(this.balanceMap);

    return { details: activeData, reset } as BalanceJson;
  }

  public async getStoredBalance (address: string): Promise<Record<string, BalanceItem>> {
    const items = await this.dbService.stores.balance.getDataByAddressAsObject(address);

    return items || {};
  }

  public async switchAccount (newAddress: string) {
    await Promise.all([
      this.resetBalanceMap(newAddress),
      this.resetCrowdloanMap(newAddress)
    ]);
  }

  public async resetBalanceMap (newAddress: string) {
    const defaultData = this.generateDefaultBalanceMap();
    let storedData = await this.getStoredBalance(newAddress);

    storedData = this.removeInactiveNetworkData(storedData);

    const merge = { ...defaultData, ...storedData } as Record<string, BalanceItem>;

    this.balanceMap = merge;
    this.publishBalance(true);
  }

  public async resetCrowdloanMap (newAddress: string) {
    const defaultData = generateDefaultCrowdloanMap();
    const storedData = await this.getStoredCrowdloan(newAddress);

    // storedData = this.removeInactiveNetworkData(storedData);

    this.crowdloanMap = { ...defaultData, ...storedData } as Record<string, CrowdloanItem>;
    this.publishCrowdloan(true);
  }

  public async resetStaking (newAddress: string) {
    this.getStaking()
      .then((data) => {
        this.stakingSubject.next(data);
      })
      .catch((e) => this.logger.warn(e));

    const activeNetworkHashes = Object.values(this.activeNetworks).map((network) => network.genesisHash);
    const addresses = await this.getDecodedAddresses(newAddress);

    this.dbService.subscribeStaking(addresses, activeNetworkHashes, (stakings) => {
      this.stakingSubject.next({
        ready: true,
        details: stakings
      });
    });
  }

  public setBalanceItem (networkKey: string, item: BalanceItem) {
    // eslint-disable-next-line no-prototype-builtins
    if (typeof item === 'object' && item.hasOwnProperty('children') && item.children === undefined) {
      delete item.children;
    }

    const itemData = { timestamp: +new Date(), ...item };

    this.balanceMap[networkKey] = { ...this.balanceMap[networkKey], ...itemData };
    this.updateBalanceStore(networkKey, item);

    this.lazyNext('setBalanceItem', () => {
      this.publishBalance();
    });
  }

  private updateBalanceStore (networkKey: string, item: BalanceItem) {
    this.getCurrentAccount((currentAccountInfo) => {
      this.dbService.updateBalanceStore(networkKey, this.getNetworkGenesisHashByKey(networkKey), currentAccountInfo.address, item).catch((e) => this.logger.warn(e));
    });
  }

  public subscribeBalance () {
    return this.balanceSubject;
  }

  public getCrowdloan (reset?: boolean): CrowdloanJson {
    // const activeData = this.removeInactiveNetworkData(this.crowdloanMap);

    return { details: this.crowdloanMap, reset } as CrowdloanJson;
  }

  public async getStoredCrowdloan (address: string) {
    const items = await this.dbService.stores.crowdloan.getDataByAddressAsObject(address);

    return items || {};
  }

  public setCrowdloanItem (networkKey: string, item: CrowdloanItem) {
    const itemData = { ...item, timestamp: +new Date() };

    // Update crowdloan map
    this.crowdloanMap[networkKey] = itemData;
    this.updateCrowdloanStore(networkKey, itemData);

    this.lazyNext('setCrowdloanItem', () => {
      this.publishCrowdloan();
    });
  }

  private updateCrowdloanStore (networkKey: string, item: CrowdloanItem) {
    this.getCurrentAccount((currentAccountInfo) => {
      this.dbService.updateCrowdloanStore(networkKey, this.getNetworkGenesisHashByKey(networkKey), currentAccountInfo.address, item).catch((e) => this.logger.warn(e));
    });
  }

  public subscribeCrowdloan () {
    return this.crowdloanSubject;
  }

  public getChainRegistryMap (): Record<string, ChainRegistry> {
    return this.chainRegistryMap;
  }

  public setChainRegistryItem (networkKey: string, registry: ChainRegistry) {
    this.chainRegistryMap[networkKey] = registry;
    this.lazyNext('setChainRegistry', () => {
      this.chainRegistrySubject.next(this.getChainRegistryMap());
    });
  }

  public checkTokenKey (tokenData: CustomToken): string {
    const chainRegistry = this.chainRegistryMap[tokenData.chain];
    let tokenKey = '';

    for (const [key, token] of Object.entries(chainRegistry.tokenMap)) {
      if (token.contractAddress === tokenData.smartContract) {
        tokenKey = key;
        break;
      }
    }

    return tokenKey;
  }

  public upsertChainRegistry (tokenData: CustomToken) {
    const chainRegistry = this.chainRegistryMap[tokenData.chain];

    if (chainRegistry) {
      const tokenKey = this.checkTokenKey(tokenData);

      if (tokenKey !== '') {
        chainRegistry.tokenMap[tokenKey] = {
          isMainToken: false,
          symbol: tokenData.symbol,
          name: tokenData.name,
          contractAddress: tokenData.smartContract,
          decimals: tokenData.decimals,
          type: tokenData.type
        } as TokenInfo;
      } else {
        // @ts-ignore
        chainRegistry.tokenMap[tokenData.symbol] = {
          isMainToken: false,
          symbol: tokenData.symbol,
          name: tokenData.name,
          contractAddress: tokenData.smartContract,
          decimals: tokenData.decimals,
          type: tokenData.type
        } as TokenInfo;
      }

      cacheRegistryMap[tokenData.chain] = chainRegistry;
      this.chainRegistrySubject.next(this.getChainRegistryMap());
    }
  }

  public initChainRegistry () {
    this.chainRegistryMap = cacheRegistryMap; // prevents deleting token registry even when network is disabled
    this.getCustomTokenStore((storedCustomTokens) => {
      const customTokens = getTokensForChainRegistry(storedCustomTokens);

      this.setChainRegistryItem('polkadot', {
        chainDecimals: [10],
        chainTokens: ['DOT'],
        tokenMap: {
          DOT: {
            isMainToken: true,
            name: 'DOT',
            symbol: 'DOT',
            decimals: 10
          }
        }
      });

      this.setChainRegistryItem('kusama', {
        chainDecimals: [12],
        chainTokens: ['KSM'],
        tokenMap: {
          KSM: {
            isMainToken: true,
            name: 'KSM',
            symbol: 'KSM',
            decimals: 12
          }
        }
      });

      Object.entries(this.apiMap.dotSama).forEach(([networkKey, { api }]) => {
        getRegistry(networkKey, api, customTokens)
          .then((rs) => {
            this.setChainRegistryItem(networkKey, rs);
          })
          .catch(this.logger.error);
      });

      this.onReady();
    });
  }

  public subscribeChainRegistryMap () {
    return this.chainRegistrySubject;
  }

  public getTransactionHistory (address: string, networkKey: string, update: (items: TransactionHistoryItemType[]) => void): void {
    const items = this.historyMap[networkKey];

    if (!items) {
      update([]);
    } else {
      update(items);
    }
  }

  public subscribeHistory () {
    return this.historySubject;
  }

  public getHistoryMap (): Record<string, TransactionHistoryItemType[]> {
    return this.removeInactiveNetworkData(this.historyMap);
  }

  public setPrice (priceData: PriceJson, callback?: (priceData: PriceJson) => void): void {
    this.priceStore.set('PriceData', priceData, () => {
      if (callback) {
        callback(priceData);
        this.priceStoreReady = true;
      }
    });
  }

  public getPrice (update: (value: PriceJson) => void): void {
    this.priceStore.get('PriceData', (rs) => {
      if (this.priceStoreReady) {
        update(rs);
      } else {
        const activeNetworks = Object.values(state.getNetworkMap()).map((network) => network.coinGeckoKey).filter((key) => key) as string[];

        getTokenPrice(activeNetworks)
          .then((rs) => {
            this.setPrice(rs);
            update(rs);
          })
          .catch((err) => {
            this.logger.error(err);
            throw err;
          });
      }
    });
  }

  public subscribePrice () {
    return this.priceStore.getSubject();
  }

  public subscribeCustomToken () {
    return this.customTokenSubject;
  }

  public getCustomTokenState () {
    return this.customTokenState;
  }

  public getActiveErc20Tokens () {
    const filteredErc20Tokens: CustomToken[] = [];

    this.customTokenState.erc20.forEach((token) => {
      if (!token.isDeleted) {
        filteredErc20Tokens.push(token);
      }
    });

    return filteredErc20Tokens;
  }

  public getActiveNftContracts () {
    const filteredNftContracts: CustomToken[] = [];

    Object.entries(this.customTokenState).forEach(([_tokenType, _tokenList]) => {
      const tokenType = _tokenType as CustomTokenType;
      const tokenList = _tokenList as CustomToken[];

      if (!FUNGIBLE_TOKEN_STANDARDS.includes(tokenType)) {
        for (const token of tokenList) {
          if (!token.isDeleted) {
            filteredNftContracts.push(token);
          }
        }
      }
    });

    return filteredNftContracts;
  }

  public getCustomTokenStore (callback: (data: CustomTokenJson) => void) {
    return this.customTokenStore.get('EvmToken', (data) => {
      callback(data);
    });
  }

  public upsertCustomToken (data: CustomToken) {
    const { needUpdateChainRegistry, newCustomTokenState } = upsertCustomToken(data, this.customTokenState);

    this.customTokenState = newCustomTokenState;

    if (needUpdateChainRegistry) {
      this.upsertChainRegistry(data);
    }

    this.customTokenSubject.next(this.customTokenState);
    this.customTokenStore.set('EvmToken', this.customTokenState);
    this.updateServiceInfo();
  }

  public deleteCustomTokens (targetTokens: DeleteCustomTokenParams[]) {
    const { deletedNfts, newChainRegistryMap, newCustomTokenState } = deleteCustomTokens(targetTokens, this.customTokenState, this.chainRegistryMap);

    // Delete stored nfts
    for (const targetToken of deletedNfts) {
      this.dbService.deleteNftsByCustomToken(this.getNetworkGenesisHashByKey(targetToken.chain), targetToken.smartContract).catch((e) => this.logger.warn(e));
    }

    this.chainRegistryMap = newChainRegistryMap;

    Object.entries(newChainRegistryMap).forEach(([key, chainRegistry]) => {
      cacheRegistryMap[key] = chainRegistry;
    });

    this.customTokenState = newCustomTokenState;
    this.customTokenSubject.next(this.customTokenState);
    this.chainRegistrySubject.next(this.getChainRegistryMap());
    this.customTokenStore.set('EvmToken', this.customTokenState);
    this.updateServiceInfo();
  }

  public getNetworkMap () {
    return this.networkMap;
  }

  public getNetworkMapByKey (key: string) {
    return this.networkMap[key];
  }

  public subscribeNetworkMap () {
    return this.networkMapStore.getSubject();
  }

  public getActiveContractSupportedNetworks () {
    const contractSupportedNetworkMap: Record<string, NetworkJson> = {};

    Object.entries(this.networkMap).forEach(([key, network]) => {
      if (network.active && network.supportSmartContract && network.supportSmartContract.length > 0) {
        contractSupportedNetworkMap[key] = network;
      }
    });

    return contractSupportedNetworkMap;
  }

  public async upsertNetworkMap (data: NetworkJson): Promise<boolean> {
    if (this.lockNetworkMap) {
      return false;
    }

    this.lockNetworkMap = true;

    if (data.key in this.networkMap) { // update provider for existed network
      if (data.customProviders) {
        this.networkMap[data.key].customProviders = data.customProviders;
      }

      if (data.currentProvider !== this.networkMap[data.key].currentProvider && data.currentProvider) {
        this.networkMap[data.key].currentProvider = data.currentProvider;
        this.networkMap[data.key].currentProviderMode = data.currentProvider.startsWith('ws') ? 'ws' : 'http';
      }

      this.networkMap[data.key].chain = data.chain;

      if (data.nativeToken) {
        this.networkMap[data.key].nativeToken = data.nativeToken;
      }

      if (data.decimals) {
        this.networkMap[data.key].decimals = data.decimals;
      }

      this.networkMap[data.key].crowdloanUrl = data.crowdloanUrl;

      this.networkMap[data.key].coinGeckoKey = data.coinGeckoKey;

      this.networkMap[data.key].paraId = data.paraId;

      this.networkMap[data.key].blockExplorer = data.blockExplorer;
    } else { // insert
      this.networkMap[data.key] = data;
      this.networkMap[data.key].getStakingOnChain = true; // try to fetch staking on chain for custom network by default
    }

    if (this.networkMap[data.key].active) { // update API map if network is active
      if (data.key in this.apiMap.dotSama) {
        this.apiMap.dotSama[data.key].api?.disconnect && await this.apiMap.dotSama[data.key].api.disconnect();
        delete this.apiMap.dotSama[data.key];
      }

      if (data.isEthereum && data.key in this.apiMap.web3) {
        delete this.apiMap.web3[data.key];
      }

      const currentProvider = getCurrentProvider(data);

      if (currentProvider) {
        this.apiMap.dotSama[data.key] = initApi(data.key, currentProvider, data.isEthereum);

        if (data.isEthereum && data.isEthereum) {
          this.apiMap.web3[data.key] = initWeb3Api(currentProvider);
        }
      }
    }

    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);
    this.updateServiceInfo();
    this.lockNetworkMap = false;

    return true;
  }

  public removeNetworkMap (networkKey: string): boolean {
    if (this.lockNetworkMap) {
      return false;
    }

    this.lockNetworkMap = true;
    delete this.networkMap[networkKey];

    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);
    this.updateServiceInfo();
    this.lockNetworkMap = false;

    return true;
  }

  public async disableNetworkMap (networkKey: string): Promise<boolean> {
    if (this.lockNetworkMap) {
      return false;
    }

    this.lockNetworkMap = true;
    this.apiMap.dotSama[networkKey].api.disconnect && await this.apiMap.dotSama[networkKey].api.disconnect();
    delete this.apiMap.dotSama[networkKey];

    if (this.networkMap[networkKey].isEthereum && this.networkMap[networkKey].isEthereum) {
      delete this.apiMap.web3[networkKey];
    }

    this.networkMap[networkKey].active = false;
    this.networkMap[networkKey].apiStatus = NETWORK_STATUS.DISCONNECTED;
    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);
    this.updateServiceInfo();
    this.lockNetworkMap = false;

    this.getAuthorize((data) => {
      if (this.networkMap[networkKey].isEthereum) {
        this.evmChainSubject.next(data);
      }

      this.authorizeUrlSubject.next(data);
    });

    return true;
  }

  private getDefaultNetworkKey = (): string[] => {
    const genesisHashes: Record<string, string> = {};

    const pairs = keyring.getPairs();

    pairs.forEach((pair) => {
      const originGenesisHash = pair.meta.originGenesisHash;

      if (originGenesisHash && typeof originGenesisHash === 'string') {
        genesisHashes[originGenesisHash] = originGenesisHash;
      }
    });

    const hashes = Object.keys(genesisHashes);

    const result: string[] = [];

    for (const [key, network] of Object.entries(this.networkMap)) {
      const condition = key === 'polkadot' || key === 'kusama' || hashes.includes(network.genesisHash);

      if (condition) {
        result.push(key);
      }
    }

    return result;
  };

  public async disableAllNetworks (): Promise<boolean> {
    if (this.lockNetworkMap) {
      return false;
    }

    this.lockNetworkMap = true;
    const targetNetworkKeys: string[] = [];

    const networkKeys = this.getDefaultNetworkKey();

    for (const [key, network] of Object.entries(this.networkMap)) {
      if (network.active && !networkKeys.includes(key)) {
        targetNetworkKeys.push(key);
        this.networkMap[key].active = false;
      }
    }

    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);

    for (const key of targetNetworkKeys) {
      this.apiMap.dotSama[key].api.disconnect && await this.apiMap.dotSama[key].api.disconnect();
      delete this.apiMap.dotSama[key];

      if (this.networkMap[key].isEthereum && this.networkMap[key].isEthereum) {
        delete this.apiMap.web3[key];
      }

      this.networkMap[key].apiStatus = NETWORK_STATUS.DISCONNECTED;
    }

    this.updateServiceInfo();
    this.lockNetworkMap = false;

    this.getAuthorize((data) => {
      this.evmChainSubject.next(data);
      this.authorizeUrlSubject.next(data);
    });

    return true;
  }

  public enableNetworkMap (networkKey: string) {
    if (this.lockNetworkMap) {
      return false;
    }

    const networkData = this.networkMap[networkKey];

    this.lockNetworkMap = true;
    const currentProvider = getCurrentProvider(networkData);

    if (currentProvider) {
      this.apiMap.dotSama[networkKey] = initApi(networkKey, currentProvider, networkData.isEthereum);

      if (networkData.isEthereum && networkData.isEthereum) {
        this.apiMap.web3[networkKey] = initWeb3Api(currentProvider);
      }
    }

    networkData.active = true;
    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);
    this.updateServiceInfo();
    this.lockNetworkMap = false;

    this.getAuthorize((data) => {
      if (this.networkMap[networkKey].isEthereum) {
        this.evmChainSubject.next(data);
      }

      this.authorizeUrlSubject.next(data);
    });

    return true;
  }

  public enableAllNetworks () {
    if (this.lockNetworkMap) {
      return false;
    }

    this.lockNetworkMap = true;
    const targetNetworkKeys: string[] = [];

    for (const [key, network] of Object.entries(this.networkMap)) {
      if (!network.active) {
        targetNetworkKeys.push(key);
        this.networkMap[key].active = true;
      }
    }

    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);

    for (const key of targetNetworkKeys) {
      const currentProvider = getCurrentProvider(this.networkMap[key]);

      if (currentProvider) {
        this.apiMap.dotSama[key] = initApi(key, currentProvider, this.networkMap[key].isEthereum);

        if (this.networkMap[key].isEthereum && this.networkMap[key].isEthereum) {
          this.apiMap.web3[key] = initWeb3Api(currentProvider);
        }
      }
    }

    this.updateServiceInfo();
    this.lockNetworkMap = false;

    this.getAuthorize((data) => {
      this.evmChainSubject.next(data);
      this.authorizeUrlSubject.next(data);
    });

    return true;
  }

  public async resetDefaultNetwork () {
    if (this.lockNetworkMap) {
      return false;
    }

    this.lockNetworkMap = true;
    const targetNetworkKeys: string[] = [];
    const networkKeys = this.getDefaultNetworkKey();

    for (const [key, network] of Object.entries(this.networkMap)) {
      if (!network.active) {
        const currentProvider = getCurrentProvider(this.networkMap[key]);

        if (networkKeys.includes(key) && currentProvider) {
          this.apiMap.dotSama[key] = initApi(key, currentProvider, this.networkMap[key].isEthereum);
          this.networkMap[key].active = true;
        }
      } else {
        if (!networkKeys.includes(key)) {
          targetNetworkKeys.push(key);
          this.networkMap[key].active = false;
          this.networkMap[key].apiStatus = NETWORK_STATUS.DISCONNECTED;
        }
      }
    }

    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);

    for (const key of targetNetworkKeys) {
      this.apiMap.dotSama[key].api.disconnect && await this.apiMap.dotSama[key].api.disconnect();
      delete this.apiMap.dotSama[key];

      if (this.networkMap[key].isEthereum && this.networkMap[key].isEthereum) {
        delete this.apiMap.web3[key];
      }
    }

    this.updateServiceInfo();
    this.lockNetworkMap = false;

    return true;
  }

  public updateNetworkStatus (networkKey: string, status: NETWORK_STATUS) {
    if (this.networkMap[networkKey].apiStatus === status) {
      return;
    }

    this.networkMap[networkKey].apiStatus = status;

    this.networkMapSubject.next(this.networkMap);
    this.networkMapStore.set('NetworkMap', this.networkMap);
  }

  public getDotSamaApiMap () {
    return this.apiMap.dotSama;
  }

  public getDotSamaApi (networkKey: string) {
    return this.apiMap.dotSama[networkKey];
  }

  public getWeb3ApiMap (): Record<string, Web3> {
    return this.apiMap.web3;
  }

  public getWeb3Api (networkKey: string) {
    return this.apiMap.web3[networkKey];
  }

  public getApiMap () {
    return this.apiMap;
  }

  public refreshDotSamaApi (key: string) {
    const apiProps = this.apiMap.dotSama[key];

    if (key in this.apiMap.dotSama) {
      if (!apiProps.isApiConnected) {
        apiProps.recoverConnect && apiProps.recoverConnect();
      }
    }

    return true;
  }

  public refreshWeb3Api (key: string) {
    const currentProvider = getCurrentProvider(this.networkMap[key]);

    if (currentProvider) {
      this.apiMap.web3[key] = initWeb3Api(currentProvider);
    }
  }

  public subscribeServiceInfo () {
    return this.serviceInfoSubject;
  }

  public updateServiceInfo () {
    this.logger.log('<---Update serviceInfo--->');
    this.getCurrentAccount((value) => {
      this.serviceInfoSubject.next({
        networkMap: this.networkMap,
        apiMap: this.apiMap,
        currentAccountInfo: value,
        chainRegistry: this.chainRegistryMap,
        customNftRegistry: this.getActiveNftContracts()
      });
    });
  }

  public getExternalRequestMap (): Record<string, ExternalRequestPromise> {
    return this.externalRequest;
  }

  public setExternalRequestMap (id: string, value: ExternalRequestPromise) {
    this.externalRequest[id] = value;
  }

  public getExternalRequest (id: string): ExternalRequestPromise {
    return this.externalRequest[id];
  }

  public updateExternalRequest (id: string, value: Partial<ExternalRequestPromise>): void {
    const rs = this.externalRequest[id];

    if (rs) {
      for (const [_key, _value] of Object.entries(value)) {
        // @ts-ignore
        rs[_key] = _value;
      }
    }
  }

  public cleanExternalRequest (): void {
    const now = new Date().getTime();
    const map = this.externalRequest;

    const arr: string[] = [];

    const handlerPushToDelete = (key: string, value: ExternalRequestPromise) => {
      arr.push(key);
      value.resolve = undefined;
      value.reject = undefined;
    };

    for (const [key, value] of Object.entries(map)) {
      if (value.status === ExternalRequestPromiseStatus.COMPLETED || value.status === ExternalRequestPromiseStatus.REJECTED) {
        handlerPushToDelete(key, value);
      } else {
        if (now - value.createdAt > 15 * 60 * 60) {
          handlerPushToDelete(key, value);
        }
      }
    }

    for (const key of arr) {
      delete map[key];
    }
  }

  public getNetworkGenesisHashByKey (key: string) {
    const network = this.networkMap[key];

    return network && network.genesisHash;
  }

  public getNetworkKeyByGenesisHash (hash: string) {
    return Object.values(this.networkMap).find((network) => network.genesisHash === hash)?.key;
  }

  public async resetHistoryMap (newAddress: string): Promise<void> {
    this.historyMap = {};

    const storedData = await this.getStoredHistories(newAddress);

    if (storedData) {
      this.historyMap = storedData;
    }

    this.publishHistory();
  }

  public async getStoredHistories (address: string) {
    const items = await this.dbService.stores.transaction.getHistoryByAddressAsObject(address);

    return items || {};
  }

  private saveHistoryToStorage (address: string, network: string, items: TransactionHistoryItemType[]) {
    this.dbService.addHistories(network, this.getNetworkGenesisHashByKey(network), address, items).catch((e) => this.logger.warn(e));
  }

  private combineHistories (oldItems: TransactionHistoryItemType[], newItems: TransactionHistoryItemType[]): TransactionHistoryItemType[] {
    const newHistories = newItems.filter((item) => !oldItems.some((old) => this.isSameHistory(old, item)));

    return [...oldItems, ...newHistories].filter((his) => his.origin === 'app' || his.eventIdx);
  }

  public isSameHistory (oldItem: TransactionHistoryItemType, newItem: TransactionHistoryItemType): boolean {
    if (oldItem.extrinsicHash === newItem.extrinsicHash && oldItem.action === newItem.action) {
      if (oldItem.origin === 'app') {
        return true;
      } else {
        return !oldItem.eventIdx || !newItem.eventIdx || oldItem.eventIdx === newItem.eventIdx;
      }
    }

    return false;
  }

  public pauseAllNetworks (code?: number, reason?: string) {
    // Disconnect web3 networks
    // Object.entries(this.apiMap.web3).forEach(([key, network]) => {
    //   if (network.currentProvider instanceof Web3.providers.WebsocketProvider) {
    //     if (network.currentProvider?.connected) {
    //       console.log(`[Web3] ${key} is conected`);
    //       network.currentProvider?.disconnect(code, reason);
    //       console.log(`[Web3] ${key} is ${network.currentProvider.connected ? 'connected' : 'disconnected'} now`);
    //     }
    //   }
    // });

    // Disconnect dotsama networks
    return Promise.all(Object.values(this.apiMap.dotSama).map(async (network) => {
      if (network.api.isConnected) {
        this.logger.log(`[Dotsama] Stopping network [${network.specName}]`);
        network.api?.disconnect && await network.api?.disconnect();
      }
    }));
  }

  async resumeAllNetworks () {
    // Reconnect web3 networks
    // Object.entries(this.apiMap.web3).forEach(([key, network]) => {
    //   const currentProvider = network.currentProvider;

    //   if (currentProvider instanceof Web3.providers.WebsocketProvider) {
    //     if (!currentProvider.connected) {
    //       console.log(`[Web3] ${key} is disconected`);
    //       currentProvider?.connect();
    //       setTimeout(() => console.log(`[Web3] ${key} is ${currentProvider.connected ? 'connected' : 'disconnected'} now`), 500);
    //     }
    //   }
    // });

    // Reconnect dotsama networks
    return Promise.all(Object.values(this.apiMap.dotSama).map(async (network) => {
      if (!network.api.isConnected && network.api.connect) {
        this.logger.log(`[Dotsama] Resumming network [${network.specName}]`);
        await network.api.connect();
      }
    }));
  }

  private publishBalance (reset?: boolean) {
    this.balanceSubject.next(this.getBalance(reset));
  }

  private publishCrowdloan (reset?: boolean) {
    this.crowdloanSubject.next(this.getCrowdloan(reset));
  }

  private publishHistory () {
    this.historySubject.next(this.getHistoryMap());
  }

  private removeInactiveNetworkData<T> (data: Record<string, T>) {
    const activeData: Record<string, T> = {};

    Object.entries(data).forEach(([networkKey, items]) => {
      if (this.networkMap[networkKey]?.active) {
        activeData[networkKey] = items;
      }
    });

    return activeData;
  }

  findNetworkKeyByGenesisHash (genesisHash?: string | null): [string | undefined, NetworkJson | undefined] {
    if (!genesisHash) {
      return [undefined, undefined];
    }

    const rs = Object.entries(this.networkMap).find(([networkKey, value]) => (value.genesisHash === genesisHash));

    if (rs) {
      return rs;
    } else {
      return [undefined, undefined];
    }
  }

  findChainIdGenesisHash (genesisHash?: string | null): number | undefined {
    return this.findNetworkKeyByGenesisHash(genesisHash)[1]?.evmChainId;
  }

  findNetworkKeyByChainId (chainId?: number | null): [string | undefined, NetworkJson | undefined] {
    if (!chainId) {
      return [undefined, undefined];
    }

    const rs = Object.entries(this.networkMap).find(([networkKey, value]) => (value.evmChainId === chainId));

    if (rs) {
      return rs;
    } else {
      return [undefined, undefined];
    }
  }

  findSingleMode (genesisHash: string): SingleModeJson | undefined {
    const [networkKey] = this.findNetworkKeyByGenesisHash(genesisHash);

    if (!networkKey) {
      return undefined;
    }

    return (Object.values(PREDEFINED_SINGLE_MODES)).find((item) => (item.networkKeys.includes(networkKey)));
  }

  public accountExportPrivateKey ({ address, password }: RequestAccountExportPrivateKey): ResponseAccountExportPrivateKey {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const exportedJson = keyring.backupAccount(keyring.getPair(address), password);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const decoded = decodePair(password, base64Decode(exportedJson.encoded), exportedJson.encoding.type);

    return {
      privateKey: u8aToHex(decoded.secretKey),
      publicKey: u8aToHex(decoded.publicKey)
    };
  }

  public checkPublicAndSecretKey ({ publicKey, secretKey }: RequestCheckPublicAndSecretKey): ResponseCheckPublicAndSecretKey {
    try {
      const _secret = hexStripPrefix(secretKey);

      if (_secret.length === 64) {
        const suri = `0x${_secret}`;
        const { phrase } = keyExtractSuri(suri);

        if (isHex(phrase) && isHex(phrase, 256)) {
          const type: KeypairType = 'ethereum';
          const address = keyring.createFromUri(getSuri(suri, type), {}, type).address;

          return {
            address: address,
            isValid: true,
            isEthereum: true
          };
        } else {
          return {
            address: '',
            isValid: false,
            isEthereum: true
          };
        }
      }

      const keyPair = keyring.keyring.addFromPair({ publicKey: hexToU8a(publicKey), secretKey: hexToU8a(secretKey) });

      return {
        address: keyPair.address,
        isValid: true,
        isEthereum: false
      };
    } catch (e) {
      console.error(e);

      return {
        address: '',
        isValid: false,
        isEthereum: false
      };
    }
  }

  public getEthKeyring (address: string, password: string): Promise<SimpleKeyring> {
    return new Promise<SimpleKeyring>((resolve) => {
      const { privateKey } = this.accountExportPrivateKey({ address, password: password });
      const ethKeyring = new SimpleKeyring([privateKey]);

      resolve(ethKeyring);
    });
  }

  public async evmSign (id: string, url: string, method: string, params: any, allowedAccounts: string[]): Promise<string | undefined> {
    let address = '';
    let payload: any;
    const [p1, p2] = params as [string, string];

    if (typeof p1 === 'string' && isEthereumAddress(p1)) {
      address = p1;
      payload = p2;
    } else if (typeof p2 === 'string' && isEthereumAddress(p2)) {
      address = p2;
      payload = p1;
    }

    if (address === '' || !payload) {
      throw new EvmRpcError('INVALID_PARAMS', 'Not found address or payload to sign');
    }

    if (['eth_sign', 'personal_sign', 'eth_signTypedData', 'eth_signTypedData_v1', 'eth_signTypedData_v3', 'eth_signTypedData_v4'].indexOf(method) < 0) {
      throw new EvmRpcError('INVALID_PARAMS', 'Not found sign method');
    }

    if (['eth_signTypedData_v3', 'eth_signTypedData_v4'].indexOf(method) > -1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
      payload = JSON.parse(payload);
    }

    // Check sign abiblity
    if (!allowedAccounts.find((acc) => (acc.toLowerCase() === address.toLowerCase()))) {
      throw new EvmRpcError('INVALID_PARAMS', 'Account ' + address + ' not in allowed list');
    }

    const requiredPassword = true;
    let privateKey = '';

    const validateConfirmationResponsePayload = (result: ConfirmationDefinitions['evmSignatureRequest'][1]) => {
      if (result.isApproved) {
        if (requiredPassword && !result?.password) {
          return Error('Password is required');
        }

        privateKey = (result?.password && this.accountExportPrivateKey({ address: address, password: result.password }).privateKey) || '';

        if (privateKey === '') {
          return Error('Cannot export private key');
        }
      }

      return undefined;
    };

    let meta: KeyringPair$Meta;

    try {
      const pair = keyring.getPair(address);

      if (!pair) {
        throw new EvmRpcError('INVALID_PARAMS', 'Cannot find pair with address: ' + address);
      }

      meta = pair.meta;
    } catch (e) {
      throw new EvmRpcError('INVALID_PARAMS', 'Cannot find pair with address: ' + address);
    }

    if (!meta.isExternal) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const signPayload = { address, type: method, payload };

      await this.addConfirmation(id, url, 'evmSignatureRequest', signPayload, { requiredPassword: true, address }, validateConfirmationResponsePayload)
        .then(({ isApproved, password }) => {
          if (isApproved && password) {
            return password;
          }

          throw new EvmRpcError('USER_REJECTED_REQUEST');
        });

      if (privateKey === '') {
        throw Error('Cannot export private key');
      }

      const simpleKeyring = new SimpleKeyring([privateKey]);

      switch (method) {
        case 'eth_sign':
          return await simpleKeyring.signMessage(address, payload as string);
        case 'personal_sign':
          return await simpleKeyring.signPersonalMessage(address, payload as string);
        case 'eth_signTypedData':
          return await simpleKeyring.signTypedData(address, payload as any[]);
        case 'eth_signTypedData_v1':
          return await simpleKeyring.signTypedData_v1(address, payload as any[]);
        case 'eth_signTypedData_v3':
          return await simpleKeyring.signTypedData_v3(address, payload);
        case 'eth_signTypedData_v4':
          return await simpleKeyring.signTypedData_v4(address, payload);
        default:
          throw new EvmRpcError('INVALID_PARAMS', 'Not found sign method');
      }
    } else {
      let qrPayload = '';
      let canSign = false;

      switch (method) {
        case 'personal_sign':
          canSign = true;
          qrPayload = payload as string;
          break;
        default:
          break;
      }

      const signPayload: EvmSignatureRequestExternal = { address, type: method, payload: payload as unknown, hashPayload: qrPayload, canSign: canSign };

      return this.addConfirmation(id, url, 'evmSignatureRequestExternal', signPayload, { requiredPassword: false, address })
        .then(({ isApproved, signature }) => {
          if (isApproved) {
            return signature;
          } else {
            throw new EvmRpcError('USER_REJECTED_REQUEST');
          }
        });
    }
  }

  public async evmSendTransaction (id: string, url: string, networkKey: string, allowedAccounts: string[], transactionParams: EvmSendTransactionParams): Promise<string | undefined> {
    const web3 = this.getWeb3ApiMap()[networkKey];

    const autoFormatNumber = (val?: string | number): string | undefined => {
      if (typeof val === 'string' && val.startsWith('0x')) {
        return new BN(val.replace('0x', ''), 16).toString();
      } else if (typeof val === 'number') {
        return val.toString();
      }

      return val;
    };

    if (transactionParams.from === transactionParams.to) {
      throw new EvmRpcError('INVALID_PARAMS', 'From address and to address must not be the same');
    }

    const transaction: TransactionConfig = {
      from: transactionParams.from,
      to: transactionParams.to,
      value: autoFormatNumber(transactionParams.value),
      gasPrice: autoFormatNumber(transactionParams.gasPrice),
      maxPriorityFeePerGas: autoFormatNumber(transactionParams.maxPriorityFeePerGas),
      maxFeePerGas: autoFormatNumber(transactionParams.maxFeePerGas),
      data: transactionParams.data
    };

    // Calculate transaction data
    try {
      transaction.gas = await web3.eth.estimateGas({ ...transaction });
    } catch (e) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new EvmRpcError('INVALID_PARAMS', e?.message);
    }

    const gasPrice = await web3.eth.getGasPrice();

    const estimateGas = new BN(gasPrice.toString()).mul(new BN(transaction.gas)).toString();

    // Address is validated in before step
    const fromAddress = allowedAccounts.find((account) => (account.toLowerCase() === (transaction.from as string).toLowerCase()));

    if (!fromAddress) {
      throw new EvmRpcError('INVALID_PARAMS', 'From address is not in available for ' + url);
    }

    let meta: KeyringPair$Meta;

    try {
      const pair = keyring.getPair(fromAddress);

      if (!pair) {
        throw new EvmRpcError('INVALID_PARAMS', 'Cannot find pair with address: ' + fromAddress);
      }

      meta = pair.meta;
    } catch (e) {
      throw new EvmRpcError('INVALID_PARAMS', 'Cannot find pair with address: ' + fromAddress);
    }

    // Validate balance
    const balance = new BN(await web3.eth.getBalance(fromAddress) || 0);

    if (balance.lt(new BN(gasPrice.toString()).mul(new BN(transaction.gas)).add(new BN(autoFormatNumber(transactionParams.value) || '0')))) {
      throw new EvmRpcError('INVALID_PARAMS', 'Balance can be not enough to send transaction');
    }

    const requiredPassword = true; // password is always required for to export private, we have planning to save password 15 min like sign keypair.isLocked;

    let privateKey = '';

    const validateConfirmationResponsePayload = (result: ConfirmationDefinitions['evmSendTransactionRequest'][1]) => {
      if (result.isApproved) {
        if (requiredPassword && !result?.password) {
          return Error('Password is required');
        }

        privateKey = (result?.password && this.accountExportPrivateKey({ address: fromAddress, password: result.password }).privateKey) || '';

        if (privateKey === '') {
          return Error('Cannot export private key');
        }
      }

      return undefined;
    };

    const requestPayload = { ...transaction, estimateGas };

    const setTransactionHistory = (receipt: TransactionReceipt) => {
      const network = this.getNetworkMapByKey(networkKey);

      this.setHistory(fromAddress, networkKey, {
        isSuccess: true,
        time: Date.now(),
        networkKey,
        change: transaction.value?.toString() || '0',
        changeSymbol: undefined,
        fee: (receipt.gasUsed * receipt.effectiveGasPrice).toString(),
        feeSymbol: network?.nativeToken,
        action: 'send',
        extrinsicHash: receipt.transactionHash
      });
    };

    const setFailedHistory = (transactionHash: string) => {
      const network = this.getNetworkMapByKey(networkKey);

      this.setHistory(fromAddress, networkKey, {
        isSuccess: false,
        time: Date.now(),
        networkKey,
        change: transaction.value?.toString() || '0',
        changeSymbol: undefined,
        fee: undefined,
        feeSymbol: network?.nativeToken,
        action: 'send',
        extrinsicHash: transactionHash
      });
    };

    if (!meta.isExternal) {
      return this.addConfirmation(id, url, 'evmSendTransactionRequest', requestPayload, { requiredPassword: true, address: fromAddress, networkKey }, validateConfirmationResponsePayload)
        .then(async ({ isApproved }) => {
          if (isApproved) {
            const signTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
            let transactionHash = '';

            return new Promise<string>((resolve, reject) => {
              signTransaction.rawTransaction && web3.eth.sendSignedTransaction(signTransaction.rawTransaction)
                .once('transactionHash', (hash) => {
                  transactionHash = hash;
                  resolve(hash);
                })
                .once('receipt', setTransactionHistory)
                .once('error', (e) => {
                  setFailedHistory(transactionHash);
                  reject(e);
                });
            });
          } else {
            return Promise.reject(new EvmRpcError('USER_REJECTED_REQUEST'));
          }
        });
    } else {
      const network = this.getNetworkMapByKey(networkKey);
      const nonce = await web3.eth.getTransactionCount(fromAddress);

      const txObject: Web3Transaction = {
        nonce: nonce,
        from: fromAddress,
        gasPrice: anyNumberToBN(gasPrice).toNumber(),
        gasLimit: anyNumberToBN(transaction.gas).toNumber(),
        to: transaction.to !== undefined ? transaction.to : '',
        value: anyNumberToBN(transaction.value).toNumber(),
        data: transaction.data ? transaction.data : '',
        chainId: network?.evmChainId || 1
      };

      const data: Input = [
        txObject.nonce,
        txObject.gasPrice,
        txObject.gasLimit,
        txObject.to,
        txObject.value,
        txObject.data,
        txObject.chainId,
        new Uint8Array([0x00]),
        new Uint8Array([0x00])
      ];

      const encoded = RLP.encode(data);

      const requestPayload: EvmSendTransactionRequestExternal = {
        ...transaction,
        estimateGas,
        hashPayload: u8aToHex(encoded),
        canSign: true
      };

      return this.addConfirmation(id, url, 'evmSendTransactionRequestExternal', requestPayload, { requiredPassword: false, address: fromAddress, networkKey })
        .then(async ({ isApproved, signature }) => {
          if (isApproved) {
            let transactionHash = '';

            const signed = parseTxAndSignature(txObject, signature);

            const recover = web3.eth.accounts.recoverTransaction(signed);

            if (recover.toLowerCase() !== fromAddress.toLowerCase()) {
              return Promise.reject(new EvmRpcError('UNAUTHORIZED', 'Bad signature'));
            }

            return new Promise<string>((resolve, reject) => {
              web3.eth.sendSignedTransaction(signed)
                .once('transactionHash', (hash) => {
                  transactionHash = hash;
                  resolve(hash);
                })
                .once('receipt', setTransactionHistory)
                .once('error', (e) => {
                  setFailedHistory(transactionHash);
                  reject(e);
                }).catch((e) => {
                  setFailedHistory(transactionHash);
                  reject(e);
                });
            });
          } else {
            return Promise.reject(new EvmRpcError('USER_REJECTED_REQUEST'));
          }
        });
    }
  }

  public getConfirmationsQueueSubject () {
    return this.confirmationsQueueSubject;
  }

  public countConfirmationNumber () {
    let count = 0;

    count += this.allAuthRequests.length;
    count += this.allMetaRequests.length;
    count += this.allSignRequests.length;
    count += this.allAuthRequestsV2.length;
    Object.values(this.confirmationsQueueSubject.getValue()).forEach((x) => {
      count += Object.keys(x).length;
    });

    return count;
  }

  public addConfirmation<CT extends ConfirmationType> (id: string, url: string, type: CT, payload: ConfirmationDefinitions[CT][0]['payload'], options: ConfirmationsQueueItemOptions = {}, validator?: (input: ConfirmationDefinitions[CT][1]) => Error | undefined) {
    const confirmations = this.confirmationsQueueSubject.getValue();
    const confirmationType = confirmations[type] as Record<string, ConfirmationDefinitions[CT][0]>;
    const payloadJson = JSON.stringify(payload);

    // Check duplicate request
    const duplicated = Object.values(confirmationType).find((c) => (c.url === url) && (c.payloadJson === payloadJson));

    if (duplicated) {
      throw new EvmRpcError('INVALID_PARAMS', 'Duplicate request information');
    }

    confirmationType[id] = {
      id,
      url,
      payload,
      payloadJson,
      ...options
    } as ConfirmationDefinitions[CT][0];

    const promise = new Promise<ConfirmationDefinitions[CT][1]>((resolve, reject) => {
      this.confirmationsPromiseMap[id] = {
        validator: validator,
        resolver: {
          resolve: resolve,
          reject: reject
        }
      };
    });

    this.confirmationsQueueSubject.next(confirmations);

    // Not open new popup and use existed
    const popupList = this.getPopup();

    if (this.getPopup().length > 0) {
      // eslint-disable-next-line no-void
      void chrome.windows.update(popupList[0], { focused: true });
    } else {
      this.popupOpen();
    }

    this.updateIconV2();

    return promise;
  }

  public completeConfirmation (request: RequestConfirmationComplete) {
    const confirmations = this.confirmationsQueueSubject.getValue();

    const _completeConfirmation = <T extends ConfirmationType> (type: T, result: ConfirmationDefinitions[T][1]) => {
      const { id } = result;
      const { resolver, validator } = this.confirmationsPromiseMap[id];

      if (!resolver || !(confirmations[type][id])) {
        this.logger.error('Not found confirmation', type, id);
        throw new Error('Not found promise for confirmation');
      }

      // Validate response from confirmation popup some info like password, response format....
      const error = validator && validator(result);

      if (error) {
        resolver.reject(error);
      }

      // Delete confirmations from queue
      delete this.confirmationsPromiseMap[id];
      delete confirmations[type][id];
      this.confirmationsQueueSubject.next(confirmations);

      // Update icon, and close queue
      this.updateIconV2(this.countConfirmationNumber() === 0);
      resolver.resolve(result);
    };

    Object.entries(request).forEach(([type, result]) => {
      if (type === 'addNetworkRequest') {
        _completeConfirmation(type, result as ConfirmationDefinitions['addNetworkRequest'][1]);
      } else if (type === 'addTokenRequest') {
        _completeConfirmation(type, result as ConfirmationDefinitions['addTokenRequest'][1]);
      } else if (type === 'switchNetworkRequest') {
        _completeConfirmation(type, result as ConfirmationDefinitions['switchNetworkRequest'][1]);
      } else if (type === 'evmSignatureRequest') {
        _completeConfirmation(type, result as ConfirmationDefinitions['evmSignatureRequest'][1]);
      } else if (type === 'evmSignatureRequestExternal') {
        _completeConfirmation(type, result as ConfirmationDefinitions['evmSignatureRequestExternal'][1]);
      } else if (type === 'evmSendTransactionRequest') {
        _completeConfirmation(type, result as ConfirmationDefinitions['evmSendTransactionRequest'][1]);
      } else if (type === 'evmSendTransactionRequestExternal') {
        _completeConfirmation(type, result as ConfirmationDefinitions['evmSendTransactionRequestExternal'][1]);
      }
    });

    return true;
  }

  public onInstall () {
    const singleModes = Object.values(PREDEFINED_SINGLE_MODES);

    const setUpSingleMode = ({ networkKeys, theme }: SingleModeJson) => {
      networkKeys.forEach((key) => {
        this.enableNetworkMap(key);
      });

      const { genesisHash } = this.getNetworkMapByKey(networkKeys[0]);

      this.setCurrentAccount({ address: ALL_ACCOUNT_KEY, currentGenesisHash: genesisHash });
      this.setTheme(theme);
    };

    chrome.tabs.query({}, function (tabs) {
      const openingUrls = tabs.map((t) => t.url);

      const singleMode = singleModes.find(({ autoTriggerDomain }) => {
        const urlRegex = new RegExp(autoTriggerDomain);

        return Boolean(openingUrls.find((url) => {
          return url && urlRegex.test(url);
        }));
      });

      if (singleMode) {
        // Wait for everything is ready before enable single mode
        setTimeout(() => {
          setUpSingleMode(singleMode);
        }, 999);
      }
    });
  }

  public get activeNetworks () {
    return Object.entries(this.networkMap).filter(([, network]) => network.active).reduce((obj, [key, network]) => {
      obj[key] = network;

      return obj;
    }, {} as Record<string, NetworkJson>);
  }

  public async sleep () {
    this.cron.stop();
    this.subscription.stop();
    await this.pauseAllNetworks(undefined, 'IDLE mode');
  }

  public async wakeup () {
    await this.resumeAllNetworks();
    this.cron.start();
    this.subscription.start();
  }

  public cancelSubscription (id: string): boolean {
    if (isSubscriptionRunning(id)) {
      unsubscribe(id);
    }

    if (this.unsubscriptionMap[id]) {
      this.unsubscriptionMap[id]();

      delete this.unsubscriptionMap[id];
    }

    return true;
  }

  public createUnsubscriptionHandle (id: string, unsubscribe: () => void): void {
    this.unsubscriptionMap[id] = unsubscribe;
  }

  public setExtraDelegationInfo (networkKey: string, address: string, collatorAddress: string): void {
    this.dbService.updateExtraDelegationInfo(networkKey, this.getNetworkGenesisHashByKey(networkKey), address, collatorAddress).catch((e) => this.logger.warn(e));
  }

  public async getExtraDelegationInfo (networkKey: string, address: string) {
    return await this.dbService.getExtraDelegationInfo(networkKey, address);
  }
}
