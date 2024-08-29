// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { TON_API_ENDPOINT, TON_CENTER_API_KEY, TON_OPCODES } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/consts';
import { TxByMsgResponse } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/types';
import { getJettonTxStatus, retry } from '@subwallet/extension-base/services/balance-service/helpers/subscribe/ton/utils';
import { _ApiOptions } from '@subwallet/extension-base/services/chain-service/handler/types';
import { _ChainConnectionStatus, _TonApi } from '@subwallet/extension-base/services/chain-service/types';
import { createPromiseHandler, PromiseHandler } from '@subwallet/extension-base/utils';
import { Cell } from '@ton/core';
import { Address, Contract, OpenedContract, TonClient } from '@ton/ton';
import { BehaviorSubject } from 'rxjs';

export class TonApi implements _TonApi {
  chainSlug: string;
  private api: TonClient;
  private httpEndPoint: string;
  apiUrl: string;
  apiError?: string;
  apiRetry = 0;
  public readonly isApiConnectedSubject = new BehaviorSubject(false);
  public readonly connectionStatusSubject = new BehaviorSubject(_ChainConnectionStatus.DISCONNECTED);
  isApiReady = false;
  isApiReadyOnce = false;
  isReadyHandler: PromiseHandler<_TonApi>;

  providerName: string;

  constructor (chainSlug: string, apiUrl: string, { providerName }: _ApiOptions) {
    this.chainSlug = chainSlug;
    this.apiUrl = apiUrl;
    this.httpEndPoint = apiUrl.includes(TON_API_ENDPOINT.TESTNET) ? TON_API_ENDPOINT.TESTNET : TON_API_ENDPOINT.MAINNET;
    this.providerName = providerName || 'unknown';
    this.api = this.createProvider(apiUrl);
    this.isReadyHandler = createPromiseHandler<_TonApi>();

    this.connect();
  }

  get isApiConnected (): boolean {
    return this.isApiConnectedSubject.getValue();
  }

  get connectionStatus (): _ChainConnectionStatus {
    return this.connectionStatusSubject.getValue();
  }

  private updateConnectionStatus (status: _ChainConnectionStatus): void {
    const isConnected = status === _ChainConnectionStatus.CONNECTED;

    if (isConnected !== this.isApiConnectedSubject.value) {
      this.isApiConnectedSubject.next(isConnected);
    }

    if (status !== this.connectionStatusSubject.value) {
      this.connectionStatusSubject.next(status);
    }
  }

  get isReady (): Promise<_TonApi> {
    return this.isReadyHandler.promise;
  }

  async updateApiUrl (apiUrl: string) {
    if (this.apiUrl === apiUrl) {
      return;
    }

    await this.disconnect();

    // Create new provider and api
    this.apiUrl = apiUrl;
    this.api = new TonClient({
      endpoint: this.apiUrl,
      apiKey: TON_CENTER_API_KEY
    });
  }

  async recoverConnect () {
    await this.disconnect();
    this.connect();

    await this.isReadyHandler.promise;
  }

  private createProvider (apiUrl: string) {
    return new TonClient({
      endpoint: apiUrl,
      apiKey: TON_CENTER_API_KEY
    });
  }

  connect (): void {
    this.updateConnectionStatus(_ChainConnectionStatus.CONNECTING);
    // There isn't a persistent network connection underlying TonClient. Cant check connection status.
    // this.isApiReadyOnce = true;
    this.onConnect();
  }

  async disconnect () {
    this.onDisconnect();
    this.updateConnectionStatus(_ChainConnectionStatus.DISCONNECTED);

    return Promise.resolve();
  }

  destroy () {
    // Todo: implement this in the future
    return this.disconnect();
  }

  onConnect (): void {
    if (!this.isApiConnected) {
      console.log(`Connected to ${this.chainSlug} at ${this.apiUrl}`);
      this.isApiReady = true;

      if (this.isApiReadyOnce) {
        this.isReadyHandler.resolve(this);
      }
    }

    this.updateConnectionStatus(_ChainConnectionStatus.CONNECTED);
  }

  onDisconnect (): void {
    this.updateConnectionStatus(_ChainConnectionStatus.DISCONNECTED);

    if (this.isApiConnected) {
      console.warn(`Disconnected from ${this.chainSlug} of ${this.apiUrl}`);
      this.isApiReady = false;
      this.isReadyHandler = createPromiseHandler<_TonApi>();
    }
  }

  // Util functions

  async getBalance (address: Address): Promise<bigint> {
    return await this.api.getBalance(address);
  }

  open<T extends Contract> (src: T): OpenedContract<T> {
    return this.api.open(src);
  }

  estimateExternalMessageFee (address: Address, body: Cell, ignoreSignature?: boolean, initCode?: Cell, initData?: Cell) {
    return this.api.estimateExternalMessageFee( // recheck
      address,
      {
        body: body,
        ignoreSignature: ignoreSignature || true,
        initCode: initCode || null,
        initData: initData || null
      }
    );
  }

  async sendTonTransaction (boc: string): Promise<string> {
    const url = `${this.httpEndPoint}/v2/sendBocReturnHash`;
    const resp = await fetch(
      url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': TON_CENTER_API_KEY
        },
        body: JSON.stringify({
          boc: boc
        })
      }
    );

    const extMsgInfo = await resp.json() as {result: { hash: string}};

    return extMsgInfo.result.hash;
  }

  async getTxByInMsg (extMsgHash: string): Promise<TxByMsgResponse> {
    const url = `${this.httpEndPoint}/v3/transactionsByMessage?msg_hash=${encodeURIComponent(extMsgHash)}&direction=in`;
    const resp = await fetch(
      url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': TON_CENTER_API_KEY
        }
      }
    );

    return await resp.json() as TxByMsgResponse;
  }

  async getStatusByExtMsgHash (extMsgHash: string, extrinsicType?: ExtrinsicType): Promise<[boolean, string]> {
    return retry<[boolean, string]>(async () => { // retry many times to get transaction status and transaction hex
      const externalTxInfoRaw = await this.getTxByInMsg(extMsgHash);
      const externalTxInfo = externalTxInfoRaw.transactions[0];
      const isExternalTxCompute = externalTxInfo.description.compute_ph.success;
      const isExternalTxAction = externalTxInfo.description.action.success;
      const base64Hex = externalTxInfo.hash;
      const hex = '0x'.concat(Buffer.from(base64Hex, 'base64').toString('hex'));

      if (!(isExternalTxCompute && isExternalTxAction)) {
        return [false, hex];
      }

      if (extrinsicType === ExtrinsicType.TRANSFER_BALANCE) {
        return [true, hex];
      }

      // get out msg info from tx
      const internalMsgHash = externalTxInfo.out_msgs[0]?.hash;
      const opcode = parseInt(externalTxInfo.out_msgs[0]?.opcode || '0');

      if (internalMsgHash) { // notice to update opcode check when supporting more transaction type in ton blockchain
        const status = opcode === TON_OPCODES.JETTON_TRANSFER
          ? await getJettonTxStatus(this, internalMsgHash)
          : false;

        return [status, hex];
      }

      throw new Error('Transaction not found');
    }, { retries: 10, delay: 5000 });
  }
}