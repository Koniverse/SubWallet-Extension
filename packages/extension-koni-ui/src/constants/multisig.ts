// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { MultisigTxType } from '@subwallet/extension-base/services/multisig-service';
import { detectTranslate } from '@subwallet/extension-base/utils';

export const MultisigTxToTitleMap: Record<MultisigTxType, string> = {
  [MultisigTxType.TRANSFER]: detectTranslate('ui.HISTORY.constant.multisig.title.transfer'),
  [MultisigTxType.STAKING]: detectTranslate('ui.HISTORY.constant.multisig.title.staking'),
  [MultisigTxType.LENDING]: detectTranslate('ui.HISTORY.constant.multisig.title.lending'),
  [MultisigTxType.SET_TOKEN_PAY_FEE]: detectTranslate('ui.HISTORY.constant.multisig.title.setTokenPayFee'),
  [MultisigTxType.SWAP]: detectTranslate('ui.HISTORY.constant.multisig.title.swap'),
  [MultisigTxType.TRANSFER_NFT]: detectTranslate('ui.HISTORY.constant.multisig.title.transferNFT'),
  [MultisigTxType.REDEEM]: detectTranslate('ui.HISTORY.constant.multisig.title.redeem'),
  [MultisigTxType.UNSTAKE]: detectTranslate('ui.HISTORY.constant.multisig.title.unstake'),
  [MultisigTxType.WITHDRAW]: detectTranslate('ui.HISTORY.constant.multisig.title.withdraw'),
  [MultisigTxType.CANCEL_UNSTAKE]: detectTranslate('ui.HISTORY.constant.multisig.title.cancelUnstake'),
  [MultisigTxType.CLAIM_REWARD]: detectTranslate('ui.HISTORY.constant.multisig.title.claim'),
  [MultisigTxType.NOMINATE]: detectTranslate('ui.HISTORY.constant.multisig.title.nominate'),
  [MultisigTxType.GOV_VOTE]: detectTranslate('ui.HISTORY.constant.multisig.title.govVote'),
  [MultisigTxType.GOV_REMOVE_VOTE]: detectTranslate('ui.HISTORY.constant.multisig.title.govRemoveVote'),
  [MultisigTxType.GOV_UNLOCK_VOTE]: detectTranslate('ui.HISTORY.constant.multisig.title.govUnlockVote'),
  [MultisigTxType.UNKNOWN]: detectTranslate('ui.HISTORY.constant.multisig.title.multisigTransaction')
};

export const MultisigTxToTypeNameMap: Record<MultisigTxType, string> = {
  [MultisigTxType.TRANSFER]: detectTranslate('ui.HISTORY.constant.multisig.typeName.transfer'),
  [MultisigTxType.STAKING]: detectTranslate('ui.HISTORY.constant.multisig.typeName.staking'),
  [MultisigTxType.LENDING]: detectTranslate('ui.HISTORY.constant.multisig.typeName.lending'),
  [MultisigTxType.SET_TOKEN_PAY_FEE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.setTokenPayFee'),
  [MultisigTxType.SWAP]: detectTranslate('ui.HISTORY.constant.multisig.typeName.swap'),
  [MultisigTxType.TRANSFER_NFT]: detectTranslate('ui.HISTORY.constant.multisig.typeName.transferNFT'),
  [MultisigTxType.REDEEM]: detectTranslate('ui.HISTORY.constant.multisig.typeName.redeem'),
  [MultisigTxType.UNSTAKE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.unstake'),
  [MultisigTxType.WITHDRAW]: detectTranslate('ui.HISTORY.constant.multisig.typeName.withdraw'),
  [MultisigTxType.CANCEL_UNSTAKE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.cancelUnstake'),
  [MultisigTxType.CLAIM_REWARD]: detectTranslate('ui.HISTORY.constant.multisig.typeName.claim'),
  [MultisigTxType.NOMINATE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.nominate'),
  [MultisigTxType.GOV_VOTE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.govVote'),
  [MultisigTxType.GOV_REMOVE_VOTE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.govRemoveVote'),
  [MultisigTxType.GOV_UNLOCK_VOTE]: detectTranslate('ui.HISTORY.constant.multisig.typeName.govUnlockVote'),
  [MultisigTxType.UNKNOWN]: detectTranslate('ui.HISTORY.constant.multisig.typeName.unknown')
};

export const MULTISIG_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MULTISIG_APPROVE_TX,
  ExtrinsicType.MULTISIG_EXECUTE_TX,
  ExtrinsicType.MULTISIG_CANCEL_TX,
  ExtrinsicType.MULTISIG_INIT_TX
];
