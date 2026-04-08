// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { CancelUnStakeParams, ChangeValidatorParams, ClaimBridgeParams, ClaimRewardParams, EarnParams, OffRampParams, SendNftParams, StakeParams, SwapParams, TransactionFormBaseProps, TransferParams, UnStakeParams, WithdrawParams } from '@subwallet/extension-web-ui/types';

import { ALL_KEY } from './common';

export const TRANSACTION_TITLE_MAP: Record<ExtrinsicType, string> = {
  [ExtrinsicType.TRANSFER_BALANCE]: detectTranslate('ui.TRANSACTION.constants.transaction.transfer'),
  [ExtrinsicType.TRANSFER_XCM]: detectTranslate('ui.TRANSACTION.constants.transaction.transfer'),
  [ExtrinsicType.TRANSFER_TOKEN]: detectTranslate('ui.TRANSACTION.constants.transaction.transfer'),
  [ExtrinsicType.SEND_NFT]: detectTranslate('ui.TRANSACTION.constants.transaction.transferNft'),
  [ExtrinsicType.CROWDLOAN]: detectTranslate('ui.TRANSACTION.constants.transaction.crowdloan'),
  [ExtrinsicType.STAKING_JOIN_POOL]: detectTranslate('ui.TRANSACTION.constants.transaction.addToStake'),
  [ExtrinsicType.STAKING_BOND]: detectTranslate('ui.TRANSACTION.constants.transaction.addToStake'),
  [ExtrinsicType.STAKING_LEAVE_POOL]: detectTranslate('ui.TRANSACTION.constants.transaction.unstake'),
  [ExtrinsicType.STAKING_UNBOND]: detectTranslate('ui.TRANSACTION.constants.transaction.unstake'),
  [ExtrinsicType.CHANGE_EARNING_VALIDATOR]: detectTranslate('ui.TRANSACTION.constants.transaction.changeValidator'),
  [ExtrinsicType.STAKING_WITHDRAW]: detectTranslate('ui.TRANSACTION.constants.transaction.withdraw'),
  [ExtrinsicType.STAKING_POOL_WITHDRAW]: detectTranslate('ui.TRANSACTION.constants.transaction.withdraw'),
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: detectTranslate('ui.TRANSACTION.constants.transaction.cancelUnstake'),
  [ExtrinsicType.STAKING_CLAIM_REWARD]: detectTranslate('ui.TRANSACTION.constants.transaction.claimRewards'),
  [ExtrinsicType.STAKING_COMPOUNDING]: detectTranslate('ui.TRANSACTION.constants.transaction.compound'),
  [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: detectTranslate('ui.TRANSACTION.constants.transaction.cancelCompound'),
  [ExtrinsicType.JOIN_YIELD_POOL]: detectTranslate('ui.TRANSACTION.constants.transaction.startEarning'), // TODO: Change this
  [ExtrinsicType.EVM_EXECUTE]: detectTranslate('ui.TRANSACTION.constants.transaction.execute'),
  [ExtrinsicType.UNKNOWN]: detectTranslate('ui.TRANSACTION.constants.transaction.unknown'),

  [ExtrinsicType.MINT_VDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.mintVdot'), // TODO: Change this
  [ExtrinsicType.MINT_VMANTA]: detectTranslate('ui.TRANSACTION.constants.transaction.mintVmanta'), // TODO: Change this
  [ExtrinsicType.MINT_LDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.mintLdot'), // TODO: Change this
  [ExtrinsicType.MINT_SDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.mintSdot'), // TODO: Change this
  [ExtrinsicType.MINT_QDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.mintQdot'), // TODO: Change this
  [ExtrinsicType.MINT_STDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.mintStdot'), // TODO: Change this
  [ExtrinsicType.MINT_VMANTA]: detectTranslate('ui.TRANSACTION.constants.transaction.mintVmanta'), // TODO: Change this

  [ExtrinsicType.REDEEM_VDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemVdot'), // TODO: Change this
  [ExtrinsicType.REDEEM_VMANTA]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemVmanta'), // TODO: Change this
  [ExtrinsicType.REDEEM_LDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemLdot'), // TODO: Change this
  [ExtrinsicType.REDEEM_SDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemSdot'), // TODO: Change this
  [ExtrinsicType.REDEEM_QDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemQdot'), // TODO: Change this
  [ExtrinsicType.REDEEM_STDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemStdot'), // TODO: Change this
  [ExtrinsicType.REDEEM_VMANTA]: detectTranslate('ui.TRANSACTION.constants.transaction.redeemVmanta'),

  [ExtrinsicType.UNSTAKE_VDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeVdot'),
  [ExtrinsicType.UNSTAKE_VMANTA]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeVmanta'),
  [ExtrinsicType.UNSTAKE_LDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeLdot'),
  [ExtrinsicType.UNSTAKE_SDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeSdot'),
  [ExtrinsicType.UNSTAKE_STDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeStdot'),
  [ExtrinsicType.UNSTAKE_QDOT]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeQdot'),
  [ExtrinsicType.UNSTAKE_VMANTA]: detectTranslate('ui.TRANSACTION.constants.transaction.unstakeVmanta'),

  [ExtrinsicType.CLAIM_BRIDGE]: detectTranslate('ui.TRANSACTION.constants.transaction.claimTokens'),

  [ExtrinsicType.SET_FEE_TOKEN]: detectTranslate('ui.TRANSACTION.constants.transaction.setFeeToken'),

  [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: detectTranslate('ui.TRANSACTION.constants.transaction.tokenApprove'),
  [ExtrinsicType.SWAP]: detectTranslate('ui.TRANSACTION.constants.transaction.swap')
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

export const DEFAULT_OFF_RAMP_PARAMS: OffRampParams = {
  orderId: '',
  slug: '',
  partnerCustomerId: '',
  cryptoCurrency: '',
  numericCryptoAmount: 0,
  walletAddress: '',
  network: ''
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
  value: '',
  redirectFromPreview: false,
  hasPreSelectTarget: false
};

export const DEFAULT_CHANGE_VALIDATOR_PARAMS: ChangeValidatorParams = {
  ...DEFAULT_EARN_PARAMS,
  originValidator: ''
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
  defaultSlug: '',
  ...DEFAULT_TRANSACTION_PARAMS,
  fromAmount: '',
  fromTokenSlug: '',
  toTokenSlug: ''
};

export const DEFAULT_CLAIM_AVAIL_BRIDGE_PARAMS: ClaimBridgeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  notificationId: ''
};
