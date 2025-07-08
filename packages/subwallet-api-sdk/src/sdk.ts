// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetchUnsignedPayload } from '@subwallet/subwallet-api-sdk/cardano';
import { BuildCardanoTxParams } from '@subwallet/subwallet-api-sdk/cardano/utils';
import { BalanceDetectionApi } from '@subwallet/subwallet-api-sdk/modules/balanceDetectionApi';
import { PriceHistoryApi } from '@subwallet/subwallet-api-sdk/modules/priceHistoryApi';

import { SwapApi } from './modules/swapApi';
import { XcmApi } from './modules/xcmApi';

export interface CardanoTransactionConfigProps {
  cardanoId: string;
  from: string;
  to: string;
  value: string;
  cardanoTtlOffset: number | null;
}

// TODO: NEED TO UPDATE THIS INTERFACE
export interface SubWalletResponse<T> {
  statusCode: number, // todo: better to use a flag status than status code
  result: T,
  message: string
}

export interface SubWalletApiInitRequest {
  url: string;
  priceHistoryUrl: string;
  headers: Record<string, string>;
}

export class SubWalletApiSdk {
  private baseUrl = '';
  private static _instance: SubWalletApiSdk | undefined = undefined;
  public swapApi: SwapApi | undefined;
  public xcmApi: XcmApi | undefined;
  public balanceDetectionApi: BalanceDetectionApi | undefined;
  public priceHistoryApi: PriceHistoryApi | undefined;

  public init ({ headers, priceHistoryUrl, url }: SubWalletApiInitRequest) {
    this.baseUrl = url;
    this.swapApi = new SwapApi(url, headers);
    this.xcmApi = new XcmApi(url, headers);
    this.balanceDetectionApi = new BalanceDetectionApi(url, headers);
    this.priceHistoryApi = new PriceHistoryApi(priceHistoryUrl, headers);
  }

  async fetchUnsignedPayload (params: BuildCardanoTxParams): Promise<string> {
    const url = `${this.baseUrl}/cardano/build-cardano-tx?`;

    return fetchUnsignedPayload(url, params);
  }

  static instance () {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new SubWalletApiSdk();

    return this._instance;
  }
}
