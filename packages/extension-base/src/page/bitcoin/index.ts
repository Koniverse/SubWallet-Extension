// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BitcoinProviderError } from '@subwallet/extension-base/background/errors/BitcoinProviderError';
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

  private getURL (): string {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private authenticationRequest (payload: string): Promise<any> {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private signatureRequest (payload: string): Promise<any> {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private structuredDataSignatureRequest (payload: string): Promise<any> {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private transactionRequest (payload: string): Promise<any> {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private psbtRequest (payload: string): Promise<any> {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private profileUpdateRequest (payload: string): Promise<any> {
    // Implement this method
    throw new Error('Method not implemented.');
  }

  private request (method: string, params?: any[] | undefined): Promise<Record<string, any>> {
    // Implement this method
    return new Promise((resolve, reject) => {
      this.sendMessage('bitcoin(request)', { method, params })
        .then((result) => {
          resolve(result as Record<string, any>);
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
      getURL: () => this.getURL(),
      authenticationRequest: (payload: string) => this.authenticationRequest(payload),
      signatureRequest: (payload: string) => this.signatureRequest(payload),
      structuredDataSignatureRequest: (payload: string) => this.structuredDataSignatureRequest(payload),
      transactionRequest: (payload: string) => this.transactionRequest(payload),
      psbtRequest: (payload: string) => this.psbtRequest(payload),
      profileUpdateRequest: (payload: string) => this.profileUpdateRequest(payload),
      request: (method: string, params?: any[]) => this.request(method, params),
      getProductInfo: () => this.getProductInfo()
    };
  }
}
