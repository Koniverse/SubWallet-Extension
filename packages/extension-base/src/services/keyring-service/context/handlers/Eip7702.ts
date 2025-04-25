// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { CandidePaymaster, MetaTransaction, Simple7702Account, UserOperationV8 } from 'abstractionkit';
import { TransactionConfig } from 'web3-core';

export const CANDIDE_BUNDLER_URL = 'https://api.candide.dev/bundler/v3/sepolia/99700fa2b1177145a779792fdeab5cd9';
export const CANDIDE_PAYMASTER_URL = 'https://api.candide.dev/paymaster/v3/sepolia/99700fa2b1177145a779792fdeab5cd9';

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
  let userOp: UserOperationV8 = await smartAccount.createUserOperation(
    [tx],
    evmApi.apiUrl,
    CANDIDE_BUNDLER_URL,
    {
      eip7702Auth: {
        chainId: BigInt(_getEvmChainId(chainInfo) as number)
      }
    });

  const paymaster = new CandidePaymaster(CANDIDE_PAYMASTER_URL);

  // sponsor user operation
  // const [paymasterUserOperation, _sponsorMetadata] = await paymaster.createSponsorPaymasterUserOperation(
  //   userOp,
  //   CANDIDE_BUNDLER_URL,
  //   'c27a8e5e0e9c3146'
  // );
  //
  // userOp = paymasterUserOperation;

  // pay with erc20 token
  userOp = await paymaster.createTokenPaymasterUserOperation(
    smartAccount,
    userOp,
    '0xFa5854FBf9964330d761961F46565AB7326e5a3b',
    CANDIDE_BUNDLER_URL
  );

  // console.log('sponsor data', _sponsorMetadata);

  return userOp;
}
