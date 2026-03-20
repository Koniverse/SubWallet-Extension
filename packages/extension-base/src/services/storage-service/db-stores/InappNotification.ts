// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { _NotificationInfo, MultisigApprovalNotificationMetadata, NotificationTab } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { getIsTabRead } from '@subwallet/extension-base/services/inapp-notification-service/utils';
import BaseStore from '@subwallet/extension-base/services/storage-service/db-stores/BaseStore';
import { GetNotificationParams, MarkAllReadParams, RequestSwitchStatusParams } from '@subwallet/extension-base/types/notification';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { liveQuery } from 'dexie';

export default class InappNotificationStore extends BaseStore<_NotificationInfo> {
  async getNotificationInfo (id: string) {
    return this.table.get(id);
  }

  async getAll () {
    return this.table.toArray();
  }

  async getNotificationsByParams (params: GetNotificationParams) {
    const { metadata, notificationTab, proxyId } = params;
    const isAllAccount = proxyId === ALL_ACCOUNT_KEY;
    const isTabAll = notificationTab === NotificationTab.ALL;

    if (isTabAll && isAllAccount) {
      return this.getAll();
    }

    const filteredTable = this.table.filter((item) => {
      const matchesProxyId = item.proxyId === proxyId;
      const matchesReadStatus = item.isRead === getIsTabRead(notificationTab);

      if (metadata?.multisigAddress && metadata?.chain && notificationTab === NotificationTab.MULTISIG) {
        // @Todo This condition is service only for multisig subscribe service to get all filter by multisig address
        // then clear it when tx is completed
        // So, if use this condition to service other feature, need to re-check carefully
        const multisigMetadata = item.metadata as MultisigApprovalNotificationMetadata;
        const multisigAddressOfNotification = multisigMetadata?.multisigAddress;
        const chain = multisigMetadata?.chain;

        return !!multisigAddressOfNotification && isSameAddress(multisigAddressOfNotification, metadata.multisigAddress) && chain === metadata.chain;
      }

      if (isTabAll) {
        return matchesProxyId;
      }

      if (isAllAccount) {
        return matchesReadStatus;
      }

      return matchesProxyId && matchesReadStatus;
    });

    return filteredTable.toArray();
  }

  updateNotificationProxyId (proxyIds: string[], newProxyId: string, newName: string) {
    this.table.where('proxyId')
      .anyOfIgnoreCase(proxyIds)
      .modify((item) => {
        item.proxyId = newProxyId;
        item.title = item.title.replace(/\[.*?\]/, `[${newName}]`);
      })
      .catch(console.error);
  }

  async cleanUpOldNotifications (overdueTime: number) {
    const currentTimestamp = Date.now();

    return this.table
      .filter((item) => item.time <= currentTimestamp - overdueTime)
      .delete();
  }

  async cleanUpNotificationsByIds (ids: string[]) {
    return this.table.where('id').anyOf(ids).delete();
  }

  subscribeUnreadNotificationsCount () {
    return liveQuery(
      async () => {
        return await this.getUnreadNotificationsCountMap();
      }
    );
  }

  async getUnreadNotificationsCountMap () {
    const unreadNotifications = await this.table.filter((item) => !item.isRead).toArray();

    return unreadNotifications.reduce((countMap, item) => {
      countMap[item.proxyId] = (countMap[item.proxyId] || 0) + 1;

      return countMap;
    }, {} as Record<string, number>);
  }

  markAllRead (params: MarkAllReadParams) {
    const { proxyId, excludeNotificationIds = [] } = params;

    if (proxyId === ALL_ACCOUNT_KEY) {
      return this.table.toCollection()
        .filter((notification) => !excludeNotificationIds.includes(notification.id))
        .modify({ isRead: true });
    }

    return this.table.where('proxyId')
      .equalsIgnoreCase(proxyId)
      .modify({ isRead: true });
  }

  switchReadStatus (params: RequestSwitchStatusParams) {
    return this.table.where('id')
      .equals(params.id)
      .modify({ isRead: !params.isRead });
  }

  removeAccountNotifications (proxyId: string) {
    return this.table.where('proxyId').equalsIgnoreCase(proxyId).delete();
  }
}
