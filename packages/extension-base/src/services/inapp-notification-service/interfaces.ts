// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AvailBridgeSourceChain } from '@subwallet/extension-base/services/inapp-notification-service/utils';
import { MultisigTxType } from '@subwallet/extension-base/services/multisig-service';
import { YieldPoolType } from '@subwallet/extension-base/types';

export interface _BaseNotificationInfo {
  id: string,
  title: string,
  description: string,
  address: string,
  time: number,
  extrinsicType: ExtrinsicType,
  isRead: boolean,
  actionType: NotificationActionType,
  metadata: ActionTypeToMetadataMap[NotificationActionType]
}

export interface _NotificationInfo extends _BaseNotificationInfo {
  proxyId: string
}

export enum BridgeTransactionStatus {
  READY_TO_CLAIM = 'READY_TO_CLAIM',
  CLAIMED = 'CLAIMED',
  BRIDGED = 'BRIDGED'
}

export interface ActionTypeToMetadataMap {
  [NotificationActionType.SEND]: SendReceiveNotificationMetadata,
  [NotificationActionType.RECEIVE]: SendReceiveNotificationMetadata
  [NotificationActionType.WITHDRAW]: WithdrawClaimNotificationMetadata,
  [NotificationActionType.CLAIM]: WithdrawClaimNotificationMetadata,
  [NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL]: ClaimAvailBridgeNotificationMetadata,
  [NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM]: ClaimAvailBridgeNotificationMetadata,
  [NotificationActionType.CLAIM_POLYGON_BRIDGE]: ClaimPolygonBridgeNotificationMetadata,
  [NotificationActionType.SWAP]: ProcessNotificationMetadata,
  [NotificationActionType.EARNING]: ProcessNotificationMetadata,
  [NotificationActionType.MULTISIG_APPROVAL]: MultisigApprovalNotificationMetadata,
}

export interface SendReceiveNotificationMetadata {
  chain: string,
  from: string,
  to: string,
  extrinsicHash: string,
  amount: bigint,
  tokenSlug: string
}

export interface WithdrawClaimNotificationMetadata {
  stakingType: YieldPoolType,
  stakingSlug: string
}

export interface ClaimAvailBridgeNotificationMetadata {
  chainSlug: string;
  tokenSlug: string;
  messageId: string;
  sourceChain: AvailBridgeSourceChain;
  sourceTransactionHash: string;
  depositorAddress: string;
  receiverAddress: string;
  amount: string;
  sourceBlockHash: string;
  sourceTransactionIndex: string;
  status: BridgeTransactionStatus;
}

export interface ClaimPolygonBridgeNotificationMetadata {
  chainSlug: string;
  tokenSlug: string;
  _id: string;
  amounts: string[];
  bridgeType: string;
  counter?: number;
  destinationNetwork: number;
  originTokenAddress?: string;
  originTokenNetwork?: number;
  receiver?: string;
  sourceNetwork?: number;
  status: BridgeTransactionStatus;
  transactionHash: string;
  transactionInitiator?: string;
  userAddress: string;
}

export interface ProcessNotificationMetadata {
  processId: string;
}

export interface MultisigApprovalNotificationMetadata {
  multisigKey: string;
  multisigTxType: MultisigTxType;

  // just additional info to easy lookup in notification table
  chain: string;
  multisigAddress: string;
  extrinsicHash: string;
  callHash: string;
  blockHeight: number;
  extrinsicIndex: number;
  currentSigner: string;
  approvals: string[];
}

export enum NotificationTimePeriod {
  TODAY = 'TODAY',
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH'
}

export enum NotificationActionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  WITHDRAW = 'WITHDRAW',
  CLAIM = 'CLAIM', // Claim reward
  CLAIM_AVAIL_BRIDGE_ON_AVAIL = 'CLAIM_AVAIL_BRIDGE_ON_AVAIL',
  CLAIM_AVAIL_BRIDGE_ON_ETHEREUM = 'CLAIM_AVAIL_BRIDGE_ON_ETHEREUM',
  CLAIM_POLYGON_BRIDGE = 'CLAIM_POLYGON_BRIDGE',
  SWAP = 'SWAP',
  EARNING = 'EARNING',
  MULTISIG_APPROVAL = 'MULTISIG_APPROVAL'
  // todo: MULTISIG_EXECUTE
}

export enum NotificationTab {
  ALL = 'ALL',
  UNREAD = 'UNREAD',
  READ = 'READ',
  MULTISIG = 'MULTISIG'
}

export interface ShowNotificationPayload {
  // send: boolean, // notice when an account does a transaction to send asset
  // receive: boolean, // notice when an account does a transaction to receive asset
  earningClaim: boolean, // notice when an account has an earning reward to claim
  earningWithdraw: boolean, // notice when an account has an earning unstake to withdraw
  availBridgeClaim: boolean, // notice when an account has an avail bridge to claim
  polygonBridgeClaim: boolean, // notice when an account has an polygon bridge to claim
  // marketing: boolean, // notice when wallet has a marketing announcement
  // marketing: boolean, // notice when wallet has a marketing announcement
  // announcement: boolean // notice when wallet has an announcement
}

export interface NotificationSetup {
  isEnabled: boolean,
  showNotice: ShowNotificationPayload
}
