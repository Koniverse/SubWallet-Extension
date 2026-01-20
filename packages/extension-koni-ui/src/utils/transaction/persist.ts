// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_TRANSACTION, ADD_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, CANCEL_UN_STAKE_TRANSACTION, CHANGE_VALIDATOR_TRANSACTION, CLAIM_BRIDGE_TRANSACTION, CLAIM_REWARD_TRANSACTION, CURRENT_PAGE, EARN_TRANSACTION, GOV_REFERENDUM_UNVOTE_TRANSACTION, GOV_REFERENDUM_VOTE_TRANSACTION, GOV_UNLOCK_VOTE_TRANSACTION, NFT_TRANSACTION, REMOVE_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION, STAKE_TRANSACTION, SWAP_TRANSACTION, TRANSFER_TRANSACTION, UN_STAKE_TRANSACTION, WITHDRAW_TRANSACTION } from '@subwallet/extension-koni-ui/constants';

import { removeStorage } from '../common';

export const detectTransactionPersistKey = (type?: ExtrinsicType): string => {
  switch (type) {
    case ExtrinsicType.SEND_NFT:
      return NFT_TRANSACTION;
    case ExtrinsicType.TRANSFER_BALANCE:
    case ExtrinsicType.TRANSFER_TOKEN:
    case ExtrinsicType.TRANSFER_XCM:
      return TRANSFER_TRANSACTION;
    case ExtrinsicType.STAKING_BOND:
    case ExtrinsicType.STAKING_JOIN_POOL:
      return STAKE_TRANSACTION;
    case ExtrinsicType.JOIN_YIELD_POOL:
      return EARN_TRANSACTION;
    case ExtrinsicType.STAKING_UNBOND:
    case ExtrinsicType.STAKING_LEAVE_POOL:
      return UN_STAKE_TRANSACTION;
    case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
      return CANCEL_UN_STAKE_TRANSACTION;
    case ExtrinsicType.STAKING_WITHDRAW:
    case ExtrinsicType.STAKING_POOL_WITHDRAW:
      return WITHDRAW_TRANSACTION;
    case ExtrinsicType.STAKING_CLAIM_REWARD:
      return CLAIM_REWARD_TRANSACTION;
    case ExtrinsicType.CHANGE_EARNING_VALIDATOR:
      return CHANGE_VALIDATOR_TRANSACTION;
    case ExtrinsicType.CHANGE_BITTENSOR_ROOT_CLAIM_TYPE:
      return CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_TRANSACTION;
    case ExtrinsicType.SWAP:
      return SWAP_TRANSACTION;
    case ExtrinsicType.CLAIM_BRIDGE:
      return CLAIM_BRIDGE_TRANSACTION;
    case ExtrinsicType.GOV_VOTE:
      return GOV_REFERENDUM_VOTE_TRANSACTION;
    case ExtrinsicType.GOV_UNVOTE:
      return GOV_REFERENDUM_UNVOTE_TRANSACTION;
    case ExtrinsicType.GOV_UNLOCK_VOTE:
      return GOV_UNLOCK_VOTE_TRANSACTION;
    case ExtrinsicType.ADD_SUBSTRATE_PROXY_ACCOUNT:
      return ADD_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION;
    case ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT:
      return REMOVE_SUBSTRATE_PROXY_ACCOUNT_TRANSACTION;
    default:
      return '';
  }
};

export const removeTransactionPersist = (type?: ExtrinsicType) => {
  const key = detectTransactionPersistKey(type);

  if (key) {
    removeStorage(key);
  }

  window.localStorage.setItem(CURRENT_PAGE, '/home/tokens');
};
