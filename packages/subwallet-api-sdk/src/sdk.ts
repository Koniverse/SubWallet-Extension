// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetchUnsignedPayload } from '@subwallet/subwallet-api-sdk/cardano';
import { BuildCardanoTxParams } from '@subwallet/subwallet-api-sdk/cardano/utils';
import { BalanceDetectionApi } from '@subwallet/subwallet-api-sdk/modules/balanceDetectionApi';

import { SwapApi } from './modules/swapApi';

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

export class SubWalletApiSdk {
  private baseUrl = '';
  private static _instance: SubWalletApiSdk | undefined = undefined;
  public swapApi: SwapApi | undefined;
  public balanceDetectioApi: BalanceDetectionApi | undefined;

  public init (url: string) {
    this.baseUrl = url;
    this.swapApi = new SwapApi(url);
    this.balanceDetectioApi = new BalanceDetectionApi(url);
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
