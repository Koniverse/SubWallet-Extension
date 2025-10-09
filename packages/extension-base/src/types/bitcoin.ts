// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

// https://github.com/leather-wallet/extension/blob/dev/src/app/query/bitcoin/bitcoin-client.ts
export interface UtxoResponseItem {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
}

// https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/coinselect/local-coin-selection.ts
export interface DetermineUtxosForSpendArgs {
  sender: string;
  amount: number;
  feeRate: number;
  recipient: string;
  utxos: UtxoResponseItem[];
}

interface DetermineUtxosOutput {
  value: number;
  address?: string;
}

export interface DetermineUtxosForSpendResult {
  filteredUtxos: UtxoResponseItem[];
  inputs: UtxoResponseItem[];
  outputs: DetermineUtxosOutput[],
  size: number;
  fee: number;
}

// https://github.com/leather-wallet/extension/blob/dev/src/app/common/transactions/bitcoin/coinselect/local-coin-selection.ts
export class InsufficientFundsError extends Error {
  constructor () {
    super('Insufficient funds');
  }
}
// Source: https://github.com/Blockstream/esplora/blob/master/API.md#transaction-format
// ---------------
interface BitcoinTransactionIssuance {
  asset_id: string;
  is_reissuance: boolean;
  asset_blinding_nonce: number;
  asset_entropy: number;
  contract_hash: string;
  assetamount?: number;
  assetamountcommitment?: number;
  tokenamount?: number;
  tokenamountcommitment?: number;
}

interface BitcoinTransactionPegOut {
  genesis_hash: string;
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_address: string;
}

export interface BitcoinTransactionStatus {
  confirmed: boolean;
  block_height?: number | null;
  block_hash?: string | null;
  block_time?: number | null;
}

export interface BitcoinTransactionVectorOutput {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
  valuecommitment?: number;
  asset?: string;
  assetcommitment?: number;
  pegout?: BitcoinTransactionPegOut | null;
}

export interface BitcoinTransactionVectorInput {
  inner_redeemscript_asm?: string;
  inner_witnessscript_asm?: string;
  is_coinbase: boolean;
  is_pegin?: boolean;
  issuance?: BitcoinTransactionIssuance | null;
  prevout: BitcoinTransactionVectorOutput;
  scriptsig: string;
  scriptsig_asm: string;
  sequence: number;
  txid: string;
  vout: number;
  witness: string[];
}

export interface BitcoinTx {
  fee: number;
  locktime: number;
  size: number;
  status: BitcoinTransactionStatus;
  tx_type?: string;
  txid: string;
  version: number;
  vin: BitcoinTransactionVectorInput[];
  vout: BitcoinTransactionVectorOutput[];
  weight: number;
}
// ---------------
