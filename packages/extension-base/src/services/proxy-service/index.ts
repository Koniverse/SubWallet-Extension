// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import { AddProxyParams, ProxyAccounts, ProxyItem, ProxyType, RemoveProxyParams, RequestGetProxyAccounts } from '@subwallet/extension-base/types/proxy';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

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

  async getProxyAccounts (request: RequestGetProxyAccounts): Promise<ProxyAccounts> {
    const { address, chain, selectedProxyAddress, type } = request;
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    const result = await substrateApi.api.query.proxy.proxies(address);

    const [proxyAccounts, proxyDeposit] = result.toPrimitive() as [PrimitiveProxyItem[], string];

    let proxies: ProxyItem[] = (proxyAccounts || []).map((account) => {
      const proxyId = this.state.keyringService.context.belongUnifiedAccount(account.delegate) || reformatAddress(account.delegate);

      return {
        proxyAddress: account.delegate,
        proxyType: account.proxyType,
        delay: account.delay,
        proxyId
      };
    });

    if (type) {
      const allowedSet = new Set([...(typeToProxyMap[type] || []), 'Any']);

      proxies = proxies.filter((p) => allowedSet.has(p.proxyType));
    }

    if (selectedProxyAddress && selectedProxyAddress.length > 0) {
      proxies = proxies.filter(
        (p) => !selectedProxyAddress.includes(p.proxyAddress)
      );
    }

    const baseDeposit = substrateApi.api.consts.proxy.proxyDepositBase?.toString() || '0';

    return {
      proxies,
      proxyDeposit: new BigN(proxyDeposit).gt(0) ? proxyDeposit.toString() : baseDeposit
    };
  }

  async addProxyAccounts (data: AddProxyParams): Promise<TransactionData> {
    const { address, chain, proxyAddress, proxyType } = data;

    if (address === proxyAddress) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    // Currently we not support delay time
    return substrateApi.api.tx.proxy.addProxy(proxyAddress, proxyType, 0);
  }

  public async validateAddProxy (params: AddProxyParams): Promise<TransactionError[]> {
    const { address, chain, proxyDeposit } = params;

    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;
    const transferableBalance = await this.state.balanceService.getTransferableBalance(address, chain);
    const bnTransferableBalance = new BigN(transferableBalance.value);

    const feeInfo = await substrateApi.api.tx.proxy
      .addProxy(params.proxyAddress, params.proxyType, 0)
      .paymentInfo(address);

    const estimatedFee = new BigN(feeInfo?.partialFee?.toString() || '0');
    const factorDeposit = substrateApi.api.consts.proxy.proxyDepositFactor?.toString() || '0';

    const totalRequired = new BigN(proxyDeposit).plus(estimatedFee).plus(factorDeposit);

    const errors: TransactionError[] = [];

    if (bnTransferableBalance.lt(totalRequired)) {
      errors.push(new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE));
    }

    return errors;
  }

  async removeProxyAccounts (data: RemoveProxyParams): Promise<TransactionData> {
    const { chain, isRemoveAll, selectedProxyAccounts } = data;

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

  private getSubstrateApi (chain: string): _SubstrateApi {
    return this.state.getSubstrateApi(chain);
  }
}
