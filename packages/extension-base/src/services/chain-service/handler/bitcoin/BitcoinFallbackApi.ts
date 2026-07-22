// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BitcoinAddressSummaryInfo, BitcoinApiStrategy, BitcoinTransactionEventMap, Inscription, RuneUtxo } from '@subwallet/extension-base/services/chain-service/handler/bitcoin/strategy/types';
import { ApiRequestContext } from '@subwallet/extension-base/strategy/api-request-strategy/types';
import { BitcoinFeeInfo, BitcoinTransactionStatus, BitcoinTx, UtxoResponseItem } from '@subwallet/extension-base/types';
import EventEmitter from 'eventemitter3';

export class BitcoinApiWithFallback implements BitcoinApiStrategy {
  private readonly primary: BitcoinApiStrategy;
  private readonly fallback: BitcoinApiStrategy;

  constructor (primary: BitcoinApiStrategy, fallback: BitcoinApiStrategy) {
    this.primary = primary;
    this.fallback = fallback;
  }

  private async call<T> (method: string, primaryCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
    try {
      return await primaryCall();
    } catch (error) {
      console.warn(`Bitcoin ${method} failed on primary API, fallback to mempool`, error);

      return fallbackCall();
    }
  }

  private pipeTransactionEmitter (source: EventEmitter<BitcoinTransactionEventMap>, target: EventEmitter<BitcoinTransactionEventMap>, onError?: (error: string) => void) {
    source.on('extrinsicHash', (txHash) => target.emit('extrinsicHash', txHash));
    source.on('success', (data) => target.emit('success', data));
    source.on('error', (error) => {
      if (onError) {
        onError(error);
      } else {
        target.emit('error', error);
      }
    });
  }

  setContext (context: ApiRequestContext): void {
    this.primary.setContext(context);
    this.fallback.setContext(context);
  }

  stop (): void {
    this.primary.stop();
    this.fallback.stop();
  }

  getBlockTime (): Promise<number> {
    return this.call('getBlockTime', () => this.primary.getBlockTime(), () => this.fallback.getBlockTime());
  }

  computeBlockTime (): Promise<number> {
    return this.call('computeBlockTime', () => this.primary.computeBlockTime(), () => this.fallback.computeBlockTime());
  }

  getAddressSummaryInfo (address: string): Promise<BitcoinAddressSummaryInfo> {
    return this.call('getAddressSummaryInfo', () => this.primary.getAddressSummaryInfo(address), () => this.fallback.getAddressSummaryInfo(address));
  }

  getRuneUtxos (address: string): Promise<RuneUtxo[]> {
    return this.call('getRuneUtxos', () => this.primary.getRuneUtxos(address), () => this.fallback.getRuneUtxos(address));
  }

  getAddressInscriptions (address: string): Promise<Inscription[]> {
    return this.call('getAddressInscriptions', () => this.primary.getAddressInscriptions(address), () => this.fallback.getAddressInscriptions(address));
  }

  getAddressTransaction (address: string, limit?: number): Promise<BitcoinTx[]> {
    return this.call('getAddressTransaction', () => this.primary.getAddressTransaction(address, limit), () => this.fallback.getAddressTransaction(address, limit));
  }

  getTransactionStatus (txHash: string): Promise<BitcoinTransactionStatus> {
    return this.call('getTransactionStatus', () => this.primary.getTransactionStatus(txHash), () => this.fallback.getTransactionStatus(txHash));
  }

  getTransactionDetail (txHash: string): Promise<BitcoinTx> {
    return this.call('getTransactionDetail', () => this.primary.getTransactionDetail(txHash), () => this.fallback.getTransactionDetail(txHash));
  }

  getFeeRate (): Promise<BitcoinFeeInfo> {
    return this.call('getFeeRate', () => this.primary.getFeeRate(), () => this.fallback.getFeeRate());
  }

  getRecommendedFeeRate (): Promise<BitcoinFeeInfo> {
    return this.call('getRecommendedFeeRate', () => this.primary.getRecommendedFeeRate(), () => this.fallback.getRecommendedFeeRate());
  }

  getUtxos (address: string): Promise<UtxoResponseItem[]> {
    return this.call('getUtxos', () => this.primary.getUtxos(address), () => this.fallback.getUtxos(address));
  }

  getTxHex (txHash: string): Promise<string> {
    return this.call('getTxHex', () => this.primary.getTxHex(txHash), () => this.fallback.getTxHex(txHash));
  }

  sendRawTransaction (rawTransaction: string): EventEmitter<BitcoinTransactionEventMap> {
    const eventEmitter = new EventEmitter<BitcoinTransactionEventMap>();
    const primaryEmitter = this.primary.sendRawTransaction(rawTransaction);

    this.pipeTransactionEmitter(primaryEmitter, eventEmitter, (error) => {
      console.warn('Bitcoin sendRawTransaction failed on primary API, fallback to mempool', error);
      const fallbackEmitter = this.fallback.sendRawTransaction(rawTransaction);

      this.pipeTransactionEmitter(fallbackEmitter, eventEmitter);
    });

    return eventEmitter;
  }

  simpleSendRawTransaction (rawTransaction: string): Promise<string> {
    return this.call('simpleSendRawTransaction', () => this.primary.simpleSendRawTransaction(rawTransaction), () => this.fallback.simpleSendRawTransaction(rawTransaction));
  }
}
