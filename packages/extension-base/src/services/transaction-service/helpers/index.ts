// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { CardanoTransactionConfig } from '@subwallet/extension-base/services/balance-service/transfer/cardano-transfer';
import { TonTransactionConfig } from '@subwallet/extension-base/services/balance-service/transfer/ton-transfer';
import { SWTransaction, SWTransactionBase } from '@subwallet/extension-base/services/transaction-service/types';
import { Psbt } from 'bitcoinjs-lib';

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';

let transactionCount = 0;
let validationCount = 0;

export const getTransactionId = (chainType: string, chain: string, isInternal: boolean, isWalletConnect = false): string => {
  return `${isInternal ? 'internal' : !isWalletConnect ? 'external' : 'wallet-connect'}.${chainType}.${chain}.${Date.now()}.${++transactionCount}`;
};

export const getValidationId = (chainType: string, chain: string): string => {
  return `${chainType}.${chain}.${Date.now()}.${++validationCount}`;
};

export const isSubstrateTransaction = (tx: SWTransactionBase['transaction']): tx is SubmittableExtrinsic => {
  return !!(tx as SubmittableExtrinsic).send;
};

export const isTonTransaction = (tx: SWTransactionBase['transaction']): tx is TonTransactionConfig => {
  const tonTransactionConfig = tx as TonTransactionConfig;

  return Boolean(tonTransactionConfig.messagePayload) && tonTransactionConfig.seqno >= 0;
};

export const isCardanoTransaction = (tx: SWTransactionBase['transaction']): tx is CardanoTransactionConfig => {
  const cardanoTransactionConfig = tx as CardanoTransactionConfig;

  return cardanoTransactionConfig.cardanoPayload !== null && cardanoTransactionConfig.cardanoPayload !== undefined;
};

// TODO: [Review] this function
export const isBitcoinTransaction = (tx: SWTransaction['transaction']): tx is Psbt => {
  return 'data' in tx && Array.isArray((tx as Psbt).data?.inputs);
};

const typeName = (type: SWTransactionBase['extrinsicType']) => {
  switch (type) {
    case ExtrinsicType.TRANSFER_BALANCE:
    case ExtrinsicType.TRANSFER_TOKEN:
    case ExtrinsicType.TRANSFER_XCM:
      return 'Transfer';
    case ExtrinsicType.SEND_NFT:
      return 'Send NFT';
    case ExtrinsicType.CROWDLOAN:
      return 'Crowdloan contribution';
    case ExtrinsicType.STAKING_JOIN_POOL:
      return 'Join pool';
    case ExtrinsicType.STAKING_LEAVE_POOL:
      return 'Leave pool';
    case ExtrinsicType.STAKING_BOND:
      return 'Bond';
    case ExtrinsicType.STAKING_UNBOND:
      return 'Unstake';
    case ExtrinsicType.STAKING_CLAIM_REWARD:
      return 'Claim reward';
    case ExtrinsicType.STAKING_WITHDRAW:
      return 'Withdraw';
    case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
      return 'Cancel unstake';
    case ExtrinsicType.STAKING_COMPOUNDING:
      return 'Stake compound';
    case ExtrinsicType.EVM_EXECUTE:
      return 'EVM execute';
    case ExtrinsicType.STAKING_CANCEL_COMPOUNDING:
      return 'Cancel compounding';
    case ExtrinsicType.STAKING_POOL_WITHDRAW:
      return 'Withdraw pool';
    case ExtrinsicType.JOIN_YIELD_POOL:
      return 'Start earning';
    case ExtrinsicType.GOV_VOTE:
      return 'Vote';
    case ExtrinsicType.GOV_UNVOTE:
      return 'Remove vote';
    case ExtrinsicType.GOV_UNLOCK_VOTE:
      return 'Unlock votes';
    case ExtrinsicType.CHANGE_EARNING_VALIDATOR:
      return 'Change validator';
    case ExtrinsicType.UNKNOWN:
    default:
      return 'unknown';
  }
};

export const getBaseTransactionInfo = (transaction: SWTransactionBase, chainInfoMap: Record<string, _ChainInfo>) => {
  return `${typeName(transaction.extrinsicType)} on ${chainInfoMap[transaction.chain]?.name || 'unknown network'}`;
};
