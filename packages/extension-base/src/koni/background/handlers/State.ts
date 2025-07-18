// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { _AssetRef, _AssetType, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { BitcoinProviderError } from '@subwallet/extension-base/background/errors/BitcoinProviderError';
import { CardanoProviderError } from '@subwallet/extension-base/background/errors/CardanoProviderError';
import { EvmProviderError } from '@subwallet/extension-base/background/errors/EvmProviderError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { withErrorLog } from '@subwallet/extension-base/background/handlers/helpers';
import { isSubscriptionRunning, unsubscribe } from '@subwallet/extension-base/background/handlers/subscriptions';
import { AddressCardanoTransactionBalance, AddTokenRequestExternal, AmountData, APIItemState, ApiMap, AuthRequestV2, BitcoinProviderErrorType, BitcoinSendTransactionParams, BitcoinSendTransactionRequest, BitcoinSignatureRequest, BitcoinSignMessageParams, BitcoinSignMessageResult, BitcoinSignPsbtParams, BitcoinSignPsbtRequest, BitcoinSignPsbtResult, CardanoKeyType, CardanoProviderErrorType, CardanoSignatureRequest, CardanoTransactionDappConfig, ChainStakingMetadata, ChainType, ConfirmationsQueue, ConfirmationsQueueBitcoin, ConfirmationsQueueCardano, ConfirmationsQueueTon, ConfirmationType, CrowdloanItem, CrowdloanJson, CurrencyType, EvmProviderErrorType, EvmSendTransactionParams, EvmSendTransactionRequest, EvmSignatureRequest, ExternalRequestPromise, ExternalRequestPromiseStatus, ExtrinsicType, MantaAuthorizationContext, MantaPayConfig, MantaPaySyncState, NftCollection, NftItem, NftJson, NominatorMetadata, PsbtTransactionArg, RequestAccountExportPrivateKey, RequestCardanoSignData, RequestCardanoSignTransaction, RequestConfirmationComplete, RequestConfirmationCompleteBitcoin, RequestConfirmationCompleteCardano, RequestConfirmationCompleteTon, RequestCrowdloanContributions, RequestSettingsType, ResponseAccountExportPrivateKey, ResponseCardanoSignData, ResponseCardanoSignTransaction, ServiceInfo, SingleModeJson, StakingItem, StakingJson, StakingRewardItem, StakingRewardJson, StakingType, UiSettings } from '@subwallet/extension-base/background/KoniTypes';
import { RequestAuthorizeTab, RequestRpcSend, RequestRpcSubscribe, RequestRpcUnsubscribe, RequestSign, ResponseRpcListProviders, ResponseSigning } from '@subwallet/extension-base/background/types';
import { BACKEND_API_URL, BACKEND_PRICE_HISTORY_URL, EnvConfig, MANTA_PAY_BALANCE_INTERVAL, REMIND_EXPORT_ACCOUNT } from '@subwallet/extension-base/constants';
import { convertErrorFormat, generateValidationProcess, PayloadValidated, ValidateStepFunction, validationAuthCardanoMiddleware, validationAuthMiddleware, validationAuthWCMiddleware, validationBitcoinConnectMiddleware, validationBitcoinSendTransactionMiddleware, validationBitcoinSignMessageMiddleware, validationBitcoinSignPsbtMiddleware, validationCardanoSignDataMiddleware, validationConnectMiddleware, validationEvmDataTransactionMiddleware, validationEvmSignMessageMiddleware } from '@subwallet/extension-base/core/logic-validation';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ServiceStatus } from '@subwallet/extension-base/services/base/types';
import BuyService from '@subwallet/extension-base/services/buy-service';
import CampaignService from '@subwallet/extension-base/services/campaign-service';
import { ChainOnlineService } from '@subwallet/extension-base/services/chain-online-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _DEFAULT_MANTA_ZK_CHAIN, _MANTA_ZK_CHAIN_GROUP, _PREDEFINED_SINGLE_MODES } from '@subwallet/extension-base/services/chain-service/constants';
import { _ChainState, _NetworkUpsertParams, _ValidateCustomAssetRequest } from '@subwallet/extension-base/services/chain-service/types';
import { _getEvmChainId, _getSubstrateGenesisHash, _getTokenOnChainAssetId, _isAssetFungibleToken, _isChainEnabled, _isChainTestNet, _parseMetadataForSmartContractAsset } from '@subwallet/extension-base/services/chain-service/utils';
import EarningService from '@subwallet/extension-base/services/earning-service/service';
import { EventService } from '@subwallet/extension-base/services/event-service';
import FeeService from '@subwallet/extension-base/services/fee-service/service';
import { calculateGasFeeParams } from '@subwallet/extension-base/services/fee-service/utils';
import { HistoryService } from '@subwallet/extension-base/services/history-service';
import { InappNotificationService } from '@subwallet/extension-base/services/inapp-notification-service';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import MigrationService from '@subwallet/extension-base/services/migration-service';
import MintCampaignService from '@subwallet/extension-base/services/mint-campaign-service';
import MktCampaignService from '@subwallet/extension-base/services/mkt-campaign-service';
import NotificationService from '@subwallet/extension-base/services/notification-service/NotificationService';
import { PriceService } from '@subwallet/extension-base/services/price-service';
import RequestService from '@subwallet/extension-base/services/request-service';
import { openPopup } from '@subwallet/extension-base/services/request-service/handler/PopupHandler';
import { convertAssetToValue, convertValueToAsset, extractKeyHashesFromCollaterals, extractKeyHashesFromRequiredSigners, extractKeyHashesFromScripts, extractKeyHashesFromWithdrawals, extractKeyHashFromCertificate, getBalanceAddressMap } from '@subwallet/extension-base/services/request-service/helper';
import { AuthUrls, MetaRequest, SignRequest } from '@subwallet/extension-base/services/request-service/types';
import SettingService from '@subwallet/extension-base/services/setting-service/SettingService';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import { SubscanService } from '@subwallet/extension-base/services/subscan-service';
import { SwapService } from '@subwallet/extension-base/services/swap-service';
import TransactionService from '@subwallet/extension-base/services/transaction-service';
import { TransactionEventResponse } from '@subwallet/extension-base/services/transaction-service/types';
import WalletConnectService from '@subwallet/extension-base/services/wallet-connect-service';
import { SWStorage } from '@subwallet/extension-base/storage';
import { BalanceItem, BasicTxErrorType, CurrentAccountInfo, EvmFeeInfo, RequestCheckPublicAndSecretKey, ResponseCheckPublicAndSecretKey, StorageDataInterface } from '@subwallet/extension-base/types';
import { addLazy, isManifestV3, isSameAddress, reformatAddress, sailsCache, stripUrl, targetIsWeb } from '@subwallet/extension-base/utils';
import { convertCardanoHexToBech32, validateAddressNetwork } from '@subwallet/extension-base/utils/cardano';
import { createPromiseHandler } from '@subwallet/extension-base/utils/promise';
import { MetadataDef, ProviderMeta } from '@subwallet/extension-inject/types';
import subwalletApiSdk from '@subwallet/subwallet-api-sdk';
import { keyring } from '@subwallet/ui-keyring';
import BigN from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import BN from 'bn.js';
import { t } from 'i18next';
import { interfaces } from 'manta-extension-sdk';
import { BehaviorSubject, Subject } from 'rxjs';

import { JsonRpcResponse, ProviderInterface, ProviderInterfaceCallback } from '@polkadot/rpc-provider/types';
import { assert, logger as createLogger, noop } from '@polkadot/util';
import { Logger } from '@polkadot/util/types';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { KoniCron } from '../cron';
import { KoniSubscription } from '../subscription';

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const passworder = require('browser-passworder');

const ERROR_CONFIRMATION_TYPE = ['errorConnectNetwork'];

// List of providers passed into constructor. This is the list of providers
// exposed by the extension.
type Providers = Record<string, {
  meta: ProviderMeta;
  // The provider is not running at init, calling this will instantiate the
  // provider.
  start: () => ProviderInterface;
}>

const generateDefaultCrowdloanMap = (): Record<string, CrowdloanItem> => {
  const crowdloanMap: Record<string, CrowdloanItem> = {};

  return crowdloanMap;
};

const DEFAULT_CURRENCY: CurrencyType = 'USD';

export default class KoniState {
  private injectedProviders = new Map<chrome.runtime.Port, ProviderInterface>();
  private readonly providers: Providers;
  private readonly unsubscriptionMap: Record<string, () => void> = {};
  private externalRequest: Record<string, ExternalRequestPromise> = {};

  private crowdloanMap: Record<string, CrowdloanItem> = generateDefaultCrowdloanMap();
  private crowdloanSubject = new Subject<CrowdloanJson>();

  private nftSubject = new Subject<NftJson>();

  private mantaPayConfigSubject = new Subject<MantaPayConfig[]>();
  public isMantaPayEnabled = false;

  private stakingSubject = new Subject<StakingJson>();
  private chainStakingMetadataSubject = new Subject<ChainStakingMetadata[]>();
  private stakingNominatorMetadataSubject = new Subject<NominatorMetadata[]>();
  private stakingRewardSubject = new Subject<StakingRewardJson>();
  private stakingRewardState: StakingRewardJson = {
    ready: false,
    data: {}
  } as StakingRewardJson;

  private lazyMap: Record<string, unknown> = {};

  readonly notificationService: NotificationService;
  // TODO: consider making chainService public (or getter) and call function directly
  readonly eventService: EventService;
  readonly keyringService: KeyringService;
  readonly chainService: ChainService;
  readonly dbService: DatabaseService;
  private cron: KoniCron;
  private subscription: KoniSubscription;
  private logger: Logger;
  readonly settingService: SettingService;
  readonly requestService: RequestService;
  readonly transactionService: TransactionService;
  readonly historyService: HistoryService;
  readonly priceService: PriceService;
  readonly balanceService: BalanceService;
  readonly migrationService: MigrationService;
  readonly subscanService: SubscanService;
  readonly walletConnectService: WalletConnectService;
  readonly mintCampaignService: MintCampaignService;
  readonly campaignService: CampaignService;
  readonly mktCampaignService: MktCampaignService;
  readonly buyService: BuyService;
  readonly earningService: EarningService;
  readonly feeService: FeeService;
  readonly swapService: SwapService;
  readonly inappNotificationService: InappNotificationService;
  readonly chainOnlineService: ChainOnlineService;

  // Handle the general status of the extension
  private generalStatus: ServiceStatus = ServiceStatus.INITIALIZING;
  private waitSleeping: Promise<void> | null = null;
  private waitStarting: Promise<void> | null = null;
  private waitStartingFull: Promise<void> | null = null;

  constructor (providers: Providers = {}) {
    // Init subwallet api sdk
    subwalletApiSdk.init({
      url: BACKEND_API_URL,
      priceHistoryUrl: BACKEND_PRICE_HISTORY_URL
    });

    this.providers = providers;

    this.eventService = new EventService();
    this.dbService = new DatabaseService(this.eventService);
    this.keyringService = new KeyringService(this);
    this.feeService = new FeeService(this);
    this.transactionService = new TransactionService(this);

    this.notificationService = new NotificationService();
    this.chainService = new ChainService(this.dbService, this.eventService);
    this.subscanService = SubscanService.getInstance();
    this.settingService = new SettingService();
    this.requestService = new RequestService(this.chainService, this.settingService, this.keyringService, this.transactionService);
    this.priceService = new PriceService(this.dbService, this.eventService, this.chainService);
    this.balanceService = new BalanceService(this);
    this.historyService = new HistoryService(this.dbService, this.chainService, this.eventService, this.keyringService, this.subscanService);
    this.mintCampaignService = new MintCampaignService(this);
    this.walletConnectService = new WalletConnectService(this, this.requestService);
    this.migrationService = new MigrationService(this, this.eventService);

    this.campaignService = new CampaignService(this);
    this.mktCampaignService = new MktCampaignService(this);
    this.buyService = new BuyService(this);
    this.earningService = new EarningService(this);
    this.swapService = new SwapService(this);
    this.inappNotificationService = new InappNotificationService(this.dbService, this.keyringService, this.eventService, this.chainService);
    this.chainOnlineService = new ChainOnlineService(this.chainService, this.settingService, this.eventService, this.dbService);

    this.subscription = new KoniSubscription(this, this.dbService);
    this.cron = new KoniCron(this, this.subscription, this.dbService);
    this.logger = createLogger('State');

    // Init state
    if (targetIsWeb) {
      this.init().then(() => {
        this.wakeup(true).catch(console.error);
      }).catch(console.error);
    }
  }

  // Clone from polkadot.js
  public get knownMetadata (): MetadataDef[] {
    return this.requestService.knownMetadata;
  }

  public injectMetadata (request: MetadataDef): boolean {
    return this.requestService.injectMetadata(request);
  }

  public getMetaRequest (id: string): MetaRequest {
    return this.requestService.getMetaRequest(id);
  }

  public getSignRequest (id: string): SignRequest | undefined {
    return this.requestService.getSignRequest(id);
  }

  // List all providers the extension is exposing
  public rpcListProviders (): Promise<ResponseRpcListProviders> {
    return Promise.resolve(Object.keys(this.providers).reduce((acc, key) => {
      acc[key] = this.providers[key].meta;

      return acc;
    }, {} as ResponseRpcListProviders));
  }

  public rpcSend (request: RequestRpcSend, port: chrome.runtime.Port): Promise<JsonRpcResponse<unknown>> {
    const provider = this.injectedProviders.get(port);

    assert(provider, 'Cannot call pub(rpc.subscribe) before provider is set');

    return provider.send(request.method, request.params);
  }

  // Start a provider, return its meta
  public rpcStartProvider (key: string, port: chrome.runtime.Port): Promise<ProviderMeta> {
    assert(Object.keys(this.providers).includes(key), 'Provider cannot be found.');

    if (this.injectedProviders.get(port)) {
      return Promise.resolve(this.providers[key].meta);
    }

    // Instantiate the provider
    this.injectedProviders.set(port, this.providers[key].start());

    // Close provider connection when page is closed
    port.onDisconnect.addListener((): void => {
      const provider = this.injectedProviders.get(port);

      if (provider) {
        withErrorLog(() => provider.disconnect());
      }

      this.injectedProviders.delete(port);
    });

    return Promise.resolve(this.providers[key].meta);
  }

  public rpcSubscribe ({ method,
    params,
    type }: RequestRpcSubscribe, cb: ProviderInterfaceCallback, port: chrome.runtime.Port): Promise<number | string> {
    const provider = this.injectedProviders.get(port);

    assert(provider, 'Cannot call pub(rpc.subscribe) before provider is set');

    return provider.subscribe(type, method, params, cb);
  }

  public rpcSubscribeConnected (_request: null, cb: ProviderInterfaceCallback, port: chrome.runtime.Port): void {
    const provider = this.injectedProviders.get(port);

    assert(provider, 'Cannot call pub(rpc.subscribeConnected) before provider is set');

    cb(null, provider.isConnected); // Immediately send back current isConnected
    provider.on('connected', () => cb(null, true));
    provider.on('disconnected', () => cb(null, false));
  }

  public rpcUnsubscribe (request: RequestRpcUnsubscribe, port: chrome.runtime.Port): Promise<boolean> {
    const provider = this.injectedProviders.get(port);

    assert(provider, 'Cannot call pub(rpc.unsubscribe) before provider is set');

    return provider.unsubscribe(request.type, request.method, request.subscriptionId);
  }

  public saveMetadata (meta: MetadataDef): void {
    this.requestService.saveMetadata(meta);
  }

  public sign (url: string, request: RequestSign): Promise<ResponseSigning> {
    return this.requestService.sign(url, request);
  }

  public get authSubjectV2 () {
    return this.requestService.authSubjectV2;
  }

  private afterChainServiceInit () {
    this.subscanService.setSubscanChainMap(this.chainService.getSubscanChainMap());
  }

  public async init () {
    await this.eventService.waitCryptoReady;
    await this.chainService.init();
    await this.migrationService.run();
    this.campaignService.init();
    this.mktCampaignService.init();
    this.eventService.emit('chain.ready', true);

    await this.balanceService.init();
    await this.earningService.init();
    await this.swapService.init();
    await this.inappNotificationService.init();

    // this.onReady();
    this.onAccountAdd();
    this.onAccountRemove();

    // TODO: consider moving this to a separate service
    await this.dbService.stores.crowdloan.removeEndedCrowdloans();

    await this.startSubscription();
    this.chainOnlineService.checkLatestData();
    this.chainService.checkLatestData();
    this.chainService.subscribeChainInfoMap().subscribe(() => {
      this.afterChainServiceInit();
    });

    // init sails
    await sailsCache.init();

    // Mark app is ready
    this.eventService.emit('general.init', true);
  }

  public async initMantaPay (password: string) {
    const mantaPayConfig = await this.chainService?.mantaPay?.getMantaPayFirstConfig(_DEFAULT_MANTA_ZK_CHAIN) as MantaPayConfig;

    if (mantaPayConfig && mantaPayConfig.enabled && !this.isMantaPayEnabled) { // only init the first login
      console.debug('Initiating MantaPay for', mantaPayConfig.address);
      await this.enableMantaPay(false, mantaPayConfig.address, password);
      console.debug('Initiated MantaPay for', mantaPayConfig.address);

      this.isMantaPayEnabled = true;
      this.eventService.emit('mantaPay.enable', mantaPayConfig.address);
    }
  }

  private async startSubscription () {
    await this.eventService.waitKeyringReady;
    await this.eventService.waitAssetReady;

    this.dbService.subscribeChainStakingMetadata([], (data) => {
      this.chainStakingMetadataSubject.next(data);
    });

    this.dbService.subscribeMantaPayConfig(_DEFAULT_MANTA_ZK_CHAIN, (data) => {
      this.mantaPayConfigSubject.next(data);
    });
  }

  public updateKeyringState (isReady = true, callback?: () => void): void {
    this.keyringService.updateKeyringState(isReady);
    callback && callback();
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
    return this.requestService.getAuthRequestV2(id);
  }

  public setAuthorize (data: AuthUrls, callback?: () => void): void {
    this.requestService.setAuthorize(data, callback);
  }

  public getAuthorize (update: (value: AuthUrls) => void): void {
    this.requestService.getAuthorize(update);
  }

  public subscribeEvmChainChange (): Subject<AuthUrls> {
    return this.requestService.subscribeEvmChainChange;
  }

  public subscribeAuthorizeUrlSubject (): Subject<AuthUrls> {
    return this.requestService.subscribeAuthorizeUrlSubject;
  }

  public getAuthList (): Promise<AuthUrls> {
    return this.requestService.getAuthList();
  }

  public async authorizeUrlV2 (url: string, request: RequestAuthorizeTab): Promise<boolean> {
    return this.requestService.authorizeUrlV2(url, request);
  }

  public getNativeTokenInfo (networkKey: string) {
    return this.chainService.getNativeTokenInfo(networkKey);
  }

  public getChainInfo (networkKey: string) {
    return this.chainService.getChainInfoByKey(networkKey);
  }

  public async getChainStakingMetadata (): Promise<ChainStakingMetadata[]> {
    return this.dbService.getChainStakingMetadata();
  }

  public async getStakingMetadataByChain (chain: string, type: StakingType) {
    return this.dbService.getStakingMetadataByChain(chain, type);
  }

  public async getNominatorMetadata (): Promise<NominatorMetadata[]> {
    return this.dbService.getNominatorMetadata();
  }

  public async getMantaPayConfig (chain: string): Promise<MantaPayConfig[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.dbService.getMantaPayConfig(chain);
  }

  public async getStaking (): Promise<StakingJson> {
    const addresses = this.keyringService.context.getDecodedAddresses();

    const stakings = await this.dbService.getStakings(addresses, this.activeChainSlugs);

    return { ready: true, details: stakings } as StakingJson;
  }

  public async getStakingOwnersByChains (chains: string[]): Promise<string[]> {
    const stakings = await this.dbService.getStakingsByChains(chains);
    const addresses: string[] = [];

    stakings.forEach((staking) => {
      if (!addresses.includes(staking.address)) {
        addresses.push(staking.address);
      }
    });

    return addresses;
  }

  public async getPooledStakingRecordsByAddress (addresses: string[]): Promise<StakingItem[]> {
    return this.dbService.getPooledStakings(addresses, this.activeChainSlugs);
  }

  public subscribeMantaPayConfig () {
    return this.mantaPayConfigSubject;
  }

  public subscribeStaking () {
    return this.stakingSubject;
  }

  public subscribeChainStakingMetadata () {
    return this.chainStakingMetadataSubject;
  }

  public subscribeNominatorMetadata () {
    return this.stakingNominatorMetadataSubject;
  }

  public ensureUrlAuthorizedV2 (url: string): Promise<boolean> {
    return this.requestService.ensureUrlAuthorizedV2(url);
  }

  public setStakingItem (networkKey: string, item: StakingItem): void {
    this.dbService.updateStaking(networkKey, item.address, item).catch((e) => this.logger.warn(e));
  }

  public updateChainStakingMetadata (item: ChainStakingMetadata, changes?: Record<string, unknown>) {
    this.dbService.updateChainStakingMetadata(item, changes).catch((e) => this.logger.warn(e));
  }

  public updateStakingNominatorMetadata (item: NominatorMetadata) {
    this.dbService.updateNominatorMetadata(item).catch((e) => this.logger.warn(e));
  }

  public setNftCollection (network: string, data: NftCollection, callback?: (data: NftCollection) => void): void {
    this.dbService.addNftCollection(data).catch((e) => this.logger.warn(e));
    callback && callback(data);
  }

  public getNftCollection () {
    return this.dbService.getAllNftCollection(this.activeChainSlugs);
  }

  public subscribeNftCollection () {
    const getChains = () => this.activeChainSlugs;

    return this.dbService.stores.nftCollection.subscribeNftCollection(getChains);
  }

  resetNft (newAddress: string): void {
    this.getNft().then((data) => this.nftSubject.next(data || {
      nftList: [],
      total: 0
    })).catch((e) => this.logger.warn(e));

    const addresses = this.keyringService.context.getDecodedAddresses(newAddress);

    this.dbService.subscribeNft(addresses, this.activeChainSlugs, (nfts) => {
      this.nftSubject.next({
        nftList: nfts,
        total: nfts.length
      });
    });
  }

  public updateNftData (network: string, nftData: NftItem, address: string, callback?: (nftData: NftItem) => void): void {
    this.dbService.addNft(address, nftData).catch((e) => this.logger.warn(e));

    callback && callback(nftData);
  }

  public deleteNftCollection (chain: string, collectionId: string) {
    return this.dbService.deleteNftCollection(chain, collectionId);
  }

  public cleanUpNfts (chain: string, owner: string, collectionId: string[], nftIds: string[], ownNothing?: boolean) {
    this.dbService.cleanUpNft(chain, owner, collectionId, nftIds, ownNothing).catch((e) => this.logger.warn(e));
  }

  public async getNft (): Promise<NftJson | undefined> {
    const addresses = this.keyringService.context.getDecodedAddresses();

    if (!addresses.length) {
      return;
    }

    const nfts = await this.dbService.getNft(addresses, this.activeChainSlugs);

    return {
      nftList: nfts,
      total: nfts.length
    };
  }

  public subscribeNft () {
    return this.nftSubject;
  }

  public resetStakingReward () {
    this.stakingRewardState.data = {};

    this.stakingRewardSubject.next(this.stakingRewardState);
  }

  public updateStakingReward (stakingRewardData: StakingRewardItem, callback?: (stakingRewardData: StakingRewardJson) => void): void {
    this.stakingRewardState.ready = true;
    const key = `${stakingRewardData.chain}___${stakingRewardData.address}___${stakingRewardData.type}`;

    this.stakingRewardState.data[key] = stakingRewardData;

    if (callback) {
      callback(this.stakingRewardState);
    }

    this.stakingRewardSubject.next(this.stakingRewardState);
  }

  public updateStakingRewardReady (ready: boolean) {
    this.stakingRewardState.ready = ready;
    this.stakingRewardSubject.next(this.stakingRewardState);
  }

  public getStakingReward (update: (value: StakingRewardJson) => void): void {
    update(this.stakingRewardState);
  }

  public subscribeStakingReward () {
    return this.stakingRewardSubject;
  }

  public async switchEvmNetworkByUrl (shortenUrl: string, networkKey: string): Promise<void> {
    const authUrls = await this.getAuthList();
    const chainInfo = this.chainService.getChainInfoByKey(networkKey);
    const chainState = this.chainService.getChainStateByKey(networkKey);

    if (authUrls[shortenUrl]) {
      if (chainInfo && !_isChainEnabled(chainState)) {
        await this.enableChainWithPriorityAssets(networkKey);
      }

      authUrls[shortenUrl].currentNetworkMap.evm = networkKey;
      this.setAuthorize(authUrls);
    } else {
      throw new EvmProviderError(EvmProviderErrorType.INTERNAL_ERROR, t('Not found {{shortenUrl}} in auth list', { replace: { shortenUrl } }));
    }
  }

  public async addNetworkConfirm (id: string, url: string, networkData: _NetworkUpsertParams) {
    return this.requestService.addConfirmation(id, url, 'addNetworkRequest', networkData)
      .then(async ({ isApproved }) => {
        if (isApproved) {
          if (networkData.mode === 'insert') {
            await this.upsertChainInfo(networkData);
          } else {
            // TODO: update existed network (need more discussion)
          }

          return null;
        } else {
          throw new EvmProviderError(EvmProviderErrorType.USER_REJECTED_REQUEST);
        }
      });
  }

  public async addTokenConfirm (id: string, url: string, tokenInfo: AddTokenRequestExternal) {
    return this.requestService.addConfirmation(id, url, 'addTokenRequest', tokenInfo)
      .then(async ({ isApproved }) => {
        if (isApproved) {
          await this.upsertCustomToken({
            originChain: tokenInfo.originChain,
            slug: '',
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            priceId: null,
            minAmount: null,
            assetType: tokenInfo.type,
            metadata: _parseMetadataForSmartContractAsset(tokenInfo.contractAddress),
            multiChainAsset: null,
            hasValue: _isChainTestNet(this.chainService.getChainInfoByKey(tokenInfo.originChain)),
            icon: ''
          });

          return isApproved;
        } else {
          throw new EvmProviderError(EvmProviderErrorType.USER_REJECTED_REQUEST);
        }
      });
  }

  public get metaSubject () {
    return this.requestService.metaSubject;
  }

  public get signSubject () {
    return this.requestService.signSubject;
  }

  public getSettings (callback: (settings: UiSettings) => void): void {
    this.settingService.getSettings(callback);
  }

  public setSettings (settings: UiSettings, callback?: () => void): void {
    this.settingService.setSettings(settings, callback);
  }

  public updateSetting <T extends keyof UiSettings> (key: T, value: UiSettings[T]): void {
    this.settingService.getSettings((settings) => {
      const newSettings: UiSettings = {
        ...settings,
        [key]: value
      };

      this.settingService.setSettings(newSettings);
    });
  }

  public setShowBalance (value: boolean): void {
    this.settingService.getSettings((settings) => {
      const newSettings = {
        ...settings,
        isShowBalance: value
      };

      this.settingService.setSettings(newSettings);
    });
  }

  public subscribeSettingsSubject (): Subject<RequestSettingsType> {
    return this.settingService.getSubject();
  }

  public async resetCrowdloanMap (newAddress: string) {
    const defaultData = generateDefaultCrowdloanMap();
    const storedData = await this.getStoredCrowdloan(newAddress);

    this.crowdloanMap = { ...defaultData, ...storedData } as Record<string, CrowdloanItem>;
    this.publishCrowdloan(true);
  }

  public resetStaking (newAddress: string) {
    this.getStaking()
      .then((data) => {
        this.stakingSubject.next(data);
      })
      .catch((e) => this.logger.warn(e));

    const addresses = this.keyringService.context.getDecodedAddresses(newAddress);

    this.dbService.subscribeStaking(addresses, this.activeChainSlugs, (stakings) => {
      this.stakingSubject.next({
        ready: true,
        details: stakings
      });
    });
  }

  public getCrowdloan (reset?: boolean): CrowdloanJson {
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
    const currentAccountInfo = this.keyringService.context.currentAccount;

    this.dbService.updateCrowdloanStore(networkKey, currentAccountInfo.proxyId, item).catch((e) => this.logger.warn(e));
  }

  public subscribeCrowdloan () {
    return this.crowdloanSubject;
  }

  public getSmartContractNfts () {
    return this.chainService.getSmartContractNfts();
  }

  // ChainService ------------------------------------------------

  public getChainInfoMap () {
    return this.chainService.getChainInfoMap();
  }

  public getChainStateMap () {
    return this.chainService.getChainStateMap();
  }

  public getAssetRefMap () {
    return this.chainService.getAssetRefMap();
  }

  public getChainStateByKey (key: string) {
    return this.chainService.getChainStateByKey(key);
  }

  public getAssetRegistry () {
    return this.chainService.getAssetRegistry();
  }

  public getMultiChainAssetMap () {
    return this.chainService.getMultiChainAssetMap();
  }

  public getXcmRefMap () {
    return this.chainService.xcmRefMap;
  }

  public getAssetByChainAndAsset (chain: string, assetTypes: _AssetType[]) {
    return this.chainService.getAssetByChainAndType(chain, assetTypes);
  }

  public getAssetBySlug (slug: string) {
    return this.chainService.getAssetBySlug(slug);
  }

  public getXcmEqualAssetByChain (destinationChain: string, originTokenSlug: string) {
    return this.chainService.getXcmEqualAssetByChain(destinationChain, originTokenSlug);
  }

  public subscribeChainInfoMap (): Subject<Record<string, _ChainInfo>> {
    return this.chainService.subscribeChainInfoMap();
  }

  public subscribeChainStateMap (): Subject<Record<string, _ChainState>> {
    return this.chainService.subscribeChainStateMap();
  }

  public subscribeAssetRegistry (): Subject<Record<string, _ChainAsset>> {
    return this.chainService.subscribeAssetRegistry();
  }

  public subscribeMultiChainAssetMap (): Subject<Record<string, _MultiChainAsset>> {
    return this.chainService.subscribeMultiChainAssetMap();
  }

  public subscribeXcmRefMap (): Subject<Record<string, _AssetRef>> {
    return this.chainService.subscribeXcmRefMap();
  }

  public async upsertCustomToken (data: _ChainAsset) {
    const tokenSlug = this.chainService.upsertCustomToken(data);

    if (_isAssetFungibleToken(data)) {
      await this.chainService.updateAssetSetting(tokenSlug, { visible: true });
      this.eventService.emit('asset.updateState', tokenSlug);
    } else {
      this.eventService.emit('asset.updateState', tokenSlug);
    }
  }

  public deleteCustomAssets (targetTokens: string[]) {
    this.chainService.deleteCustomAssets(targetTokens);
  }

  public async validateCustomChain (provider: string, existedChainSlug?: string) {
    return await this.chainService.validateCustomChain(provider, existedChainSlug);
  }

  public getSupportedSmartContractTypes () {
    return this.chainService.getSupportedSmartContractTypes();
  }

  public async validateCustomAsset (data: _ValidateCustomAssetRequest) {
    return await this.chainService.validateCustomToken(data);
  }

  // ------------------------------------------------

  public getActiveChainInfoMap () {
    return this.chainService.getActiveChainInfoMap();
  }

  public async upsertChainInfo (data: _NetworkUpsertParams): Promise<boolean> {
    const newNativeTokenSlug = await this.chainService.upsertChain(data);

    if (newNativeTokenSlug) {
      await this.chainService.updateAssetSetting(newNativeTokenSlug, { visible: true });
      this.eventService.emit('asset.updateState', newNativeTokenSlug);
    }

    return true;
  }

  public removeCustomChain (networkKey: string): boolean {
    return this.chainService.removeCustomChain(networkKey);
  }

  public forceRemoveChain (networkKey: string) {
    this.chainService.forceRemoveChain(networkKey);
  }

  // TODO: avoids turning off chains related to ledger account
  private getDefaultNetworkKeys = (): string[] => {
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

    for (const [key, network] of Object.entries(this.chainService.getChainInfoMap())) {
      const condition = hashes.includes(_getSubstrateGenesisHash(network) || '');

      if (condition) {
        result.push(key);
      }
    }

    return result;
  };

  public async disableChain (chainSlug: string): Promise<boolean> {
    await this.chainService.updateAssetSettingByChain(chainSlug, false);

    if (_MANTA_ZK_CHAIN_GROUP.includes(chainSlug)) {
      const mantaPayConfig = await this.chainService?.mantaPay?.getMantaPayFirstConfig(_DEFAULT_MANTA_ZK_CHAIN) as MantaPayConfig;

      if (mantaPayConfig && mantaPayConfig.enabled && this.isMantaPayEnabled) {
        await this.disableMantaPay(mantaPayConfig.address);
      }
    }

    return this.chainService.disableChain(chainSlug);
  }

  public async enableChain (chainSlug: string, enableTokens = true): Promise<boolean> {
    if (enableTokens) {
      await this.chainService.updateAssetSettingByChain(chainSlug, true);
    }

    return this.chainService.enableChain(chainSlug);
  }

  public async enableChainWithPriorityAssets (chainSlug: string, enableTokens = true): Promise<boolean> {
    if (enableTokens) {
      await this.chainService.updatePriorityAssetsByChain(chainSlug, true);
    }

    return this.chainService.enableChain(chainSlug);
  }

  public resetDefaultChains () {
    const defaultChains = this.getDefaultNetworkKeys();

    return this.chainService.resetChainInfoMap(defaultChains);
  }

  public getSubstrateApiMap () {
    return this.chainService.getSubstrateApiMap();
  }

  public getSubstrateApi (networkKey: string) {
    return this.chainService.getSubstrateApi(networkKey);
  }

  public getEvmApiMap () {
    return this.chainService.getEvmApiMap();
  }

  public getEvmApi (networkKey: string) {
    return this.chainService.getEvmApi(networkKey);
  }

  public getTonApiMap () {
    return this.chainService.getTonApiMap();
  }

  public getTonApi (networkKey: string) {
    return this.chainService.getTonApi(networkKey);
  }

  public getCardanoApiMap () {
    return this.chainService.getCardanoApiMap();
  }

  public getCardanoApi (networkKey: string) {
    return this.chainService.getCardanoApi(networkKey);
  }

  public getBitcoinApi (networkKey: string) {
    return this.chainService.getBitcoinApi(networkKey);
  }

  public getApiMap () {
    return {
      substrate: this.chainService.getSubstrateApiMap(),
      evm: this.chainService.getEvmApiMap()
    } as ApiMap;
  }

  public refreshSubstrateApi (key: string) {
    this.chainService.refreshSubstrateApi(key);

    return true;
  }

  public refreshWeb3Api (key: string) {
    this.chainService.refreshEvmApi(key);
  }

  public getServiceInfo (): ServiceInfo {
    return {
      chainInfoMap: this.chainService.getChainInfoMap(),
      chainApiMap: this.getApiMap(),
      currentAccountInfo: this.keyringService.context.currentAccount,
      assetRegistry: this.chainService.getAssetRegistry(),
      chainStateMap: this.chainService.getChainStateMap()
    };
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

  public pauseAllNetworks (code?: number, reason?: string) {
    return this.chainService.stopAllChainApis();
  }

  async resumeAllNetworks () {
    this.chainOnlineService.checkLatestData();

    return this.chainService.resumeAllChainApis();
  }

  private publishCrowdloan (reset?: boolean) {
    this.crowdloanSubject.next(this.getCrowdloan(reset));
  }

  // private publishHistory () {
  //   this.historySubject.next(this.getHistoryMap());
  // }

  // private removeInactiveDataByChain<T> (data: Record<string, T>) {
  //   const activeData: Record<string, T> = {};
  //
  //   Object.entries(data).forEach(([networkKey, items]) => {
  //     if (this.chainService.getChainStateByKey(networkKey).active) {
  //       activeData[networkKey] = items;
  //     }
  //   });
  //
  //   return activeData;
  // }

  findNetworkKeyByGenesisHash (genesisHash?: string | null): [string | undefined, _ChainInfo | undefined] {
    if (!genesisHash) {
      return [undefined, undefined];
    }

    const rs = Object.entries(this.chainService.getChainInfoMap()).find(([networkKey, chainInfo]) => (_getSubstrateGenesisHash(chainInfo) === genesisHash));

    if (rs) {
      return rs;
    } else {
      return [undefined, undefined];
    }
  }

  findChainIdGenesisHash (genesisHash?: string | null): number | undefined {
    const chainInfo = this.findNetworkKeyByGenesisHash(genesisHash)[1];

    return chainInfo ? _getEvmChainId(chainInfo) : undefined;
  }

  findNetworkKeyByChainId (chainId?: number | null): [string | undefined, _ChainInfo | undefined] {
    if (!chainId) {
      return [undefined, undefined];
    }

    const rs = Object.entries(this.chainService.getChainInfoMap()).find(([networkKey, chainInfo]) => (chainInfo?.evmInfo?.evmChainId === chainId));

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

    return (Object.values(_PREDEFINED_SINGLE_MODES)).find((item) => (item.networkKeys.includes(networkKey)));
  }

  public accountExportPrivateKey (request: RequestAccountExportPrivateKey): ResponseAccountExportPrivateKey {
    return this.keyringService.context.accountExportPrivateKey(request);
  }

  public checkPublicAndSecretKey (request: RequestCheckPublicAndSecretKey): ResponseCheckPublicAndSecretKey {
    return this.keyringService.context.checkPublicAndSecretKey(request);
  }

  public async evmSign (id: string, url: string, method: string, params: any, topic?: string): Promise<string | undefined> {
    let address = '';
    let payload: unknown;
    const [p1, p2] = params as [string, string];

    if (typeof p1 === 'string' && isEthereumAddress(p1)) {
      address = p1;
      payload = p2;
    } else if (typeof p2 === 'string' && isEthereumAddress(p2)) {
      address = p2;
      payload = p1;
    }

    const payloadValidation: PayloadValidated = {
      address,
      type: 'evm',
      payloadAfterValidated: payload,
      method,
      errors: [],
      networkKey: ''
    };

    const validationSteps: ValidateStepFunction[] =
      [
        topic ? validationAuthWCMiddleware : validationAuthMiddleware,
        validationEvmSignMessageMiddleware
      ];

    const result = await generateValidationProcess(this, url, payloadValidation, validationSteps, topic);
    const errorsFormated = convertErrorFormat(result.errors);
    const payloadAfterValidated: EvmSignatureRequest = {
      ...result.payloadAfterValidated as EvmSignatureRequest,
      errors: errorsFormated,
      id
    };

    return this.requestService.addConfirmation(id, url, 'evmSignatureRequest', payloadAfterValidated, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          if (payload) {
            return payload;
          } else {
            throw new EvmProviderError(EvmProviderErrorType.INVALID_PARAMS, t('Not found signature'));
          }
        } else {
          throw new EvmProviderError(EvmProviderErrorType.USER_REJECTED_REQUEST);
        }
      });
  }

  async calculateAllGasFeeOnChain (activeEvmChains: string[], timeout = 10000): Promise<Record<string, EvmFeeInfo | null>> {
    const promiseList: Promise<[string, EvmFeeInfo | null]>[] = [];

    activeEvmChains.forEach((slug) => {
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeout);
      });
      const promise = (async () => {
        try {
          const web3Api = this.chainService.getEvmApi(slug);

          await web3Api.isReady;

          return await calculateGasFeeParams(web3Api, slug, false, false);
        } catch (e) {
          console.error(e);

          return null;
        }
      })();

      promiseList.push(Promise.race([promise, timeoutPromise]).then((result) => {
        return [slug, result || null];
      }));
    });

    return Object.fromEntries(await Promise.all(promiseList));
  }

  public async evmSendTransaction (id: string, url: string, transactionParams: EvmSendTransactionParams, networkKeyInit?: string, topic?: string): Promise<string | undefined> {
    const payloadValidation: PayloadValidated = {
      errors: [],
      type: 'evm',
      networkKey: networkKeyInit || '',
      payloadAfterValidated: transactionParams,
      address: transactionParams.from
    };
    const validationSteps: ValidateStepFunction[] =
      [
        topic ? validationAuthWCMiddleware : validationAuthMiddleware,
        validationConnectMiddleware,
        validationEvmDataTransactionMiddleware
      ];

    const result = await generateValidationProcess(this, url, payloadValidation, validationSteps, topic);
    const { confirmationType, errors, networkKey: networkKey_ } = result;
    const errorsFormated = convertErrorFormat(errors);

    if (errorsFormated && errorsFormated.length > 0 && confirmationType) {
      if (ERROR_CONFIRMATION_TYPE.includes(confirmationType)) {
        return this.requestService.addConfirmation(id, url, confirmationType as ConfirmationType, { ...result, errors: errorsFormated }, {})
          .then(() => {
            throw new EvmProviderError(EvmProviderErrorType.USER_REJECTED_REQUEST);
          });
      }
    }

    const transactionValidated = result.payloadAfterValidated as EvmSendTransactionRequest;
    const networkKey = networkKey_ || '';

    const requestPayload: EvmSendTransactionRequest = {
      ...transactionValidated,
      errors: errorsFormated
    };

    const eType = transactionValidated.value ? ExtrinsicType.TRANSFER_BALANCE : ExtrinsicType.EVM_EXECUTE;

    const transactionData = { ...transactionValidated };
    const token = this.chainService.getNativeTokenInfo(networkKey);

    if (eType === ExtrinsicType.TRANSFER_BALANCE) {
      // @ts-ignore
      transactionData.tokenSlug = token.slug;
    }

    // Custom handle this instead of general handler transaction
    const transactionEmitter = await this.transactionService.addTransaction({
      transaction: requestPayload,
      address: requestPayload.from as string,
      chain: networkKey,
      url,
      data: transactionData,
      errors: errors as TransactionError[],
      extrinsicType: eType,
      chainType: ChainType.EVM,
      estimateFee: {
        value: transactionValidated.estimateGas,
        symbol: token.symbol,
        decimals: token.decimals || 18
      },
      id
    });

    // Wait extrinsic hash
    return new Promise((resolve, reject) => {
      transactionEmitter.on('extrinsicHash', (rs: TransactionEventResponse) => {
        resolve(rs.extrinsicHash);
      });

      // Mapping error for evmProvider
      transactionEmitter.on('error', (rs: TransactionEventResponse) => {
        let evmProviderError = new EvmProviderError(EvmProviderErrorType.INTERNAL_ERROR);

        const errorType = (rs.errors[0]?.errorType || BasicTxErrorType.INTERNAL_ERROR);

        if (errorType === BasicTxErrorType.USER_REJECT_REQUEST || errorType === BasicTxErrorType.UNABLE_TO_SIGN) {
          evmProviderError = new EvmProviderError(EvmProviderErrorType.USER_REJECTED_REQUEST);
        } else if (errorType === BasicTxErrorType.UNABLE_TO_SEND) {
          evmProviderError = new EvmProviderError(EvmProviderErrorType.INTERNAL_ERROR, rs.errors[0]?.message);
        }

        reject(evmProviderError);
      });
    });
  }

  // Cardano
  public async cardanoGetBalance (id: string, url: string, address: string): Promise<CardanoWasm.Value> {
    const authInfoMap = await this.getAuthList();
    const authInfo = authInfoMap[stripUrl(url)];

    let networkKey = authInfo?.currentNetworkMap.cardano;

    const autoActiveChain = authInfo?.isAllowed || false;
    const chainInfo = this.requestService.getDAppChainInfo({
      autoActive: autoActiveChain,
      accessType: 'cardano',
      defaultChain: networkKey,
      url
    });

    networkKey = chainInfo?.slug || 'cardano';
    const cardanoApi = this.chainService.getCardanoApi(networkKey);
    const networkAddress = reformatAddress(address, chainInfo?.isTestnet ? 0 : 1);
    const balances = await cardanoApi.getBalanceMap(networkAddress);

    return convertAssetToValue(balances);
  }

  public async cardanoSignData (id: string, url: string, params: RequestCardanoSignData, currentAddress: string): Promise<ResponseCardanoSignData> {
    const { address: addressHex, payload } = params;
    const address = convertCardanoHexToBech32(addressHex);
    const payloadValidation: PayloadValidated = {
      address,
      type: 'cardano',
      payloadAfterValidated: payload,
      errors: [],
      networkKey: ''
    };

    const validationSteps: ValidateStepFunction[] =
      [
        validationAuthCardanoMiddleware,
        validationCardanoSignDataMiddleware
      ];

    const result = await generateValidationProcess(this, url, payloadValidation, validationSteps);

    const errorsFormated = convertErrorFormat(result.errors);
    const payloadAfterValidated: CardanoSignatureRequest = {
      ...result.payloadAfterValidated as CardanoSignatureRequest,
      currentAddress,
      errors: errorsFormated,
      id
    };

    return this.requestService.addConfirmationCardano(id, url, 'cardanoSignatureRequest', payloadAfterValidated, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          if (payload) {
            return payload;
          } else {
            throw new CardanoProviderError(CardanoProviderErrorType.INVALID_REQUEST, t('Not found signature'));
          }
        } else {
          throw new CardanoProviderError(CardanoProviderErrorType.SIGN_DATA_DECLINED);
        }
      });
  }

  // Todo: Add validate for this method
  public async cardanoSignTx (id: string, url: string, param: RequestCardanoSignTransaction, currentAddress: string): Promise<ResponseCardanoSignTransaction> {
    const { partialSign, tx: txHex } = param;
    const tx = CardanoWasm.Transaction.from_hex(txHex);
    const inputs = tx.body().inputs();
    const outputs = tx.body().outputs();

    const estimateCardanoFee = tx.body().fee().to_str();

    const authInfoMap = await this.getAuthList();
    const authInfo = authInfoMap[stripUrl(url)];

    if (!authInfo) {
      throw new CardanoProviderError(CardanoProviderErrorType.REFUSED_REQUEST, t('Not found auth info'));
    }

    let requireKeyHashes: string[] = [];
    let networkKey = authInfo?.currentNetworkMap.cardano;
    let autoActiveChain = false;

    if (authInfo?.isAllowed) {
      autoActiveChain = true;
    }

    const currentCardanoNetwork = this.requestService.getDAppChainInfo({
      autoActive: autoActiveChain,
      accessType: 'cardano',
      defaultChain: networkKey,
      url
    });

    networkKey = currentCardanoNetwork?.slug || 'cardano';
    const allUtxos = await this.chainService.getUtxosByAddress(currentAddress, networkKey);

    const outputTransactionUnSpend = CardanoWasm.TransactionOutputs.new();

    inputs.to_js_value().forEach((input) => {
      const availableUtxo = allUtxos.find((utxo) => {
        const txIn = utxo.input();

        return txIn.transaction_id().to_hex() === input.transaction_id && txIn.index() === input.index;
      });

      if (availableUtxo) {
        const keyHash = availableUtxo.output().address().payment_cred()?.to_keyhash()?.to_hex();

        if (keyHash) {
          requireKeyHashes.push(keyHash);
        }

        outputTransactionUnSpend.add(availableUtxo.output());
      }
    });

    const addressInputMap = getBalanceAddressMap(outputTransactionUnSpend);
    const addressOutputMap = getBalanceAddressMap(outputs);
    const addressInputAmountMap: Record<string, AddressCardanoTransactionBalance> = {};
    const addressOutputAmountMap: Record<string, AddressCardanoTransactionBalance> = {};
    let transactionValue = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str('0'));

    for (const address in addressInputMap) {
      const output = addressOutputMap[address] ?? CardanoWasm.Value.new(CardanoWasm.BigNum.from_str('0'));
      const input = addressInputMap[address];

      const amount = input.checked_sub(output);

      if (amount.is_zero()) {
        continue;
      }

      addressInputAmountMap[address] = { values: convertValueToAsset(input) };
      addressOutputAmountMap[address] = { values: convertValueToAsset(output) };

      if (isSameAddress(currentAddress, address)) {
        if (!validateAddressNetwork(address, currentCardanoNetwork)) {
          throw new CardanoProviderError(CardanoProviderErrorType.ACCOUNT_CHANGED, t('Current network is changed'));
        }

        transactionValue = transactionValue.checked_add(amount);
        addressInputAmountMap[address].isOwner = true;
        addressOutputAmountMap[address].isOwner = true;
      }

      // Check if address is valid with current network
      if (!validateAddressNetwork(address, currentCardanoNetwork)) {
        throw new CardanoProviderError(CardanoProviderErrorType.INVALID_REQUEST, t('Current network is not match with input address'));
      }
    }

    for (const address in addressOutputMap) {
      if (!validateAddressNetwork(address, currentCardanoNetwork)) {
        throw new CardanoProviderError(CardanoProviderErrorType.INVALID_REQUEST, t('Current network is not match with output address'));
      }

      if (!addressInputAmountMap[address] && !addressOutputMap[address].is_zero()) {
        addressOutputAmountMap[address] = { values: convertValueToAsset(addressOutputMap[address]), isRecipient: true };
      }
    }

    const transactionBody = tx.body();
    const getSpecificUtxo = this.chainService.getSpecificUtxo.bind(this);

    requireKeyHashes.push(...extractKeyHashFromCertificate(transactionBody.certs()));
    requireKeyHashes.push(...extractKeyHashesFromWithdrawals(transactionBody.withdrawals()));
    requireKeyHashes.push(...extractKeyHashesFromRequiredSigners(transactionBody.required_signers()));
    requireKeyHashes.push(...(await extractKeyHashesFromCollaterals(transactionBody.collateral(), getSpecificUtxo(networkKey))));
    requireKeyHashes.push(...extractKeyHashesFromScripts(tx.witness_set().native_scripts()));

    requireKeyHashes = [...new Set(requireKeyHashes)];
    const addressRequireKeyTypes: CardanoKeyType[] = [];
    const keyHashAddressMap: Record<string, CardanoKeyType> = {};

    const pair = keyring.getPair(currentAddress);

    if (pair) {
      const paymentPubKey = CardanoWasm.Bip32PublicKey.from_hex(pair.cardano.paymentPubKey).to_raw_key().hash().to_hex();
      const stakePubKey = CardanoWasm.Bip32PublicKey.from_hex(pair.cardano.stakePubKey).to_raw_key().hash().to_hex();

      keyHashAddressMap[paymentPubKey] = 'payment';
      keyHashAddressMap[stakePubKey] = 'stake';
    } else {
      throw new CardanoProviderError(CardanoProviderErrorType.INVALID_REQUEST);
    }

    const needForeignKeyHash = requireKeyHashes.some((key) => {
      const ownKeyHash = keyHashAddressMap[key];

      if (ownKeyHash) {
        addressRequireKeyTypes.push(ownKeyHash);

        return false;
      }

      return true;
    });

    const needOwnerKeyHash = requireKeyHashes.some((key) => {
      const ownKeyHash = keyHashAddressMap[key];

      if (ownKeyHash) {
        addressRequireKeyTypes.push(ownKeyHash);

        return true;
      }

      return false;
    });

    if (!needOwnerKeyHash) {
      throw new CardanoProviderError(CardanoProviderErrorType.PROOF_GENERATION_FAILED, t('Not found owner key hash'));
    }

    if (needForeignKeyHash && !partialSign) {
      throw new CardanoProviderError(CardanoProviderErrorType.INVALID_REQUEST, 'Not support foreign key hash yet');
    }

    const result: CardanoTransactionDappConfig = {
      id,
      txInputs: addressInputAmountMap,
      txOutputs: addressOutputAmountMap,
      addressRequireKeyTypes,
      value: convertValueToAsset(transactionValue),
      estimateCardanoFee,
      from: currentAddress,
      cardanoPayload: txHex,
      networkKey
    };

    return this.requestService.addConfirmationCardano(id, url, 'cardanoSignTransactionRequest', result, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          if (payload) {
            return payload;
          } else {
            throw new CardanoProviderError(CardanoProviderErrorType.INVALID_REQUEST, t('Not found signature'));
          }
        } else {
          throw new CardanoProviderError(CardanoProviderErrorType.SIGN_TRANSACTION_DECLINED);
        }
      });
  }

  public async cardanoSubmitTx (id: string, url: string, txHex: string): Promise<string> {
    const currentNetwork = this.requestService.getDAppChainInfo({
      autoActive: true,
      accessType: 'cardano',
      url
    });

    const networkKey = currentNetwork?.slug || 'cardano_preproduction';

    const cardanoApi = this.chainService.getCardanoApi(networkKey);

    return await cardanoApi.sendCardanoTxReturnHash(txHex);
  }

  // Bitcoin
  public async bitcoinSign (id: string, url: string, method: string, params: BitcoinSignMessageParams): Promise<BitcoinSignMessageResult> {
    const { address, message } = params;

    const payloadValidation: PayloadValidated = {
      address,
      type: 'bitcoin',
      payloadAfterValidated: message,
      errors: [],
      networkKey: ''
    };

    const validationSteps: ValidateStepFunction[] =
      [
        validationAuthMiddleware,
        validationBitcoinSignMessageMiddleware
      ];

    const result = await generateValidationProcess(this, url, payloadValidation, validationSteps);

    const errorsFormated = convertErrorFormat(result.errors);
    const payloadAfterValidated: BitcoinSignatureRequest = {
      ...result.payloadAfterValidated as BitcoinSignatureRequest,
      errors: errorsFormated,
      id
    };

    return this.requestService.addConfirmationBitcoin(id, url, 'bitcoinSignatureRequest', payloadAfterValidated, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          if (payload) {
            return payload;
          } else {
            throw new BitcoinProviderError(BitcoinProviderErrorType.INVALID_PARAMS, t('Not found signature'));
          }
        } else {
          throw new BitcoinProviderError(BitcoinProviderErrorType.USER_REJECTED_REQUEST);
        }
      });
  }

  public async bitcoinSignPspt (id: string, url: string, params: BitcoinSignPsbtParams): Promise<BitcoinSignPsbtResult> {
    const { address, network, psbt } = params;
    const payloadValidation: PayloadValidated = {
      address,
      type: 'bitcoin',
      payloadAfterValidated: params,
      errors: [],
      networkKey: network === 'mainnet' ? 'bitcoin' : 'bitcoinTestnet'
    };

    const validationSteps: ValidateStepFunction[] =
      [
        validationAuthMiddleware,
        validationBitcoinConnectMiddleware,
        validationBitcoinSignPsbtMiddleware
      ];

    const result = await generateValidationProcess(this, url, payloadValidation, validationSteps);

    const errorsFormated = convertErrorFormat(result.errors);

    const payloadAfterValidated: BitcoinSignPsbtRequest = {
      ...result.payloadAfterValidated as BitcoinSignPsbtRequest,
      errors: errorsFormated
    };
    const network_ = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const psbtGenerate = bitcoin.Psbt.fromHex(psbt, {
      network: network_
    });

    const isExistedInput = (inputs: PsbtTransactionArg[], address: string) => inputs.findIndex(({ address: address_ }) => isSameAddress(address, address_ || ''));
    let to = '';
    const tokenInfo = this.getNativeTokenInfo(result.networkKey);
    let value = new BigN(0);
    const totalBalance = await this.balanceService.getTotalBalance(address, result.networkKey, tokenInfo.slug);
    let inputAmount = new BigN(0);
    const psbtInputData = psbtGenerate.data.inputs.reduce((inputs, { nonWitnessUtxo, witnessUtxo }, inputIndex) => {
      let inputData: PsbtTransactionArg | null = null;

      if (witnessUtxo) {
        inputData = {
          address: bitcoin.address.fromOutputScript(witnessUtxo?.script, network_),
          amount: witnessUtxo.value.toString()
        };
      } else if (nonWitnessUtxo) {
        const txin = psbtGenerate.txInputs[inputIndex];
        const txout = bitcoin.Transaction.fromBuffer(nonWitnessUtxo).outs[txin.index];

        inputData = {
          address: bitcoin.address.fromOutputScript(txout.script, network_),
          amount: txout.value.toString()
        };
      }

      if (inputData) {
        inputs.push(inputData);

        if (isSameAddress(address, inputData.address || '')) {
          inputAmount = inputAmount.plus(new BigN(inputData.amount || '0'));
        }
      }

      return inputs;
    }, [] as PsbtTransactionArg[]);

    if (new BigN(totalBalance.value).lt(inputAmount)) {
      payloadAfterValidated.errors = [{ message: t('Insufficient balance'), name: t('Unable to sign transaction') }];
    }

    const psbtOutputData = psbtGenerate.txOutputs.map((output) => {
      let address = '';

      try {
        address = output.address || bitcoin.address.fromOutputScript(output.script, network_);
      } catch (e) {
        if (output.script.includes(bitcoin.opcodes.OP_RETURN)) {
          address = 'OP_RETURN';
        } else {
          address = 'Unknown';
        }
      }

      if (isExistedInput(psbtInputData, address) === -1) {
        to = address;
        value = value.plus(new BigN(output.value));
      }

      return {
        address,
        amount: output.value.toString()
      } as PsbtTransactionArg;
    });

    payloadAfterValidated.payload = {
      ...payloadAfterValidated.payload,
      psbt,
      tokenSlug: tokenInfo.slug,
      value: value.toString(),
      to,
      txInput: psbtInputData,
      txOutput: psbtOutputData
    };

    return this.requestService.addConfirmationBitcoin(id, url, 'bitcoinSignPsbtRequest', payloadAfterValidated, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          if (payload) {
            return payload;
          } else {
            throw new BitcoinProviderError(BitcoinProviderErrorType.INVALID_PARAMS, t('Not found signature'));
          }
        } else {
          throw new BitcoinProviderError(BitcoinProviderErrorType.USER_REJECTED_REQUEST);
        }
      });
  }

  public async bitcoinSendTransaction (id: string, url: string, transactionParams: BitcoinSendTransactionParams): Promise<string | undefined> {
    const payloadValidation: PayloadValidated = {
      address: transactionParams.account,
      type: 'bitcoin',
      payloadAfterValidated: transactionParams,
      errors: [],
      networkKey: transactionParams.network === 'mainnet' ? 'bitcoin' : 'bitcoinTestnet'
    };

    const validationSteps: ValidateStepFunction[] =
      [
        validationAuthMiddleware,
        validationBitcoinConnectMiddleware,
        validationBitcoinSendTransactionMiddleware
      ];
    const result = await generateValidationProcess(this, url, payloadValidation, validationSteps);
    const errorsFormated = convertErrorFormat(result.errors);
    const requestPayload: BitcoinSendTransactionRequest = {
      ...result.payloadAfterValidated as BitcoinSendTransactionRequest,
      hashPayload: JSON.stringify(result.payloadAfterValidated),
      from: transactionParams.account,
      id,
      errors: errorsFormated
    };

    // Custom handle this instead of general handler transaction
    return this.requestService.addConfirmationBitcoin(id, url, 'bitcoinSendTransactionRequestAfterConfirmation', requestPayload, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          if (payload) {
            return payload;
          } else {
            throw new BitcoinProviderError(BitcoinProviderErrorType.INVALID_PARAMS, t('Not found signature'));
          }
        } else {
          throw new BitcoinProviderError(BitcoinProviderErrorType.USER_REJECTED_REQUEST);
        }
      });
  }

  public getConfirmationsQueueSubject (): BehaviorSubject<ConfirmationsQueue> {
    return this.requestService.confirmationsQueueSubject;
  }

  public getConfirmationsQueueSubjectTon (): BehaviorSubject<ConfirmationsQueueTon> {
    return this.requestService.confirmationsQueueSubjectTon;
  }

  public getConfirmationsQueueSubjectCardano (): BehaviorSubject<ConfirmationsQueueCardano> {
    return this.requestService.confirmationsQueueSubjectCardano;
  }

  public getConfirmationsQueueSubjectBitcoin (): BehaviorSubject<ConfirmationsQueueBitcoin> {
    return this.requestService.confirmationsQueueSubjectBitcoin;
  }

  public async completeConfirmation (request: RequestConfirmationComplete) {
    return await this.requestService.completeConfirmation(request);
  }

  public async completeConfirmationTon (request: RequestConfirmationCompleteTon) {
    return await this.requestService.completeConfirmationTon(request);
  }

  public async completeConfirmationCardano (request: RequestConfirmationCompleteCardano) {
    return await this.requestService.completeConfirmationCardano(request);
  }

  public async completeConfirmationBitcoin (request: RequestConfirmationCompleteBitcoin) {
    return await this.requestService.completeConfirmationBitcoin(request);
  }

  private async onMV3Update () {
    const migrationStatus = await SWStorage.instance.getItem('mv3_migration');

    if (!migrationStatus || migrationStatus !== 'done') {
      if (!isManifestV3) {
        this.migrateMV3LocalStorage(JSON.stringify(self.localStorage)).catch(console.error);
      }
    }
  }

  private async storePreviousVersionData (details: chrome.runtime.InstalledDetails) {
    if (details.reason === 'update') {
      const previousVersion = details.previousVersion;

      if (!previousVersion) {
        return;
      }

      const storedData = await SWStorage.instance.getItem('previous_version');

      if (!storedData || !storedData.includes(previousVersion)) {
        await SWStorage.instance.setItem('previous_version', previousVersion);
      }
    }
  }

  public async migrateMV3LocalStorage (data: string) {
    try {
      const parsedData = JSON.parse(data) as Record<string, string>;

      parsedData.mv3_migration = 'done';

      await SWStorage.instance.setMap(parsedData);

      // Reload some services use SWStorage
      // wallet connect
      this.walletConnectService.initClient().catch(console.error);

      return true;
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  private async onMV3Install () {
    await SWStorage.instance.setItem('mv3_migration', 'done');

    // Open expand page
    const url = `${chrome.runtime.getURL('index.html')}#/welcome`;

    withErrorLog(() => chrome.tabs.create({ url }));
  }

  public onInstallOrUpdate (details: chrome.runtime.InstalledDetails) {
    // Open mv3 migration window
    if (details.reason === 'install') {
      this.onMV3Install().catch(console.error);
    } else if (details.reason === 'update') {
      this.onMV3Update().catch(console.error);
      this.storePreviousVersionData(details).catch(console.error);
    }
  }

  private async onHandleRemindExportAccount () {
    const remindStatus = await SWStorage.instance.getItem(REMIND_EXPORT_ACCOUNT);

    if (!remindStatus || !remindStatus.includes('done')) {
      const handleRemind = (account: CurrentAccountInfo) => {
        if (account.proxyId !== '') {
          // Open remind tab
          const url = `${chrome.runtime.getURL('index.html')}#/remind-export-account`;

          openPopup(url)
            .then(noop)
            .catch(console.error)
            .finally(() => subscription.unsubscribe());
        } else {
          setTimeout(() => {
            subscription.unsubscribe();
          }, 3000);
        }
      };

      const subscription = this.keyringService.context.observable.currentAccount.subscribe(handleRemind);
    }
  }

  public async setStorageFromWS ({ key, value }: StorageDataInterface) {
    try {
      const jsonData = JSON.stringify(value);

      await SWStorage.instance.setItem(key, jsonData);

      return true;
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  public async getStorageFromWS (key: string) {
    try {
      return await SWStorage.instance.getItem(key);
    } catch (e) {
      console.error(e);

      return null;
    }
  }

  public onCheckToRemindUser () {
    this.onHandleRemindExportAccount()
      .catch(console.error);
  }

  public onInstall () {
    // const singleModes = Object.values(_PREDEFINED_SINGLE_MODES);

    // This logic is moved to installation.ts
    // try {
    //   // Open expand page
    //   const url = `${chrome.extension.getURL('index.html')}#/`;
    //
    //   withErrorLog(() => chrome.tabs.create({ url }));
    // } catch (e) {
    //   console.error(e);
    // }

    // const setUpSingleMode = ({ networkKeys, theme }: SingleModeJson) => {
    //   networkKeys.forEach((key) => {
    //     this.enableChain(key).catch(console.error);
    //   });
    //
    //   const chainInfo = this.chainService.getChainInfoByKey(networkKeys[0]);
    //   const genesisHash = _getSubstrateGenesisHash(chainInfo);
    //
    //   this.setCurrentAccount({
    //     address: ALL_ACCOUNT_KEY,
    //     currentGenesisHash: genesisHash.length > 0 ? genesisHash : null
    //   });
    //   this.setTheme(theme);
    // };
    //
    // chrome.tabs.query({}, function (tabs) {
    //   const openingUrls = tabs.map((t) => t.url);
    //
    //   const singleMode = singleModes.find(({ autoTriggerDomain }) => {
    //     const urlRegex = new RegExp(autoTriggerDomain);
    //
    //     return Boolean(openingUrls.find((url) => {
    //       return url && urlRegex.test(url);
    //     }));
    //   });
    //
    //   if (singleMode) {
    //     // Wait for everything is ready before enable single mode
    //     setTimeout(() => {
    //       setUpSingleMode(singleMode);
    //     }, 999);
    //   }
    // });
  }

  public get activeNetworks () {
    return this.chainService.getActiveChainInfos();
  }

  public get activeChainSlugs () {
    return Object.values(this.activeNetworks).map((chainInfo) => {
      return chainInfo.slug;
    });
  }

  public async sleep () {
    // Wait for app initialized before sleep
    await this.eventService.waitAppInitialized;

    // Wait starting finish before sleep to avoid conflict
    this.generalStatus === ServiceStatus.STARTING && this.waitStarting && await this.waitStarting;
    this.generalStatus === ServiceStatus.STARTING_FULL && this.waitStartingFull && await this.waitStartingFull;
    this.eventService.emit('general.sleep', true);

    // Avoid sleep multiple times
    if (this.generalStatus === ServiceStatus.STOPPED) {
      return;
    }

    // Continue wait existed stopping process
    if (this.generalStatus === ServiceStatus.STOPPING) {
      await this.waitSleeping;

      return;
    }

    const sleeping = createPromiseHandler<void>();

    this.generalStatus = ServiceStatus.STOPPING;
    this.waitSleeping = sleeping.promise;

    // Stopping services
    this.campaignService.stop();
    await Promise.all([this.cron.stop(), this.subscription.stop()]);
    await this.pauseAllNetworks(undefined, 'IDLE mode');
    await Promise.all([this.historyService.stop(), this.priceService.stop(), this.balanceService.stop(), this.earningService.stop(), this.swapService.stop(), this.inappNotificationService.stop()]);

    // Complete sleeping
    sleeping.resolve();
    this.generalStatus = ServiceStatus.STOPPED;
    this.waitSleeping = null;
  }

  private async _start () {
    // Wait for app initialized before start
    await this.eventService.waitAppInitialized;

    // Wait sleep finish before start to avoid conflict
    this.generalStatus === ServiceStatus.STOPPING && this.waitSleeping && await this.waitSleeping;

    // Avoid start multiple times
    if (this.generalStatus === ServiceStatus.STARTED) {
      return;
    }

    // Continue wait existed starting process
    if (this.generalStatus === ServiceStatus.STARTING) {
      await this.waitStarting;

      return;
    }

    const isWakeup = this.generalStatus === ServiceStatus.STOPPED;
    const starting = createPromiseHandler<void>();

    this.generalStatus = ServiceStatus.STARTING;
    this.waitStarting = starting.promise;

    // Resume all networks if wakeup from sleep
    if (isWakeup) {
      await this.resumeAllNetworks();
      this.eventService.emit('general.wakeup', true);
    }

    // Start services
    this.eventService.emit('general.start', true);

    // Complete starting
    this.waitStarting = null;
    this.generalStatus = ServiceStatus.STARTED;
    starting.resolve();
  }

  private async _startFull () {
    // Continue wait existed starting process
    if (this.generalStatus === ServiceStatus.STARTING) {
      await this.waitStarting;
    }

    // Always start full from start state
    if (this.generalStatus !== ServiceStatus.STARTED) {
      return;
    }

    this.generalStatus = ServiceStatus.STARTING_FULL;
    const startingFull = createPromiseHandler<void>();

    this.waitStartingFull = startingFull.promise;

    await Promise.all([this.cron.start(), this.subscription.start(), this.historyService.start(), this.priceService.start(), this.balanceService.start(), this.earningService.start(), this.swapService.start(), this.inappNotificationService.start()]);
    this.eventService.emit('general.start_full', true);

    this.waitStartingFull = null;
    this.generalStatus = ServiceStatus.STARTED_FULL;
    startingFull.resolve();
  }

  public async wakeup (fullWakeup = false) {
    await this._start();

    if (fullWakeup) {
      await this._startFull();
    }
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

  scanAddressOnAdd: string[] = [];

  public onAccountAdd () {
    this.eventService.on('account.add', (address) => {
      this.scanAddressOnAdd.push(address);

      addLazy('autoScanBalanceOnAdd', () => {
        this.balanceService.autoEnableChains(this.scanAddressOnAdd).catch(this.logger.error);
        this.scanAddressOnAdd = [];
      }, 500, 5000, false);
    });
  }

  public onAccountRemove () {
    this.eventService.on('account.remove', (address) => {
      // Some separate service like historyService will listen to this event and remove inside that service

      const stores = this.dbService.stores;

      // Remove NFT
      stores.nft.deleteNftByAddress([address]).catch(console.error);

      // Remove Staking Data
      stores.staking.removeAllByAddress(address).catch(console.error);
    });
  }

  public async reloadNft () {
    const currentAddress = this.keyringService.context.currentAccount.proxyId;

    await this.dbService.removeNftsByAddress(currentAddress);

    return await this.cron.reloadNft();
  }

  public async reloadStaking () {
    await this.earningService.reloadEarning(true);

    return true;
  }

  public async reloadBalance () {
    await this.balanceService.reloadBalance();

    return true;
  }

  public async reloadCrowdloan () {
    await this.subscription.reloadCrowdloan();

    return true;
  }

  public async approvePassPhishingPage (_url: string) {
    return new Promise<boolean>((resolve) => {
      this.settingService.getPassPhishingList((value) => {
        const result = { ...value };
        const url = stripUrl(_url);

        result[url] = { pass: true };

        this.settingService.setPassPhishing(result, () => {
          resolve(true);
        });
      });
    });
  }

  public saveEnvConfig <T extends keyof EnvConfig> (key: T, value: EnvConfig[T]): void {
    this.settingService.getEnvironmentList((config) => {
      const newSettings: EnvConfig = {
        ...config,
        [key]: value
      };

      this.settingService.setEnvironment(newSettings);
    });
  }

  public initEnvConfig (envConfig: EnvConfig): void {
    this.settingService.setEnvironment(envConfig);
  }

  public async resetWallet (resetAll: boolean) {
    await this.keyringService.resetWallet(resetAll);
    await this.earningService.resetYieldPosition();
    await this.balanceService.handleResetBalance(true);
    this.requestService.resetWallet();
    this.transactionService.resetWallet();
    // await this.handleResetBalance(ALL_ACCOUNT_KEY, true);
    await this.earningService.resetWallet();
    await this.dbService.resetWallet(resetAll);

    if (resetAll) {
      await this.priceService.setPriceCurrency(DEFAULT_CURRENCY);
      this.settingService.resetWallet();
      await this.priceService.setPriceCurrency(DEFAULT_CURRENCY);
    }

    this.chainService.resetWallet(resetAll);
    await this.walletConnectService.resetWallet(resetAll);

    await this.chainService.init();
    this.chainOnlineService.checkLatestData();
    this.chainService.checkLatestData();
    this.chainService.subscribeChainInfoMap().subscribe(() => {
      this.afterChainServiceInit();
    });
  }

  public async enableMantaPay (updateStore: boolean, address: string, password: string, seedPhrase?: string) {
    if (!address || isEthereumAddress(address)) {
      return;
    }

    this.chainService?.mantaPay?.setCurrentAddress(address);

    await this.chainService?.mantaPay?.privateWallet?.initialSigner();

    if (updateStore && seedPhrase) { // first time initiation
      await this.chainService?.mantaPay?.privateWallet?.loadUserSeedPhrase(seedPhrase);
      const authContext = await this.chainService?.mantaPay?.privateWallet?.getAuthorizationContext();

      await this.chainService?.mantaPay?.privateWallet?.loadAuthorizationContext(authContext as interfaces.AuthContextType);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const encryptedData = await passworder.encrypt(password, authContext);

      await this.chainService?.mantaPay?.saveMantaAuthContext({
        chain: _DEFAULT_MANTA_ZK_CHAIN,
        address,
        data: encryptedData
      });
    } else {
      const authContext = (await this.chainService?.mantaPay?.getMantaAuthContext(address, _DEFAULT_MANTA_ZK_CHAIN)) as MantaAuthorizationContext;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const decryptedData = await passworder.decrypt(password, authContext.data);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      const proofAuthKey = new Uint8Array(Object.values(decryptedData.proof_authorization_key));

      await this.chainService?.mantaPay?.privateWallet?.loadAuthorizationContext({
        proof_authorization_key: proofAuthKey
      } as interfaces.AuthContextType);
    }

    const zkAddress = await this.chainService?.mantaPay?.privateWallet?.getZkAddress();

    if (updateStore) {
      await this.chainService?.mantaPay?.saveMantaPayConfig({
        address,
        zkAddress: zkAddress,
        enabled: true,
        chain: this.chainService?.mantaPay?.privateWallet?.network?.toLowerCase(),
        isInitialSync: false
      } as MantaPayConfig);
    }

    this.isMantaPayEnabled = true;

    return zkAddress;
  }

  public async disableMantaPay (address: string) {
    const config = await this.chainService?.mantaPay?.getMantaPayConfig(address, _DEFAULT_MANTA_ZK_CHAIN) as MantaPayConfig;

    if (!config) {
      return false;
    }

    await this.chainService?.mantaPay?.privateWallet?.dropAuthorizationContext();
    await this.chainService?.mantaPay?.privateWallet?.dropUserSeedPhrase();
    // await this.chainService?.mantaPay?.privateWallet?.resetState();
    await this.chainService?.mantaPay?.deleteMantaPayConfig(address, _DEFAULT_MANTA_ZK_CHAIN);
    await this.chainService?.mantaPay?.deleteMantaAuthContext(address, _DEFAULT_MANTA_ZK_CHAIN);

    this.chainService.setMantaZkAssetSettings(false);
    this.isMantaPayEnabled = false;

    return true;
  }

  public async initialSyncMantaPay (address: string) {
    if (!address || isEthereumAddress(address)) {
      return;
    }

    this.chainService?.mantaPay?.setCurrentAddress(address);

    await this.chainService?.mantaPay?.privateWallet?.baseWallet?.isApiReady();

    const syncResult = await this.chainService?.mantaPay?.privateWallet?.initialWalletSync();

    await this.chainService?.mantaPay?.updateMantaPayConfig(address, _DEFAULT_MANTA_ZK_CHAIN, { isInitialSync: true });

    this.eventService.emit('mantaPay.initSync', undefined);

    return syncResult;
  }

  public getMantaZkBalance () {
    if (!this.chainService || !this.chainService?.mantaPay) {
      return;
    }

    if (!this.chainService?.mantaPay?.privateWallet?.initialSyncIsFinished) {
      return;
    }

    const chain = this.chainService?.mantaPay.privateWallet?.network;

    if (!chain) {
      return;
    }

    const assetMap = this.chainService.getMantaZkAssets(chain?.toLowerCase());

    this.chainService?.mantaPay?.privateWallet?.getMultiZkBalance(Object.values(assetMap).map((tokenInfo) => new BN(_getTokenOnChainAssetId(tokenInfo))))
      .then((zkBalances) => {
        const assetList = Object.values(assetMap);

        for (let i = 0; i < assetList.length; i++) {
          const balanceItem = {
            tokenSlug: assetList[i].slug,
            state: APIItemState.PENDING,
            free: '0',
            locked: '0'
          } as BalanceItem;

          balanceItem.free = zkBalances[i]?.toString() || '0';
          balanceItem.state = APIItemState.READY;
          this.balanceService.setBalanceItem([balanceItem]);
        }
      })
      .catch(console.warn);
  }

  public subscribeMantaPayBalance () {
    let interval: NodeJS.Timer | undefined;

    this.chainService?.mantaPay?.getMantaPayConfig(this.keyringService.context.currentAccount.proxyId, _DEFAULT_MANTA_ZK_CHAIN)
      .then((config: MantaPayConfig) => {
        if (config && config.enabled && config.isInitialSync) {
          this.getMantaZkBalance();

          interval = setInterval(this.getMantaZkBalance, MANTA_PAY_BALANCE_INTERVAL);
        }
      })
      .catch(console.warn);

    return () => {
      interval && clearInterval(interval);
    };
  }

  public async syncMantaPay () {
    const config = await this.chainService?.mantaPay?.getMantaPayFirstConfig(_DEFAULT_MANTA_ZK_CHAIN) as MantaPayConfig;

    if (!config.isInitialSync) {
      return;
    }

    if (this.chainService?.mantaPay?.privateWallet?.initialSyncIsFinished) {
      await this.chainService?.mantaPay?.privateWallet?.walletSync();
    } else {
      await this.chainService?.mantaPay?.privateWallet?.initialWalletSync();
    }
  }

  public async getMantaPayZkBalance (address: string, tokenInfo: _ChainAsset): Promise<AmountData> {
    const bnAssetId = new BN(_getTokenOnChainAssetId(tokenInfo));
    const balance = await this.chainService?.mantaPay?.privateWallet?.getZkBalance(bnAssetId);

    return {
      decimals: tokenInfo.decimals || 0,
      symbol: tokenInfo.symbol,
      value: balance?.toString() || '0'
    };
  }

  public subscribeMantaPaySyncState () {
    if (!this.chainService?.mantaPay) {
      return new Subject<MantaPaySyncState>();
    }

    return this.chainService?.mantaPay?.subscribeSyncState();
  }

  /* Metadata */

  public async findMetadata (hash: string) {
    const metadata = await this.chainService.getMetadataByHash(hash);

    return {
      metadata: metadata?.hexValue || '',
      specVersion: parseInt(metadata?.specVersion || '0'),
      types: metadata?.types || {},
      userExtensions: metadata?.userExtensions
    };
  }

  public async calculateMetadataHash (chain: string) {
    return this.chainService.calculateMetadataHash(chain);
  }

  public async shortenMetadata (chain: string, txBlob: string) {
    return this.chainService.shortenMetadata(chain, txBlob);
  }

  /* Metadata */

  public getCrowdloanContributions ({ address, page, relayChain }: RequestCrowdloanContributions) {
    return this.subscanService.getCrowdloanContributions(relayChain, address, page);
  }
}
