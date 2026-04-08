// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { StatusType } from '@subwallet/extension-web-ui/Popup/Home/History/Detail';
import { CheckCircle, ClockCounterClockwise, PaperPlaneTilt, ProhibitInset, Queue, Spinner, StopCircle } from 'phosphor-react';

export const TxTypeNameMap: Record<ExtrinsicType, string> = {
  [ExtrinsicType.TRANSFER_BALANCE]: detectTranslate('ui.HISTORY.constants.history.transfer'),
  [ExtrinsicType.TRANSFER_TOKEN]: detectTranslate('ui.HISTORY.constants.history.transfer'),
  [ExtrinsicType.TRANSFER_XCM]: detectTranslate('ui.HISTORY.constants.history.transfer'),
  [ExtrinsicType.SEND_NFT]: detectTranslate('ui.HISTORY.constants.history.nftTransaction'),
  [ExtrinsicType.CROWDLOAN]: detectTranslate('ui.HISTORY.constants.history.crowdloanContribution'),
  [ExtrinsicType.STAKING_JOIN_POOL]: detectTranslate('ui.HISTORY.constants.history.joinPool'),
  [ExtrinsicType.STAKING_BOND]: detectTranslate('ui.HISTORY.constants.history.stake'),
  [ExtrinsicType.MINT_VDOT]: detectTranslate('ui.HISTORY.constants.history.mintVdot'),
  [ExtrinsicType.MINT_VMANTA]: detectTranslate('ui.HISTORY.constants.history.mintVmanta'),
  [ExtrinsicType.MINT_LDOT]: detectTranslate('ui.HISTORY.constants.history.mintLdot'),
  [ExtrinsicType.MINT_SDOT]: detectTranslate('ui.HISTORY.constants.history.mintSdot'),
  [ExtrinsicType.MINT_QDOT]: detectTranslate('ui.HISTORY.constants.history.mintQdot'),
  [ExtrinsicType.MINT_STDOT]: detectTranslate('ui.HISTORY.constants.history.mintStdot'),
  [ExtrinsicType.STAKING_LEAVE_POOL]: detectTranslate('ui.HISTORY.constants.history.unstake'),
  [ExtrinsicType.STAKING_UNBOND]: detectTranslate('ui.HISTORY.constants.history.unstake'),
  [ExtrinsicType.CHANGE_EARNING_VALIDATOR]: detectTranslate('ui.HISTORY.constants.history.nominate'),
  [ExtrinsicType.JOIN_YIELD_POOL]: detectTranslate('ui.HISTORY.constants.history.joinPool'),
  [ExtrinsicType.UNSTAKE_VDOT]: detectTranslate('ui.HISTORY.constants.history.unstakeVdot'),
  [ExtrinsicType.UNSTAKE_VMANTA]: detectTranslate('ui.HISTORY.constants.history.unstakeVmanta'),
  [ExtrinsicType.UNSTAKE_LDOT]: detectTranslate('ui.HISTORY.constants.history.unstakeLdot'),
  [ExtrinsicType.UNSTAKE_SDOT]: detectTranslate('ui.HISTORY.constants.history.unstakeSdot'),
  [ExtrinsicType.UNSTAKE_STDOT]: detectTranslate('ui.HISTORY.constants.history.unstakeStdot'),
  [ExtrinsicType.UNSTAKE_QDOT]: detectTranslate('ui.HISTORY.constants.history.unstakeQdot'),
  [ExtrinsicType.REDEEM_VDOT]: detectTranslate('ui.HISTORY.constants.history.redeemVdot'),
  [ExtrinsicType.REDEEM_VMANTA]: detectTranslate('ui.HISTORY.constants.history.redeemVmanta'),
  [ExtrinsicType.REDEEM_LDOT]: detectTranslate('ui.HISTORY.constants.history.redeemLdot'),
  [ExtrinsicType.REDEEM_SDOT]: detectTranslate('ui.HISTORY.constants.history.redeemSdot'),
  [ExtrinsicType.REDEEM_QDOT]: detectTranslate('ui.HISTORY.constants.history.redeemQdot'),
  [ExtrinsicType.REDEEM_STDOT]: detectTranslate('ui.HISTORY.constants.history.redeemStdot'),
  [ExtrinsicType.STAKING_WITHDRAW]: detectTranslate('ui.HISTORY.constants.history.withdraw'),
  [ExtrinsicType.STAKING_COMPOUNDING]: detectTranslate('ui.HISTORY.constants.history.stakeCompound'),
  [ExtrinsicType.STAKING_CLAIM_REWARD]: detectTranslate('ui.HISTORY.constants.history.claimReward'),
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: detectTranslate('ui.HISTORY.constants.history.cancelUnstake'),
  [ExtrinsicType.STAKING_POOL_WITHDRAW]: detectTranslate('ui.HISTORY.constants.history.withdraw'),
  [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: detectTranslate('ui.HISTORY.constants.history.cancelCompound'),
  [ExtrinsicType.EVM_EXECUTE]: detectTranslate('ui.HISTORY.constants.history.evmExecute'),
  [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: detectTranslate('ui.HISTORY.constants.history.tokenApprove'),
  [ExtrinsicType.SWAP]: detectTranslate('ui.HISTORY.constants.history.swap'),
  [ExtrinsicType.SET_FEE_TOKEN]: detectTranslate('ui.HISTORY.constants.history.feeToken'),
  [ExtrinsicType.CLAIM_BRIDGE]: detectTranslate('ui.HISTORY.constants.history.claimToken'),
  [ExtrinsicType.UNKNOWN]: detectTranslate('ui.HISTORY.constants.history.unknown')
};

export const StakingTypeNameMap: Record<string, string> = {
  [ExtrinsicType.STAKING_JOIN_POOL]: detectTranslate('ui.HISTORY.constants.history.stake'),
  [ExtrinsicType.STAKING_LEAVE_POOL]: detectTranslate('ui.HISTORY.constants.history.unstake'),
  [ExtrinsicType.STAKING_BOND]: detectTranslate('ui.HISTORY.constants.history.stake'),
  [ExtrinsicType.STAKING_UNBOND]: detectTranslate('ui.HISTORY.constants.history.unstake'),
  [ExtrinsicType.CHANGE_EARNING_VALIDATOR]: detectTranslate('ui.HISTORY.constants.history.nominate'),
  [ExtrinsicType.STAKING_WITHDRAW]: detectTranslate('ui.HISTORY.constants.history.withdraw'),
  [ExtrinsicType.STAKING_COMPOUNDING]: detectTranslate('ui.HISTORY.constants.history.compounding')
};

export const HistoryStatusMap: Record<ExtrinsicStatus, StatusType> = {
  [ExtrinsicStatus.SUCCESS]: {
    schema: 'success',
    icon: CheckCircle,
    name: detectTranslate('ui.HISTORY.constants.history.completed')
  },
  [ExtrinsicStatus.FAIL]: {
    schema: 'danger',
    icon: ProhibitInset,
    name: detectTranslate('ui.HISTORY.constants.history.failed')
  },
  [ExtrinsicStatus.QUEUED]: {
    schema: 'light',
    icon: Queue,
    name: detectTranslate('ui.HISTORY.constants.history.queued')
  },
  [ExtrinsicStatus.SUBMITTING]: {
    schema: 'gold',
    icon: PaperPlaneTilt,
    name: detectTranslate('ui.HISTORY.constants.history.submitting')
  },
  [ExtrinsicStatus.PROCESSING]: {
    schema: 'gold',
    icon: Spinner,
    name: detectTranslate('ui.HISTORY.constants.history.processing')
  },
  [ExtrinsicStatus.CANCELLED]: {
    schema: 'gray',
    icon: StopCircle,
    name: detectTranslate('ui.HISTORY.constants.history.cancelled')
  },
  [ExtrinsicStatus.UNKNOWN]: {
    schema: 'gray',
    icon: StopCircle,
    name: detectTranslate('ui.HISTORY.constants.history.unknown')
  },
  [ExtrinsicStatus.TIMEOUT]: {
    schema: 'gold',
    icon: ClockCounterClockwise,
    name: detectTranslate('ui.HISTORY.constants.history.timeOut')
  }
};
