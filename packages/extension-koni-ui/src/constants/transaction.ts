// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { AddSubstrateProxyAccountParams, CancelUnStakeParams, ChangeBittensorRootClaimType, ChangeValidatorParams, ClaimBridgeParams, ClaimRewardParams, EarnParams, GovReferendumUnvoteParams, GovReferendumVoteParams, GovUnlockVoteParams, RemoveSubstrateProxyAccountParams, SendNftParams, StakeParams, SwapParams, TransactionFormBaseProps, TransferParams, UnStakeParams, WithdrawParams } from '@subwallet/extension-koni-ui/types';

import { ALL_KEY } from './common';

export const TRANSACTION_TITLE_MAP: Record<ExtrinsicType, string> = {
  [ExtrinsicType.TRANSFER_BALANCE]: detectTranslate('ui.TRANSACTION.constant.transaction.transfer'),
  [ExtrinsicType.TRANSFER_XCM]: detectTranslate('ui.TRANSACTION.constant.transaction.transfer'),
  [ExtrinsicType.TRANSFER_TOKEN]: detectTranslate('ui.TRANSACTION.constant.transaction.transfer'),
  [ExtrinsicType.SEND_NFT]: detectTranslate('ui.TRANSACTION.constant.transaction.transferNft'),
  [ExtrinsicType.CROWDLOAN]: detectTranslate('ui.TRANSACTION.constant.transaction.crowdloan'),
  [ExtrinsicType.STAKING_JOIN_POOL]: detectTranslate('ui.TRANSACTION.constant.transaction.addToStake'),
  [ExtrinsicType.STAKING_BOND]: detectTranslate('ui.TRANSACTION.constant.transaction.addToStake'),
  [ExtrinsicType.STAKING_LEAVE_POOL]: detectTranslate('ui.TRANSACTION.constant.transaction.unstake'),
  [ExtrinsicType.STAKING_UNBOND]: detectTranslate('ui.TRANSACTION.constant.transaction.unstake'),
  [ExtrinsicType.CHANGE_EARNING_VALIDATOR]: detectTranslate('ui.TRANSACTION.constant.transaction.changeValidator'),
  [ExtrinsicType.CHANGE_BITTENSOR_ROOT_CLAIM_TYPE]: detectTranslate('ui.TRANSACTION.constant.transaction.changeClaimType'),
  [ExtrinsicType.STAKING_WITHDRAW]: detectTranslate('ui.TRANSACTION.constant.transaction.withdraw'),
  [ExtrinsicType.STAKING_POOL_WITHDRAW]: detectTranslate('ui.TRANSACTION.constant.transaction.withdraw'),
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: detectTranslate('ui.TRANSACTION.constant.transaction.cancelUnstake'),
  [ExtrinsicType.STAKING_CLAIM_REWARD]: detectTranslate('ui.TRANSACTION.constant.transaction.claimRewards'),
  [ExtrinsicType.STAKING_COMPOUNDING]: detectTranslate('ui.TRANSACTION.constant.transaction.compound'),
  [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: detectTranslate('ui.TRANSACTION.constant.transaction.cancelCompound'),
  [ExtrinsicType.JOIN_YIELD_POOL]: detectTranslate('ui.TRANSACTION.constant.transaction.startEarning'), // TODO: Change this
  [ExtrinsicType.EVM_EXECUTE]: detectTranslate('ui.TRANSACTION.constant.transaction.execute'),
  [ExtrinsicType.UNKNOWN]: detectTranslate('ui.TRANSACTION.constant.transaction.unknown'),

  [ExtrinsicType.MINT_VDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.mintVDot'), // TODO: Change this
  [ExtrinsicType.MINT_VMANTA]: detectTranslate('ui.TRANSACTION.constant.transaction.mintVManta'), // TODO: Change this
  [ExtrinsicType.MINT_LDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.mintLDot'), // TODO: Change this
  [ExtrinsicType.MINT_SDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.mintSDot'), // TODO: Change this
  [ExtrinsicType.MINT_QDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.mintQDot'), // TODO: Change this
  [ExtrinsicType.MINT_STDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.mintStDot'), // TODO: Change this
  [ExtrinsicType.MINT_VMANTA]: detectTranslate('ui.TRANSACTION.constant.transaction.mintVManta'), // TODO: Change this

  [ExtrinsicType.REDEEM_VDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemVDot'), // TODO: Change this
  [ExtrinsicType.REDEEM_VMANTA]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemVManta'), // TODO: Change this
  [ExtrinsicType.REDEEM_LDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemLDot'), // TODO: Change this
  [ExtrinsicType.REDEEM_SDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemSDot'), // TODO: Change this
  [ExtrinsicType.REDEEM_QDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemQDot'), // TODO: Change this
  [ExtrinsicType.REDEEM_STDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemStDot'), // TODO: Change this
  [ExtrinsicType.REDEEM_VMANTA]: detectTranslate('ui.TRANSACTION.constant.transaction.redeemVManta'),

  [ExtrinsicType.UNSTAKE_VDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeVDot'),
  [ExtrinsicType.UNSTAKE_VMANTA]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeVManta'),
  [ExtrinsicType.UNSTAKE_LDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeLDot'),
  [ExtrinsicType.UNSTAKE_SDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeSDot'),
  [ExtrinsicType.UNSTAKE_STDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeStDot'),
  [ExtrinsicType.UNSTAKE_QDOT]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeQDot'),
  [ExtrinsicType.UNSTAKE_VMANTA]: detectTranslate('ui.TRANSACTION.constant.transaction.unstakeVManta'),

  [ExtrinsicType.CLAIM_BRIDGE]: detectTranslate('ui.TRANSACTION.constant.transaction.claimTokens'),

  [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: detectTranslate('ui.TRANSACTION.constant.transaction.tokenApprove'),
  [ExtrinsicType.SWAP]: detectTranslate('ui.TRANSACTION.constant.transaction.swap'),

  [ExtrinsicType.GOV_VOTE]: detectTranslate('ui.TRANSACTION.constant.transaction.vote'),
  [ExtrinsicType.GOV_UNVOTE]: detectTranslate('ui.TRANSACTION.constant.transaction.unvote'),
  [ExtrinsicType.GOV_UNLOCK_VOTE]: detectTranslate('ui.TRANSACTION.constant.transaction.unlockVotes'),

  [ExtrinsicType.ADD_SUBSTRATE_PROXY_ACCOUNT]: detectTranslate('ui.TRANSACTION.constant.transaction.addProxy'),
  [ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT]: detectTranslate('ui.TRANSACTION.constant.transaction.removeProxy')
};

export const ALL_STAKING_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.STAKING_JOIN_POOL,
  ExtrinsicType.STAKING_BOND,
  ExtrinsicType.STAKING_LEAVE_POOL,
  ExtrinsicType.STAKING_UNBOND,
  ExtrinsicType.STAKING_WITHDRAW,
  ExtrinsicType.STAKING_POOL_WITHDRAW,
  ExtrinsicType.STAKING_LEAVE_POOL,
  ExtrinsicType.STAKING_CANCEL_UNSTAKE,
  ExtrinsicType.STAKING_CLAIM_REWARD,
  ExtrinsicType.STAKING_COMPOUNDING,
  ExtrinsicType.STAKING_CANCEL_COMPOUNDING,
  ExtrinsicType.CHANGE_EARNING_VALIDATOR
];

export const DEFAULT_TRANSACTION_PARAMS: TransactionFormBaseProps = {
  fromAccountProxy: '',
  asset: '',
  chain: '',
  from: ''
};

export const DEFAULT_TRANSFER_PARAMS: TransferParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  defaultSlug: '',
  destChain: '',
  to: '',
  value: ''
};

export const DEFAULT_NFT_PARAMS: SendNftParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  collectionId: '',
  itemId: '',
  to: ''
};

export const DEFAULT_STAKE_PARAMS: StakeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  nominate: '',
  pool: '',
  type: '' as StakingType,
  value: '',
  defaultChain: ALL_KEY,
  defaultType: ALL_KEY
};

export const DEFAULT_EARN_PARAMS: EarnParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  target: '',
  value: ''
};

export const DEFAULT_CHANGE_VALIDATOR_PARAMS: ChangeValidatorParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  originValidator: '',
  slug: '',
  target: '',
  value: ''
};

export const DEFAULT_UN_STAKE_PARAMS: UnStakeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  fastLeave: false,
  validator: '',
  value: ''
};

export const DEFAULT_CANCEL_UN_STAKE_PARAMS: CancelUnStakeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  unstake: ''
};

export const DEFAULT_WITHDRAW_PARAMS: WithdrawParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: ''
};

export const DEFAULT_CLAIM_REWARD_PARAMS: ClaimRewardParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  bondReward: false
};

export const DEFAULT_SWAP_PARAMS: SwapParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  fromAmount: '',
  fromTokenSlug: '',
  toTokenSlug: '',
  defaultSlug: ''
};

export const DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS: ClaimBridgeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  notificationId: ''
};

export const DEFAULT_GOV_REFERENDUM_VOTE_PARAMS: GovReferendumVoteParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  conviction: 0,
  referendumId: '',
  track: -1
};

export const DEFAULT_GOV_REFERENDUM_UNVOTE_PARAMS: GovReferendumUnvoteParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  referendumId: '',
  track: -1
};

export const DEFAULT_GOV_UNLOCK_VOTE_PARAMS: GovUnlockVoteParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  referendumIds: [],
  tracks: [],
  amount: ''
};

export const DEFAULT_CHANGE_BITTENSOR_ROOT_CLAIM_TYPE_PARAMS: ChangeBittensorRootClaimType = {
  ...DEFAULT_TRANSACTION_PARAMS,
  bittensorRootClaimType: ''
};

export const DEFAULT_ADD_SUBSTRATE_PROXY_ACCOUNT_PARAMS: AddSubstrateProxyAccountParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  substrateProxyAddress: '',
  substrateProxyType: 'Any',
  chain: ''
};

export const DEFAULT_REMOVE_SUBSTRATE_PROXY_ACCOUNT_PARAMS: RemoveSubstrateProxyAccountParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  substrateProxyAddressKeys: []
};
