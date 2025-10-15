// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType } from '@subwallet/extension-base/types';
import { ProxyAccounts, ProxyItem, ProxyType, RequestGetProxyAccounts } from '@subwallet/extension-base/types/proxy';

import { _SubstrateApi } from '../chain-service/types';
import { typeToProxyMap } from './constant';

type PrimitiveProxyItem = {
  delegate: string;
  proxyType: ProxyType;
  delay: number;
};

export default class ProxyService {
  protected readonly state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  private getSubstrateApi (chain: string): _SubstrateApi {
    return this.state.getSubstrateApi(chain);
  }

  async getProxyAccounts (request: RequestGetProxyAccounts): Promise<ProxyAccounts> {
    const { address, chain, selectedProxyAdress, type } = request;
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    const result = await substrateApi.api.query.proxy.proxies(address);

    const [proxyAccounts, deposit] = result.toPrimitive() as [PrimitiveProxyItem[], string];

    let proxies: ProxyItem[] = (proxyAccounts || []).map((account) => ({
      proxyAddress: account.delegate,
      proxyType: account.proxyType,
      delay: account.delay
    }));

    if (type) {
      const allowedSet = new Set([...(typeToProxyMap[type] || []), 'Any']);

      proxies = proxies.filter((p) => allowedSet.has(p.proxyType));
    }

    if (selectedProxyAdress && selectedProxyAdress.length > 0) {
      proxies = proxies.filter(
        (p) => !selectedProxyAdress.includes(p.proxyAddress)
      );
    }

    return {
      proxies,
      deposit: deposit.toString()
    };
  }

  async addProxyAccounts (chain: string, proxyAddress: string, proxyType: ProxyType) {
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    // Currently we not support delay time
    return substrateApi.api.tx.proxy.addProxy(proxyAddress, proxyType, 0);
  }

  async removeProxyAccounts (chain: string, selectedProxyAccounts: ProxyItem[], isRemoveAll?: boolean) {
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    const api = substrateApi.api;

    if (isRemoveAll) {
      return api.tx.proxy.removeProxies();
    }

    if (!selectedProxyAccounts.length) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    if (selectedProxyAccounts.length === 1) {
      const { delay, proxyAddress, proxyType } = selectedProxyAccounts[0];

      return api.tx.proxy.removeProxy(proxyAddress, proxyType, delay);
    }

    const removeProxies = selectedProxyAccounts.map(({ delay, proxyAddress, proxyType }) =>
      api.tx.proxy.removeProxy(proxyAddress, proxyType, delay)
    );

    return api.tx.utility.batchAll(removeProxies);
  }
}
