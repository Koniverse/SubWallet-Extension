// Copyright 2019-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AuthUrls, Resolver } from '@subwallet/extension-base/background/handlers/State';
import { AccountAuthType, AccountJson, AuthorizeRequest, RequestAccountList, RequestAccountSubscribe, RequestAuthorizeCancel, RequestAuthorizeReject, RequestAuthorizeSubscribe, RequestAuthorizeTab, RequestCurrentAccountAddress, ResponseAuthorizeList, ResponseJsonGetAccountInfo, SeedLengths } from '@subwallet/extension-base/background/types';
import { ExternalState, LedgerState, QrState } from '@subwallet/extension-base/signers/types';
import { InjectedAccount, MetadataDefBase } from '@subwallet/extension-inject/types';
import Web3 from 'web3';
import { RequestArguments, TransactionConfig } from 'web3-core';
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsicFunction } from '@polkadot/api/promise/types';
import { KeyringPair$Json, KeyringPair$Meta } from '@polkadot/keyring/types';
import { Registry } from '@polkadot/types/types';
import { SignerResult } from '@polkadot/types/types/extrinsic';
import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import { KeyringOptions } from '@polkadot/ui-keyring/options/types';
import { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { BN } from '@polkadot/util';
import { KeypairType } from '@polkadot/util-crypto/types';

export interface ServiceInfo {
  networkMap: Record<string, NetworkJson>;
  apiMap: ApiMap;
  isLock?: boolean;
  currentAccountInfo: CurrentAccountInfo;
  chainRegistry: Record<string, ChainRegistry>;
  customNftRegistry: CustomToken[];
}

export enum ApiInitStatus {
  SUCCESS,
  ALREADY_EXIST,
  NOT_SUPPORT,
  NOT_EXIST
}

/// Request Auth

export interface AuthRequestV2 extends Resolver<ResultResolver> {
  id: string;
  idStr: string;
  request: RequestAuthorizeTab;
  url: string;
  accountAuthType: AccountAuthType
}

/// Manage Auth

// Get Auth

export interface RequestAuthorizeApproveV2 {
  id: string;
  accounts: string[];
}

// Auth All site

export interface RequestAuthorizationAll {
  connectValue: boolean;
}

// Manage site auth (all allowed/unAllowed)

export interface RequestAuthorization extends RequestAuthorizationAll {
  url: string;
}

// Manage single auth with single account

export interface RequestAuthorizationPerAccount extends RequestAuthorization {
  address: string;
}

// Manage single site with multi account

export interface RequestAuthorizationPerSite {
  id: string;
  values: Record<string, boolean>;
}

// Manage site block

export interface RequestAuthorizationBlock {
  id: string;
  connectedValue: boolean;
}

// Forget site auth

export interface RequestForgetSite {
  url: string;
}

export interface ResultResolver {
  result: boolean;
  accounts: string[];
}

export interface RejectResolver {
  error: Error;
  accounts: string[];
}

/// Staking subscribe

export enum StakingType {
  NOMINATED = 'nominated',
  POOLED = 'pooled',
}

export interface StakingRewardItem {
  state: APIItemState
  name: string,
  chain: string,
  address: string,
  type: StakingType,

  latestReward?: string,
  totalReward?: string,
  totalSlash?: string,
  unclaimedReward?: string
}
export interface UnlockingStakeInfo {
  chain: string,
  address: string,
  type: StakingType,

  nextWithdrawal: number,
  redeemable: number,
  nextWithdrawalAmount: number,
  nextWithdrawalAction?: string,
  validatorAddress?: string // validator to unstake from
}

export interface StakingItem {
  name: string,
  chain: string,
  address: string,

  balance?: string,
  activeBalance?: string,
  unlockingBalance?: string,
  nativeToken: string,
  unit?: string,

  type: StakingType,
  state: APIItemState,

  unlockingInfo?: UnlockingStakeInfo,
  rewardInfo?: StakingRewardItem
}

export interface StakingJson {
  reset?: boolean,
  ready?: boolean,
  details: StakingItem[]
}

export interface StakingRewardJson {
  ready: boolean;
  slowInterval: Array<StakingRewardItem>;
  fastInterval: Array<StakingRewardItem>;
}

export interface StakeUnlockingJson {
  timestamp: number,
  details: UnlockingStakeInfo[]
}

export interface PriceJson {
  ready?: boolean,
  currency: string,
  priceMap: Record<string, number>,
  tokenPriceMap: Record<string, number>
}

export enum APIItemState {
  PENDING = 'pending',
  READY = 'ready',
  CACHED = 'cached',
  ERROR = 'error',
  NOT_SUPPORT = 'not_support'
}

export enum RMRK_VER {
  VER_1 = '1.0.0',
  VER_2 = '2.0.0'
}

export enum CrowdloanParaState {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface NftTransferExtra {
  cronUpdate: boolean;
  forceUpdate: boolean;
  selectedNftCollection?: NftCollection; // for rendering
  nftItems?: NftItem[]; // for rendering, remaining nfts
}

export interface NftItem {
  id?: string;
  name?: string;
  image?: string;
  external_url?: string;
  rarity?: string;
  collectionId?: string;
  description?: string;
  properties?: Record<any, any> | null;
  chain?: string;
  type?: CustomTokenType.erc721 | CustomTokenType.psp34 | RMRK_VER; // for sending
  rmrk_ver?: RMRK_VER;
  owner?: string;
  onChainOption?: any; // for sending PSP-34 tokens, should be done better
}

export interface NftCollection {
  collectionId: string;
  collectionName?: string;
  image?: string;
  chain?: string;
  itemCount?: number;
}

export interface NftJson {
  total: number;
  nftList: Array<NftItem>;
}

export interface NftCollectionJson {
  ready: boolean;
  nftCollectionList: Array<NftCollection>;
}

export interface NftStoreJson {
  nftList: Array<NftItem>;
  nftCollectionList: Array<NftCollection>;
}

export interface TokenBalanceRaw {
  reserved: BN,
  frozen: BN,
  free: BN
}

export interface BalanceChildItem {
  reserved: string,
  frozen: string,
  free: string,
  decimals: number
}

export interface BalanceItem {
  state: APIItemState,
  free?: string,
  reserved?: string,
  miscFrozen?: string,
  feeFrozen?: string,
  children?: Record<string, BalanceChildItem>,
  timestamp?: number
}

export interface BalanceJson {
  reset?: boolean,
  details: Record<string, BalanceItem>
}

export interface CrowdloanItem {
  state: APIItemState,
  paraState?: CrowdloanParaState,
  contribute: string
}

export interface CrowdloanJson {
  reset?: boolean,
  details: Record<string, CrowdloanItem>
}

export interface ChainRegistry {
  chainDecimals: number[];
  chainTokens: string[];
  tokenMap: Record<string, TokenInfo>
}

export interface DefaultFormatBalance {
  decimals?: number[] | number;
  unit?: string[] | string;
}

export interface ApiState {
  apiDefaultTx: SubmittableExtrinsicFunction;
  apiDefaultTxSudo: SubmittableExtrinsicFunction;
  isApiReady: boolean;
  isApiReadyOnce: boolean;
  isDevelopment?: boolean;
  isEthereum?: boolean;
  specName: string;
  specVersion: string;
  systemChain: string;
  systemName: string;
  systemVersion: string;
  registry: Registry;
  defaultFormatBalance: DefaultFormatBalance;
}

export interface ApiProps extends ApiState {
  api: ApiPromise;
  apiError?: string;
  apiUrl: string;
  isNotSupport?: boolean;
  isApiReadyOnce: boolean;
  isApiConnected: boolean;
  isEthereum: boolean;
  isEthereumOnly: boolean;
  isApiInitialized: boolean;
  isReady: Promise<ApiProps>;
  apiRetry?: number;
  recoverConnect?: () => void;
  useEvmAddress?: boolean
}

export type NetWorkGroup = 'RELAY_CHAIN' | 'POLKADOT_PARACHAIN' | 'KUSAMA_PARACHAIN' | 'MAIN_NET' | 'TEST_NET' | 'UNKNOWN';

export interface NetWorkInfo {
  chain: string;
  genesisHash: string;
  icon?: string;
  ss58Format: number;
  chainType?: 'substrate' | 'ethereum';
  provider: string;
  groups: NetWorkGroup[];
  paraId?: number;
  isEthereum?: boolean;
  nativeToken?: string;
  crowdloanUrl?: string;
  decimals?: number;
}

export enum ContractType {
  wasm = 'wasm',
  evm = 'evm'
}

export interface NetworkJson {
  // General Information
  key: string; // Key of network in NetworkMap
  chain: string; // Name of the network
  icon?: string; // Icon name, available with known network
  active: boolean; // Network is active or not

  // Provider Information
  providers: Record<string, string>; // Predefined provider map
  currentProvider: string | null; // Current provider key
  currentProviderMode: 'http' | 'ws'; // Current provider mode, compute depend on provider protocol. the feature need to know this to decide use subscribe or cronjob to use this features.
  customProviders?: Record<string, string>; // Custom provider map, provider name same with provider map
  nftProvider?: string;

  // Metadata get after connect to provider
  genesisHash: string; // identifier for network
  groups: NetWorkGroup[];
  ss58Format: number;
  paraId?: number;
  chainType?: 'substrate' | 'ethereum';
  crowdloanUrl?: string;

  // Ethereum related information for predefined network only
  isEthereum?: boolean; // Only show network with isEthereum=true when select one EVM account // user input
  evmChainId?: number;

  isHybrid?: boolean;

  // Native token information
  nativeToken?: string;
  decimals?: number;

  // Other information
  coinGeckoKey?: string; // Provider key to get token price from CoinGecko // user input
  blockExplorer?: string; // Link to block scanner to check transaction with extrinsic hash // user input
  abiExplorer?: string; // Link to block scanner to check transaction with extrinsic hash // user input
  dependencies?: string[]; // Auto active network in dependencies if current network is activated
  getStakingOnChain?: boolean; // support get bonded on chain
  supportBonding?: boolean;
  supportSmartContract?: ContractType[]; // if network supports PSP smart contracts

  apiStatus?: NETWORK_STATUS;
  requestId?: string;
}

export interface DonateInfo {
  key: string;
  name: string;
  value: string;
  icon: string;
  link: string;
}

export interface DropdownOptionType {
  text: string;
  value: string;
}

export interface DropdownTransformOptionType {
  label: string;
  value: string;
}

export interface DropdownTransformGroupOptionType {
  label: string;
  options: DropdownTransformOptionType[];
}

export interface NetWorkMetadataDef extends MetadataDefBase {
  networkKey: string;
  groups: NetWorkGroup[];
  isEthereum: boolean;
  paraId?: number;
  isAvailable: boolean;
  active: boolean;
  apiStatus: NETWORK_STATUS;
}

export type CurrentNetworkInfo = {
  networkKey: string;
  networkPrefix: number;
  icon: string;
  genesisHash: string;
  isEthereum: boolean;
  isReady?: boolean; // check if current network info is lifted from initial state
}

export type TokenInfo = {
  isMainToken: boolean,
  symbol: string,
  symbolAlt?: string, // Alternate display for symbol
  contractAddress?: string,
  type?: CustomTokenType, // to differentiate custom tokens from native tokens
  decimals: number,
  name: string,
  coinGeckoKey?: string,
  // TODO: unify specialOption, assetId, assetIndex
  specialOption?: object,
  assetId?: string, // for moon assets
  assetIndex?: number | string,
}

// all Accounts and the address of the current Account
export interface AccountsWithCurrentAddress {
  accounts: AccountJson[];
  currentAddress?: string;
  currentGenesisHash?: string | null;
  isShowBalance?: boolean;
  allAccountLogo?: string;
}

export interface OptionInputAddress {
  options: KeyringOptions;
}

export interface CurrentAccountInfo {
  address: string;
  currentGenesisHash: string | null;
  allGenesisHash?: string;
}

export interface RequestSettingsType {
  isShowBalance: boolean;
  accountAllLogo: string;
  theme: ThemeTypes;
}

export interface ResponseSettingsType {
  isShowBalance: boolean;
  accountAllLogo: string;
  theme: ThemeTypes;
}

export interface RandomTestRequest {
  start: number;
  end: number;
}

export interface TransactionHistoryItemType {
  time: number | string;
  networkKey: string;
  change: string;
  changeSymbol?: string; // if undefined => main token
  fee?: string;
  feeSymbol?: string;
  // if undefined => main token, sometime "fee" uses different token than "change"
  // ex: sub token (DOT, AUSD, KSM, ...) of Acala, Karaura uses main token to pay fee
  isSuccess: boolean;
  action: 'send' | 'received';
  extrinsicHash: string;
  origin?: 'app' | 'network';
  eventIdx?: number | null;
}

export interface TransactionHistoryItemJson {
  items: TransactionHistoryItemType[],
  total: number
}

export interface RequestTransactionHistoryGet {
  address: string;
  networkKey: string;
}

export interface RequestTransactionHistoryGetByMultiNetworks {
  address: string;
  networkKeys: string[];
}

export interface RequestTransactionHistoryAdd {
  address: string;
  networkKey: string;
  item: TransactionHistoryItemType;
}

export interface RequestApi {
  networkKey: string;
}

/// Manage account

// Export private key

export interface RequestAccountExportPrivateKey {
  address: string;
  password: string;
}

export interface ResponseAccountExportPrivateKey {
  privateKey: string;
  publicKey: string;
}

// Get account info with private key

export interface RequestCheckPublicAndSecretKey {
  secretKey: string;
  publicKey: string;
}

export interface ResponseCheckPublicAndSecretKey {
  address: string;
  isValid: boolean;
  isEthereum: boolean;
}

// Create seed phase

export interface RequestSeedCreateV2 {
  length?: SeedLengths;
  seed?: string;
  types?: Array<KeypairType>;
}

export interface ResponseSeedCreateV2 {
  seed: string,
  addressMap: Record<KeypairType, string>
}

// Get account info with suri

export interface RequestSeedValidateV2 {
  suri: string;
  types?: Array<KeypairType>;
}

export type ResponseSeedValidateV2 = ResponseSeedCreateV2

// Create account with suri

export interface RequestAccountCreateSuriV2 {
  name: string;
  genesisHash?: string | null;
  password: string;
  suri: string;
  types?: Array<KeypairType>;
  isAllowed: boolean;
}

export type ResponseAccountCreateSuriV2 = Record<KeypairType, string>

// Create derive account

export interface RequestDeriveCreateV2 {
  name: string;
  genesisHash?: string | null;
  suri: string;
  parentAddress: string;
  parentPassword: string;
  password: string;
  isAllowed: boolean;
}

// Restore account with json file (single account)

export interface RequestJsonRestoreV2 {
  file: KeyringPair$Json;
  password: string;
  address: string;
  isAllowed: boolean;
}

// Restore account with json file (multi account)

export interface RequestBatchRestoreV2 {
  file: KeyringPairs$Json;
  password: string;
  accountsInfo: ResponseJsonGetAccountInfo[];
  isAllowed: boolean;
}

// Restore account with privateKey

export interface ResponsePrivateKeyValidateV2 {
  addressMap: Record<KeypairType, string>,
  autoAddPrefix: boolean
}

// External account

export enum AccountExternalErrorCode {
  INVALID_ADDRESS = 'invalidToAccount',
  KEYRING_ERROR = 'keyringError',
  UNKNOWN_ERROR = 'unknownError'
}

export interface AccountExternalError{
  code: AccountExternalErrorCode;
  message: string;
}

// Attach QR-signer account

export interface RequestAccountCreateExternalV2 {
  address: string;
  genesisHash?: string | null;
  name: string;
  isEthereum: boolean;
  isAllowed: boolean;
  isReadOnly: boolean;
}

// Attach Ledger account

export interface RequestAccountCreateHardwareV2 {
  accountIndex: number;
  address: string;
  addressOffset: number;
  genesisHash: string;
  hardwareType: string;
  name: string;
  isAllowed?: boolean;
}

// Restore account with public and secret key

export interface RequestAccountCreateWithSecretKey {
  publicKey: string;
  secretKey: string;
  password: string;
  name: string;
  isAllow: boolean;
  isEthereum: boolean;
}

export interface ResponseAccountCreateWithSecretKey {
  errors: AccountExternalError[];
  success: boolean;
}

/// Sign External Request

// Status

export enum ExternalRequestPromiseStatus {
  PENDING,
  REJECTED,
  FAILED,
  COMPLETED
}

// Structure

export interface ExternalRequestPromise {
  resolve?: (result: SignerResult | PromiseLike<SignerResult>) => void,
  reject?: (error?: Error) => void,
  status: ExternalRequestPromiseStatus,
  message?: string;
  createdAt: number
}

// Prepare to create

export interface PrepareExternalRequest {
  id: string;
  setState: (promise: ExternalRequestPromise) => void;
  updateState: (promise: Partial<ExternalRequestPromise>) => void;
}

// Reject

export interface RequestRejectExternalRequest {
  id: string;
  message?: string;
  throwError?: boolean;
}

export type ResponseRejectExternalRequest = void

// Resolve

export interface RequestResolveExternalRequest {
  id: string;
  data: SignerResult;
}

export type ResponseResolveExternalRequest = void

///

export type AccountRef = Array<string>
export type AccountRefMap = Record<string, AccountRef>

export type RequestPrice = null
export type RequestSubscribePrice = null
export type RequestBalance = null
export type RequestSubscribeBalance = null
export type RequestSubscribeBalancesVisibility = null
export type RequestCrowdloan = null
export type RequestSubscribeCrowdloan = null
export type RequestSubscribeNft = null
export type RequestSubscribeStaking = null
export type RequestSubscribeStakingReward = null
export type ThemeTypes = 'light' | 'dark' | 'subspace'
export type RequestNftForceUpdate = {
  collectionId: string,
  nft: NftItem,
  isSendingSelf: boolean,
  chain: string,
  senderAddress: string,
  recipientAddress: string
}

export enum NETWORK_ERROR {
  INVALID_INFO_TYPE = 'invalidInfoType',
  INJECT_SCRIPT_DETECTED = 'injectScriptDetected',
  EXISTED_NETWORK = 'existedNetwork',
  EXISTED_PROVIDER = 'existedProvider',
  INVALID_PROVIDER = 'invalidProvider',
  NONE = 'none',
  CONNECTION_FAILURE = 'connectionFailure',
  PROVIDER_NOT_SAME_NETWORK = 'providerNotSameNetwork'
}

export enum NETWORK_STATUS {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending'
}

export enum TransferErrorCode {
  NOT_ENOUGH_VALUE = 'notEnoughValue',
  INVALID_VALUE = 'invalidValue',
  INVALID_TOKEN = 'invalidToken',
  TRANSFER_ERROR = 'transferError',
  UNSUPPORTED = 'unsupported'
}

export enum BasicTxErrorCode {
  INVALID_PARAM = 'invalidParam',
  KEYRING_ERROR = 'keyringError',
  STAKING_ERROR = 'stakingError',
  UN_STAKING_ERROR = 'unStakingError',
  WITHDRAW_STAKING_ERROR = 'withdrawStakingError',
  CLAIM_REWARD_ERROR = 'claimRewardError',
  CREATE_COMPOUND_ERROR = 'createCompoundError',
  CANCEL_COMPOUND_ERROR = 'cancelCompoundError',
  TIMEOUT = 'timeout',
  BALANCE_TO_LOW = 'balanceTooLow1',
  UNKNOWN_ERROR = 'unknownError'
}

export type TxErrorCode = TransferErrorCode | BasicTxErrorCode

export type BasicTxError = {
  code: TxErrorCode,
  data?: object,
  message: string
}

export interface BasicTxResponse {
  passwordError?: string | null;
  callHash?: string;
  status?: boolean;
  extrinsicHash?: string;
  txError?: boolean;
  errors?: BasicTxError[];
  externalState?: ExternalState;
  qrState?: QrState;
  ledgerState?: LedgerState;
  isBusy?: boolean;
  txResult?: TxResultType,
  isFinalized?: boolean
}

export interface NftTransactionResponse extends BasicTxResponse {
  isSendingSelf: boolean;
}

export type HandleBasicTx = (data: BasicTxResponse) => void;
export type HandleTxResponse<T extends BasicTxResponse> = (data: T) => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export type BaseRequestSign = {};

export type PasswordRequestSign<T extends BaseRequestSign> = T & { password: string; };

export type ExternalRequestSign<T extends BaseRequestSign> = Omit<T, 'password'>;

export enum TransferStep {
  READY = 'ready',
  SIGNING = 'signing',
  START = 'start',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

export type TxResultType = {
  change: string;
  changeSymbol?: string;
  fee?: string;
  feeSymbol?: string;
}

export interface NftTransactionRequest {
  networkKey: string,
  senderAddress: string,
  recipientAddress: string,
  params: Record<string, any>
}

export interface EvmNftTransaction {
  tx: Record<string, any> | null,
  estimatedFee: string | null,
  balanceError: boolean
}

export interface EvmNftSubmitTransaction extends BaseRequestSign {
  senderAddress: string,
  recipientAddress: string,
  networkKey: string,
  rawTransaction: Record<string, any>
}

export interface ValidateNetworkResponse {
  success: boolean,
  key: string,
  genesisHash: string,
  ss58Prefix: string,
  networkGroup: NetWorkGroup[],
  chain: string,
  evmChainId: number,
  nativeToken?: string,
  decimal?: number

  error?: NETWORK_ERROR,
  conflictChain?: string,
  conflictKey?: string,
}

export interface ValidateNetworkRequest {
  provider: string,
  isEthereum: boolean,
  existedNetwork?: NetworkJson
}

export interface ApiMap {
  dotSama: Record<string, ApiProps>;
  web3: Record<string, Web3>;
}

export interface DisableNetworkResponse {
  success: boolean,
  activeNetworkCount?: number
}

export enum CustomTokenType {
  erc20 = 'erc20',
  erc721 = 'erc721',
  psp22 = 'psp22',
  psp34 = 'psp34'
}

export interface CustomToken { // general interface for all kinds of tokens
  smartContract: string,
  chain: string,
  type: CustomTokenType,

  name?: string,
  symbol?: string,
  decimals?: number,
  isCustom?: boolean,
  isDeleted?: boolean,
  image?: string
}

export interface CustomTokenJson {
  [CustomTokenType.erc20]: CustomToken[],
  [CustomTokenType.erc721]: CustomToken[],
  [CustomTokenType.psp22]: CustomToken[],
  [CustomTokenType.psp34]: CustomToken[]
}

export interface DeleteCustomTokenParams {
  smartContract: string,
  chain: string,
  type: CustomTokenType
}

export interface ValidateCustomTokenRequest {
  smartContract: string,
  chain: string,
  type: CustomTokenType,
  contractCaller?: string
}

export interface ValidateCustomTokenResponse {
  name: string,
  symbol: string,
  decimals?: number,
  isExist: boolean,
  contractError: boolean
}

export interface SupportTransferResponse {
  supportTransfer: boolean;
  supportTransferAll: boolean;
}

export interface RequestFreeBalance {
  address: string,
  networkKey: string,
  token?: string
}

export interface RequestTransferCheckReferenceCount {
  address: string,
  networkKey: string
}

export interface RequestTransferCheckSupporting {
  networkKey: string,
  token: string
}

export interface RequestTransferExistentialDeposit {
  networkKey: string,
  token: string
}

export interface RequestSaveRecentAccount {
  accountId: string;
}

export interface SubstrateNftTransaction {
  error: boolean;
  estimatedFee?: string;
  balanceError: boolean;
}

export interface SubstrateNftSubmitTransaction extends BaseRequestSign {
  params: Record<string, any> | null;
  senderAddress: string;
  recipientAddress: string;
}

export type RequestSubstrateNftSubmitTransaction = PasswordRequestSign<SubstrateNftSubmitTransaction>
export type RequestEvmNftSubmitTransaction = PasswordRequestSign<EvmNftSubmitTransaction>

export type ChainRelationType = 'p' | 'r'; // parachain | relaychain

export interface ChainRelationInfo {
  type: ChainRelationType;
  isEthereum: boolean;
  supportedToken: string[];
}

export interface CrossChainRelation {
  type: ChainRelationType;
  isEthereum: boolean;
  relationMap: Record<string, ChainRelationInfo>;
}

export interface RequestAccountMeta{
  address: string | Uint8Array;
}

export interface ResponseAccountMeta{
  meta: KeyringPair$Meta;
}

export type RequestEvmEvents = null;
export type EvmEventType = 'connect' | 'disconnect' | 'accountsChanged' | 'chainChanged' | 'message' | 'data' | 'reconnect' | 'error';
export type EvmAccountsChangedPayload = string [];
export type EvmChainChangedPayload = string;
export type EvmConnectPayload = { chainId: EvmChainChangedPayload }
export type EvmDisconnectPayload = unknown

export interface EvmEvent {
  type: EvmEventType,
  payload: EvmAccountsChangedPayload | EvmChainChangedPayload | EvmConnectPayload | EvmDisconnectPayload;
}

export interface EvmAppState {
  networkKey?: string,
  chainId?: string,
  isConnected?: boolean,
  web3?: Web3,
  listenEvents?: string[]
}

export type RequestEvmProviderSend = JsonRpcPayload;

export interface ResponseEvmProviderSend {
  error: (Error | null);
  result?: JsonRpcResponse;
}

export interface SubWalletProviderErrorInterface extends Error{
  code?: number;
  data?: unknown;
}

export interface EvmProviderRpcErrorInterface extends SubWalletProviderErrorInterface{
  code: number;
}

export type EvmRpcErrorHelperMap = Record<'USER_REJECTED_REQUEST'| 'UNAUTHORIZED'| 'UNSUPPORTED_METHOD'| 'DISCONNECTED'| 'CHAIN_DISCONNECTED'| 'INVALID_PARAMS'| 'INTERNAL_ERROR', [number, string]>;

export interface EvmSendTransactionParams {
  from: string;
  to?: string;
  value?: string | number;
  gasLimit?: string | number;
  maxPriorityFeePerGas?: string | number;
  maxFeePerGas?: string | number;
  gasPrice?: string | number;
  data?: string
}

export interface SwitchNetworkRequest {
  networkKey: string;
  address?: string;
}

export interface EvmSignatureRequest {
  address: string,
  type: string;
  payload: unknown
}

export interface ConfirmationsQueueItemOptions {
  requiredPassword?: boolean;
  address?: string;
  networkKey?: string;
}

export interface ConfirmationsQueueItem<T> extends ConfirmationsQueueItemOptions{
  id: string;
  url: string;
  payload: T;
  payloadJson: string;
}

export interface ConfirmationResult<T> {
  id: string;
  isApproved: boolean;
  url?: string;
  payload?: T;
  password?: string;
}

export interface ConfirmationResultExternal<T> extends ConfirmationResult<T>{
  signature: `0x${string}`;
}

export interface EvmSendTransactionRequest extends TransactionConfig {
  estimateGas: string;
}

export interface EvmRequestExternal {
  hashPayload: string;
  canSign: boolean;
}

export interface EvmSendTransactionRequestExternal extends EvmSendTransactionRequest, EvmRequestExternal {}

export interface EvmSignatureRequestExternal extends EvmSignatureRequest, EvmRequestExternal {}

export interface ConfirmationDefinitions {
  addNetworkRequest: [ConfirmationsQueueItem<NetworkJson>, ConfirmationResult<NetworkJson>],
  addTokenRequest: [ConfirmationsQueueItem<CustomToken>, ConfirmationResult<boolean>],
  switchNetworkRequest: [ConfirmationsQueueItem<SwitchNetworkRequest>, ConfirmationResult<boolean>],
  evmSignatureRequest: [ConfirmationsQueueItem<EvmSignatureRequest>, ConfirmationResult<string>],
  evmSignatureRequestExternal: [ConfirmationsQueueItem<EvmSignatureRequestExternal>, ConfirmationResultExternal<string>],
  evmSendTransactionRequest: [ConfirmationsQueueItem<EvmSendTransactionRequest>, ConfirmationResult<boolean>]
  evmSendTransactionRequestExternal: [ConfirmationsQueueItem<EvmSendTransactionRequestExternal>, ConfirmationResultExternal<boolean>]
}

export type ConfirmationType = keyof ConfirmationDefinitions;

export type ConfirmationsQueue = {
  [ConfirmationType in keyof ConfirmationDefinitions]: Record<string, ConfirmationDefinitions[ConfirmationType][0]>;
}

export type RequestConfirmationsSubscribe = null;

// Design to use only one confirmation
export type RequestConfirmationComplete = {
  [ConfirmationType in keyof ConfirmationDefinitions]?: ConfirmationDefinitions[ConfirmationType][1];
}

export interface ValidatorInfo {
  address: string;
  totalStake: number;
  ownStake: number;
  otherStake: number;
  nominatorCount: number;
  commission: number;
  expectedReturn: number;
  blocked: boolean;
  identity?: string;
  isVerified: boolean;
  minBond: number;
  isNominated: boolean; // this validator has been staked to before
  icon?: string;
  hasScheduledRequest?: boolean; // for parachain, can't stake more on a collator that has existing scheduled request
}

export interface ExtraDelegationInfo {
  chain: string;
  address: string;
  collatorAddress: string;
}

export interface BasicTxInfo {
  fee: string,
  balanceError: boolean,
  rawFee?: number
}

export interface BondingOptionParams {
  networkKey: string;
  address: string;
}

export interface SingleModeJson {
  networkKeys: string[],
  theme: ThemeTypes,
  autoTriggerDomain: string // Regex for auto trigger single mode
}

/// EVM transaction

export type NestedArray<T> = T | NestedArray<T>[];

/// EVM Contract Input

export interface EVMTransactionArg {
  name: string;
  type: string;
  value: string;
  children?: EVMTransactionArg[];
}

export interface ParseEVMTransactionData{
  method: string;
  methodName: string;
  args: EVMTransactionArg[];
}

export interface RequestParseEVMContractInput {
  data: string;
  contract: string;
  chainId: number;
}

export interface ResponseParseEVMContractInput {
  result: ParseEVMTransactionData | string
}

/// Ledger

export interface LedgerNetwork {
  genesisHash: string;
  displayName: string;
  network: string;
  icon: 'substrate' | 'ethereum';
  isDevMode: boolean;
}

/// On-ramp

export interface TransakNetwork {
  networks: string[];
  tokens?: string[];
}

/// Qr Sign

// Parse Substrate

export interface FormattedMethod {
  args?: ArgInfo[];
  methodName: string;
}

export interface ArgInfo {
  argName: string;
  argValue: string | string[];
}

export interface EraInfo{
  period: number;
  phase: number;
}

export interface ResponseParseTransactionSubstrate {
  era: EraInfo | string;
  nonce: number;
  method: string | FormattedMethod[];
  tip: number;
  specVersion: number;
  message: string;
}

export interface RequestParseTransactionSubstrate {
  data: string;
  networkKey: string;
}

// Parse EVM

export interface RequestQrParseRLP {
  data: string;
}

export interface ResponseQrParseRLP {
  data: ParseEVMTransactionData | string;
  input: string;
  nonce: number;
  to: string;
  gas: number;
  gasPrice: number;
  value: number;
}

// Check lock

export interface RequestAccountIsLocked {
  address: string;
}

export interface ResponseAccountIsLocked {
  isLocked: boolean;
  remainingTime: number;
}

// Sign

export type SignerDataType = 'transaction' | 'message'

export interface RequestQrSignSubstrate {
  address: string;
  data: string;
  savePass: boolean;
  networkKey: string;
  password?: string;
}

export interface ResponseQrSignSubstrate {
  signature: string;
}

export interface RequestQrSignEVM {
  address: string;
  message: string;
  type: 'message' | 'transaction'
  chainId?: number;
  password: string;
}

export interface ResponseQrSignEVM {
  signature: string;
}

/// Transfer

export interface RequestCheckTransfer extends BaseRequestSign{
  networkKey: string,
  from: string,
  to: string,
  value?: string,
  transferAll?: boolean
  token?: string
}

export interface ResponseCheckTransfer{
  errors?: Array<BasicTxError>,
  fromAccountFree: string,
  toAccountFree: string,
  estimateFee?: string,
  feeSymbol?: string // if undefined => use main token
}

export type RequestTransfer = PasswordRequestSign<RequestCheckTransfer>

export interface RequestCheckCrossChainTransfer extends BaseRequestSign {
  originNetworkKey: string,
  destinationNetworkKey: string,
  from: string,
  to: string,
  transferAll?: boolean,
  value: string,
  token: string
}

export type RequestCrossChainTransfer = PasswordRequestSign<RequestCheckCrossChainTransfer>;

export interface ResponseCheckCrossChainTransfer {
  errors?: Array<BasicTxError>,
  feeString?: string,
  estimatedFee: string,
  feeSymbol: string
}

/// Stake

// Bonding

export interface BondingOptionInfo {
  isBondedBefore: boolean,
  era: number,
  maxNominations: number,
  maxNominatorPerValidator: number,
  validators: ValidatorInfo[],
  bondedValidators: string[]
}

export interface ChainBondingBasics {
  stakedReturn: number,
  // minBond: number,
  isMaxNominators: boolean,
  validatorCount: number
}

export interface BondingSubmitParams extends BaseRequestSign {
  networkKey: string,
  nominatorAddress: string,
  amount: number,
  validatorInfo: ValidatorInfo,
  isBondedBefore: boolean,
  bondedValidators: string[], // already delegated validators
  lockPeriod?: number // in month
}

export type RequestBondingSubmit = PasswordRequestSign<BondingSubmitParams>;

// UnBonding

export interface UnbondingSubmitParams extends BaseRequestSign {
  amount: number,
  networkKey: string,
  address: string,
  // for some chains
  validatorAddress?: string,
  unstakeAll?: boolean
}

export type RequestUnbondingSubmit = PasswordRequestSign<UnbondingSubmitParams>;

// Withdraw

export interface StakeWithdrawalParams extends BaseRequestSign {
  address: string,
  networkKey: string,
  validatorAddress?: string,
  action?: string
}

export type RequestStakeWithdrawal = PasswordRequestSign<StakeWithdrawalParams>;

// Claim

export interface StakeClaimRewardParams extends BaseRequestSign {
  address: string,
  networkKey: string,
  validatorAddress?: string,
  stakingType: StakingType
}

export type RequestStakeClaimReward = PasswordRequestSign<StakeClaimRewardParams>;

// Compound

export interface DelegationItem {
  owner: string,
  amount: string, // raw amount string
  identity?: string,
  minBond: string,
  hasScheduledRequest: boolean
  icon?: string;
}

export interface StakeDelegationRequest {
  address: string,
  networkKey: string
}

export interface CheckExistingTuringCompoundParams {
  address: string;
  collatorAddress: string;
  networkKey: string;
}

export interface ExistingTuringCompoundTask {
  exist: boolean;
  taskId: string;
  accountMinimum: number;
  frequency: number;
}

export interface TuringStakeCompoundResp {
  txInfo: BasicTxInfo,
  optimalFrequency: string,
  initTime: number,
  compoundFee: string,
  rawCompoundFee?: number
}

export interface TuringStakeCompoundParams extends BaseRequestSign {
  address: string,
  collatorAddress: string,
  networkKey: string,
  accountMinimum: string,
  bondedAmount: string,
}

export type RequestTuringStakeCompound = PasswordRequestSign<TuringStakeCompoundParams>;

export interface TuringCancelStakeCompoundParams extends BaseRequestSign {
  taskId: string;
  networkKey: string;
  address: string;
}

export type RequestTuringCancelStakeCompound = PasswordRequestSign<TuringCancelStakeCompoundParams>;

/// Create QR

// Transfer

export type RequestTransferExternal = ExternalRequestSign<RequestCheckTransfer>;

// XCM

export type RequestCrossChainTransferExternal = ExternalRequestSign<RequestCheckCrossChainTransfer>;

// NFT

export type RequestNftTransferExternalSubstrate = ExternalRequestSign<SubstrateNftSubmitTransaction>;

export type RequestNftTransferExternalEVM = ExternalRequestSign<EvmNftSubmitTransaction>;

// Stake

export type RequestStakeExternal = ExternalRequestSign<BondingSubmitParams>;

export type RequestUnStakeExternal = ExternalRequestSign<UnbondingSubmitParams>;

export type RequestWithdrawStakeExternal = ExternalRequestSign<StakeWithdrawalParams>;

export type RequestClaimRewardExternal = ExternalRequestSign<StakeClaimRewardParams>;

export type RequestCreateCompoundStakeExternal = ExternalRequestSign<TuringStakeCompoundParams>;

export type RequestCancelCompoundStakeExternal = ExternalRequestSign<TuringCancelStakeCompoundParams>;

export type SubscriptionServiceType = 'chainRegistry' | 'balance' | 'crowdloan' | 'staking';
export type CronServiceType = 'price' | 'nft' | 'staking' | 'history' | 'recoverApi' | 'checkApiStatus';
export type CronType =
  'recoverApiMap' |
  'checkApiMapStatus' |
  'refreshHistory' |
  'refreshNft' |
  'refreshPrice' |
  'refreshStakeUnlockingInfo' |
  'refreshStakingReward' |
  'refreshPoolingStakingReward';

export interface RequestInitCronAndSubscription {
  subscription: {
    activeServices: SubscriptionServiceType[]
  },
  cron: {
    intervalMap: Partial<Record<CronType, number>>,
    activeServices: CronServiceType[]
  }
}

export interface RequestCronAndSubscriptionAction {
  subscriptionServices: SubscriptionServiceType[];
  cronServices: CronServiceType[];
}

export interface ActiveCronAndSubscriptionMap {
  subscription: Record<SubscriptionServiceType, boolean>;
  cron: Record<CronServiceType, boolean>;
}

export interface KoniRequestSignatures {
  // Bonding functions
  'pri(staking.submitTuringCancelCompound)': [RequestTuringCancelStakeCompound, BasicTxResponse, BasicTxResponse];
  'pri(staking.turingCancelCompound)': [TuringCancelStakeCompoundParams, BasicTxInfo];
  'pri(staking.checkTuringCompoundTask)': [CheckExistingTuringCompoundParams, ExistingTuringCompoundTask];
  'pri(staking.submitTuringCompound)': [RequestTuringStakeCompound, BasicTxResponse, BasicTxResponse];
  'pri(staking.turingCompound)': [TuringStakeCompoundParams, TuringStakeCompoundResp];
  'pri(staking.delegationInfo)': [StakeDelegationRequest, DelegationItem[]];
  'pri(staking.submitClaimReward)': [RequestStakeClaimReward, BasicTxResponse, BasicTxResponse];
  'pri(staking.claimRewardTxInfo)': [StakeClaimRewardParams, BasicTxInfo];
  'pri(unbonding.submitWithdrawal)': [RequestStakeWithdrawal, BasicTxResponse, BasicTxResponse];
  'pri(unbonding.withdrawalTxInfo)': [StakeWithdrawalParams, BasicTxInfo];
  'pri(unbonding.subscribeUnlockingInfo)': [null, StakeUnlockingJson, StakeUnlockingJson];
  'pri(unbonding.submitTransaction)': [RequestUnbondingSubmit, BasicTxResponse, BasicTxResponse];
  'pri(unbonding.txInfo)': [UnbondingSubmitParams, BasicTxInfo];
  'pri(bonding.txInfo)': [BondingSubmitParams, BasicTxInfo];
  'pri(bonding.submitTransaction)': [RequestBondingSubmit, BasicTxResponse, BasicTxResponse];
  'pri(bonding.getChainBondingBasics)': [NetworkJson[], Record<string, ChainBondingBasics>, Record<string, ChainBondingBasics>];
  'pri(bonding.getBondingOptions)': [BondingOptionParams, BondingOptionInfo];

  // Network, APIs, Custom tokens functions
  'pri(networkMap.recoverDotSama)': [string, boolean];
  'pri(networkMap.disableAll)': [null, boolean];
  'pri(networkMap.enableAll)': [null, boolean];
  'pri(networkMap.resetDefault)': [null, boolean];
  'pri(apiMap.validate)': [ValidateNetworkRequest, ValidateNetworkResponse];
  'pri(networkMap.enableMany)': [string[], boolean];
  'pri(networkMap.disableMany)': [string[], boolean];
  'pri(networkMap.enableOne)': [string, boolean];
  'pri(networkMap.disableOne)': [string, DisableNetworkResponse];
  'pri(networkMap.removeOne)': [string, boolean];
  'pri(networkMap.upsert)': [NetworkJson, boolean];
  'pri(networkMap.getNetworkMap)': [null, Record<string, NetworkJson>];
  'pri(networkMap.getSubscription)': [null, Record<string, NetworkJson>, Record<string, NetworkJson>];
  'pri(customTokenState.validateCustomToken)': [ValidateCustomTokenRequest, ValidateCustomTokenResponse];
  'pri(customTokenState.deleteMany)': [DeleteCustomTokenParams[], boolean];
  'pri(customTokenState.upsertCustomTokenState)': [CustomToken, boolean];
  'pri(customTokenState.getCustomTokenState)': [null, CustomTokenJson];
  'pri(customTokenState.getSubscription)': [null, CustomTokenJson, CustomTokenJson];

  // NFT functions
  'pri(evmNft.submitTransaction)': [RequestEvmNftSubmitTransaction, NftTransactionResponse, NftTransactionResponse];
  'pri(evmNft.getTransaction)': [NftTransactionRequest, EvmNftTransaction];
  'pri(substrateNft.submitTransaction)': [RequestSubstrateNftSubmitTransaction, NftTransactionResponse, NftTransactionResponse];
  'pri(substrateNft.getTransaction)': [NftTransactionRequest, SubstrateNftTransaction];
  'pri(nftTransfer.setNftTransfer)': [NftTransferExtra, boolean];
  'pri(nftTransfer.getNftTransfer)': [null, NftTransferExtra];
  'pri(nftTransfer.getSubscription)': [null, NftTransferExtra, NftTransferExtra];
  'pri(nft.forceUpdate)': [RequestNftForceUpdate, boolean];
  'pri(nft.getNft)': [null, NftJson];
  'pri(nft.getSubscription)': [RequestSubscribeNft, NftJson, NftJson];
  'pri(nftCollection.getNftCollection)': [null, NftCollectionJson];
  'pri(nftCollection.getSubscription)': [null, NftCollection[], NftCollection[]];
  'pri(wasmNft.getTransaction)': [NftTransactionRequest, SubstrateNftTransaction];

  // Staking functions
  'pri(staking.getStaking)': [null, StakingJson];
  'pri(staking.getSubscription)': [RequestSubscribeStaking, StakingJson, StakingJson];
  'pri(stakingReward.getStakingReward)': [null, StakingRewardJson];
  'pri(stakingReward.getSubscription)': [RequestSubscribeStakingReward, StakingRewardJson, StakingRewardJson];

  // Price, balance, crowdloan functions
  'pri(price.getPrice)': [RequestPrice, PriceJson];
  'pri(price.getSubscription)': [RequestSubscribePrice, PriceJson, PriceJson];
  'pri(balance.getBalance)': [RequestBalance, BalanceJson];
  'pri(balance.getSubscription)': [RequestSubscribeBalance, BalanceJson, BalanceJson];
  'pri(crowdloan.getCrowdloan)': [RequestCrowdloan, CrowdloanJson];
  'pri(crowdloan.getSubscription)': [RequestSubscribeCrowdloan, CrowdloanJson, CrowdloanJson];

  // Auth
  'pri(authorize.listV2)': [null, ResponseAuthorizeList];
  'pri(authorize.requestsV2)': [RequestAuthorizeSubscribe, boolean, AuthorizeRequest[]];
  'pri(authorize.approveV2)': [RequestAuthorizeApproveV2, boolean];
  'pri(authorize.changeSiteAll)': [RequestAuthorizationAll, boolean, AuthUrls];
  'pri(authorize.changeSite)': [RequestAuthorization, boolean, AuthUrls];
  'pri(authorize.changeSitePerAccount)': [RequestAuthorizationPerAccount, boolean, AuthUrls];
  'pri(authorize.changeSitePerSite)': [RequestAuthorizationPerSite, boolean];
  'pri(authorize.changeSiteBlock)': [RequestAuthorizationBlock, boolean];
  'pri(authorize.forgetSite)': [RequestForgetSite, boolean, AuthUrls];
  'pri(authorize.forgetAllSite)': [null, boolean, AuthUrls];
  'pri(authorize.rejectV2)': [RequestAuthorizeReject, boolean];
  'pri(authorize.cancelV2)': [RequestAuthorizeCancel, boolean];

  // Account management
  'pri(seed.createV2)': [RequestSeedCreateV2, ResponseSeedCreateV2];
  'pri(seed.validateV2)': [RequestSeedValidateV2, ResponseSeedValidateV2];
  'pri(privateKey.validateV2)': [RequestSeedValidateV2, ResponsePrivateKeyValidateV2];
  'pri(accounts.create.suriV2)': [RequestAccountCreateSuriV2, ResponseAccountCreateSuriV2];
  'pri(accounts.create.externalV2)': [RequestAccountCreateExternalV2, AccountExternalError[]];
  'pri(accounts.create.hardwareV2)': [RequestAccountCreateHardwareV2, boolean];
  'pri(accounts.create.withSecret)': [RequestAccountCreateWithSecretKey, ResponseAccountCreateWithSecretKey];
  'pri(derivation.createV2)': [RequestDeriveCreateV2, boolean];
  'pri(json.restoreV2)': [RequestJsonRestoreV2, void];
  'pri(json.batchRestoreV2)': [RequestBatchRestoreV2, void];
  'pri(accounts.exportPrivateKey)': [RequestAccountExportPrivateKey, ResponseAccountExportPrivateKey];
  'pri(accounts.checkPublicAndSecretKey)': [RequestCheckPublicAndSecretKey, ResponseCheckPublicAndSecretKey];
  'pri(accounts.subscribeWithCurrentAddress)': [RequestAccountSubscribe, boolean, AccountsWithCurrentAddress];
  'pri(accounts.subscribeAccountsInputAddress)': [RequestAccountSubscribe, string, OptionInputAddress];
  'pri(accounts.saveRecent)': [RequestSaveRecentAccount, SingleAddress];
  'pri(accounts.triggerSubscription)': [null, boolean];
  'pri(accounts.get.meta)': [RequestAccountMeta, ResponseAccountMeta];
  'pri(accounts.updateCurrentAddress)': [string, boolean];
  'pri(currentAccount.saveAddress)': [RequestCurrentAccountAddress, boolean, CurrentAccountInfo];

  // Settings
  'pri(settings.changeBalancesVisibility)': [null, boolean, ResponseSettingsType];
  'pri(settings.subscribe)': [null, ResponseSettingsType, ResponseSettingsType];
  'pri(settings.saveAccountAllLogo)': [string, boolean, ResponseSettingsType];
  'pri(settings.saveTheme)': [ThemeTypes, boolean, ResponseSettingsType];

  // Subscription
  'pri(chainRegistry.getSubscription)': [null, Record<string, ChainRegistry>, Record<string, ChainRegistry>];
  'pri(transaction.history.getSubscription)': [null, Record<string, TransactionHistoryItemType[]>, Record<string, TransactionHistoryItemType[]>];
  'pri(transaction.history.add)': [RequestTransactionHistoryAdd, boolean, TransactionHistoryItemType[]];
  'pri(transfer.checkReferenceCount)': [RequestTransferCheckReferenceCount, boolean];
  'pri(transfer.checkSupporting)': [RequestTransferCheckSupporting, SupportTransferResponse];
  'pri(transfer.getExistentialDeposit)': [RequestTransferExistentialDeposit, string];
  'pri(subscription.cancel)': [string, boolean];
  'pri(freeBalance.subscribe)': [RequestFreeBalance, string, string];

  // Transfer
  'pri(accounts.checkTransfer)': [RequestCheckTransfer, ResponseCheckTransfer];
  'pri(accounts.transfer)': [RequestTransfer, BasicTxResponse, BasicTxResponse];

  'pri(accounts.checkCrossChainTransfer)': [RequestCheckCrossChainTransfer, ResponseCheckCrossChainTransfer];
  'pri(accounts.crossChainTransfer)': [RequestCrossChainTransfer, BasicTxResponse, BasicTxResponse];

  // Confirmation Queues
  'pri(confirmations.subscribe)': [RequestConfirmationsSubscribe, ConfirmationsQueue, ConfirmationsQueue];
  'pri(confirmations.complete)': [RequestConfirmationComplete, boolean];

  'pub(utils.getRandom)': [RandomTestRequest, number];
  'pub(accounts.listV2)': [RequestAccountList, InjectedAccount[]];
  'pub(accounts.subscribeV2)': [RequestAccountSubscribe, boolean, InjectedAccount[]];

  // Sign QR
  'pri(account.isLocked)': [RequestAccountIsLocked, ResponseAccountIsLocked];
  'pri(qr.transaction.parse.substrate)': [RequestParseTransactionSubstrate, ResponseParseTransactionSubstrate];
  'pri(qr.transaction.parse.evm)': [RequestQrParseRLP, ResponseQrParseRLP];
  'pri(qr.sign.substrate)': [RequestQrSignSubstrate, ResponseQrSignSubstrate];
  'pri(qr.sign.evm)': [RequestQrSignEVM, ResponseQrSignEVM];

  // External account request
  'pri(account.external.reject)': [RequestRejectExternalRequest, ResponseRejectExternalRequest];
  'pri(account.external.resolve)': [RequestResolveExternalRequest, ResponseResolveExternalRequest];

  // EVM
  'evm(events.subscribe)': [RequestEvmEvents, boolean, EvmEvent];
  'evm(request)': [RequestArguments, unknown];
  'evm(provider.send)': [RequestEvmProviderSend, string | number, ResponseEvmProviderSend]

  // EVM Transaction
  'pri(evm.transaction.parse.input)': [RequestParseEVMContractInput, ResponseParseEVMContractInput];

  // Create qr request
  'pri(accounts.transfer.qr.create)': [RequestTransferExternal, BasicTxResponse, BasicTxResponse];
  'pri(accounts.cross.transfer.qr.create)': [RequestCrossChainTransferExternal, BasicTxResponse, BasicTxResponse];
  'pri(nft.transfer.qr.create.substrate)': [RequestNftTransferExternalSubstrate, NftTransactionResponse, NftTransactionResponse];
  'pri(nft.transfer.qr.create.evm)': [RequestNftTransferExternalEVM, NftTransactionResponse, NftTransactionResponse];
  'pri(stake.qr.create)': [RequestStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(unStake.qr.create)': [RequestUnStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(withdrawStake.qr.create)': [RequestWithdrawStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(claimReward.qr.create)': [RequestClaimRewardExternal, BasicTxResponse, BasicTxResponse];
  'pri(createCompound.qr.create)': [RequestCreateCompoundStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(cancelCompound.qr.create)': [RequestCancelCompoundStakeExternal, BasicTxResponse, BasicTxResponse];

  // Create ledger request
  'pri(accounts.transfer.ledger.create)': [RequestTransferExternal, BasicTxResponse, BasicTxResponse];
  'pri(accounts.cross.transfer.ledger.create)': [RequestCrossChainTransferExternal, BasicTxResponse, BasicTxResponse];
  'pri(nft.transfer.ledger.create.substrate)': [RequestNftTransferExternalSubstrate, NftTransactionResponse, NftTransactionResponse];
  'pri(stake.ledger.create)': [RequestStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(unStake.ledger.create)': [RequestUnStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(withdrawStake.ledger.create)': [RequestWithdrawStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(claimReward.ledger.create)': [RequestClaimRewardExternal, BasicTxResponse, BasicTxResponse];
  'pri(createCompound.ledger.create)': [RequestCreateCompoundStakeExternal, BasicTxResponse, BasicTxResponse];
  'pri(cancelCompound.ledger.create)': [RequestCancelCompoundStakeExternal, BasicTxResponse, BasicTxResponse];

  // Authorize
  'pri(authorize.subscribe)': [null, AuthUrls, AuthUrls];

  // Mobile
  'mobile(ping)': [null, string];
  'mobile(cronAndSubscription.init)': [RequestInitCronAndSubscription, ActiveCronAndSubscriptionMap];
  'mobile(cronAndSubscription.activeService.subscribe)': [null, ActiveCronAndSubscriptionMap, ActiveCronAndSubscriptionMap];
  'mobile(cronAndSubscription.start)': [RequestCronAndSubscriptionAction, void];
  'mobile(cronAndSubscription.stop)': [RequestCronAndSubscriptionAction, void];
  'mobile(cronAndSubscription.restart)': [RequestCronAndSubscriptionAction, void];
  'mobile(cron.start)': [CronServiceType[], void];
  'mobile(cron.stop)': [CronServiceType[], void];
  'mobile(cron.restart)': [CronServiceType[], void];
  'mobile(subscription.start)': [SubscriptionServiceType[], void];
  'mobile(subscription.stop)': [SubscriptionServiceType[], void];
  'mobile(subscription.restart)': [SubscriptionServiceType[], void];
}

export interface ApplicationMetadataType {
  version: string;
}
