// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy/types';
import { BitcoinFeeInfo, BitcoinTransactionStatus, BitcoinTx, UtxoResponseItem } from '@subwallet/extension-base/types';
import EventEmitter from 'eventemitter3';

export interface BitcoinApiStrategy extends Omit<ApiRequestStrategy, 'addRequest'> {
  getBlockTime (): Promise<number>;
  getAddressSummaryInfo (address: string): Promise<BitcoinAddressSummaryInfo>;
  getRunes (address: string): Promise<RunesInfoByAddress[]>;
  // getRuneTxsUtxos (address: string): Promise<RuneTxs[]>; // noted: all rune utxos come in account
  getRuneUtxos (address: string): Promise<RuneUtxo[]>;
  // getAddressBRC20FreeLockedBalance (address: string, ticker: string): Promise<Brc20BalanceItem>;
  getAddressInscriptions (address: string): Promise<Inscription[]>
  getAddressTransaction (address: string, limit?: number): Promise<BitcoinTx[]>;
  getTransactionStatus (txHash: string): Promise<BitcoinTransactionStatus>;
  getTransactionDetail (txHash: string): Promise<BitcoinTx>;
  getFeeRate (): Promise<BitcoinFeeInfo>;
  getRecommendedFeeRate (): Promise<BitcoinFeeInfo>;
  getUtxos (address: string): Promise<UtxoResponseItem[]>;
  getTxHex (txHash: string): Promise<string>;
  sendRawTransaction (rawTransaction: string): EventEmitter<BitcoinTransactionEventMap>;
  simpleSendRawTransaction (rawTransaction: string): Promise<string>;
}

export interface BitcoinTransactionEventMap {
  extrinsicHash: (txHash: string) => void;
  error: (error: string) => void;
  success: (data: BitcoinTransactionStatus) => void;
}

export interface BlockStreamBlock {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}

export interface BlockstreamAddressResponse {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

export interface BitcoinAddressSummaryInfo extends BlockstreamAddressResponse{
  balance: number,
  total_inscription: number,
  balance_rune: string,
  balance_inscription: string,
}

// todo: combine RunesByAddressResponse & RunesCollectionInfoResponse

export interface RunesInfoByAddressResponse {
  statusCode: number,
  data: RunesInfoByAddressFetchedData
}

export interface RunesInfoByAddressFetchedData {
  limit: number,
  offset: number,
  total: number,
  runes: RunesInfoByAddress[]
}

// todo: check is_hot and turbo and cenotaph attributes meaning in RuneInfoByAddress

export interface RunesInfoByAddress {
  amount: string,
  address: string,
  rune_id: string,
  rune: {
    rune: string,
    rune_name: string,
    divisibility: number,
    premine: string,
    spacers: string,
    symbol: string
  }
}

export interface RunesCollectionInfoResponse {
  statusCode: number,
  data: RunesCollectionInfoFetchedData
}

interface RunesCollectionInfoFetchedData {
  limit: number,
  offset: number,
  total: number,
  runes: RunesCollectionInfo[]
}

export interface RunesCollectionInfo {
  rune_id: string,
  rune: string,
  rune_name: string,
  divisibility: string,
  spacers: string
}

export interface RuneTxsResponse {
  statusCode: number,
  data: RuneTxsFetchedData
}

interface RuneTxsFetchedData {
  limit: number,
  offset: number,
  total: number,
  transactions: RuneTxs[]
}

export interface RuneTxs {
  txid: string,
  vout: RuneTxsUtxosVout[]
}

interface RuneTxsUtxosVout {
  n: number,
  value: number,
  runeInject: any
}

export interface Brc20MetadataFetchedData {
  token: Brc20Metadata
}

export interface Brc20Metadata {
  ticker: string,
  decimals: number
}

export interface Brc20BalanceFetchedData {
  limit: number,
  offset: number,
  total: number,
  results: Brc20Balance[]
}

export interface Brc20Balance {
  ticker: string,
  available_balance: string,
  transferrable_balance: string,
  overall_balance: string
}

export interface Brc20BalanceItem {
  free: string,
  locked: string
}

export interface InscriptionFetchedData {
  limit: number,
  offset: number,
  total: number,
  results: Inscription[]
}

export interface Inscription {
  id: string;
  number: number;
  address: string;
  genesis_block_height: number;
  genesis_block_hash: string;
  genesis_timestamp: number;
  tx_id: string;
  location: string;
  output: string;
  value: string;
  offset: string;
  fee: number;
  sat_ordinal: string;
  sat_rarity: string;
  content_type: string;
  content_length: number;
  // content: any
}

export interface UpdateOpenBitUtxo {
  totalUtxo: number,
  utxoItems: BlockStreamUtxo[]
}

export interface BlockStreamUtxo {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash: string;
    block_time?: number;
  },
  value: number;
}

export interface BlockStreamTransactionStatus {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface BlockStreamFeeEstimates {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
}

export interface RecommendedFeeEstimates {
  fastestFee: number,
  halfHourFee: number,
  hourFee: number,
  economyFee: number,
  minimumFee: number
}

export interface BlockStreamTransactionVectorOutput {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface BlockStreamTransactionVectorInput {
  is_coinbase: boolean;
  prevout: BlockStreamTransactionVectorOutput;
  scriptsig: string;
  scriptsig_asm: string;
  sequence: number;
  txid: string;
  vout: number;
  witness: string[];
}

export interface BlockStreamTransactionDetail {
  txid: string;
  version: number;
  locktime: number;
  totalVin: number;
  totalVout: number;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  }
  vin: BlockStreamTransactionVectorInput[];
  vout: BlockStreamTransactionVectorOutput[];
}

export interface RuneUtxoResponse {
  total: number,
  results: RuneUtxo[]
}

export interface RuneUtxo {
  height: number,
  confirmations: number,
  address: string,
  satoshi: number,
  scriptPk: string,
  txid: string,
  vout: number,
  runes: RuneInject[]
}

interface RuneInject {
  rune: string,
  runeid: string,
  spacedRune: string,
  amount: string,
  symbol: string,
  divisibility: number
}

export interface RuneMetadata {
  id: string,
  mintable: boolean,
  parent: string,
  entry: RuneInfo
}

interface RuneInfo {
  block: number,
  burned: string,
  divisibility: number,
  etching: string,
  mints: string,
  number: number,
  premine: string,
  spaced_rune: string,
  symbol: string,
  terms: RuneTerms
  timestamp: string,
  turbo: boolean
}

interface RuneTerms {
  amount: string,
  cap: string,
  height: string[],
  offset: string[]
}
