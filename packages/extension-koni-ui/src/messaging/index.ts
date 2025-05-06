// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WindowOpenParams } from '@subwallet/extension-base/background/types';

import { CronReloadRequest, CurrentTokenPrice, Notification, PriceChartTimeframe, RequestGetTransaction, RequestParseEvmContractInput, ResponseParseEvmContractInput, ResponseSubscribeCurrentTokenPrice, ResponseSubscribeHistory, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging/base';

export async function ping () {
  return sendMessage('pri(ping)', null);
}

export async function windowOpen (params: WindowOpenParams): Promise<boolean> {
  return sendMessage('pri(window.open)', params);
}

export async function parseEVMTransactionInput (request: RequestParseEvmContractInput): Promise<ResponseParseEvmContractInput> {
  return sendMessage('pri(evm.transaction.parse.input)', request);
}

export async function getTransaction (request: RequestGetTransaction): Promise<SWTransactionResult> {
  return sendMessage('pri(transactions.getOne)', request);
}

export async function subscribeNotifications (callback: (rs: Notification[]) => void): Promise<Notification[]> {
  return sendMessage('pri(notifications.subscribe)', null, callback);
}

export async function reloadCron (request: CronReloadRequest): Promise<boolean> {
  return sendMessage('pri(cron.reload)', request);
}

// Phishing page
export async function passPhishingPage (url: string): Promise<boolean> {
  return sendMessage('pri(phishing.pass)', { url });
}

export async function cancelSubscription (request: string): Promise<boolean> {
  return sendMessage('pri(subscription.cancel)', request);
}

export async function subscribeTransactionHistory (chain: string, address: string, callback: (items: TransactionHistoryItem[]) => void): Promise<ResponseSubscribeHistory> {
  return sendMessage('pri(transaction.history.subscribe)', { address, chain }, callback);
}

export async function getHistoryTokenPrice (priceId: string, timeframe: PriceChartTimeframe) {
  return sendMessage('pri(price.getHistory)', { priceId, timeframe });
}

export async function checkCoinGeckoPriceSupport (priceId: string): Promise<boolean> {
  return sendMessage('pri(price.checkCoinGeckoPriceSupport)', priceId);
}

export async function subscribeCurrentTokenPrice (priceId: string, callback: (item: CurrentTokenPrice) => void): Promise<ResponseSubscribeCurrentTokenPrice> {
  return sendMessage('pri(price.subscribeCurrentTokenPrice)', priceId, callback);
}

export * from './accounts';
export * from './base';
export * from './confirmation';
export * from './keyring';
export * from './manta-pay';
export * from './metadata';
export * from './qr-signer';
export * from './settings';
export * from './transaction';
export * from './WalletConnect';
export * from './database';
