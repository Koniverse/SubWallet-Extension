// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AvailBridgeSourceChain, AvailBridgeTransactionStatus } from '@subwallet/extension-base/services/inapp-notification-service/utils';
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

export interface ActionTypeToMetadataMap {
  [NotificationActionType.SEND]: SendReceiveNotificationMetadata,
  [NotificationActionType.RECEIVE]: SendReceiveNotificationMetadata
  [NotificationActionType.WITHDRAW]: WithdrawClaimNotificationMetadata,
  [NotificationActionType.CLAIM]: WithdrawClaimNotificationMetadata,
  [NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL]: ClaimAvailBridgeNotificationMetadata,
  [NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM]: ClaimAvailBridgeNotificationMetadata
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
  status: AvailBridgeTransactionStatus;
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
  CLAIM_AVAIL_BRIDGE_ON_ETHEREUM = 'CLAIM_AVAIL_BRIDGE_ON_ETHEREUM'
}

export enum NotificationTab {
  ALL = 'ALL',
  UNREAD = 'UNREAD',
  READ = 'READ'
}

export interface ShowNotificationPayload {
  // send: boolean, // notice when an account does a transaction to send asset
  // receive: boolean, // notice when an account does a transaction to receive asset
  earningClaim: boolean, // notice when an account has an earning reward to claim
  earningWithdraw: boolean, // notice when an account has an earning unstake to withdraw
  availBridgeClaim: boolean, // notice when an account has an avail bridge to claim
  // marketing: boolean, // notice when wallet has a marketing announcement
  // marketing: boolean, // notice when wallet has a marketing announcement
  // announcement: boolean // notice when wallet has an announcement
}

export interface NotificationSetup {
  isEnabled: boolean,
  showNotice: ShowNotificationPayload
}
