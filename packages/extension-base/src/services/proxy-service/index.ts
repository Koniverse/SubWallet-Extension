// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { ProxyAccounts, ProxyItem, RequestGetProxyAccounts } from '@subwallet/extension-base/types/proxy';

import { _SubstrateApi } from '../chain-service/types';

type PrimitiveProxyItem = {
  delegate: string;
  proxyType: string;
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
    const { address, chain } = request;
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    const result = await substrateApi.api.query.proxy.proxies(address);

    const [entries, deposit] = result.toPrimitive() as [PrimitiveProxyItem[], string];

    const proxies: ProxyItem[] = (entries || []).map((entry) => ({
      proxyAddress: entry.delegate,
      proxyType: entry.proxyType
    }));

    return {
      proxies,
      deposit: deposit.toString()
    };
  }

  //   async calculateProxyDeposit (chain: string, currentCount = 0) {
  //     const api = await this.getApi(chain);
  //     const base = api.consts.proxy.proxyDepositBase.toBn();
  //     const factor = api.consts.proxy.proxyDepositFactor.toBn();

  //     return base.add(factor.muln(currentCount));
  //   }

  //   async createAddProxyExtrinsic (chain: string, delegate: string, proxyType: string, delay: number) {
  //     const api = await this.getApi(chain);

  //     return api.tx.proxy.addProxy(delegate, proxyType, delay);
  //   }

  //   async createRemoveProxyExtrinsic (chain: string, delegate: string, proxyType: string, delay: number) {
  //     const api = await this.getApi(chain);

//     return api.tx.proxy.removeProxy(delegate, proxyType, delay);
//   }
}
