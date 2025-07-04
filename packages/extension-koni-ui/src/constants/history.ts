// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { detectTranslate } from '@subwallet/extension-base/utils';
import { StatusType } from '@subwallet/extension-koni-ui/Popup/Home/History/Detail';
import { CheckCircle, ClockCounterClockwise, PaperPlaneTilt, ProhibitInset, Queue, Spinner, StopCircle } from 'phosphor-react';

export const TxTypeNameMap: Record<ExtrinsicType, string> = {
  [ExtrinsicType.TRANSFER_BALANCE]: detectTranslate('ui.constant.history.transfer'),
  [ExtrinsicType.TRANSFER_TOKEN]: detectTranslate('ui.constant.history.transfer'),
  [ExtrinsicType.TRANSFER_XCM]: detectTranslate('ui.constant.history.transfer'),
  [ExtrinsicType.SEND_NFT]: detectTranslate('ui.constant.history.nftTransaction'),
  [ExtrinsicType.CROWDLOAN]: detectTranslate('ui.constant.history.crowdloanContribution'),
  [ExtrinsicType.STAKING_JOIN_POOL]: detectTranslate('ui.constant.history.joinPool'),
  [ExtrinsicType.STAKING_BOND]: detectTranslate('ui.constant.history.stake'),
  [ExtrinsicType.MINT_VDOT]: detectTranslate('ui.constant.history.mintVDot'),
  [ExtrinsicType.MINT_VMANTA]: detectTranslate('ui.constant.history.mintVManta'),
  [ExtrinsicType.MINT_LDOT]: detectTranslate('ui.constant.history.mintLDot'),
  [ExtrinsicType.MINT_SDOT]: detectTranslate('ui.constant.history.mintSDot'),
  [ExtrinsicType.MINT_QDOT]: detectTranslate('ui.constant.history.mintQDot'),
  [ExtrinsicType.MINT_STDOT]: detectTranslate('ui.constant.history.mintStDot'),
  [ExtrinsicType.STAKING_LEAVE_POOL]: detectTranslate('ui.constant.history.unstake'),
  [ExtrinsicType.STAKING_UNBOND]: detectTranslate('ui.constant.history.unstake'),
  [ExtrinsicType.JOIN_YIELD_POOL]: detectTranslate('ui.constant.history.joinPool'),
  [ExtrinsicType.UNSTAKE_VDOT]: detectTranslate('ui.constant.history.unstakeVDot'),
  [ExtrinsicType.UNSTAKE_VMANTA]: detectTranslate('ui.constant.history.unstakeVManta'),
  [ExtrinsicType.UNSTAKE_LDOT]: detectTranslate('ui.constant.history.unstakeLDot'),
  [ExtrinsicType.UNSTAKE_SDOT]: detectTranslate('ui.constant.history.unstakeSDot'),
  [ExtrinsicType.UNSTAKE_STDOT]: detectTranslate('ui.constant.history.unstakeStDot'),
  [ExtrinsicType.UNSTAKE_QDOT]: detectTranslate('ui.constant.history.unstakeQDot'),
  [ExtrinsicType.REDEEM_VDOT]: detectTranslate('ui.constant.history.redeemVDot'),
  [ExtrinsicType.REDEEM_VMANTA]: detectTranslate('ui.constant.history.redeemVManta'),
  [ExtrinsicType.REDEEM_LDOT]: detectTranslate('ui.constant.history.redeemLDot'),
  [ExtrinsicType.REDEEM_SDOT]: detectTranslate('ui.constant.history.redeemSDot'),
  [ExtrinsicType.REDEEM_QDOT]: detectTranslate('ui.constant.history.redeemQDot'),
  [ExtrinsicType.REDEEM_STDOT]: detectTranslate('ui.constant.history.redeemStDot'),
  [ExtrinsicType.STAKING_WITHDRAW]: detectTranslate('ui.constant.history.withdraw'),
  [ExtrinsicType.STAKING_COMPOUNDING]: detectTranslate('ui.constant.history.stakeCompound'),
  [ExtrinsicType.STAKING_CLAIM_REWARD]: detectTranslate('ui.constant.history.claimReward'),
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: detectTranslate('ui.constant.history.cancelUnstake'),
  [ExtrinsicType.STAKING_POOL_WITHDRAW]: detectTranslate('ui.constant.history.withdraw'),
  [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: detectTranslate('ui.constant.history.cancelCompound'),
  [ExtrinsicType.EVM_EXECUTE]: detectTranslate('ui.constant.history.evmExecute'),
  [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: detectTranslate('ui.constant.history.tokenApprove'),
  [ExtrinsicType.SWAP]: detectTranslate('ui.constant.history.swap'),
  [ExtrinsicType.CLAIM_BRIDGE]: detectTranslate('ui.constant.history.claimToken'),
  [ExtrinsicType.UNKNOWN]: detectTranslate('ui.constant.history.unknown')
};

export const StakingTypeNameMap: Record<string, string> = {
  [ExtrinsicType.STAKING_JOIN_POOL]: detectTranslate('ui.constant.history.stake'),
  [ExtrinsicType.STAKING_LEAVE_POOL]: detectTranslate('ui.constant.history.unstake'),
  [ExtrinsicType.STAKING_BOND]: detectTranslate('ui.constant.history.stake'),
  [ExtrinsicType.STAKING_UNBOND]: detectTranslate('ui.constant.history.unstake'),
  [ExtrinsicType.STAKING_WITHDRAW]: detectTranslate('ui.constant.history.withdraw'),
  [ExtrinsicType.STAKING_COMPOUNDING]: detectTranslate('ui.constant.history.compounding')
};

export const HistoryStatusMap: Record<ExtrinsicStatus, StatusType> = {
  [ExtrinsicStatus.SUCCESS]: {
    schema: 'success',
    icon: CheckCircle,
    name: detectTranslate('ui.constant.history.completed')
  },
  [ExtrinsicStatus.FAIL]: {
    schema: 'danger',
    icon: ProhibitInset,
    name: detectTranslate('ui.constant.history.failed')
  },
  [ExtrinsicStatus.QUEUED]: {
    schema: 'light',
    icon: Queue,
    name: detectTranslate('ui.constant.history.queued')
  },
  [ExtrinsicStatus.SUBMITTING]: {
    schema: 'gold',
    icon: PaperPlaneTilt,
    name: detectTranslate('ui.constant.history.submitting')
  },
  [ExtrinsicStatus.PROCESSING]: {
    schema: 'gold',
    icon: Spinner,
    name: detectTranslate('ui.constant.history.processing')
  },
  [ExtrinsicStatus.CANCELLED]: {
    schema: 'gray',
    icon: StopCircle,
    name: detectTranslate('ui.constant.history.cancelled')
  },
  [ExtrinsicStatus.UNKNOWN]: {
    schema: 'gray',
    icon: StopCircle,
    name: detectTranslate('ui.constant.history.unknown')
  },
  [ExtrinsicStatus.TIMEOUT]: {
    schema: 'gold',
    icon: ClockCounterClockwise,
    name: detectTranslate('ui.constant.history.timeOut')
  }
};
