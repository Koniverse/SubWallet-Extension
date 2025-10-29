// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import { AddSubstrateProxyAccountParams, RemoveSubstrateProxyAccountParams, RequestGetSubstrateProxyAccountInfo, SubstrateProxyAccountInfo, SubstrateProxyAccountItem, SubstrateProxyType } from '@subwallet/extension-base/types/substrateProxyAccount';
import { reformatAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';

import { _SubstrateApi } from '../chain-service/types';
import { txTypeToSubstrateProxyMap } from './constant';

type PrimitiveSubstrateProxyAccountItem = {
  delegate: string;
  proxyType: SubstrateProxyType; // type of proxy retrieved from on-chain data
  delay: number;
};

export default class SubstrateProxyAccountService {
  protected readonly state: KoniState;

  constructor (state: KoniState) {
    this.state = state;
  }

  private getSubstrateApi (chain: string): _SubstrateApi {
    return this.state.getSubstrateApi(chain);
  }

  async getSubstrateProxyAccountInfo (request: RequestGetSubstrateProxyAccountInfo): Promise<SubstrateProxyAccountInfo> {
    const { address, chain, selectedSubstrateProxyAddresses, type } = request;
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    const result = await substrateApi.api.query.proxy.proxies(address);

    const [substrateProxyAccounts, substrateProxyDeposit] = result.toPrimitive() as [PrimitiveSubstrateProxyAccountItem[], string];

    let substrateProxies: SubstrateProxyAccountItem[] = (substrateProxyAccounts || []).map((account) => {
      const proxyId = this.state.keyringService.context.belongUnifiedAccount(account.delegate) || reformatAddress(account.delegate);

      return {
        substrateProxyAddress: account.delegate,
        substrateProxyType: account.proxyType,
        delay: account.delay,
        proxyId
      };
    });

    if (type) {
      const allowedSet = new Set([...(txTypeToSubstrateProxyMap[type] || []), 'Any']);

      substrateProxies = substrateProxies.filter((p) => allowedSet.has(p.substrateProxyType));
    }

    if (selectedSubstrateProxyAddresses && selectedSubstrateProxyAddresses.length > 0) {
      substrateProxies = substrateProxies.filter(
        (p) => !selectedSubstrateProxyAddresses.includes(p.substrateProxyAddress)
      );
    }

    const baseDeposit = substrateApi.api.consts.proxy.proxyDepositBase?.toString() || '0';

    return {
      substrateProxies,
      substrateProxyDeposit: new BigN(substrateProxyDeposit).gt(0) ? substrateProxyDeposit.toString() : baseDeposit
    };
  }

  async addSubstrateProxyAccounts (data: AddSubstrateProxyAccountParams): Promise<TransactionData> {
    const { address, chain, substrateProxyAddress, substrateProxyType } = data;

    if (address === substrateProxyAddress) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    // Currently we not support delay time
    return substrateApi.api.tx.proxy.addProxy(substrateProxyAddress, substrateProxyType, 0);
  }

  public async validateAddSubstrateProxyAccount (params: AddSubstrateProxyAccountParams): Promise<TransactionError[]> {
    const { address, chain, substrateProxyDeposit } = params;

    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;
    const transferableBalance = await this.state.balanceService.getTransferableBalance(address, chain);
    const bnTransferableBalance = new BigN(transferableBalance.value);

    const feeInfo = await substrateApi.api.tx.proxy
      .addProxy(params.substrateProxyAddress, params.substrateProxyType, 0)
      .paymentInfo(address);

    const estimatedFee = new BigN(feeInfo?.partialFee?.toString() || '0');
    const factorDeposit = substrateApi.api.consts.proxy.proxyDepositFactor?.toString() || '0';

    const totalRequired = new BigN(substrateProxyDeposit).plus(estimatedFee).plus(factorDeposit);

    const errors: TransactionError[] = [];

    if (bnTransferableBalance.lt(totalRequired)) {
      errors.push(new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE));
    }

    return errors;
  }

  async removeSubstrateProxyAccounts (data: RemoveSubstrateProxyAccountParams): Promise<TransactionData> {
    const { chain, isRemoveAll, selectedSubstrateProxyAccounts } = data;

    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    const api = substrateApi.api;

    if (isRemoveAll) {
      return api.tx.proxy.removeProxies();
    }

    if (!selectedSubstrateProxyAccounts.length) {
      return Promise.reject(new TransactionError(BasicTxErrorType.INVALID_PARAMS));
    }

    if (selectedSubstrateProxyAccounts.length === 1) {
      const { delay, substrateProxyAddress, substrateProxyType } = selectedSubstrateProxyAccounts[0];

      return api.tx.proxy.removeProxy(substrateProxyAddress, substrateProxyType, delay);
    }

    const removeProxies = selectedSubstrateProxyAccounts.map(({ delay, substrateProxyAddress, substrateProxyType }) =>
      api.tx.proxy.removeProxy(substrateProxyAddress, substrateProxyType, delay)
    );

    return api.tx.utility.batchAll(removeProxies);
  }
}
