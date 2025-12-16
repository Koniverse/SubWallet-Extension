// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { BasicTxErrorType, TransactionData } from '@subwallet/extension-base/types';
import { AddSubstrateProxyAccountParams, RemoveSubstrateProxyAccountParams, RequestGetSubstrateProxyAccountGroup, SubstrateProxyAccountGroup, SubstrateProxyAccountItem, SubstrateProxyType } from '@subwallet/extension-base/types/substrateProxyAccount';
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

  // Get proxied accounts for a main account
  // Get when view details or perform transaction
  async getSubstrateProxyAccountGroup (request: RequestGetSubstrateProxyAccountGroup): Promise<SubstrateProxyAccountGroup> {
    const { address, chain, excludedSubstrateProxyAccounts, type } = request;
    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    // Get proxied accounts from on-chain data
    const result = await substrateApi.api.query.proxy.proxies(address);
    const baseDeposit = substrateApi.api.consts.proxy.proxyDepositBase?.toString() || '0';
    const factorDeposit = substrateApi.api.consts.proxy.proxyDepositFactor?.toString() || '0';
    const deposit = new BigN(baseDeposit).plus(factorDeposit);

    const [substrateProxyAccounts_, currentSubstrateProxyDeposit] = result.toPrimitive() as [PrimitiveSubstrateProxyAccountItem[], string];

    // Mapping on-chain data to our defined type
    let substrateProxyAccounts: SubstrateProxyAccountItem[] = (substrateProxyAccounts_ || []).map((account) => {
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

      substrateProxyAccounts = substrateProxyAccounts.filter((p) => allowedSet.has(p.substrateProxyType));
    }

    if (excludedSubstrateProxyAccounts && excludedSubstrateProxyAccounts.length > 0) {
      substrateProxyAccounts = substrateProxyAccounts.filter((p) => {
        return !excludedSubstrateProxyAccounts.some(
          (excluded) => excluded.address === p.substrateProxyAddress && excluded.substrateProxyType === p.substrateProxyType
        );
      });
    }

    const estimateSubstrateProxyDeposit = new BigN(currentSubstrateProxyDeposit).plus(factorDeposit);

    return {
      substrateProxyAccounts,
      substrateProxyDeposit: new BigN(currentSubstrateProxyDeposit).gt(0) ? estimateSubstrateProxyDeposit.toFixed() : deposit.toFixed()
    };
  }

  // Linking proxy account with main account
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

  // Validate adding proxy account
  public async validateAddSubstrateProxyAccount (params: AddSubstrateProxyAccountParams): Promise<TransactionError[]> {
    const { address, chain, substrateProxyDeposit } = params;

    const substrateApi = this.getSubstrateApi(chain);

    await substrateApi.isReady;

    if (!substrateApi.api.tx.proxy || !substrateApi.api.tx.proxy.addProxy) {
      return [new TransactionError(BasicTxErrorType.UNSUPPORTED)];
    }

    // Validate max proxies accounts limit
    const maxSubstrateProxies = substrateApi.api.consts.proxy.maxProxies?.toNumber?.() || 0;

    const currentProxiesRaw = await substrateApi.api.query.proxy.proxies(address);
    const [proxyList] = currentProxiesRaw.toPrimitive() as [PrimitiveSubstrateProxyAccountItem[], string];

    if (proxyList.length >= maxSubstrateProxies) {
      return [new TransactionError(BasicTxErrorType.INVALID_PARAMS, `Maximum number of proxies reached: ${maxSubstrateProxies}`)];
    }

    // Ensure enough balance for deposit + fee
    const transferableBalance = await this.state.balanceService.getTransferableBalance(address, chain);
    const bnTransferableBalance = new BigN(transferableBalance.value);

    const feeInfo = await substrateApi.api.tx.proxy
      .addProxy(params.substrateProxyAddress, params.substrateProxyType, 0)
      .paymentInfo(address);

    const estimatedFee = new BigN(feeInfo.partialFee.toString());

    const totalRequired = new BigN(substrateProxyDeposit).plus(estimatedFee);

    if (bnTransferableBalance.lt(totalRequired)) {
      return [new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE)];
    }

    return [];
  }

  // Removing linked proxy accounts from main account
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
