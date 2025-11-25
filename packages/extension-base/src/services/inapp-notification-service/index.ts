// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { COMMON_ASSETS, COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { CRON_LISTEN_AVAIL_BRIDGE_CLAIM } from '@subwallet/extension-base/constants';
import { fetchLatestRemindNotificationTime } from '@subwallet/extension-base/constants/remind-notification-time';
import { CronServiceInterface, ServiceStatus } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { NotificationDescriptionMap, NotificationTitleMap, ONE_DAY_MILLISECOND } from '@subwallet/extension-base/services/inapp-notification-service/consts';
import { _BaseNotificationInfo, _NotificationInfo, BridgeTransactionStatus, ClaimAvailBridgeNotificationMetadata, ClaimPolygonBridgeNotificationMetadata, NotificationActionType, NotificationTab, ProcessNotificationMetadata, WithdrawClaimNotificationMetadata } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { AvailBridgeSourceChain, AvailBridgeTransaction, fetchAllAvailBridgeTransactions, fetchPolygonBridgeTransactions, hrsToMillisecond, PolygonTransaction } from '@subwallet/extension-base/services/inapp-notification-service/utils';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import { getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';
import { ProcessTransactionData, ProcessType, SummaryEarningProcessData, SwapBaseTxData, YieldPoolType } from '@subwallet/extension-base/types';
import { GetNotificationParams, RequestSwitchStatusParams } from '@subwallet/extension-base/types/notification';
import { formatNumber, getAddressesByChainType, reformatAddress } from '@subwallet/extension-base/utils';
import { isSubstrateAddress } from '@subwallet/keyring';

export class InappNotificationService implements CronServiceInterface {
  status: ServiceStatus;
  private refeshAvailBridgeClaimTimeOut: NodeJS.Timeout | undefined;

  constructor (
    private readonly dbService: DatabaseService,
    private readonly keyringService: KeyringService,
    private readonly eventService: EventService,
    private readonly chainService: ChainService
  ) {
    this.status = ServiceStatus.NOT_INITIALIZED;
  }

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;

    await this.eventService.waitAccountReady;

    this.status = ServiceStatus.INITIALIZED;

    await this.start();

    this.onAccountProxyRemove();
  }

  async markAllRead (proxyId: string) {
    await this.dbService.markAllRead(proxyId);
  }

  async switchReadStatus (params: RequestSwitchStatusParams) {
    await this.dbService.switchReadStatus(params);
  }

  public subscribeUnreadNotificationsCountMap (callback: (data: Record<string, number>) => void) {
    return this.dbService.subscribeUnreadNotificationsCountMap().subscribe(
      {
        next: callback
      }
    );
  }

  public async getUnreadNotificationsCountMap () {
    return await this.dbService.getUnreadNotificationsCountMap();
  }

  public async fetchNotificationsByParams (params: GetNotificationParams) {
    return this.dbService.getNotificationsByParams(params);
  }

  public async getNotificationById (id: string) {
    return this.dbService.getNotification(id);
  }

  cleanUpOldNotifications (overdueTime = ONE_DAY_MILLISECOND * 60) {
    return this.dbService.cleanUpOldNotifications(overdueTime);
  }

  passValidateNotification (candidateNotification: _BaseNotificationInfo, comparedNotifications: _NotificationInfo[], remindTimeConfigInHrs: Record<NotificationActionType, number>) { // todo: simplify condition !!
    if ([NotificationActionType.WITHDRAW, NotificationActionType.CLAIM].includes(candidateNotification.actionType)) {
      const { actionType, address, metadata, time } = candidateNotification;
      const candidateMetadata = metadata as WithdrawClaimNotificationMetadata;
      const remindTime = hrsToMillisecond(remindTimeConfigInHrs[candidateNotification.actionType]);

      for (const comparedNotification of comparedNotifications) {
        const specialCase = comparedNotification.actionType === NotificationActionType.WITHDRAW && !comparedNotification.isRead;

        if (comparedNotification.address !== address) {
          continue;
        }

        if (comparedNotification.actionType !== actionType) {
          continue;
        }

        const comparedMetadata = comparedNotification.metadata as WithdrawClaimNotificationMetadata;
        const sameNotification = candidateMetadata.stakingType === comparedMetadata.stakingType && candidateMetadata.stakingSlug === comparedMetadata.stakingSlug;

        if (!sameNotification) {
          continue;
        }

        if (time - comparedNotification.time <= remindTime) {
          return false;
        } else {
          if (specialCase) {
            return false;
          }
        }
      }
    }

    if ([NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM, NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL].includes(candidateNotification.actionType)) {
      const { address, metadata, time } = candidateNotification;
      const candidateMetadata = metadata as ClaimAvailBridgeNotificationMetadata;
      const remindTime = hrsToMillisecond(remindTimeConfigInHrs[candidateNotification.actionType]);

      for (const notification of comparedNotifications) {
        if (notification.address !== address) {
          continue;
        }

        if (time - notification.time >= remindTime) {
          continue;
        }

        const comparedMetadata = notification.metadata as ClaimAvailBridgeNotificationMetadata;
        const sameNotification =
          candidateMetadata.messageId === comparedMetadata.messageId &&
          candidateMetadata.sourceBlockHash === comparedMetadata.sourceBlockHash &&
          candidateMetadata.sourceTransactionHash === comparedMetadata.sourceTransactionHash;

        if (sameNotification) {
          return false;
        }
      }
    }

    if ([NotificationActionType.CLAIM_POLYGON_BRIDGE].includes(candidateNotification.actionType)) {
      const { address, metadata, time } = candidateNotification;
      const candidateMetadata = metadata as ClaimPolygonBridgeNotificationMetadata;
      const remindTime = hrsToMillisecond(remindTimeConfigInHrs[candidateNotification.actionType]);

      for (const notification of comparedNotifications) {
        if (notification.address !== address) {
          continue;
        }

        if (time - notification.time >= remindTime) {
          continue;
        }

        const comparedMetadata = notification.metadata as ClaimPolygonBridgeNotificationMetadata;
        const sameNotification =
          candidateMetadata._id === comparedMetadata._id &&
          candidateMetadata.transactionHash === comparedMetadata.transactionHash &&
          candidateMetadata.counter === comparedMetadata.counter;

        if (sameNotification) {
          return false;
        }
      }
    }

    if ([NotificationActionType.SWAP, NotificationActionType.EARNING].includes(candidateNotification.actionType)) {
      const candidateMetadata = candidateNotification.metadata as ProcessNotificationMetadata;
      const processId = candidateMetadata.processId;

      for (const notification of comparedNotifications) {
        const comparedMetadata = notification.metadata as ProcessNotificationMetadata;
        const _processId = comparedMetadata.processId;

        if (processId === _processId) {
          return false;
        }
      }
    }

    return true;
  }

  async validateAndWriteNotificationsToDB (notifications: _BaseNotificationInfo[], address: string) {
    const proxyId = this.keyringService.context.belongUnifiedAccount(address) || address;
    const accountName = this.keyringService.context.getCurrentAccountProxyName(proxyId);
    const passNotifications: _NotificationInfo[] = [];
    const needUpdateNotifications: _NotificationInfo[] = [];
    const [comparedNotifications, remindTimeConfig] = await Promise.all([
      this.fetchNotificationsByParams({ notificationTab: NotificationTab.ALL, proxyId }),
      fetchLatestRemindNotificationTime()
    ]);

    for (const candidateNotification of notifications) {
      // -- update avail claimed notifications
      // todo: bring this logic to a pure function
      const availActionType = candidateNotification.actionType;
      const isAvailClaim = [NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM, NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL].includes(availActionType);

      if (isAvailClaim) {
        const availClaimMetadata = candidateNotification.metadata as ClaimAvailBridgeNotificationMetadata;
        const availClaimStatus = availClaimMetadata && availClaimMetadata.status;

        if (availClaimStatus !== BridgeTransactionStatus.READY_TO_CLAIM) {
          const exists = comparedNotifications.filter((old) => {
            if (availActionType !== old.actionType) {
              return false;
            }

            const oldMetadata = old.metadata as ClaimAvailBridgeNotificationMetadata;

            return old.address === address && oldMetadata.messageId === availClaimMetadata.messageId && oldMetadata.status === BridgeTransactionStatus.READY_TO_CLAIM;
          });

          const updatedExists: _NotificationInfo[] = exists.map((exist) => {
            const newMetadata = {
              ...(exist.metadata as ClaimAvailBridgeNotificationMetadata),
              status: availClaimStatus
            };

            return { ...exist, metadata: newMetadata };
          });

          needUpdateNotifications.push(...updatedExists);

          continue;
        }
      }
      // -- update avail claimed notifications

      candidateNotification.title = candidateNotification.title.replace('{{accountName}}', accountName);

      if (this.passValidateNotification(candidateNotification, comparedNotifications, remindTimeConfig)) {
        passNotifications.push({
          ...candidateNotification,
          proxyId
        });
      }
    }

    await this.dbService.upsertNotifications([...passNotifications, ...needUpdateNotifications]);
  }

  cronCreateBridgeClaimNotification () {
    clearTimeout(this.refeshAvailBridgeClaimTimeOut);

    this.createAvailBridgeClaimNotification();

    this.createPolygonClaimableTransactions().catch((err) => {
      console.error('Error:', err);
    });

    this.refeshAvailBridgeClaimTimeOut = setTimeout(this.cronCreateBridgeClaimNotification.bind(this), CRON_LISTEN_AVAIL_BRIDGE_CLAIM);
  }

  getCategorizedAddresses () {
    const addresses = this.keyringService.context.getAllAddresses();
    const evmAddresses = getAddressesByChainType(addresses, [ChainType.EVM]);
    const substrateAddresses = getAddressesByChainType(addresses, [ChainType.SUBSTRATE]);

    return { evmAddresses: evmAddresses, substrateAddresses: substrateAddresses };
  }

  createAvailBridgeClaimNotification () {
    const { evmAddresses, substrateAddresses } = this.getCategorizedAddresses();

    const chainAssets = this.chainService.getAssetRegistry();

    enum ASSET_TYPE {
      TEST_EVM = 'test_evm',
      TEST_SUBSTRATE = 'test_substrate',
      MAIN_EVM = 'main_evm',
      MAIN_SUBSTRATE = 'main_substrate'
    }

    const chainAssetMap = Object.values(chainAssets).reduce((acc, chainAsset) => {
      let type: ASSET_TYPE | undefined;

      if (chainAsset.symbol === 'AVAIL') {
        if (chainAsset.originChain === 'sepolia_ethereum') {
          type = ASSET_TYPE.TEST_EVM;
        } else if (chainAsset.originChain === 'availTuringTest') {
          type = ASSET_TYPE.TEST_SUBSTRATE;
        } else if (chainAsset.originChain === 'ethereum') {
          type = ASSET_TYPE.MAIN_EVM;
        } else if (chainAsset.originChain === 'avail_mainnet') {
          type = ASSET_TYPE.MAIN_SUBSTRATE;
        }
      }

      if (type) {
        acc[type] = chainAsset;
      }

      return acc;
    }, {} as Record<ASSET_TYPE, _ChainAsset>);

    substrateAddresses.forEach((address) => {
      fetchAllAvailBridgeTransactions(address, AvailBridgeSourceChain.ETHEREUM, true)
        .then(async (transactions) => await this.processWriteAvailBridgeClaim(address, transactions, chainAssetMap[ASSET_TYPE.TEST_SUBSTRATE]))
        .catch(console.error);

      fetchAllAvailBridgeTransactions(address, AvailBridgeSourceChain.ETHEREUM, false)
        .then(async (transactions) => await this.processWriteAvailBridgeClaim(address, transactions, chainAssetMap[ASSET_TYPE.MAIN_SUBSTRATE]))
        .catch(console.error);
    });

    evmAddresses.forEach((address) => {
      fetchAllAvailBridgeTransactions(address, AvailBridgeSourceChain.AVAIL, true)
        .then(async (transactions) => await this.processWriteAvailBridgeClaim(address, transactions, chainAssetMap[ASSET_TYPE.TEST_EVM]))
        .catch(console.error);

      fetchAllAvailBridgeTransactions(address, AvailBridgeSourceChain.AVAIL, false)
        .then(async (transactions) => await this.processWriteAvailBridgeClaim(address, transactions, chainAssetMap[ASSET_TYPE.MAIN_EVM]))
        .catch(console.error);
    });
  }

  async processWriteAvailBridgeClaim (address: string, transactions: AvailBridgeTransaction[], token: _ChainAsset) {
    const actionType = isSubstrateAddress(address) ? NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL : NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM;
    const timestamp = Date.now();
    const symbol = token.symbol;
    const decimals = token.decimals ?? 0;
    const notifications: _BaseNotificationInfo[] = transactions.map((transaction) => {
      const { amount, depositorAddress, messageId, receiverAddress, sourceBlockHash, sourceChain, sourceTransactionHash, sourceTransactionIndex, status } = transaction;
      const metadata: ClaimAvailBridgeNotificationMetadata = {
        chainSlug: token.originChain,
        tokenSlug: token.slug,
        messageId,
        sourceChain,
        sourceTransactionHash,
        depositorAddress,
        receiverAddress,
        amount,
        sourceBlockHash,
        sourceTransactionIndex,
        status
      };

      return {
        id: `${actionType}___${messageId}___${timestamp}`,
        address: address, // address is receiverAddress
        title: NotificationTitleMap[actionType].replace('{{tokenSymbol}}', symbol),
        description: NotificationDescriptionMap[actionType](formatNumber(amount, decimals), symbol),
        time: timestamp,
        extrinsicType: ExtrinsicType.CLAIM_BRIDGE,
        isRead: false,
        actionType,
        metadata
      };
    });

    await this.validateAndWriteNotificationsToDB(notifications, address);
  }

  // Polygon Claimable Handle
  async createPolygonClaimableTransactions () {
    const { evmAddresses } = this.getCategorizedAddresses();
    const etherChains = [COMMON_ASSETS.ETH, COMMON_ASSETS.ETH_SEPOLIA];

    const polygonAssets = Object.values(this.chainService.getAssetRegistry()).filter(
      (asset) => etherChains.includes(asset.slug as COMMON_ASSETS)
    );

    for (const polygonAsset of polygonAssets) {
      const isTestnet = polygonAsset?.originChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA;

      if (evmAddresses.length === 0) {
        return;
      }

      for (const address of evmAddresses) {
        const response = await fetchPolygonBridgeTransactions(address, isTestnet);

        if (response && response.success) {
          await this.processPolygonClaimNotification(address, response.result, polygonAsset);
        }
      }
    }
  }

  async processPolygonClaimNotification (address: string, transactions: PolygonTransaction[], token: _ChainAsset) {
    const actionType = NotificationActionType.CLAIM_POLYGON_BRIDGE;
    const timestamp = Date.now();
    const symbol = token.symbol;
    const decimals = token.decimals ?? 0;
    const notifications: _BaseNotificationInfo[] = transactions.map((transaction) => {
      const { _id, amounts, bridgeType, counter, destinationNetwork, originTokenAddress, originTokenNetwork, receiver, sourceNetwork, status, transactionHash, transactionInitiator, userAddress } = transaction;
      const metadata: ClaimPolygonBridgeNotificationMetadata = {
        chainSlug: token.originChain,
        tokenSlug: token.slug,
        _id,
        amounts,
        bridgeType,
        counter,
        destinationNetwork,
        originTokenAddress,
        originTokenNetwork,
        receiver,
        sourceNetwork,
        status,
        transactionHash,
        transactionInitiator,
        userAddress
      };

      return {
        id: `${actionType}___${_id}___${timestamp}`,
        address: address,
        title: NotificationTitleMap[actionType].replace('{{tokenSymbol}}', symbol),
        description: NotificationDescriptionMap[actionType](formatNumber(amounts[0], decimals), symbol),
        time: timestamp,
        extrinsicType: ExtrinsicType.CLAIM_BRIDGE,
        isRead: false,
        actionType,
        metadata
      };
    });

    await this.validateAndWriteNotificationsToDB(notifications, address);
  }

  public async createProcessNotification (process: ProcessTransactionData) {
    const timestamp = Date.now();
    const _id = process.id;
    const address = process.address;

    let actionType: NotificationActionType;
    let extrinsicType: ExtrinsicType;
    let title = '';
    let description = '';

    if (process.type === ProcessType.SWAP) {
      actionType = NotificationActionType.SWAP;
      extrinsicType = ExtrinsicType.SWAP;
      const combineInfo = process.combineInfo as SwapBaseTxData;

      const targetPair = (() => {
        try {
          return getTokenPairFromStep(combineInfo.process.steps) || combineInfo.quote.pair;
        } catch (e) {
          return combineInfo.quote.pair;
        }
      })();

      const fromAsset = this.chainService.getAssetBySlug(targetPair.from);
      const toAsset = this.chainService.getAssetBySlug(targetPair.to);

      title = '[{{accountName}}]  SWAPPED {{fromAsset}}'
        .replace('{{fromAsset}}', fromAsset.symbol);
      description = '{{fromAmount}} {{fromAsset}} swapped for {{toAmount}} {{toAsset}}. Click to view details'
        .replace('{{fromAmount}}', formatNumber(combineInfo.quote.fromAmount, fromAsset.decimals || 0))
        .replace('{{fromAsset}}', fromAsset.symbol)
        .replace('{{toAmount}}', formatNumber(combineInfo.quote.toAmount, toAsset.decimals || 0))
        .replace('{{toAsset}}', toAsset.symbol);
    } else {
      actionType = NotificationActionType.EARNING;
      extrinsicType = ExtrinsicType.JOIN_YIELD_POOL; // Not used

      const combineInfo = process.combineInfo as SummaryEarningProcessData;
      const asset = this.chainService.getAssetBySlug(combineInfo.brief.token);
      const chain = this.chainService.getChainInfoByKey(combineInfo.brief.chain);
      const amount = combineInfo.brief.amount;
      let method: string;

      switch (combineInfo.brief.method) {
        case YieldPoolType.LIQUID_STAKING:
          method = 'Liquid staking';
          break;
        case YieldPoolType.LENDING:
          method = 'Lending';
          break;
        case YieldPoolType.SINGLE_FARMING:
          method = 'Single farming';
          break;
        case YieldPoolType.NOMINATION_POOL:
          method = 'Nomination pool';
          break;
        case YieldPoolType.PARACHAIN_STAKING:
          method = 'Parachain staking';
          break;
        case YieldPoolType.NATIVE_STAKING:
          method = _STAKING_CHAIN_GROUP.astar.includes(chain.slug) ? 'dApp staking' : 'Direct nomination';
          break;
        case YieldPoolType.SUBNET_STAKING:
          method = 'Subnet staking'; // todo: confirm with tester
          break;
      }

      title = '[{{accountName}}] STAKED {{asset}}'
        .replace('{{asset}}', asset.symbol);
      description = '{{amount}} {{asset}} on {{chain}} staked via {{method}}. Click to view details'
        .replace('{{amount}}', formatNumber(amount, asset.decimals || 0))
        .replace('{{asset}}', asset.symbol)
        .replace('{{chain}}', chain.name)
        .replace('{{method}}', method);
    }

    const notification: _BaseNotificationInfo = {
      id: `${actionType}___${_id}___${timestamp}`,
      address: reformatAddress(address),
      title,
      actionType,
      metadata: {
        processId: process.id
      },
      time: timestamp,
      description,
      isRead: false,
      extrinsicType
    };

    await this.validateAndWriteNotificationsToDB([notification], process.address);
  }

  // Polygon Claimable Handle

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STARTED) {
      return;
    }

    try {
      this.status = ServiceStatus.STARTING;
      await this.startCron();
      this.status = ServiceStatus.STARTED;
    } catch (e) {

    }
  }

  async startCron (): Promise<void> {
    this.cleanUpOldNotifications()
      .catch(console.error);
    this.cronCreateBridgeClaimNotification();

    return Promise.resolve();
  }

  async stop (): Promise<void> {
    try {
      this.status = ServiceStatus.STOPPING;
      await this.stopCron();
      this.status = ServiceStatus.STOPPED;
    } catch (e) {

    }
  }

  stopCron (): Promise<void> {
    return Promise.resolve(undefined);
  }

  onAccountProxyRemove () {
    this.eventService.on('accountProxy.remove', (proxyId: string) => {
      this.removeAccountNotifications(proxyId);
    });
  }

  removeAccountNotifications (proxyId: string) {
    this.dbService.removeAccountNotifications(proxyId).catch(console.error);
  }

  migrateNotificationProxyId (proxyIds: string[], newProxyId: string, newName: string) {
    this.dbService.updateNotificationProxyId(proxyIds, newProxyId, newName);
  }
}
