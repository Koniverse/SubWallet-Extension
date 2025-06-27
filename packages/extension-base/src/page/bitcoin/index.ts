// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BitcoinProviderError } from '@subwallet/extension-base/background/errors/BitcoinProviderError';
import { BitcoinDAppAddress, BitcoinSendTransactionParams, BitcoinSendTransactionResult, BitcoinSignMessageParams, BitcoinSignMessageResult, BitcoinSignPsbtParams, BitcoinSignPsbtResult } from '@subwallet/extension-base/background/KoniTypes';
import { SendRequest } from '@subwallet/extension-base/page/types';
import { BitcoinProvider } from '@subwallet/extension-inject/types';

const WALLET_NAME = 'SubWallet';
const WALLET_VERSION = process.env.PKG_VERSION as string;

export default class SubWalletBitcoinProvider {
  readonly name: string = WALLET_NAME;
  readonly version: string = WALLET_VERSION;
  protected sendMessage: SendRequest;
  private isSubWallet = true;

  constructor (sendMessage: SendRequest) {
    this.sendMessage = sendMessage;
  }

  private async requestAccounts (): Promise<BitcoinDAppAddress[]> {
    return await this.request<BitcoinDAppAddress[]>('getAccounts');
  }

  private async getAccounts (): Promise<BitcoinDAppAddress[]> {
    return await this.request<BitcoinDAppAddress[]>('getAccounts');
  }

  private async signMessage (params: BitcoinSignMessageParams): Promise<BitcoinSignMessageResult> {
    return await this.request<BitcoinSignMessageResult>('signMessage', params);
  }

  private async signPsbt (params: BitcoinSignPsbtParams): Promise<BitcoinSignPsbtResult> {
    return await this.request<BitcoinSignPsbtResult>('signPsbt', params);
  }

  private async sendTransfer (params: BitcoinSendTransactionParams): Promise<BitcoinSendTransactionResult> {
    return await this.request<BitcoinSendTransactionResult>('sendTransfer', params);
  }

  private request<T> (method: string, params?: any): Promise<T> {
    // Implement this method
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.sendMessage('bitcoin(request)', { method, params })
        .then((result) => {
          resolve(result as T);
        })
        .catch((e: BitcoinProviderError) => {
          reject(e);
        });
    });
  }

  private getProductInfo (): { name: string; version: string } {
    return {
      name: this.name,
      version: this.version
    };
  }

  get apis (): BitcoinProvider {
    return {
      isSubWallet: this.isSubWallet,
      request: <T>(method: string, params?: any) => this.request<T>(method, params),
      getAccounts: () => this.getAccounts(),
      signMessage: (params: BitcoinSignMessageParams) => this.signMessage(params),
      signPsbt: (params: BitcoinSignPsbtParams) => this.signPsbt(params),
      sendTransfer: (params: BitcoinSendTransactionParams) => this.sendTransfer(params),
      requestAccounts: () => this.requestAccounts(),
      getProductInfo: () => this.getProductInfo()
    };
  }
}
