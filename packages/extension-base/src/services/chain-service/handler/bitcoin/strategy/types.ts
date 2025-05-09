// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { BitcoinAddressSummaryInfo } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/BlockStream/types';
import { ApiRequestStrategy } from '@subwallet/extension-base/strategy/api-request-strategy/types';
import { BitcoinFeeInfo, BitcoinTransactionStatus, BitcoinTx, UtxoResponseItem } from '@subwallet/extension-base/types';
import EventEmitter from 'eventemitter3';

export interface BitcoinApiStrategy extends Omit<ApiRequestStrategy, 'addRequest'> {
  getBlockTime (): Promise<number>;
  getAddressSummaryInfo (address: string): Promise<BitcoinAddressSummaryInfo>;
  // getRunes (address: string): Promise<RunesInfoByAddress[]>;
  // getRuneTxsUtxos (address: string): Promise<RuneTxs[]>; // noted: all rune utxos come in account
  // getRuneUtxos (address: string): Promise<RuneUtxo[]>;
  // getAddressBRC20FreeLockedBalance (address: string, ticker: string): Promise<Brc20BalanceItem>;
  // getAddressInscriptions (address: string): Promise<Inscription[]>
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
