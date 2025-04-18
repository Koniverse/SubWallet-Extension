// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { MetaTransaction, Simple7702Account, UserOperationV8 } from 'abstractionkit';
import { TransactionConfig } from 'web3-core';

export const CANDIDE_BUNDLER_URL = 'https://api.candide.dev/bundler/v3/sepolia/99700fa2b1177145a779792fdeab5cd9';
export const CANDIDE_PAYMASTER_URL = 'https://api.candide.dev/paymaster/v3/sepolia';

export const CANDIDE_CHAIN_SLUG_MAPPING = {
  sepolia_ethereum: 'sepolia',
  arbitrum_sepolia: 'arbitrum-sepolia'
};

export async function convertEVMTransactionConfigToEip7702UserOp (transactionConfig: TransactionConfig, evmApi: _EvmApi, chainInfo: _ChainInfo): Promise<UserOperationV8> {
  if (!transactionConfig.from || !transactionConfig.to || !transactionConfig.value) {
    throw new Error('Invalid transaction config');
  }

  const smartAccount = new Simple7702Account(transactionConfig.from as string);
  const tx: MetaTransaction = {
    to: transactionConfig.to,
    value: BigInt(transactionConfig.value as string),
    data: transactionConfig.data || ''
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return smartAccount.createUserOperation(
    [tx],
    evmApi.apiUrl,
    CANDIDE_BUNDLER_URL,
    {
      eip7702Auth: {
        chainId: BigInt(_getEvmChainId(chainInfo) as number)
      }
    });
}
